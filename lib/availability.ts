import { prisma } from "./prisma";
import { BookingStatus } from "@/app/generated/prisma/client";

const MINIMUM_NIGHTS = 2;

interface AvailabilityResult {
  available: boolean;
  reason?: string;
}

/**
 * Check whether a villa is available for the given date range.
 *
 * Checks all three sources per the spec:
 *  1. Confirmed / pending_payment bookings
 *  2. AvailabilityBlocks (manual blocks, maintenance, etc.)
 *  3. ExternalCalendarEvents (Airbnb / iCal)
 *
 * Date overlap logic: a conflict exists when an existing range starts before
 * the requested checkout AND ends after the requested checkin.
 */
export async function checkAvailability(
  villaId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<AvailabilityResult> {
  // --- Validate minimum stay ---
  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (nights < MINIMUM_NIGHTS) {
    return { available: false, reason: `Minimum stay is ${MINIMUM_NIGHTS} nights` };
  }

  if (checkIn >= checkOut) {
    return { available: false, reason: "Check-in must be before check-out" };
  }

  // Run all three checks in parallel
  const [conflictingBooking, conflictingBlock, conflictingEvent] =
    await Promise.all([
      // 1. Overlapping bookings that are active (confirmed or pending payment)
      prisma.booking.findFirst({
        where: {
          villaId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
        select: { id: true },
      }),

      // 2. Overlapping availability blocks (manual, maintenance, etc.)
      prisma.availabilityBlock.findFirst({
        where: {
          villaId,
          startDate: { lt: checkOut },
          endDate: { gt: checkIn },
        },
        select: { id: true, reason: true },
      }),

      // 3. Overlapping external calendar events (Airbnb / iCal)
      prisma.externalCalendarEvent.findFirst({
        where: {
          villaId,
          startDate: { lt: checkOut },
          endDate: { gt: checkIn },
        },
        select: { id: true, summary: true },
      }),
    ]);

  if (conflictingBooking) {
    return { available: false, reason: "Dates overlap with an existing booking" };
  }

  if (conflictingBlock) {
    return { available: false, reason: "Dates are blocked" };
  }

  if (conflictingEvent) {
    return { available: false, reason: "Dates are blocked by an external reservation" };
  }

  return { available: true };
}

/**
 * Returns all blocked date ranges for a villa within a given window.
 * Useful for the GET /api/villas/:id/availability endpoint (Step later).
 */
export async function getBlockedRanges(
  villaId: string,
  from: Date,
  to: Date,
): Promise<{ start: Date; end: Date; type: string }[]> {
  const [bookings, blocks, events] = await Promise.all([
    prisma.booking.findMany({
      where: {
        villaId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT] },
        checkIn: { lt: to },
        checkOut: { gt: from },
      },
      select: { checkIn: true, checkOut: true },
    }),

    prisma.availabilityBlock.findMany({
      where: {
        villaId,
        startDate: { lt: to },
        endDate: { gt: from },
      },
      select: { startDate: true, endDate: true, reason: true },
    }),

    prisma.externalCalendarEvent.findMany({
      where: {
        villaId,
        startDate: { lt: to },
        endDate: { gt: from },
      },
      select: { startDate: true, endDate: true },
    }),
  ]);

  return [
    ...bookings.map((b) => ({ start: b.checkIn, end: b.checkOut, type: "booking" })),
    ...blocks.map((b) => ({ start: b.startDate, end: b.endDate, type: b.reason.toLowerCase() })),
    ...events.map((e) => ({ start: e.startDate, end: e.endDate, type: "external" })),
  ];
}
