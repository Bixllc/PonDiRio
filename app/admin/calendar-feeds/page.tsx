export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getCalendarFeeds } from "@/app/actions/admin";
import { AddFeedForm } from "./AddFeedForm";
import { RemoveFeedButton } from "./RemoveFeedButton";
import { SyncButton } from "./SyncButton";

const VILLA_ID = "cmn854tso0000ck3p78a7zy4x";

function formatDate(date: Date | null) {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CalendarFeedsPage() {
  const feeds = await getCalendarFeeds(VILLA_ID);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Calendar Feeds</h1>
        <SyncButton />
      </div>

      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Add Feed</h2>
        <AddFeedForm villaId={VILLA_ID} />
      </div>

      {feeds.length === 0 ? (
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
              {feeds.map((feed) => (
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
