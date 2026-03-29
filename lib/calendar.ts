import ical, { VEvent } from "node-ical";
import { prisma } from "./prisma";

interface SyncFeedResult {
  feedId: string;
  eventsUpserted: number;
  eventsRemoved: number;
  error?: string;
}

export async function syncFeed(feed: {
  id: string;
  villaId: string;
  feedUrl: string;
}): Promise<SyncFeedResult> {
  const ical = await import("node-ical");
  const { prisma } = await import("./prisma");

  const parsed = await ical.default.async.fromURL(feed.feedUrl);

  const events: { uid: string; start: Date; end: Date; summary: string; raw: string }[] = [];

  for (const key of Object.keys(parsed)) {
    const component = parsed[key];
    if (!component || component.type !== "VEVENT") continue;
    if (!("uid" in component) || !("start" in component) || !("end" in component)) continue;
    if (!component.uid || !component.start || !component.end) continue;

    const summary =
      typeof component.summary === "string"
        ? component.summary
        : component.summary?.val || "";

    events.push({
      uid: component.uid,
      start: new Date(component.start),
      end: new Date(component.end),
      summary,
      raw: JSON.stringify(component),
    });
  }

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

  const currentUids = events.map((e) => e.uid);
  const { count: removed } = await prisma.externalCalendarEvent.deleteMany({
    where: {
      externalFeedId: feed.id,
      externalEventUid: { notIn: currentUids },
    },
  });

  await prisma.externalCalendarFeed.update({
    where: { id: feed.id },
    data: { lastSyncedAt: new Date() },
  });

  return { feedId: feed.id, eventsUpserted: upserted, eventsRemoved: removed };
}

export async function syncAllFeeds(): Promise<SyncFeedResult[]> {
  const { prisma } = await import("./prisma");

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