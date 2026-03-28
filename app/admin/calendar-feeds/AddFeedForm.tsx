"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCalendarFeed } from "@/app/actions/admin";

export function AddFeedForm({ villaId }: { villaId: string }) {
  const router = useRouter();
  const [sourceName, setSourceName] = useState("");
  const [feedUrl, setFeedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!sourceName.trim() || !feedUrl.trim()) {
      setError("Source name and feed URL are required");
      return;
    }

    setLoading(true);
    try {
      await addCalendarFeed(villaId, sourceName.trim(), feedUrl.trim());
      setSourceName("");
      setFeedUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add feed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div>
        <label className="mb-1 block text-sm text-gray-600">Source Name</label>
        <input
          type="text"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          placeholder="Airbnb"
          className="h-10 rounded-md border border-gray-300 px-3 text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-sm text-gray-600">Feed URL</label>
        <input
          type="url"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          placeholder="https://www.airbnb.com/calendar/ical/..."
          className="h-10 w-full min-w-[300px] rounded-md border border-gray-300 px-3 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-md bg-black px-4 text-sm text-white hover:bg-black/90 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Feed"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
