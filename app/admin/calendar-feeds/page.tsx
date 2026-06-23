export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getCalendarFeeds, getVillas } from "@/app/actions/admin";
import { CalendarFeedsClient } from "./CalendarFeedsClient";
import { SyncButton } from "./SyncButton";

export default async function CalendarFeedsPage() {
  const [villas, feeds] = await Promise.all([getVillas(), getCalendarFeeds()]);

  const serializedFeeds = feeds.map((f) => ({
    id: f.id,
    villaId: f.villaId,
    sourceName: f.sourceName,
    feedUrl: f.feedUrl,
    isActive: f.isActive,
    lastSyncedAt: f.lastSyncedAt ? f.lastSyncedAt.toISOString() : null,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Calendar Feeds</h1>
        <SyncButton />
      </div>

      <CalendarFeedsClient villas={villas} feeds={serializedFeeds} />
    </div>
  );
}
