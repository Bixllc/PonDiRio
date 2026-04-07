export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getVillas } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { BlockDatesForm } from "./BlockDatesForm";
import { AvailabilityBlocksTable } from "./AvailabilityPageClient";

export default async function AvailabilityPage() {
  const villas = await getVillas();

  const blocks = await prisma.availabilityBlock.findMany({
    orderBy: { startDate: "asc" },
    include: {
      booking: { select: { id: true, guestName: true } },
      villa: { select: { id: true, name: true } },
    },
  });

  const serializedBlocks = blocks.map((b) => ({
    id: b.id,
    villaId: b.villaId,
    villaName: b.villa.name,
    startDate: b.startDate.toISOString().split("T")[0],
    endDate: b.endDate.toISOString().split("T")[0],
    reason: b.reason,
    source: b.source,
    guestName: b.booking?.guestName || null,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Availability</h1>

      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Block Dates</h2>
        <BlockDatesForm villas={villas} />
      </div>

      <AvailabilityBlocksTable blocks={serializedBlocks} villas={villas} />
    </div>
  );
}
