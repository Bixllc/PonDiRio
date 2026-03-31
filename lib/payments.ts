import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { BookingStatus } from "@/app/generated/prisma/client";
import { sendBookingConfirmation } from "./email";

// ISO 4217 numeric currency codes
const CURRENCY_CODES: Record<string, string> = {
  XCD: "951",
  USD: "840",
  TTD: "780",
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getFacConfig() {
  return {
    baseUrl: requireEnv("FAC_BASE_URL"),
    merchantId: requireEnv("FAC_MERCHANT_ID"),
    processingPassword: requireEnv("FAC_PROCESSING_PASSWORD"),
    pageSet: (process.env.FAC_PAGE_SET || "").trim(),
    pageName: (process.env.FAC_PAGE_NAME || "").trim(),
  };
}

function facHeaders(config: ReturnType<typeof getFacConfig>) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "PowerTranz-PowerTranzId": config.merchantId,
    "PowerTranz-PowerTranzPassword": config.processingPassword,
  };
}

// ─── Initiate Payment ─────────────────────────────────────

interface InitiateResult {
  success: boolean;
  redirectHtml?: string;
  redirectUrl?: string;
  error?: string;
}

export async function initiatePayment(
  bookingId: string,
): Promise<InitiateResult> {
  // Load booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      currency: true,
      guestName: true,
      guestEmail: true,
      guestPhone: true,
    },
  });

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  if (booking.status !== BookingStatus.DRAFT) {
    return { success: false, error: "Booking is not in DRAFT status" };
  }

  // Dev mock: skip FAC, go straight to local confirmation page
  if (process.env.NODE_ENV === "development") {
    const transactionId = randomUUID();

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.PENDING_PAYMENT },
      }),
      prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          currency: booking.currency,
          externalTransactionId: transactionId,
        },
      }),
    ]);

    return {
      success: true,
      redirectUrl: `/dev/payment-success?bookingId=${booking.id}`,
    };
  }

  const fac = getFacConfig();
  const currencyCode = CURRENCY_CODES[booking.currency] || CURRENCY_CODES.USD;
  const transactionId = randomUUID();
  const nameParts = booking.guestName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const payload = {
    TransactionIdentifier: transactionId,
    TotalAmount: parseFloat(booking.totalAmount.toString()),
    CurrencyCode: currencyCode,
    ThreeDSecure: true,
    OrderIdentifier: booking.id,
    AddressMatch: false,
    BillingAddress: {
      FirstName: firstName,
      LastName: lastName,
      EmailAddress: booking.guestEmail,
      PhoneNumber: booking.guestPhone || "",
      Line1: "",
      City: "",
      PostalCode: "00000",
      CountryCode: currencyCode,
    },
    ExtendedData: {
      MerchantResponseUrl: "https://pon-di-rio.vercel.app/api/payments/callback",
      // HostedPage omitted — use PowerTranz default page to test
      // HostedPage: {
      //   PageSet: fac.pageSet,
      //   PageName: fac.pageName,
      // },
      ThreeDSecure: {
        ChallengeWindowSize: 4,
        ChallengeIndicator: "01",
      },
    },
  };

  const requestUrl = `${fac.baseUrl}/spi/sale`;
  const headers = facHeaders(fac);

  console.log("[FAC] ── Request ──────────────────────────────");
  console.log("[FAC] URL:", requestUrl);
  console.log("[FAC] Headers:", JSON.stringify({
    ...headers,
    "PowerTranz-PowerTranzPassword": headers["PowerTranz-PowerTranzPassword"].slice(0, 6) + "…",
  }, null, 2));
  console.log("[FAC] Body:", JSON.stringify(payload, null, 2));
  console.log("[FAC] Env check:", {
    FAC_BASE_URL: fac.baseUrl,
    FAC_MERCHANT_ID: fac.merchantId,
    FAC_PROCESSING_PASSWORD: fac.processingPassword ? `${fac.processingPassword.slice(0, 6)}…(${fac.processingPassword.length} chars)` : "MISSING",
    FAC_PAGE_SET: `"${fac.pageSet}" (${fac.pageSet.length} chars)`,
    FAC_PAGE_NAME: `"${fac.pageName}" (${fac.pageName.length} chars)`,
  });

  const response = await fetch(requestUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  console.log("[FAC] ── Response ─────────────────────────────");
  console.log("[FAC] Status:", response.status, response.statusText);
  console.log("[FAC] Response body:", responseText);

  if (!response.ok) {
    return { success: false, error: `FAC request failed: ${response.status} — ${responseText}` };
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(responseText);
  } catch {
    return { success: false, error: `FAC returned non-JSON: ${responseText.slice(0, 200)}` };
  }

  console.log("[FAC] IsoResponseCode:", data.IsoResponseCode);
  console.log("[FAC] ResponseMessage:", data.ResponseMessage);
  console.log("[FAC] Has RedirectData:", !!data.RedirectData);

  // SP4 = hosted page session created
  if (data.IsoResponseCode !== "SP4" || !data.RedirectData) {
    return {
      success: false,
      error: (data.ResponseMessage as string) || "Failed to create payment session",
    };
  }

  // Update booking to PENDING_PAYMENT and store the transaction ID on a payment record
  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.PENDING_PAYMENT },
    }),
    prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        externalTransactionId: transactionId,
      },
    }),
  ]);

  return { success: true, redirectHtml: data.RedirectData as string };
}

