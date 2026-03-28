"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeCalendarFeed } from "@/app/actions/admin";

export function RemoveFeedButton({ feedId }: { feedId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    setLoading(true);
    try {
      await removeCalendarFeed(feedId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove feed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {loading ? "Removing..." : "Remove"}
    </button>
  );
}
