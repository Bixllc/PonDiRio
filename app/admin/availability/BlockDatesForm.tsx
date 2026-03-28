"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { blockDates } from "@/app/actions/admin";

export function BlockDatesForm({ villaId }: { villaId: string }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!startDate || !endDate) {
      setError("Both dates are required");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }

    setLoading(true);
    try {
      await blockDates(villaId, new Date(startDate), new Date(endDate));
      setStartDate("");
      setEndDate("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to block dates");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div>
        <label className="mb-1 block text-sm text-gray-600">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-10 rounded-md border border-gray-300 px-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-600">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-10 rounded-md border border-gray-300 px-3 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-md bg-black px-4 text-sm text-white hover:bg-black/90 disabled:opacity-50"
      >
        {loading ? "Blocking..." : "Block Dates"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
