"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Mail, Phone, Users, Home } from "lucide-react";
import { initiateBookingPayment } from "@/app/actions/booking";
import { DayPicker, DateRange } from "react-day-picker";
import { format, addMonths, eachDayOfInterval, startOfDay, differenceInCalendarDays, parseISO } from "date-fns";
import "react-day-picker/style.css";

const CLEANING_FEE = 75;
const SERVICE_FEE = 50;
const MINIMUM_NIGHTS = 2;

type Villa = {
  id: string;
  name: string;
  slug: string;
  pricePerNight: string;
  maxGuests: number;
};

type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  villa: string;
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    mode: "onBlur",
    defaultValues: {
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      guests: searchParams.get("guests") || "2",
      villa: "",
    },
  });

  const [availability, setAvailability] = useState<AvailabilityStatus>({ state: "idle" });
  const [submitError, setSubmitError] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number | null>(null);
  const [facHtml, setFacHtml] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Villa state
  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);

  // Calendar state
  const [blockedDays, setBlockedDays] = useState<Date[]>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(() => {
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");
    if (ci && co) return { from: parseISO(ci), to: parseISO(co) };
    return undefined;
  });
  const [calMonths, setCalMonths] = useState(2);

  // Responsive month count
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setCalMonths(mq.matches ? 1 : 2);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Fetch villa list on mount, auto-select if slug provided
  useEffect(() => {
    fetch("/api/villas")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const list = json.data as Villa[];
        setVillas(list);
        const villaSlug = searchParams.get("villa");
        if (villaSlug) {
          const match = list.find((v) => v.slug === villaSlug);
          if (match) {
            setSelectedVilla(match);
            setValue("villa", match.id);
          }
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch blocked ranges when villa changes
  useEffect(() => {
    setBlockedDays([]);
    if (!selectedVilla) return;
    fetch(`/api/availability/blocked?villaId=${selectedVilla.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const days: Date[] = [];
        for (const range of json.data as { start: string; end: string }[]) {
          const interval = eachDayOfInterval({
            start: parseISO(range.start),
            end: parseISO(range.end),
          });
          days.push(...interval);
        }
        setBlockedDays(days);
      })
      .catch(() => {});
  }, [selectedVilla]);

  // Handle range selection
  const handleRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range) {
        setSelectedRange(undefined);
        setValue("checkIn", "");
        setValue("checkOut", "");
        return;
      }
      // If only from is picked, or to hasn't been set yet
      if (range.from && !range.to) {
        setSelectedRange(range);
        setValue("checkIn", format(range.from, "yyyy-MM-dd"));
        setValue("checkOut", "");
        return;
      }
      // Both picked — enforce minimum nights
      if (range.from && range.to) {
        const nights = differenceInCalendarDays(range.to, range.from);
        if (nights < MINIMUM_NIGHTS) {
          // Don't accept the range, keep only from
          setSelectedRange({ from: range.from, to: undefined });
          setValue("checkIn", format(range.from, "yyyy-MM-dd"));
          setValue("checkOut", "");
          return;
        }
        setSelectedRange(range);
        setValue("checkIn", format(range.from, "yyyy-MM-dd"));
        setValue("checkOut", format(range.to, "yyyy-MM-dd"));
      }
    },
    [setValue],
  );

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  // Update price when villa changes
  useEffect(() => {
    if (selectedVilla) {
      setPricePerNight(parseFloat(selectedVilla.pricePerNight));
    } else {
      setPricePerNight(null);
    }
  }, [selectedVilla]);

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

  // Check availability when dates or villa change
  useEffect(() => {
    setAvailability({ state: "idle" });
    if (!checkIn || !checkOut || !selectedVilla) return;

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
          `/api/availability?villaId=${selectedVilla.id}&checkIn=${checkIn}&checkOut=${checkOut}`,
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
  }, [checkIn, checkOut, selectedVilla]);

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
        villaId: selectedVilla!.id,
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

    console.log("[Booking] paymentResult:", JSON.stringify({
      success: paymentResult.success,
      error: paymentResult.error,
      hasRedirectHtml: !!paymentResult.redirectHtml,
      redirectHtmlLength: paymentResult.redirectHtml?.length || 0,
      hasRedirectUrl: !!paymentResult.redirectUrl,
    }));

    if (!paymentResult.success) {
      setSubmitError(paymentResult.error || "Failed to initiate payment");
      return;
    }

    // Dev mode: redirect URL
    if (paymentResult.redirectUrl) {
      router.push(paymentResult.redirectUrl);
      return;
    }

    // Prod: render FAC hosted page HTML in an iframe
    if (paymentResult.redirectHtml) {
      console.log("[FAC] RedirectData length:", paymentResult.redirectHtml.length);
      console.log("[FAC] RedirectData preview:", paymentResult.redirectHtml.substring(0, 500));

      // Inject browser data into the 3DS form before it auto-submits.
      // PowerTranz sends hidden fields for browser info but leaves them empty —
      // the merchant is expected to populate them client-side.
      const browserScript = `<script>
(function() {
  var fields = {
    browserLanguage: navigator.language || navigator.userLanguage || 'en-US',
    browserColorDepth: String(screen.colorDepth || 24),
    browserScreenWidth: String(screen.width),
    browserScreenHeight: String(screen.height),
    browserWidth: String(window.innerWidth || document.documentElement.clientWidth),
    browserHeight: String(window.innerHeight || document.documentElement.clientHeight),
    browserTimeZone: String(new Date().getTimezoneOffset()),
    browserJavaEnabled: 'false',
    browserJavascriptEnabled: 'true'
  };
  for (var name in fields) {
    var el = document.getElementById(name);
    if (el) el.value = fields[name];
  }
})();
</script>`;

      let enrichedHtml = paymentResult.redirectHtml;
      if (enrichedHtml.includes('</body>')) {
        enrichedHtml = enrichedHtml.replace('</body>', browserScript + '</body>');
      } else if (enrichedHtml.includes('</html>')) {
        enrichedHtml = enrichedHtml.replace('</html>', browserScript + '</html>');
      } else {
        // No closing tag at all — just append the script
        enrichedHtml = enrichedHtml + browserScript;
      }

      console.log("[FAC] Enriched HTML length:", enrichedHtml.length);
      console.log("[FAC] Script injected:", enrichedHtml.length > paymentResult.redirectHtml.length);

      setFacHtml(enrichedHtml);
    } else {
      console.error("[FAC] Payment succeeded but no redirectHtml or redirectUrl returned!");
      setSubmitError("Payment session created but no redirect data received. Please try again.");
    }
  };

  // Shared input classes
  const inputCls =
    "h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-[#1a1a2e] outline-none transition placeholder:text-gray-400 focus:border-[#C8940A]/50 focus:ring-2 focus:ring-[#C8940A]/20";
  const iconCls = "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400";

  // If FAC redirect is active, show only the iframe
  if (facHtml) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E8]">
        <iframe
          title="Payment"
          srcDoc={facHtml}
          className="h-screen w-full max-w-2xl border-0"
          sandbox="allow-scripts allow-forms allow-top-navigation"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
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

            {/* Hidden inputs for form validation */}
            <input type="hidden" {...register("checkIn", { required: "Check-in is required" })} />
            <input type="hidden" {...register("checkOut", { required: "Check-out is required" })} />

            {/* Villa */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1a1a2e]">
                Villa <span className="text-[#C8940A]">*</span>
              </label>
              <div className="relative">
                <Home className={iconCls} />
                <select
                  {...register("villa", { required: "Please select a villa" })}
                  value={watch("villa") || ""}
                  onChange={(e) => {
                    const villa = villas.find((v) => v.id === e.target.value) || null;
                    setSelectedVilla(villa);
                    setValue("villa", e.target.value, { shouldValidate: true });
                    // Reset dates when villa changes
                    handleRangeSelect(undefined);
                  }}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="">Select a villa</option>
                  {villas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.villa && (
                <p className="text-xs text-red-500">{errors.villa.message}</p>
              )}
            </div>

            {/* Guests */}
            <div className="mt-5 space-y-1.5">
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

            {/* Date range picker */}
            <div className="mt-6 rdp-gold flex justify-center">
              <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={handleRangeSelect}
                numberOfMonths={calMonths}
                min={MINIMUM_NIGHTS}
                disabled={[
                  { before: startOfDay(new Date()) },
                  { after: addMonths(new Date(), 6) },
                  ...blockedDays,
                ]}
                excludeDisabled
                defaultMonth={new Date()}
              />
            </div>

            {/* Selected dates display */}
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex-1 rounded-lg border border-gray-200 px-4 py-3">
                <span className="text-xs text-gray-400">Check-in</span>
                <p className="font-medium text-[#1a1a2e]">
                  {selectedRange?.from ? format(selectedRange.from, "MMM d, yyyy") : "Select date"}
                </p>
              </div>
              <span className="text-gray-300">&rarr;</span>
              <div className="flex-1 rounded-lg border border-gray-200 px-4 py-3">
                <span className="text-xs text-gray-400">Check-out</span>
                <p className="font-medium text-[#1a1a2e]">
                  {selectedRange?.to ? format(selectedRange.to, "MMM d, yyyy") : "Select date"}
                </p>
              </div>
            </div>

            {/* Clear dates */}
            {selectedRange?.from && (
              <button
                type="button"
                onClick={() => handleRangeSelect(undefined)}
                className="mt-3 text-xs font-medium text-[#C8940A] underline underline-offset-2 hover:text-[#b08308]"
              >
                Clear dates
              </button>
            )}

            {errors.checkIn && !checkIn && (
              <p className="mt-2 text-xs text-red-500">{errors.checkIn.message}</p>
            )}
            {errors.checkOut && !checkOut && (
              <p className="mt-2 text-xs text-red-500">{errors.checkOut.message}</p>
            )}

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
                src="/booking-river.jpg"
                alt="Palm Villa"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <h3
              className={`font-serif text-xl text-[#1a1a2e]`}
            >
              {selectedVilla ? selectedVilla.name : "Select a Villa"}
            </h3>
            <p className="mb-5 text-sm text-gray-500">
              {selectedVilla ? "Riverside luxury villa with private deck" : "Choose your villa to see pricing"}
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
                !selectedVilla ||
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

            {/* Payment logos */}
            <div className="mt-4 flex items-center justify-center gap-4">
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
