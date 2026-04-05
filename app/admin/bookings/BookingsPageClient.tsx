"use client";

import { useState } from "react";
import { BookingsCalendar } from "./BookingsCalendar";

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

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-800",
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  DRAFT: "bg-gray-100 text-gray-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BookingsPageClient({
  bookings,
  blocks,
  villas,
}: {
  bookings: Booking[];
  blocks: Block[];
  villas: Villa[];
}) {
  const [view, setView] = useState<"calendar" | "table">("calendar");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <div className="inline-flex rounded-md border bg-white">
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-1.5 text-sm font-medium ${
              view === "calendar"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900"
            } rounded-l-md`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 text-sm font-medium ${
              view === "table"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900"
            } rounded-r-md`}
          >
            Table
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <BookingsCalendar bookings={bookings} blocks={blocks} villas={villas} />
      ) : (
        <>
          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Villa</th>
                    <th className="px-4 py-3">Check-in</th>
                    <th className="px-4 py-3">Check-out</th>
                    <th className="px-4 py-3">Guests</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((booking) => {
                    const payment = booking.payments[0];
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {booking.guestName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.guestEmail}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {booking.villa.name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDate(booking.checkIn)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDate(booking.checkOut)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {booking.guestCount}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          ${booking.totalAmount} {booking.currency}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-800"}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {payment ? (
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_COLORS[payment.status] || "bg-gray-100 text-gray-800"}`}
                            >
                              {payment.status}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
