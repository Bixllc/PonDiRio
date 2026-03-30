"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { devConfirmPayment } from "@/app/actions/dev";

export function DevConfirmButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleConfirm() {
    setStatus("loading");
    try {
      const result = await devConfirmPayment(bookingId);
      if (result.success) {
        router.push(`/booking/confirmation?bookingId=${bookingId}`);
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
      {status === "error" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      )}
    </div>
  );
}
