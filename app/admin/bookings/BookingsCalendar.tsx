"use client";

import { useState, useRef, useEffect } from "react";

type Villa = { id: string; name: string; slug: string };

type Booking = {
  id: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalAmount: string;
  currency: string;
  status: string;
  villa: Villa;
  payments: { status: string }[];
};

type Block = {
  id: string;
  villaId: string;
  startDate: string;
  endDate: string;
  reason: string;
  source: string;
  booking: { id: string; guestName: string } | null;
};

type DayEntry = {
  type: "booking" | "block";
  booking?: Booking;
  block?: Block;
  villaId: string;
  villaName: string;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function dateToStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const VILLA_COLORS: Record<number, { dot: string; bg: string }> = {
  0: { dot: "bg-blue-500", bg: "bg-blue-50" },
  1: { dot: "bg-purple-500", bg: "bg-purple-50" },
  2: { dot: "bg-teal-500", bg: "bg-teal-50" },
};

const STATUS_DOT: Record<string, string> = {
  CONFIRMED: "bg-green-500",
  PENDING_PAYMENT: "bg-yellow-400",
  MANUAL: "bg-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed",
  PENDING_PAYMENT: "Pending Payment",
  DRAFT: "Draft",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  MANUAL: "Manual Block",
};

export function BookingsCalendar({
  bookings,
  blocks,
  villas,
}: {
  bookings: Booking[];
  blocks: Block[];
  villas: Villa[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [villaFilter, setVillaFilter] = useState("all");
  const [popover, setPopover] = useState<{
    entries: DayEntry[];
    dateStr: string;
    x: number;
    y: number;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Build villa index for colors
  const villaIndex = new Map<string, number>();
  villas.forEach((v, i) => villaIndex.set(v.id, i));

  // Build a map: dateStr -> DayEntry[]
  const dayMap = new Map<string, DayEntry[]>();

  function addEntry(dateStr: string, entry: DayEntry) {
    if (!dayMap.has(dateStr)) dayMap.set(dateStr, []);
    dayMap.get(dateStr)!.push(entry);
  }

  // Add bookings — span check-in to check-out (exclusive of check-out)
  for (const b of bookings) {
    if (villaFilter !== "all" && b.villa.id !== villaFilter) continue;
    const start = new Date(b.checkIn + "T00:00:00");
    const end = new Date(b.checkOut + "T00:00:00");
    const cursor = new Date(start);
    while (cursor < end) {
      addEntry(dateToStr(cursor), {
        type: "booking",
        booking: b,
        villaId: b.villa.id,
        villaName: b.villa.name,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Add manual/maintenance blocks
  for (const bl of blocks) {
    if (bl.reason === "BOOKING") continue; // already covered by bookings
    if (villaFilter !== "all" && bl.villaId !== villaFilter) continue;
    const villa = villas.find((v) => v.id === bl.villaId);
    const start = new Date(bl.startDate + "T00:00:00");
    const end = new Date(bl.endDate + "T00:00:00");
    const cursor = new Date(start);
    while (cursor < end) {
      addEntry(dateToStr(cursor), {
        type: "block",
        block: bl,
        villaId: bl.villaId,
        villaName: villa?.name || "Unknown",
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const monthName = new Date(year, month).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    setPopover(null);
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    setPopover(null);
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function handleDayClick(day: number, e: React.MouseEvent) {
    const dateStr = dateToStr(new Date(year, month, day));
    const entries = dayMap.get(dateStr);
    if (!entries || entries.length === 0) {
      setPopover(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({
      entries,
      dateStr,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 4,
    });
  }

  const todayStr = dateToStr(today);
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            &larr;
          </button>
          <span className="min-w-[160px] text-center text-sm font-semibold text-gray-900">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            &rarr;
          </button>
        </div>
        <select
          value={villaFilter}
          onChange={(e) => {
            setVillaFilter(e.target.value);
            setPopover(null);
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All Villas</option>
          {villas.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" /> Confirmed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" /> Pending Payment
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> Manual Block
        </span>
        {villas.length > 1 &&
          villaFilter === "all" &&
          villas.map((v, i) => (
            <span key={v.id} className="flex items-center gap-1">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-sm ${VILLA_COLORS[i % 3]?.dot || "bg-gray-400"}`}
              />
              {v.name}
            </span>
          ))}
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border bg-white">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-1 py-2 text-center text-xs font-medium uppercase text-gray-500"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r bg-gray-50/50" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = dateToStr(new Date(year, month, day));
            const entries = dayMap.get(dateStr) || [];
            const isToday = dateStr === todayStr;
            const hasEntries = entries.length > 0;

            return (
              <div
                key={day}
                onClick={(e) => handleDayClick(day, e)}
                className={`min-h-[80px] border-b border-r p-1.5 transition-colors ${
                  hasEntries ? "cursor-pointer hover:bg-gray-50" : ""
                } ${isToday ? "bg-amber-50/50" : ""}`}
              >
                <div
                  className={`mb-1 text-xs font-medium ${
                    isToday
                      ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-black text-white"
                      : "text-gray-700"
                  }`}
                >
                  {day}
                </div>

                {/* Entry indicators — show up to 3 */}
                <div className="space-y-0.5">
                  {entries.slice(0, 3).map((entry, idx) => {
                    const villaIdx = villaIndex.get(entry.villaId) ?? 0;
                    const villaColor = VILLA_COLORS[villaIdx % 3] || VILLA_COLORS[0];

                    if (entry.type === "booking" && entry.booking) {
                      const statusDot =
                        STATUS_DOT[entry.booking.status] || "bg-gray-400";
                      return (
                        <div
                          key={`${entry.booking.id}-${idx}`}
                          className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight ${
                            villaFilter === "all" && villas.length > 1
                              ? villaColor.bg
                              : "bg-gray-100"
                          }`}
                        >
                          <span
                            className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${statusDot}`}
                          />
                          <span className="truncate font-medium text-gray-700">
                            {getInitials(entry.booking.guestName)}
                          </span>
                        </div>
                      );
                    }

                    if (entry.type === "block") {
                      return (
                        <div
                          key={`${entry.block?.id}-${idx}`}
                          className="flex items-center gap-1 rounded bg-red-50 px-1 py-0.5 text-[10px] leading-tight"
                        >
                          <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                          <span className="truncate font-medium text-red-700">BLK</span>
                        </div>
                      );
                    }

                    return null;
                  })}
                  {entries.length > 3 && (
                    <div className="text-[10px] text-gray-400">
                      +{entries.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Trailing empty cells */}
          {(() => {
            const totalCells = firstDay + daysInMonth;
            const remainder = totalCells % 7;
            if (remainder === 0) return null;
            return Array.from({ length: 7 - remainder }).map((_, i) => (
              <div
                key={`trail-${i}`}
                className="min-h-[80px] border-b border-r bg-gray-50/50"
              />
            ));
          })()}
        </div>
      </div>

      {/* Popover */}
      {popover && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-72 rounded-lg border bg-white shadow-lg"
          style={{
            left: Math.min(popover.x - 144, window.innerWidth - 300),
            top: popover.y,
          }}
        >
          <div className="border-b px-3 py-2">
            <div className="text-xs font-semibold text-gray-500">
              {formatDate(popover.dateStr)}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y">
            {popover.entries.map((entry, idx) => {
              if (entry.type === "booking" && entry.booking) {
                const b = entry.booking;
                const statusDot = STATUS_DOT[b.status] || "bg-gray-400";
                return (
                  <div key={`pop-${b.id}-${idx}`} className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${statusDot}`}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {b.guestName}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 pl-4 text-xs text-gray-500">
                      <div>{b.guestEmail}</div>
                      <div>
                        {formatDate(b.checkIn)} &rarr; {formatDate(b.checkOut)}
                      </div>
                      <div>
                        ${b.totalAmount} {b.currency} &middot; {b.guestCount} guest
                        {b.guestCount !== 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">
                          {STATUS_LABEL[b.status] || b.status}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>{entry.villaName}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (entry.type === "block" && entry.block) {
                const bl = entry.block;
                return (
                  <div key={`pop-bl-${bl.id}-${idx}`} className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-red-700">
                        Manual Block
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 pl-4 text-xs text-gray-500">
                      <div>
                        {formatDate(bl.startDate)} &rarr; {formatDate(bl.endDate)}
                      </div>
                      <div>{entry.villaName}</div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
