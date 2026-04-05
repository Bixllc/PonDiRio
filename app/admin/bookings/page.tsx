export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getBookings, getVillas } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { BookingsPageClient } from "./BookingsPageClient";

export default async function BookingsPage() {
  const [bookings, villas] = await Promise.all([getBookings(), getVillas()]);

  // Fetch all non-BOOKING availability blocks (manual/maintenance) across all villas
  const blocks = await prisma.availabilityBlock.findMany({
    where: { reason: { not: "BOOKING" } },
    orderBy: { startDate: "asc" },
    include: {
      booking: { select: { id: true, guestName: true } },
    },
  });

  // Serialize dates and Decimals for client component
  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    checkIn: b.checkIn.toISOString().split("T")[0],
    checkOut: b.checkOut.toISOString().split("T")[0],
    guestCount: b.guestCount,
    totalAmount: b.totalAmount.toString(),
    currency: b.currency,
    status: b.status,
    villa: b.villa,
    payments: b.payments.map((p) => ({ status: p.status })),
  }));

  const serializedBlocks = blocks.map((bl) => ({
    id: bl.id,
    villaId: bl.villaId,
    startDate: bl.startDate.toISOString().split("T")[0],
    endDate: bl.endDate.toISOString().split("T")[0],
    reason: bl.reason,
    source: bl.source,
    booking: bl.booking,
  }));

  return (
    <BookingsPageClient
      bookings={serializedBookings}
      blocks={serializedBlocks}
      villas={villas}
    />
  );
}
