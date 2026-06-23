"use client";

import { useState } from "react";
import { AddFeedForm } from "./AddFeedForm";
import { RemoveFeedButton } from "./RemoveFeedButton";

type Villa = { id: string; name: string; slug: string };

type Feed = {
  id: string;
  villaId: string;
  sourceName: string;
  feedUrl: string;
  isActive: boolean;
  lastSyncedAt: string | null;
};

function formatDate(date: string | null) {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Jamaica",
  });
}

export function CalendarFeedsClient({
  villas,
  feeds,
}: {
  villas: Villa[];
  feeds: Feed[];
}) {
  const [selectedVillaId, setSelectedVillaId] = useState(villas[0]?.id ?? "");

  const filteredFeeds = feeds.filter((f) => f.villaId === selectedVillaId);

  return (
    <div>
      <div className="mb-6">
        <label className="mb-1 block text-sm text-gray-600">Villa</label>
        <select
          value={selectedVillaId}
          onChange={(e) => setSelectedVillaId(e.target.value)}
          className="h-10 rounded-md border border-gray-300 px-3 text-sm"
        >
          {villas.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Add Feed</h2>
        {selectedVillaId && <AddFeedForm villaId={selectedVillaId} />}
      </div>

      {filteredFeeds.length === 0 ? (
        <p className="text-gray-500">No calendar feeds configured.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Feed URL</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Last Synced</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFeeds.map((feed) => (
                <tr key={feed.id} className={`hover:bg-gray-50 ${!feed.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{feed.sourceName}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="inline-block max-w-xs truncate text-xs" title={feed.feedUrl}>
                      {feed.feedUrl}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {feed.isActive ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(feed.lastSyncedAt)}</td>
                  <td className="px-4 py-3">
                    {feed.isActive && <RemoveFeedButton feedId={feed.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
