import { getBookingConfirmation } from "@/app/actions/booking";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Booking Confirmed | Pon Di Rio",
  description: "Your reservation at Pon Di Rio has been confirmed.",
};

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E8] px-6">
        <div className="text-center">
          <p className="text-gray-600">No booking ID provided.</p>
          <a
            href="/"
            className="mt-4 inline-block rounded-lg bg-[#C8940A] px-6 py-3 text-sm font-bold text-[#1a1a2e] hover:bg-[#b08308] transition"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  const result = await getBookingConfirmation(bookingId);

  if (!result.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E8] px-6">
        <div className="text-center">
          <p className="text-red-600">{result.error}</p>
          <a
            href="/"
            className="mt-4 inline-block rounded-lg bg-[#C8940A] px-6 py-3 text-sm font-bold text-[#1a1a2e] hover:bg-[#b08308] transition"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  const booking = result.data;
  const checkInDate = new Date(booking.checkIn).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1E8] px-6 py-16">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <a href="/">
            <img
              src="/logotransparent.png"
              alt="Pon Di Rio"
              className="mx-auto h-16"
            />
          </a>
        </div>

        {/* Confirmation card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
          {/* Success icon + heading */}
          <div className="mb-6 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
            <h1
              className="mt-4 text-3xl text-[#1a1a2e]"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Booking Confirmed
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Thank you for choosing Pon Di Rio. Your reservation is confirmed.
            </p>
          </div>

          <hr className="mb-6 border-gray-100" />

          {/* Booking details */}
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Booking ID</dt>
              <dd className="font-mono text-xs font-medium text-[#1a1a2e]">
                {booking.id}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Guest</dt>
              <dd className="font-medium text-[#1a1a2e]">
                {booking.guestName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Villa</dt>
              <dd className="font-medium text-[#1a1a2e]">
                {booking.villaName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Check-in</dt>
              <dd className="text-[#1a1a2e]">{checkInDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Check-out</dt>
              <dd className="text-[#1a1a2e]">{checkOutDate}</dd>
            </div>

            <hr className="border-gray-100" />

            <div className="flex justify-between">
              <dt className="text-base font-semibold text-[#1a1a2e]">
                Total Paid
              </dt>
              <dd className="text-base font-semibold text-[#1a1a2e]">
                ${booking.totalAmount} {booking.currency}
              </dd>
            </div>
          </dl>

          <hr className="my-6 border-gray-100" />

          {/* Info note */}
          <p className="text-xs leading-relaxed text-gray-400">
            A confirmation email has been sent to your email address with your
            booking details and pre-arrival information. If you have any
            questions, please contact us at{" "}
            <a
              href="mailto:info@pondirio.com"
              className="text-amber-700 underline hover:text-amber-600"
            >
              info@pondirio.com
            </a>
            .
          </p>

          {/* Homepage button */}
          <a
            href="/"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#C8940A] text-sm font-bold text-[#1a1a2e] transition hover:bg-[#b08308]"
          >
            Return to Homepage
          </a>

          {/* Payment logos */}
          <div className="mt-5 flex items-center justify-center gap-4">
            {/* Visa */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 500" className="h-7 w-auto" aria-label="Visa">
              <rect width="780" height="500" rx="40" fill="#1A1F71" />
              <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8zM540.7 157.3c-10.5-4-27.1-8.3-47.7-8.3-52.6 0-89.7 26.5-89.9 64.5-.3 28.1 26.4 43.7 46.6 53.1 20.7 9.6 27.7 15.7 27.6 24.3-.1 13.1-16.6 19.1-31.9 19.1-21.3 0-32.6-3-50.2-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.5 10.2 59.4 10.5 56 0 92.3-26.2 92.7-66.8.2-22.3-14-39.2-44.6-53.2-18.6-9.1-30-15.1-29.9-24.3 0-8.1 9.6-16.8 30.4-16.8 17.4-.3 30 3.5 39.8 7.5l4.8 2.2 7.3-42.3zM636.5 152.9h-41.2c-12.8 0-22.3 3.5-27.9 16.2l-79.2 179.6h56l11.2-29.4h68.4l6.5 29.4h49.4l-43.2-195.8zm-65.8 126.4c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.4 56.6h-44.5zM232.1 152.9l-52.2 133.5-5.6-27.1c-9.7-31.2-39.9-65.1-73.7-82l47.8 171.2h56.4l83.8-195.6h-56.5z" fill="#fff" />
              <path d="M124.6 152.9H38.2l-.6 3.6c66.9 16.2 111.2 55.4 129.6 102.4l-18.7-90.1c-3.2-12.4-12.7-15.5-24.9-15.9z" fill="#F9A533" />
            </svg>
            {/* Mastercard */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 500" className="h-7 w-auto" aria-label="Mastercard">
              <rect width="780" height="500" rx="40" fill="#252525" />
              <circle cx="330" cy="250" r="140" fill="#EB001B" />
              <circle cx="450" cy="250" r="140" fill="#F79E1B" />
              <path d="M390 143.6c34.5 27.8 56.6 70.1 56.6 117.4s-22.1 89.6-56.6 117.4c-34.5-27.8-56.6-70.1-56.6-117.4s22.1-89.6 56.6-117.4z" fill="#FF5F00" />
            </svg>
            {/* PowerTranz logo */}
            <img
              src="/powered-by-powertranz.jpg"
              alt="Powered by PowerTranz"
              className="h-7 w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
