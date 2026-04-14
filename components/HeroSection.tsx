"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Users } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, eachDayOfInterval, parseISO, startOfDay, addMonths } from "date-fns";
import "react-day-picker/style.css";

const carouselImages = [
  "/carousel-01.jpg",
  "/carousel-02.jpg",
  "/carousel-03.jpg",
  "/carousel-04.jpg",
  "/carousel-05.jpg",
  "/carousel-06.jpg",
  "/carousel-07.jpg",
  "/carousel-08.jpg",
  "/carousel-09.jpeg",
  "/carousel-10.jpg",
  "/carousel-11.jpg",
  "/carousel-12.jpg",
  "/carousel-13.jpg",
  "/carousel-14.jpeg",
  "/carousel-15.jpeg",
];

// Duplicate for seamless infinite scroll
const duplicatedImages = [...carouselImages, ...carouselImages];

export default function HeroSection() {
  const router = useRouter();
  const [villa, setVilla] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  // Blocked dates
  const [blockedDays, setBlockedDays] = useState<Date[]>([]);

  // Popover state
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const checkInRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLDivElement>(null);

  // Fetch villas then blocked dates when villa selection changes
  useEffect(() => {
    async function fetchBlocked() {
      try {
        // Get villa list from API
        const villasRes = await fetch("/api/villas");
        const villasJson = await villasRes.json();
        if (!villasJson.success) return;

        const allVillas = villasJson.data as { id: string; slug: string }[];

        // Filter to selected villa or all
        const villaIds = villa
          ? allVillas.filter((v) => v.slug === villa).map((v) => v.id)
          : allVillas.map((v) => v.id);

        if (villaIds.length === 0) return;

        const results = await Promise.all(
          villaIds.map((id) =>
            fetch(`/api/availability/blocked?villaId=${id}`)
              .then((r) => r.json())
              .then((json) => {
                if (!json.success) return [];
                const days: Date[] = [];
                for (const range of json.data as { start: string; end: string }[]) {
                  days.push(...eachDayOfInterval({
                    start: parseISO(range.start),
                    end: parseISO(range.end),
                  }));
                }
                return days;
              })
              .catch(() => [] as Date[]),
          ),
        );

        setBlockedDays(results.flat());
      } catch {
        // Don't block the pickers if fetch fails
        setBlockedDays([]);
      }
    }
    fetchBlocked();
  }, [villa]);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (checkInRef.current && !checkInRef.current.contains(e.target as Node)) {
        setShowCheckIn(false);
      }
      if (checkOutRef.current && !checkOutRef.current.contains(e.target as Node)) {
        setShowCheckOut(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [bookingError, setBookingError] = useState("");

  function handleBookNow() {
    if (!villa) {
      setBookingError("Please select a villa");
      return;
    }
    if (!checkIn) {
      setBookingError("Please select a check-in date");
      return;
    }
    if (!checkOut) {
      setBookingError("Please select a check-out date");
      return;
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (outDate <= inDate) {
      setBookingError("Check-out must be after check-in");
      return;
    }

    const nights = Math.round(
      (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (nights < 2) {
      setBookingError("Minimum stay is 2 nights");
      return;
    }

    setBookingError("");
    const params = new URLSearchParams();
    params.set("villa", villa);
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("guests", guests);
    router.push(`/booking?${params.toString()}`);
  }

  const disabledDays = [
    { before: startOfDay(new Date()) },
    { after: addMonths(new Date(), 6) },
    ...blockedDays,
  ];

  const triggerCls =
    "h-[48px] w-full flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-gray-900 border-0 outline-none cursor-pointer text-left text-base";

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Jamaican riverside"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 py-32 text-center min-h-screen">
        {/* Main Headline */}
        <h1
          className="mb-6 max-w-4xl text-5xl md:text-7xl leading-tight text-white"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
        >
          Pon Di Rio
        </h1>

        {/* Subheadline */}
        <p
          className="text-white/90 text-lg md:text-xl tracking-wide mb-8"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
        >
          A serene blend of luxury and nature.
        </p>

        {/* Booking Bar */}
        <div className="w-full max-w-5xl mt-8 relative z-40">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              {/* Villa Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-white/80 text-sm font-light tracking-wide">
                  Villa
                </label>
                <div className="relative">
                  <select
                    value={villa}
                    onChange={(e) => setVilla(e.target.value)}
                    className="h-[48px] w-full bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-gray-900 border-0 focus:ring-2 focus:ring-white/50 outline-none"
                  >
                    <option value="">All Villas</option>
                    <option value="palm-villa">Palm Villa</option>
                    <option value="bamboo-villa">Bamboo Villa</option>
                  </select>
                </div>
              </div>

              {/* Guests */}
              <div className="flex flex-col gap-2">
                <label className="text-white/80 text-sm font-light tracking-wide">
                  Guests
                </label>
                <div className="relative">
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="h-[48px] w-full bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-gray-900 border-0 focus:ring-2 focus:ring-white/50 outline-none"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                  </select>
                </div>
              </div>

              {/* Check-in Picker */}
              <div className="flex flex-col gap-2" ref={checkInRef}>
                <label className="text-white/80 text-sm font-light tracking-wide">
                  Check-in
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowCheckIn(!showCheckIn); setShowCheckOut(false); }}
                    className={triggerCls}
                  >
                    <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className={checkIn ? "text-gray-900" : "text-gray-400"}>
                      {checkIn ? format(parseISO(checkIn), "MMM d, yyyy") : "Select date"}
                    </span>
                  </button>

                  {showCheckIn && (
                    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3">
                      <div className="rdp-gold">
                        <DayPicker
                          mode="single"
                          selected={checkIn ? parseISO(checkIn) : undefined}
                          onSelect={(day) => {
                            if (day) {
                              setCheckIn(format(day, "yyyy-MM-dd"));
                              setShowCheckIn(false);
                              // If check-out is before new check-in, clear it
                              if (checkOut && day >= parseISO(checkOut)) {
                                setCheckOut("");
                              }
                            }
                          }}
                          disabled={disabledDays}
                          defaultMonth={new Date()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Check-out Picker */}
              <div className="flex flex-col gap-2" ref={checkOutRef}>
                <label className="text-white/80 text-sm font-light tracking-wide">
                  Check-out
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowCheckOut(!showCheckOut); setShowCheckIn(false); }}
                    className={triggerCls}
                  >
                    <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className={checkOut ? "text-gray-900" : "text-gray-400"}>
                      {checkOut ? format(parseISO(checkOut), "MMM d, yyyy") : "Select date"}
                    </span>
                  </button>

                  {showCheckOut && (
                    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3">
                      <div className="rdp-gold">
                        <DayPicker
                          mode="single"
                          selected={checkOut ? parseISO(checkOut) : undefined}
                          onSelect={(day) => {
                            if (day) {
                              setCheckOut(format(day, "yyyy-MM-dd"));
                              setShowCheckOut(false);
                            }
                          }}
                          disabled={[
                            ...disabledDays,
                            ...(checkIn ? [{ before: parseISO(checkIn) }] : []),
                          ]}
                          defaultMonth={checkIn ? parseISO(checkIn) : new Date()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={handleBookNow}
                className="flex h-[48px] w-full items-center justify-center whitespace-nowrap rounded-lg bg-amber-600 px-8 text-base font-medium text-white shadow-lg transition-all hover:bg-amber-700"
              >
                Book Now
              </button>
            </div>

            {bookingError && (
              <p className="mt-4 text-center text-sm text-red-400">{bookingError}</p>
            )}
          </div>
        </div>

        {/* Scrolling Image Carousel with Wave Effect */}
        <div className="relative w-screen -ml-8 mt-40 z-30">
          <WaveCarousel images={duplicatedImages} />
        </div>
      </div>
    </div>
  );
}

// ─── Wave Carousel ─────────────────────────────────────────

function WaveCarousel({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef(0);

  const updateWave = useCallback(() => {
    if (!trackRef.current) return;

    const cards = trackRef.current.children;
    const viewCenter = window.innerWidth / 2;
    const maxDistance = window.innerWidth / 2;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - viewCenter);
      const ratio = Math.max(0, 1 - distance / maxDistance);
      const elevation = ratio * ratio * 50;
      card.style.transform = `translateY(${-elevation}px)`;
    }

    rafRef.current = requestAnimationFrame(updateWave);
  }, []);

  useEffect(() => {
    // Start the CSS animation and wave tracking
    rafRef.current = requestAnimationFrame(updateWave);
    return () => cancelAnimationFrame(rafRef.current);
  }, [updateWave]);

  // Track scroll position for seamless reset
  useEffect(() => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const handleAnimationIteration = () => {
      posRef.current = 0;
    };
    track.addEventListener("animationiteration", handleAnimationIteration);
    return () => track.removeEventListener("animationiteration", handleAnimationIteration);
  }, []);

  return (
    <div className="relative h-[450px] overflow-hidden flex items-end pb-8">
      <div
        ref={trackRef}
        className="carousel-track absolute flex gap-4"
      >
        {images.map((src, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 w-[280px] h-[360px] bg-white p-1 rounded-lg transition-transform duration-100 ease-out"
            style={{ willChange: "transform" }}
          >
            <div className="relative w-full h-full rounded overflow-hidden">
              <Image
                src={src}
                alt={`Villa view ${(index % carouselImages.length) + 1}`}
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes carousel-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .carousel-track {
          animation: carousel-scroll 30s linear infinite;
          will-change: transform;
        }
        .carousel-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .carousel-track {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
