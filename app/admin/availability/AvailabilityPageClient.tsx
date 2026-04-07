"use client";

import { useState } from "react";
import { RemoveBlockButton } from "./RemoveBlockButton";

type Villa = { id: string; name: string };

type Block = {
  id: string;
  villaId: string;
  villaName: string;
  startDate: string;
  endDate: string;
  reason: string;
  source: string;
  guestName: string | null;
};

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AvailabilityBlocksTable({
  blocks,
  villas,
}: {
  blocks: Block[];
  villas: Villa[];
}) {
  const [villaFilter, setVillaFilter] = useState("all");

  const filtered = villaFilter === "all"
    ? blocks
    : blocks.filter((b) => b.villaId === villaFilter);

  return (
    <div>
      <div className="mb-4">
        <select
          value={villaFilter}
          onChange={(e) => setVillaFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All Villas</option>
          {villas.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
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
              {filtered.map((block) => (
                <tr key={block.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{block.villaName}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(block.startDate)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(block.endDate)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      {block.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{block.source}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {block.guestName || "--"}
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
