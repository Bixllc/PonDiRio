"use server";

import { revalidatePath } from "next/cache";
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

export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "CONFIRMED" && booking.status !== "PENDING_PAYMENT") {
    throw new Error(`Cannot cancel a booking with status ${booking.status}`);
  }

  // Cancel booking and delete linked availability block in one transaction
  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    }),
    prisma.availabilityBlock.deleteMany({
      where: { bookingId },
    }),
  ]);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/availability");
  revalidatePath("/booking");
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

  // Prevent blocking dates that overlap with a confirmed booking
  const conflicting = await prisma.booking.findFirst({
    where: {
      villaId,
      status: "CONFIRMED",
      checkIn: { lt: endDate },
      checkOut: { gt: startDate },
    },
    select: { guestName: true, checkIn: true, checkOut: true },
  });

  if (conflicting) {
    throw new Error(
      `Cannot block dates — overlaps with confirmed booking for ${conflicting.guestName} (${conflicting.checkIn.toISOString().split("T")[0]} to ${conflicting.checkOut.toISOString().split("T")[0]})`,
    );
  }

  const block = await prisma.availabilityBlock.create({
    data: {
      villaId,
      startDate,
      endDate,
      reason: "MANUAL",
      source: "INTERNAL",
    },
  });
  revalidatePath("/admin/availability");
  revalidatePath("/admin/bookings");
  revalidatePath("/booking");
  return block;
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

  const deleted = await prisma.availabilityBlock.delete({
    where: { id: blockId },
  });
  revalidatePath("/admin/availability");
  revalidatePath("/admin/bookings");
  revalidatePath("/booking");
  return deleted;
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

// ─── Villas ──────────────────────────────────────────────

export async function getVillas() {
  return prisma.villa.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
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
  const feed = await prisma.externalCalendarFeed.create({
    data: {
      villaId,
      sourceName,
      feedUrl,
    },
  });
  revalidatePath("/admin/calendar-feeds");
  return feed;
}

export async function triggerCalendarSync() {
  const { syncAllFeeds } = await import("@/lib/calendar");
  const results = await syncAllFeeds();
  revalidatePath("/admin/calendar-feeds");
  revalidatePath("/admin/availability");
  revalidatePath("/booking");
  return results.map((r) => ({
    feedId: r.feedId,
    eventsUpserted: r.eventsUpserted,
    eventsRemoved: r.eventsRemoved,
    error: r.error,
  }));
}

export async function removeCalendarFeed(feedId: string) {
  const feed = await prisma.externalCalendarFeed.update({
    where: { id: feedId },
    data: { isActive: false },
  });
  revalidatePath("/admin/calendar-feeds");
  return feed;
}
