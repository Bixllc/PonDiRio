export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getVillas } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { BlockDatesForm } from "./BlockDatesForm";
import { RemoveBlockButton } from "./RemoveBlockButton";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AvailabilityPage() {
  const villas = await getVillas();

  // Fetch blocks for all villas
  const blocks = await prisma.availabilityBlock.findMany({
    orderBy: { startDate: "asc" },
    include: {
      booking: { select: { id: true, guestName: true } },
      villa: { select: { id: true, name: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Availability</h1>

      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Block Dates</h2>
        <BlockDatesForm villas={villas} />
      </div>

      {blocks.length === 0 ? (
        <p className="text-gray-500">No date blocks.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Villa</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Linked Booking</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {blocks.map((block) => (
                <tr key={block.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{block.villa.name}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(block.startDate)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(block.endDate)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      {block.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{block.source}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {block.booking ? block.booking.guestName : "--"}
                  </td>
                  <td className="px-4 py-3">
                    {block.reason !== "BOOKING" && (
                      <RemoveBlockButton blockId={block.id} />
                    )}
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
