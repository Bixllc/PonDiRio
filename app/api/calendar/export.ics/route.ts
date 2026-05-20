import { NextRequest, NextResponse } from "next/server";
import ical from "ical-generator";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/app/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const villaId = request.nextUrl.searchParams.get("villaId");

  if (!villaId) {
    return NextResponse.json({ error: "villaId is required" }, { status: 400 });
  }

  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { id: true, name: true },
  });

  if (!villa) {
    return NextResponse.json({ error: "Villa not found" }, { status: 400 });
  }

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: { villaId, status: BookingStatus.CONFIRMED },
      select: { id: true, checkIn: true, checkOut: true },
    }),
    prisma.availabilityBlock.findMany({
      where: { villaId, bookingId: null },
      select: { id: true, startDate: true, endDate: true },
    }),
  ]);

  const calendar = ical({ name: villa.name });

  for (const booking of bookings) {
    calendar.createEvent({
      uid: `booking-${booking.id}@pondiriorivercottagesja.com`,
      start: booking.checkIn,
      end: booking.checkOut,
      summary: "Reserved",
      allDay: true,
    });
  }

  for (const block of blocks) {
    calendar.createEvent({
      uid: `block-${block.id}@pondiriorivercottagesja.com`,
      start: block.startDate,
      end: block.endDate,
      summary: "Reserved",
      allDay: true,
    });
  }

  return new NextResponse(calendar.toString(), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="calendar.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
