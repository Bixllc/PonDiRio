"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
// If you installed sonner, uncomment this:
// import { toast } from "sonner";

const VILLA_ID = "cmn854tso0000ck3p78a7zy4x";
const MINIMUM_NIGHTS = 2;

const GUEST_COUNT_MAP: Record<string, number> = {
  "1-2": 2,
  "3-4": 4,
};

type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  propertyType: string;
  chefServices: string;
  message?: string;
};

type AvailabilityStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "unavailable"; reason: string }
  | { state: "error"; reason: string };

type BookingResult =
  | { state: "idle" }
  | { state: "success"; bookingId: string; totalAmount: string }
  | { state: "error"; message: string };

export default function ContactSection() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ mode: "onBlur" });

  const [availability, setAvailability] = useState<AvailabilityStatus>({ state: "idle" });
  const [bookingResult, setBookingResult] = useState<BookingResult>({ state: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  // Check availability when dates change
  useEffect(() => {
    setAvailability({ state: "idle" });

    if (!checkIn || !checkOut) return;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      setAvailability({ state: "unavailable", reason: "Check-out must be after check-in" });
      return;
    }

    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (nights < MINIMUM_NIGHTS) {
      setAvailability({ state: "unavailable", reason: `Minimum stay is ${MINIMUM_NIGHTS} nights` });
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAvailability({ state: "checking" });

    const checkDates = async () => {
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
          setAvailability({ state: "unavailable", reason: json.data.reason });
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setAvailability({
          state: "error",
          reason: err instanceof Error ? err.message : "Failed to check availability",
        });
      }
    };

    checkDates();

    return () => {
      controller.abort();
    };
  }, [checkIn, checkOut]);

  const onSubmit = async (data: ContactFormData) => {
    setBookingResult({ state: "idle" });

    // Client-side validation
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);

    if (checkOutDate <= checkInDate) {
      setBookingResult({ state: "error", message: "Check-out must be after check-in" });
      return;
    }

    const guestCount = GUEST_COUNT_MAP[data.guests];
    if (!guestCount || guestCount < 1) {
      setBookingResult({ state: "error", message: "Please select a valid number of guests" });
      return;
    }

    if (availability.state === "unavailable") {
      setBookingResult({ state: "error", message: "Selected dates are not available" });
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          villaId: VILLA_ID,
          guestName: `${data.firstName} ${data.lastName}`,
          guestEmail: data.email,
          guestPhone: data.phone,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guestCount,
          specialRequests: data.message || undefined,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setBookingResult({ state: "error", message: json.error });
        return;
      }

      setBookingResult({
        state: "success",
        bookingId: json.data.bookingId,
        totalAmount: json.data.totalAmount,
      });
      reset();
      setAvailability({ state: "idle" });
    } catch (err) {
      setBookingResult({
        state: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email",
      value: "info@pondirio.com",
      link: "mailto:info@pondirio.com",
    },
    {
      icon: <Phone className="h-5 w-5" />,
      label: "Phone",
      value: "+1 (876) 123-4567",
      link: "tel:+18761234567",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Location",
      value: "St. Mary, Jamaica",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Response Time",
      value: "Within 24 hours",
    },
  ];

  return (
    <section id="contact" className="bg-white py-24 px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-gray-500">
            GET IN TOUCH
          </p>
          <h2 className="mx-auto mb-6 max-w-4xl text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-gray-900">
            Plan Your Perfect Getaway
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Let us create a bespoke luxury experience tailored to your preferences. Our
            concierge team is ready to help you discover the perfect retreat.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left – Form */}
          <div>
            <Card className="border-0 p-8 shadow-lg lg:p-10">
              <div className="mb-8">
                <h3 className="mb-4 text-3xl text-gray-900">Custom Booking Request</h3>
                <p className="text-gray-600">
                  Share your vision and we'll craft the perfect luxury experience for you.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Names */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <input
                      id="firstName"
                      placeholder="John"
                      {...register("firstName", {
                        required: "First name is required",
                        pattern: { value: /^[a-zA-Z\s'-]+$/, message: "Letters only, no numbers or special characters" },
                      })}
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none ring-0 transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                      aria-invalid={!!errors.firstName || undefined}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <input
                      id="lastName"
                      placeholder="Doe"
                      {...register("lastName", {
                        required: "Last name is required",
                        pattern: { value: /^[a-zA-Z\s'-]+$/, message: "Letters only, no numbers or special characters" },
                      })}
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none ring-0 transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                      aria-invalid={!!errors.lastName || undefined}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Enter a valid email address" },
                      })}
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none ring-0 transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                      aria-invalid={!!errors.email || undefined}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: { value: /^[0-9+\s()-]+$/, message: "Numbers, +, spaces, dashes and parentheses only" },
                      })}
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none ring-0 transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                      aria-invalid={!!errors.phone || undefined}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn">Check-in Date</Label>
                    <input
                      id="checkIn"
                      type="date"
                      {...register("checkIn", { required: "Check-in date is required" })}
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none ring-0 transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                      aria-invalid={!!errors.checkIn || undefined}
                    />
                    {errors.checkIn && (
                      <p className="text-sm text-red-600">{errors.checkIn.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOut">Check-out Date</Label>
                    <input
                      id="checkOut"
                      type="date"
                      {...register("checkOut", { required: "Check-out date is required" })}
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none ring-0 transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                      aria-invalid={!!errors.checkOut || undefined}
                    />
                    {errors.checkOut && (
                      <p className="text-sm text-red-600">{errors.checkOut.message}</p>
                    )}
                  </div>
                </div>

                {/* Availability feedback */}
                {availability.state === "checking" && (
                  <p className="text-sm text-gray-500">Checking availability...</p>
                )}
                {availability.state === "available" && (
                  <p className="text-sm text-green-600">Dates are available</p>
                )}
                {availability.state === "unavailable" && (
                  <p className="text-sm text-red-600">{availability.reason}</p>
                )}
                {availability.state === "error" && (
                  <p className="text-sm text-red-600">{availability.reason}</p>
                )}

                {/* Preferences */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <select
                      id="guests"
                      {...register("guests", { required: "Please select guests" })}
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                      aria-invalid={!!errors.guests || undefined}
                    >
                      <option value="">Select guests</option>
                      <option value="1-2">1–2 guests</option>
                      <option value="3-4">3–4 guests</option>
                    </select>
                    {errors.guests && (
                      <p className="text-sm text-red-600">{errors.guests.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Villa</Label>
                    <select
                      id="propertyType"
                      {...register("propertyType", { required: "Please select a villa" })}
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                      aria-invalid={!!errors.propertyType || undefined}
                    >
                      <option value="">Any villa</option>
                      <option value="beachfront">Palm Villa</option>
                    </select>
                    {errors.propertyType && (
                      <p className="text-sm text-red-600">{errors.propertyType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chefServices">Chef Services</Label>
                    <select
                      id="chefServices"
                      {...register("chefServices", { required: "Please select chef services" })}
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                      aria-invalid={!!errors.chefServices || undefined}
                    >
                      <option value="">Add chef services</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {errors.chefServices && (
                      <p className="text-sm text-red-600">{errors.chefServices.message}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Special Requests & Details</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us about any special occasions, dietary requirements, activities of interest, or other preferences..."
                    {...register("message")}
                    className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base outline-none transition focus:border-black/70 focus:ring-2 focus:ring-black/10 md:text-sm"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-base text-white hover:bg-black/90"
                >
                  {isSubmitting ? "Sending Request…" : <>
                    <Send className="h-4 w-4" />
                    Send Booking Request
                  </>}
                </Button>

                {/* Booking result feedback */}
                {bookingResult.state === "success" && (
                  <div className="rounded-md border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-800">Booking created!</p>
                    <p className="mt-1 text-sm text-green-700">
                      Booking ID: {bookingResult.bookingId}
                    </p>
                    <p className="text-sm text-green-700">
                      Total: ${bookingResult.totalAmount} XCD
                    </p>
                  </div>
                )}
                {bookingResult.state === "error" && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">{bookingResult.message}</p>
                  </div>
                )}
              </form>
            </Card>
          </div>

          {/* Right – Contact Info + Image */}
          <div className="space-y-8">
            <Card className="border-0 p-8 shadow-lg">
              <h3 className="mb-6 text-2xl text-gray-900">Contact Information</h3>
              <div className="space-y-6">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="rounded-xl bg-gray-100 p-3">{item.icon}</div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">{item.label}</p>
                      {"link" in item && item.link ? (
                        <a
                          href={item.link}
                          className="text-gray-900 underline-offset-2 hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-900">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="overflow-hidden rounded-2xl shadow-lg">
              <div className="aspect-[4/5]">
                <img
                  src="/river1.jpg"
                  alt="Luxury resort at dusk by the pool"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.035]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