// ─── Verify Callback ──────────────────────────────────────

interface VerifyResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export async function verifyFacCallback(
  responseJson: string,
): Promise<VerifyResult> {
  const authResponse = JSON.parse(responseJson);
  console.log("[FAC Verify] Full callback payload:", responseJson);
  console.log("[FAC Verify] IsoResponseCode:", authResponse.IsoResponseCode,
    "| SpiToken:", !!authResponse.SpiToken,
    "| ResponseMessage:", authResponse.ResponseMessage);
  const bookingId = authResponse.OrderIdentifier as string | undefined;

  if (!bookingId) {
    return { success: false, error: "Missing OrderIdentifier in callback" };
  }

  // Guard against replays: only process bookings that are still PENDING_PAYMENT
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { status: true },
  });

  if (!booking) {
    return { success: false, bookingId, error: "Booking not found" };
  }

  if (booking.status !== BookingStatus.PENDING_PAYMENT) {
    return {
      success: booking.status === BookingStatus.CONFIRMED,
      bookingId,
      error: booking.status === BookingStatus.CONFIRMED
        ? undefined
        : `Booking is ${booking.status}, not PENDING_PAYMENT`,
    };
  }

  const isoCode = authResponse.IsoResponseCode as string;
  const canComplete = isoCode === "3D0" || isoCode === "3D1";

  if (!canComplete || !authResponse.SpiToken) {
    await markBookingFailed(bookingId);
    return { success: false, bookingId, error: authResponse.ResponseMessage || "Payment failed" };
  }

  const fac = getFacConfig();

  // Complete the charge by posting the SpiToken
  const completeResponse = await fetch(`${fac.baseUrl}/spi/payment`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(authResponse.SpiToken),
  });

  if (!completeResponse.ok) {
    await markBookingFailed(bookingId);
    return { success: false, bookingId, error: "Payment completion request failed" };
  }

  const result = await completeResponse.json();

  if (result.Approved !== true || result.IsoResponseCode !== "00") {
    await markBookingFailed(bookingId);
    return {
      success: false,
      bookingId,
      error: result.ResponseMessage || "Payment declined",
    };
  }

  // Payment succeeded — confirm booking, block dates, update payment record
  await confirmBooking(bookingId, result.TransactionIdentifier);

  // Fire-and-forget: don't let email failure block the booking response
  sendBookingConfirmation(bookingId).catch(() => {});

  return { success: true, bookingId };
}

// ─── Internal helpers ─────────────────────────────────────

async function markBookingFailed(bookingId: string) {
  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.FAILED },
    }),
    prisma.payment.updateMany({
      where: { bookingId, status: "PENDING" },
      data: { status: "FAILED" },
    }),
  ]);
}

export async function confirmBooking(
  bookingId: string,
  externalTransactionId: string,
) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    select: { villaId: true, checkIn: true, checkOut: true },
  });

  await prisma.$transaction([
    // booking → CONFIRMED
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    }),
    // payment → SUCCESS
    prisma.payment.updateMany({
      where: { bookingId, status: "PENDING" },
      data: { status: "SUCCESS", externalTransactionId },
    }),
    // block the dates
    prisma.availabilityBlock.create({
      data: {
        villaId: booking.villaId,
        startDate: booking.checkIn,
        endDate: booking.checkOut,
        reason: "BOOKING",
        source: "INTERNAL",
        bookingId,
      },
    }),
  ]);
}
