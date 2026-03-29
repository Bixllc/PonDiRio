"use server";

import { confirmBooking } from "@/lib/payments";
import { sendBookingConfirmation } from "@/lib/email";

export async function devConfirmPayment(bookingId: string) {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, error: "Dev-only action" };
  }

  try {
    await confirmBooking(bookingId, `dev-mock-${Date.now()}`);
    sendBookingConfirmation(bookingId).catch(() => {});
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to confirm booking",
    };
  }
}
