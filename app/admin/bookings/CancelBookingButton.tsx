"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/app/actions/admin";

export function CancelBookingButton({
  bookingId,
  guestName,
}: {
  bookingId: string;
  guestName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(
      `Cancel booking for ${guestName}? This will release the blocked dates.`,
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await cancelBooking(bookingId);
      if (!result.success) {
        alert(result.error || "Failed to cancel booking");
      } else {
        router.refresh();
      }
    } catch {
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Cancelling..." : "Cancel"}
    </button>
  );
}
