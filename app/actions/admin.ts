"use server";

import { prisma } from "@/lib/prisma";

// ─── Bookings ─────────────────────────────────────────────

export async function getBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      villa: { select: { id: true, name: true, slug: true } },
      payments: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          externalTransactionId: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function getBooking(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      villa: { select: { id: true, name: true, slug: true } },
      payments: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          externalTransactionId: true,
          createdAt: true,
        },
      },
      availabilityBlock: true,
    },
  });
}

// ─── Date Blocking ────────────────────────────────────────

export async function blockDates(
  villaId: string,
  startDate: Date,
  endDate: Date,
) {
  if (startDate >= endDate) {
    throw new Error("Start date must be before end date");
  }

  return prisma.availabilityBlock.create({
    data: {
      villaId,
      startDate,
      endDate,
      reason: "MANUAL",
      source: "INTERNAL",
    },
  });
}

export async function unblockDates(blockId: string) {
  const block = await prisma.availabilityBlock.findUnique({
    where: { id: blockId },
    select: { reason: true },
  });

  if (!block) {
    throw new Error("Block not found");
  }

  if (block.reason === "BOOKING") {
    throw new Error("Cannot unblock dates tied to a confirmed booking");
  }

  return prisma.availabilityBlock.delete({
    where: { id: blockId },
  });
}

export async function getAvailabilityBlocks(villaId: string) {
  return prisma.availabilityBlock.findMany({
    where: { villaId },
    orderBy: { startDate: "asc" },
    include: {
      booking: { select: { id: true, guestName: true } },
    },
  });
}

// ─── Calendar Feeds ───────────────────────────────────────

export async function getCalendarFeeds(villaId?: string) {
  return prisma.externalCalendarFeed.findMany({
    where: villaId ? { villaId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      villa: { select: { id: true, name: true } },
    },
  });
}

export async function addCalendarFeed(
  villaId: string,
  sourceName: string,
  feedUrl: string,
) {
  return prisma.externalCalendarFeed.create({
    data: {
      villaId,
      sourceName,
      feedUrl,
    },
  });
}

export async function triggerCalendarSync() {
  const { syncAllFeeds } = await import("@/lib/calendar");
  const results = await syncAllFeeds();
  return results.map((r) => ({
    feedId: r.feedId,
    eventsUpserted: r.eventsUpserted,
    eventsRemoved: r.eventsRemoved,
    error: r.error,
  }));
}

export async function removeCalendarFeed(feedId: string) {
  return prisma.externalCalendarFeed.update({
    where: { id: feedId },
    data: { isActive: false },
  });
}
