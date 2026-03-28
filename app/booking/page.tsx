"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Mail, Phone, Calendar, Users } from "lucide-react";
import { initiateBookingPayment } from "@/app/actions/booking";

const VILLA_ID = "cmn854tso0000ck3p78a7zy4x";
const CLEANING_FEE = 75;
const SERVICE_FEE = 50;
const MINIMUM_NIGHTS = 2;

type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  specialRequests?: string;
};

type AvailabilityStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "unavailable"; reason: string }
  | { state: "error"; reason: string };

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const facIframeRef = useRef<HTMLIFrameElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    mode: "onBlur",
    defaultValues: {
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      guests: searchParams.get("guests") || "2",
    },
  });

  const [availability, setAvailability] = useState<AvailabilityStatus>({ state: "idle" });
  const [submitError, setSubmitError] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number | null>(null);
  const [showFacRedirect, setShowFacRedirect] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  // Fetch villa price on mount
  useEffect(() => {
    fetch(`/api/villas?id=${VILLA_ID}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setPricePerNight(parseFloat(json.data.pricePerNight));
      })
      .catch(() => {});
  }, []);

  // Calculate nights and totals
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const stayTotal = pricePerNight && nights > 0 ? pricePerNight * nights : null;
  const grandTotal = stayTotal !== null ? stayTotal + CLEANING_FEE + SERVICE_FEE : null;

  // Check availability when dates change
  useEffect(() => {
    setAvailability({ state: "idle" });
    if (!checkIn || !checkOut) return;

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (outDate <= inDate) {
      setAvailability({ state: "unavailable", reason: "Check-out must be after check-in" });
      return;
    }

    const n = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    if (n < MINIMUM_NIGHTS) {
      setAvailability({ state: "unavailable", reason: `Minimum stay is ${MINIMUM_NIGHTS} nights` });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAvailability({ state: "checking" });

    (async () => {
      try {
        const res = await fetch(
          `/api/availability?villaId=${VILLA_ID}&checkIn=${checkIn}&checkOut=${checkOut}`,
          { signal: controller.signal },
        );
        const json = await res.json();
        if (controller.signal.aborted) return;
        if (!json.success) {
          setAvailability({ state: "error", reason: json.error });
        } else if (json.data.available) {
          setAvailability({ state: "available" });
        } else {
          setAvailability({ state: "unavailable", reason: "Dates unavailable" });
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setAvailability({
          state: "error",
          reason: err instanceof Error ? err.message : "Failed to check availability",
        });
      }
    })();

    return () => controller.abort();
  }, [checkIn, checkOut]);

  const onSubmit = async (data: BookingFormData) => {
    setSubmitError("");

    if (availability.state === "unavailable") {
      setSubmitError("Selected dates are not available");
      return;
    }

    // 1. Create booking
    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        villaId: VILLA_ID,
        guestName: `${data.firstName} ${data.lastName}`,
        guestEmail: data.email,
        guestPhone: data.phone,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guestCount: parseInt(data.guests),
        specialRequests: data.specialRequests || undefined,
      }),
    });

    const bookingJson = await bookingRes.json();
    if (!bookingJson.success) {
      setSubmitError(bookingJson.error || "Failed to create booking");
      return;
    }

    // 2. Initiate payment
    const paymentResult = await initiateBookingPayment(bookingJson.data.bookingId);

    if (!paymentResult.success) {
      setSubmitError(paymentResult.error || "Failed to initiate payment");
      return;
    }

    // Dev mode: redirect URL
    if (paymentResult.redirectUrl) {
      router.push(paymentResult.redirectUrl);
      return;
    }

    // Prod: render FAC hosted page HTML in a sandboxed iframe
    if (paymentResult.redirectHtml && facIframeRef.current) {
      facIframeRef.current.srcdoc = paymentResult.redirectHtml;
      setShowFacRedirect(true);
    }
  };

  // Shared input classes
  const inputCls =
    "h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-[#1a1a2e] outline-none transition placeholder:text-gray-400 focus:border-[#C8940A]/50 focus:ring-2 focus:ring-[#C8940A]/20";
  const iconCls = "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400";

  // If FAC redirect is active, show only the iframe
  if (showFacRedirect) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E8]">
        <iframe
          ref={facIframeRef}
          title="Payment"
          className="h-screen w-full max-w-2xl border-0"
          sandbox="allow-scripts allow-forms allow-same-origin allow-top-navigation"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      {/* Hidden iframe for FAC (pre-mounted so ref is ready) */}
      <iframe ref={facIframeRef} title="Payment" className="hidden" />

      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/">
            <img src="/logotransparent.png" alt="Pon Di Rio" className="h-12" />
          </a>
          <nav className="hidden gap-8 text-sm text-[#1a1a2e] md:flex">
            <a href="/#about" className="hover:opacity-70">About</a>
            <a href="/#villas" className="hover:opacity-70">Villas</a>
            <a href="/#contact" className="hover:opacity-70">Contact</a>
          </nav>
          <a
            href="/booking"
            className="rounded-lg bg-[#C8940A] px-6 py-2.5 text-sm font-bold text-[#1a1a2e] hover:bg-[#b08308]"
          >
            Book Now
          </a>
        </div>
      </div>

      {/* Title section — cream background */}
      <div className="bg-[#F5F1E8] px-6 pb-12 pt-16 text-center">
        <h1
          className={`font-serif mx-auto max-w-3xl text-5xl leading-tight text-[#1a1a2e] md:text-6xl lg:text-7xl`}
        >
          Booking
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500">
          Just a few more details and you&apos;ll be all set for your luxurious riverside
          escape at Pon Di Rio.
        </p>
      </div>

      {/* Form + Summary grid — white background */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto grid max-w-6xl gap-8 bg-white px-6 pb-20 pt-12 lg:grid-cols-[1fr_380px]"
      >
        {/* Left column */}
        <div className="space-y-6">
          {/* Card 1: Guest Information */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
            <h2
              className={`font-serif mb-6 text-2xl text-[#1a1a2e]`}
            >
              Guest Information
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1a1a2e]">
                  First Name <span className="text-[#C8940A]">*</span>
                </label>
                <div className="relative">
                  <User className={iconCls} />
                  <input
                    placeholder="John"
                    {...register("firstName", {
                      required: "First name is required",
                      pattern: {
                        value: /^[a-zA-Z\s'-]+$/,
                        message: "Letters only",
                      },
                    })}
                    className={inputCls}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1a1a2e]">
                  Last Name <span className="text-[#C8940A]">*</span>
                </label>
                <div className="relative">
                  <User className={iconCls} />
                  <input
                    placeholder="Doe"
                    {...register("lastName", {
                      required: "Last name is required",
                      pattern: {
                        value: /^[a-zA-Z\s'-]+$/,
                        message: "Letters only",
                      },
                    })}
                    className={inputCls}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1a1a2e]">
                  Email Address <span className="text-[#C8940A]">*</span>
                </label>
                <div className="relative">
                  <Mail className={iconCls} />
                  <input
                    type="email"
                    placeholder="john.doe@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    className={inputCls}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1a1a2e]">
                  Phone Number <span className="text-[#C8940A]">*</span>
                </label>
                <div className="relative">
                  <Phone className={iconCls} />
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9+\s()-]+$/,
                        message: "Numbers, +, spaces, dashes and parentheses only",
                      },
                    })}
                    className={inputCls}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Stay Details */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
            <h2
              className={`font-serif mb-6 text-2xl text-[#1a1a2e]`}
            >
              Stay Details
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* Check-in */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1a1a2e]">
                  Check-in Date
                </label>
                <div className="relative">
                  <Calendar className={iconCls} />
                  <input
                    type="date"
                    {...register("checkIn", { required: "Check-in is required" })}
                    className={inputCls}
                  />
                </div>
                {errors.checkIn && (
                  <p className="text-xs text-red-500">{errors.checkIn.message}</p>
                )}
              </div>

              {/* Check-out */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1a1a2e]">
                  Check-out Date
                </label>
                <div className="relative">
                  <Calendar className={iconCls} />
                  <input
                    type="date"
                    {...register("checkOut", { required: "Check-out is required" })}
                    className={inputCls}
                  />
                </div>
                {errors.checkOut && (
                  <p className="text-xs text-red-500">{errors.checkOut.message}</p>
                )}
              </div>

              {/* Guests */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1a1a2e]">
                  Number of Guests
                </label>
                <div className="relative">
                  <Users className={iconCls} />
                  <select
                    {...register("guests", { required: "Please select guests" })}
                    className={`${inputCls} appearance-none`}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.guests && (
                  <p className="text-xs text-red-500">{errors.guests.message}</p>
                )}
              </div>
            </div>

            {/* Availability feedback */}
            <div className="mt-4 h-5">
              {availability.state === "checking" && (
                <p className="text-sm text-gray-400">Checking availability...</p>
              )}
              {availability.state === "available" && (
                <p className="text-sm text-green-600">Dates are available</p>
              )}
              {availability.state === "unavailable" && (
                <p className="text-sm text-red-500">{availability.reason}</p>
              )}
              {availability.state === "error" && (
                <p className="text-sm text-red-500">{availability.reason}</p>
              )}
            </div>
          </div>

          {/* Card 3: Special Requests */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
            <h2
              className={`font-serif mb-6 text-2xl text-[#1a1a2e]`}
            >
              Special Requests
            </h2>

            <textarea
              rows={5}
              placeholder="Let us know if you have any special requests or requirements for your stay..."
              {...register("specialRequests")}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#1a1a2e] outline-none transition placeholder:text-gray-400 focus:border-[#C8940A]/50 focus:ring-2 focus:ring-[#C8940A]/20"
            />
            <p className="mt-2 text-xs text-gray-400">
              Special requests cannot be guaranteed, but we&apos;ll do our best to
              accommodate them.
            </p>
          </div>
        </div>

        {/* Right column — Booking Summary (sticky) */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
            <h2
              className={`font-serif mb-5 text-2xl text-[#1a1a2e]`}
            >
              Booking Summary
            </h2>

            {/* Villa image */}
            <div className="mb-4 overflow-hidden rounded-xl">
              <img
                src="/1.png"
                alt="Palm Villa"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <h3
              className={`font-serif text-xl text-[#1a1a2e]`}
            >
              Palm Villa
            </h3>
            <p className="mb-5 text-sm text-gray-500">
              Riverside luxury villa with private deck
            </p>

            <hr className="mb-5 border-gray-100" />

            {/* Price breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {pricePerNight !== null && nights > 0
                    ? `$${pricePerNight} x ${nights} night${nights !== 1 ? "s" : ""}`
                    : "Select dates to see pricing"}
                </span>
                <span className="font-medium text-[#1a1a2e]">
                  {stayTotal !== null ? `$${stayTotal}` : "--"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cleaning fee</span>
                <span className="font-medium text-[#1a1a2e]">${CLEANING_FEE}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee</span>
                <span className="font-medium text-[#1a1a2e]">${SERVICE_FEE}</span>
              </div>
            </div>

            <hr className="my-5 border-gray-100" />

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-[#1a1a2e]">
                Total (USD)
              </span>
              <span className="text-xl font-semibold text-[#1a1a2e]">
                {grandTotal !== null ? `$${grandTotal}` : "--"}
              </span>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs text-red-600">{submitError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                availability.state === "unavailable" ||
                availability.state === "checking"
              }
              className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-[#C8940A] text-sm font-bold text-[#1a1a2e] transition hover:bg-[#b08308] disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Proceed to Payment"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              You&apos;ll be redirected to our secure payment page
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F5F1E8]">
          <p className="text-gray-400">Loading...</p>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
