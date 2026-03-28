import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DevConfirmButton } from "./DevConfirmButton";

export default async function DevPaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  const { bookingId } = await searchParams;

  if (!bookingId) {
    return <p className="p-8 text-red-600">Missing bookingId parameter</p>;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      guestName: true,
      guestEmail: true,
      checkIn: true,
      checkOut: true,
      totalAmount: true,
      currency: true,
      status: true,
      villa: { select: { name: true } },
    },
  });

  if (!booking) {
    return <p className="p-8 text-red-600">Booking not found</p>;
  }

  return (
    <div className="mx-auto max-w-lg p-8">
      <div className="mb-2 inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
        DEV ONLY
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Mock Payment Page</h1>

      <div className="mb-8 rounded-lg border bg-white p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Guest</dt>
            <dd className="font-medium text-gray-900">{booking.guestName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Villa</dt>
            <dd className="text-gray-900">{booking.villa.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Check-in</dt>
            <dd className="text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Check-out</dt>
            <dd className="text-gray-900">{new Date(booking.checkOut).toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between border-t pt-3">
            <dt className="font-medium text-gray-900">Total</dt>
            <dd className="font-medium text-gray-900">
              ${booking.totalAmount.toString()} {booking.currency}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Status</dt>
            <dd className="text-gray-900">{booking.status}</dd>
          </div>
        </dl>
      </div>

      <DevConfirmButton bookingId={bookingId} />
    </div>
  );
}
