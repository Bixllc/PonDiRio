"use server";

import { prisma } from "@/lib/prisma";
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

export async function getBookingConfirmation(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        guestName: true,
        checkIn: true,
        checkOut: true,
        totalAmount: true,
        currency: true,
        status: true,
        villa: { select: { name: true } },
      },
    });

    if (!booking) {
      return { success: false as const, error: "Booking not found" };
    }

    return {
      success: true as const,
      data: {
        id: booking.id,
        guestName: booking.guestName,
        villaName: booking.villa.name,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        totalAmount: booking.totalAmount.toString(),
        currency: booking.currency,
        status: booking.status,
      },
    };
  } catch {
    return { success: false as const, error: "Failed to load booking details" };
  }
}
