"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users } from "lucide-react";

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

  function handleBookNow() {
    const params = new URLSearchParams();
    if (villa) params.set("villa", villa);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", guests);
    router.push(`/booking?${params.toString()}`);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.jpg"
          alt="Jamaican riverside"
          className="h-full w-full object-cover"
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
        <div className="w-full max-w-5xl mt-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end overflow-hidden">
              {/* Villa Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-white/80 text-sm font-light tracking-wide">
                  Villa
                </label>
                <div className="relative">
                  <select
                    value={villa}
                    onChange={(e) => setVilla(e.target.value)}
                    className="w-full bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-gray-900 border-0 focus:ring-2 focus:ring-white/50 outline-none"
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
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-white/90 backdrop-blur-sm rounded-lg px-10 py-3 text-gray-900 border-0 focus:ring-2 focus:ring-white/50 outline-none"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5 Guests</option>
                    <option value="6">6 Guests</option>
                  </select>
                </div>
              </div>

              {/* Check-in */}
              <div className="flex flex-col gap-2 overflow-hidden">
                <label className="text-white/80 text-sm font-light tracking-wide">
                  Check-in
                </label>
                <div className="relative overflow-hidden rounded-lg">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full min-w-0 max-w-full appearance-none bg-white/90 backdrop-blur-sm rounded-lg px-10 py-3 text-gray-900 border border-transparent focus:ring-2 focus:ring-white/50 outline-none box-border"
                  />
                </div>
              </div>

              {/* Check-out */}
              <div className="flex flex-col gap-2 overflow-hidden">
                <label className="text-white/80 text-sm font-light tracking-wide">
                  Check-out
                </label>
                <div className="relative overflow-hidden rounded-lg">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full min-w-0 max-w-full appearance-none bg-white/90 backdrop-blur-sm rounded-lg px-10 py-3 text-gray-900 border border-transparent focus:ring-2 focus:ring-white/50 outline-none box-border"
                  />
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
            <div className="w-full h-full rounded overflow-hidden">
              <img
                src={src}
                alt={`Villa view ${(index % carouselImages.length) + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
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
