"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { triggerCalendarSync } from "@/app/actions/admin";

export function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);

    try {
      const results = await triggerCalendarSync();

      const summary = results
        .map((r) => r.error ? `Feed ${r.feedId}: ${r.error}` : `Feed ${r.feedId}: ${r.eventsUpserted} upserted, ${r.eventsRemoved} removed`)
        .join("; ");

      setResult(summary || "No feeds to sync");
      router.refresh();
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSync}
        disabled={loading}
        className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "Syncing..." : "Sync Now"}
      </button>
      {result && (
        <span className="text-xs text-gray-500">{result}</span>
      )}
    </div>
  );
}
