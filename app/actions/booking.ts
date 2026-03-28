"use server";

import { initiatePayment } from "@/lib/payments";

export async function initiateBookingPayment(bookingId: string) {
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payments/callback`;

  const result = await initiatePayment(bookingId, callbackUrl);

  return {
    success: result.success,
    redirectHtml: result.redirectHtml,
    redirectUrl: result.redirectUrl,
    error: result.error,
  };
}
