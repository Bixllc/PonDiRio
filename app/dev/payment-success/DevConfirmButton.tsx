"use client";

import { useState } from "react";
import { devConfirmPayment } from "@/app/actions/dev";

export function DevConfirmButton({ bookingId }: { bookingId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleConfirm() {
    setStatus("loading");
    try {
      const result = await devConfirmPayment(bookingId);
      if (result.success) {
        setStatus("success");
        setMessage(`Booking ${bookingId} confirmed! Dates blocked, payment marked success.`);
      } else {
        setStatus("error");
        setMessage(result.error || "Failed to confirm");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div>
      {status === "idle" && (
        <button
          onClick={handleConfirm}
          className="rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700"
        >
          Simulate Successful Payment
        </button>
      )}
      {status === "loading" && (
        <p className="text-sm text-gray-500">Processing...</p>
      )}
      {status === "success" && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">{message}</p>
          <a href="/admin/bookings" className="mt-2 inline-block text-sm text-green-700 underline">
            View in admin
          </a>
        </div>
      )}
      {status === "error" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      )}
    </div>
  );
}
