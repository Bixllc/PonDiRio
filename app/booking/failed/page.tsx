import { XCircle } from "lucide-react";

export const metadata = {
  title: "Payment Failed | Pon Di Rio",
  description: "Your payment could not be processed.",
};

export default async function BookingFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; reason?: string }>;
}) {
  const { id, reason } = await searchParams;

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

        {/* Failure card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
          <div className="mb-6 text-center">
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1
              className="mt-4 text-3xl text-[#1a1a2e]"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Payment Failed
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Unfortunately, your payment could not be processed.
            </p>
          </div>

          <hr className="mb-6 border-gray-100" />

          {reason && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{reason}</p>
            </div>
          )}

          {id && (
            <p className="mb-6 text-center text-xs text-gray-400">
              Booking reference: <span className="font-mono">{id}</span>
            </p>
          )}

          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            No charges have been made to your card. You can try booking again or
            contact us at{" "}
            <a
              href="mailto:info@pondirio.com"
              className="text-amber-700 underline hover:text-amber-600"
            >
              info@pondirio.com
            </a>{" "}
            for assistance.
          </p>

          <div className="flex gap-3">
            <a
              href="/booking"
              className="flex h-12 flex-1 items-center justify-center rounded-lg bg-[#C8940A] text-sm font-bold text-[#1a1a2e] transition hover:bg-[#b08308]"
            >
              Try Again
            </a>
            <a
              href="/"
              className="flex h-12 flex-1 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-[#1a1a2e] transition hover:bg-gray-50"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
