"use server";

import { confirmBooking } from "@/lib/payments";

export async function devConfirmPayment(bookingId: string) {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, error: "Dev-only action" };
  }

  try {
    await confirmBooking(bookingId, `dev-mock-${Date.now()}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to confirm booking",
    };
  }
}
