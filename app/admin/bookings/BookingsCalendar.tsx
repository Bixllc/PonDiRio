"use client";

import { useState, useRef, useEffect } from "react";
import { CancelBookingButton } from "./CancelBookingButton";

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

type CalendarEntry = {
  id: string;
  type: "booking" | "block";
  label: string;
  startDate: Date;
  endDate: Date;
  villaId: string;
  villaName: string;
  color: string;
  booking?: Booking;
  block?: Block;
};

// ── Helpers ──────────────────────────────────────────────

function toDate(s: string) {
  return new Date(s + "T00:00:00");
}

function dateToStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Status → bar color
const STATUS_BAR_COLOR: Record<string, string> = {
  CONFIRMED: "bg-emerald-500",
  PENDING_PAYMENT: "bg-amber-400",
  DRAFT: "bg-gray-400",
  FAILED: "bg-gray-300",
  CANCELLED: "bg-gray-300",
  MANUAL_BLOCK: "bg-red-400",
};

const STATUS_BAR_TEXT: Record<string, string> = {
  CONFIRMED: "text-white",
  PENDING_PAYMENT: "text-amber-900",
  DRAFT: "text-white",
  FAILED: "text-white",
  CANCELLED: "text-white",
  MANUAL_BLOCK: "text-red-50",
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed",
  PENDING_PAYMENT: "Pending Payment",
  DRAFT: "Draft",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

// Villa-based accent colors when viewing all villas
const VILLA_BAR_COLORS = [
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-violet-500", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
];

// ── Component ────────────────────────────────────────────

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
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSelectedEntry(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Build villa index
  const villaIndex = new Map<string, number>();
  villas.forEach((v, i) => villaIndex.set(v.id, i));

  // Build calendar entries
  const entries: CalendarEntry[] = [];

  for (const b of bookings) {
    if (villaFilter !== "all" && b.villa.id !== villaFilter) continue;
    const vIdx = villaIndex.get(b.villa.id) ?? 0;
    const villaColor = VILLA_BAR_COLORS[vIdx % VILLA_BAR_COLORS.length];
    // Use status color normally, villa color when showing all
    const useVillaColor = villaFilter === "all" && villas.length > 1;
    entries.push({
      id: b.id,
      type: "booking",
      label: b.guestName,
      startDate: toDate(b.checkIn),
      endDate: toDate(b.checkOut),
      villaId: b.villa.id,
      villaName: b.villa.name,
      color: useVillaColor ? villaColor.bg : STATUS_BAR_COLOR[b.status] || "bg-gray-400",
      booking: b,
    });
  }

  for (const bl of blocks) {
    if (bl.reason === "BOOKING") continue;
    if (villaFilter !== "all" && bl.villaId !== villaFilter) continue;
    const villa = villas.find((v) => v.id === bl.villaId);
    entries.push({
      id: bl.id,
      type: "block",
      label: "Blocked",
      startDate: toDate(bl.startDate),
      endDate: toDate(bl.endDate),
      villaId: bl.villaId,
      villaName: villa?.name || "Unknown",
      color: STATUS_BAR_COLOR.MANUAL_BLOCK,
      block: bl,
    });
  }

  // Month boundaries
  const daysInMonth = getDaysInMonth(year, month);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month, daysInMonth);
  const firstDayOfWeek = monthStart.getDay(); // 0=Sun

  // Build week rows — include leading/trailing days to complete weeks
  const gridStart = addDays(monthStart, -firstDayOfWeek);
  const lastDayOfWeek = monthEnd.getDay();
  const gridEnd = addDays(monthEnd, 6 - lastDayOfWeek);
  const totalGridDays = diffDays(gridStart, gridEnd) + 1;
  const numWeeks = totalGridDays / 7;

  const weeks: Date[][] = [];
  for (let w = 0; w < numWeeks; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(addDays(gridStart, w * 7 + d));
    }
    weeks.push(week);
  }

  // For each week, figure out which entries overlap and assign rows
  function getWeekBars(week: Date[]) {
    const weekStart = week[0];
    const weekEnd = addDays(week[6], 1); // exclusive

    // Find entries that overlap this week
    const overlapping = entries.filter(
      (e) => e.startDate < weekEnd && e.endDate > weekStart,
    );

    // Assign rows (simple greedy lane allocation)
    const bars: {
      entry: CalendarEntry;
      startCol: number;
      span: number;
      row: number;
      isStart: boolean;
      isEnd: boolean;
    }[] = [];

    const lanes: (string | null)[] = []; // lane index -> entry id occupying it

    for (const entry of overlapping) {
      const clampedStart = entry.startDate < weekStart ? weekStart : entry.startDate;
      const clampedEnd = entry.endDate > weekEnd ? weekEnd : entry.endDate;
      const startCol = diffDays(weekStart, clampedStart);
      const span = diffDays(clampedStart, clampedEnd);
      const isStart = entry.startDate >= weekStart;
      const isEnd = entry.endDate <= weekEnd;

      if (span <= 0) continue;

      // Find a free lane
      let lane = lanes.findIndex((l) => l === null);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(null);
      }
      lanes[lane] = entry.id;

      bars.push({ entry, startCol, span, row: lane, isStart, isEnd });

      // Free lane after this bar ends (for bars in same week)
      // We do a simple approach: since we process in order, just mark free at end
    }

    // Re-assign lanes more carefully: greedy interval scheduling
    const sorted = [...bars].sort((a, b) => a.startCol - b.startCol || b.span - a.span);
    const laneEnds: number[] = [];

    for (const bar of sorted) {
      let assignedLane = -1;
      for (let i = 0; i < laneEnds.length; i++) {
        if (laneEnds[i] <= bar.startCol) {
          assignedLane = i;
          break;
        }
      }
      if (assignedLane === -1) {
        assignedLane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[assignedLane] = bar.startCol + bar.span;
      bar.row = assignedLane;
    }

    return sorted;
  }

  const monthName = new Date(year, month).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    setSelectedEntry(null);
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    setSelectedEntry(null);
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  function handleBarClick(entry: CalendarEntry, e: React.MouseEvent) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 6,
    });
    setSelectedEntry(entry);
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
            setSelectedEntry(null);
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All Villas</option>
          {villas.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-6 rounded-sm bg-emerald-500" /> Confirmed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-6 rounded-sm bg-amber-400" /> Pending Payment
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-6 rounded-sm bg-red-400" /> Manual Block
        </span>
        {villas.length > 1 && villaFilter === "all" &&
          villas.map((v, i) => (
            <span key={v.id} className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-6 rounded-sm ${VILLA_BAR_COLORS[i % VILLA_BAR_COLORS.length].bg}`} />
              {v.name}
            </span>
          ))}
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border bg-white">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => {
          const bars = getWeekBars(week);
          const maxRow = bars.length > 0 ? Math.max(...bars.map((b) => b.row)) : -1;
          const barAreaHeight = (maxRow + 1) * 30; // 30px per lane

          return (
            <div key={wi} className="border-b last:border-b-0">
              {/* Date labels row */}
              <div className="grid grid-cols-7">
                {week.map((date, di) => {
                  const ds = dateToStr(date);
                  const isCurrentMonth = date.getMonth() === month;
                  const isToday = ds === todayStr;
                  return (
                    <div
                      key={di}
                      className={`border-r last:border-r-0 px-2 pb-0.5 pt-2 ${
                        !isCurrentMonth ? "bg-gray-50/60" : ""
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isToday
                            ? "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black px-1 text-white"
                            : isCurrentMonth
                              ? "text-gray-700"
                              : "text-gray-300"
                        }`}
                      >
                        {formatDateShort(date)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bars area */}
              <div
                className="relative"
                style={{ minHeight: Math.max(barAreaHeight, 8) + "px" }}
              >
                {/* Grid lines (faint vertical separators) */}
                <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
                  {week.map((_, di) => (
                    <div key={di} className="border-r last:border-r-0" />
                  ))}
                </div>

                {/* Booking/block bars */}
                {bars.map((bar) => {
                  const { entry, startCol, span, row, isStart, isEnd } = bar;
                  const leftPct = (startCol / 7) * 100;
                  const widthPct = (span / 7) * 100;
                  const textColor = entry.type === "block"
                    ? STATUS_BAR_TEXT.MANUAL_BLOCK
                    : villaFilter === "all" && villas.length > 1
                      ? "text-white"
                      : STATUS_BAR_TEXT[entry.booking?.status || ""] || "text-white";

                  return (
                    <div
                      key={`${entry.id}-w${wi}`}
                      onClick={(e) => handleBarClick(entry, e)}
                      className={`absolute cursor-pointer transition-opacity hover:opacity-90 ${entry.color} ${textColor} flex items-center overflow-hidden px-2 text-xs font-medium shadow-sm ${
                        isStart ? "rounded-l-full" : ""
                      } ${isEnd ? "rounded-r-full" : ""}`}
                      style={{
                        left: `calc(${leftPct}% + 4px)`,
                        width: `calc(${widthPct}% - 8px)`,
                        top: row * 30 + 2 + "px",
                        height: "24px",
                      }}
                      title={entry.label}
                    >
                      {/* Initials circle */}
                      <span className="mr-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
                        {getInitials(entry.label)}
                      </span>
                      <span className="truncate">
                        {entry.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popover */}
      {selectedEntry && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-80 rounded-lg border bg-white shadow-xl"
          style={{
            left: Math.max(8, Math.min(popoverPos.x - 160, window.innerWidth - 330)),
            top: Math.min(popoverPos.y, window.innerHeight - 280),
          }}
        >
          {selectedEntry.type === "booking" && selectedEntry.booking && (() => {
            const b = selectedEntry.booking;
            const statusDot = STATUS_BAR_COLOR[b.status] || "bg-gray-400";
            return (
              <>
                <div className="border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${selectedEntry.color} text-xs font-bold text-white`}>
                      {getInitials(b.guestName)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{b.guestName}</div>
                      <div className="text-xs text-gray-500">{b.guestEmail}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 px-4 py-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-medium text-gray-900">{formatDateFull(b.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-medium text-gray-900">{formatDateFull(b.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guests</span>
                    <span className="font-medium text-gray-900">{b.guestCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total</span>
                    <span className="font-medium text-gray-900">${b.totalAmount} {b.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Villa</span>
                    <span className="font-medium text-gray-900">{selectedEntry.villaName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="flex items-center gap-1.5">
                      <span className={`inline-block h-2 w-2 rounded-full ${statusDot}`} />
                      <span className="font-medium text-gray-900">{STATUS_LABEL[b.status] || b.status}</span>
                    </span>
                  </div>
                </div>
                {(b.status === "CONFIRMED" || b.status === "PENDING_PAYMENT") && (
                  <div className="border-t px-4 py-2">
                    <CancelBookingButton bookingId={b.id} guestName={b.guestName} />
                  </div>
                )}
              </>
            );
          })()}

          {selectedEntry.type === "block" && selectedEntry.block && (() => {
            const bl = selectedEntry.block;
            return (
              <>
                <div className="border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-400 text-xs font-bold text-white">
                      BL
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-red-700">Manual Block</div>
                      <div className="text-xs text-gray-500">{selectedEntry.villaName}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 px-4 py-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">From</span>
                    <span className="font-medium text-gray-900">{formatDateFull(bl.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">To</span>
                    <span className="font-medium text-gray-900">{formatDateFull(bl.endDate)}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
