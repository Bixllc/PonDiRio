import ical, { VEvent } from "node-ical";
import { prisma } from "./prisma";

interface SyncFeedResult {
  feedId: string;
  eventsUpserted: number;
  eventsRemoved: number;
  error?: string;
}

/**
 * Fetch and parse an iCal feed, then upsert events into ExternalCalendarEvent.
 * Events that no longer appear in the feed are deleted.
 */
export async function syncFeed(feed: {
  id: string;
  villaId: string;
  feedUrl: string;
}): Promise<SyncFeedResult> {
  // Fetch and parse the iCal data
  const parsed = await ical.async.fromURL(feed.feedUrl);

  // Extract VEVENTs with valid dates and UIDs
  const events: { uid: string; start: Date; end: Date; summary: string; raw: string }[] = [];

  for (const key of Object.keys(parsed)) {
    const component = parsed[key];
    if (!component || component.type !== "VEVENT") continue;
    const event = component as VEvent;

    if (!event.uid || !event.start || !event.end) continue;

    const summary = typeof event.summary === "string"
      ? event.summary
      : event.summary?.val || "";

    events.push({
      uid: event.uid,
      start: new Date(event.start),
      end: new Date(event.end),
      summary,
      raw: JSON.stringify(component),
    });
  }

  // Upsert each event using the composite unique key (feedId + eventUid)
  let upserted = 0;
  for (const event of events) {
    await prisma.externalCalendarEvent.upsert({
      where: {
        externalFeedId_externalEventUid: {
          externalFeedId: feed.id,
          externalEventUid: event.uid,
        },
      },
      create: {
        villaId: feed.villaId,
        externalFeedId: feed.id,
        externalEventUid: event.uid,
        startDate: event.start,
        endDate: event.end,
        summary: event.summary,
        rawPayload: event.raw,
      },
      update: {
        startDate: event.start,
        endDate: event.end,
        summary: event.summary,
        rawPayload: event.raw,
      },
    });
    upserted++;
  }

  // Remove events that are no longer in the feed
  const currentUids = events.map((e) => e.uid);
  const { count: removed } = await prisma.externalCalendarEvent.deleteMany({
    where: {
      externalFeedId: feed.id,
      externalEventUid: { notIn: currentUids },
    },
  });

  // Update last_synced_at
  await prisma.externalCalendarFeed.update({
    where: { id: feed.id },
    data: { lastSyncedAt: new Date() },
  });

  return { feedId: feed.id, eventsUpserted: upserted, eventsRemoved: removed };
}

/**
 * Sync all active external calendar feeds.
 */
export async function syncAllFeeds(): Promise<SyncFeedResult[]> {
  const feeds = await prisma.externalCalendarFeed.findMany({
    where: { isActive: true },
    select: { id: true, villaId: true, feedUrl: true, sourceName: true },
  });

  const results: SyncFeedResult[] = [];

  for (const feed of feeds) {
    try {
      const result = await syncFeed(feed);
      results.push(result);
    } catch (error) {
      results.push({
        feedId: feed.id,
        eventsUpserted: 0,
        eventsRemoved: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
