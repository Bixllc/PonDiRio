"use client";

import React, { useMemo, useState } from "react";

function VillaImageSlider({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const safeImages = useMemo(
    () => (images && images.length ? images : ["/logotransparent.png"]),
    [images]
  );

  const [index, setIndex] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((cur) => (cur - 1 + safeImages.length) % safeImages.length);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((cur) => (cur + 1) % safeImages.length);
  };

  const goTo = (idx: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex(idx);
  };

  return (
    <div className="relative h-full w-full">
      <img
        src={safeImages[index]}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {safeImages.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur px-3 py-2 text-gray-900 shadow hover:bg-white transition"
          >
            ‹
          </button>

          <button
            onClick={next}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur px-3 py-2 text-gray-900 shadow hover:bg-white transition"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {safeImages.map((_, i) => (
              <button
                key={i}
                onClick={goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OurCabinsSection() {
  const cabins = [
    {
      id: 1,
      title: "Palm Villa",
      price: 390,
      minNights: 2,
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      images: ["/img8.JPG"],
      alt: "Palm Villa at Pon Di Rio",
    },
    {
      id: 2,
      title: "Bamboo Villa",
      price: 390,
      minNights: 2,
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      images: ["/bamboo-villa-cover.jpg"],
      alt: "Bamboo Villa at Pon Di Rio",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (direction: "prev" | "next") => {
    setActiveIndex((cur) =>
      direction === "next"
        ? (cur + 1) % cabins.length
        : (cur - 1 + cabins.length) % cabins.length
    );
  };

  const active = cabins[activeIndex];

  return (
    <section
      id="villas"
      className="pt-0 pb-24 px-4 lg:px-8"
      style={{ backgroundColor: "#c8d5c3" }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header row */}
        <div className="mb-16 pt-4 flex items-end justify-between">
          <h2
            className="text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-tight"
            style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
          >
            Our Villas
          </h2>

          {/* Carousel navigation arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goTo("prev")}
              aria-label="Previous villa"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/50 text-gray-900 hover:bg-white transition"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => goTo("next")}
              aria-label="Next villa"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/50 text-gray-900 hover:bg-white transition"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stacked card carousel */}
        <div className="relative w-full overflow-hidden" style={{ height: "clamp(350px, 50vw, 600px)" }}>
          {cabins.map((c, i) => {
            const offset = i - activeIndex;
            const isActive = offset === 0;
            const isVisible = Math.abs(offset) <= 1;

            if (!isVisible) return null;

            return (
              <div
                key={c.id}
                className="absolute top-0 left-1/2 w-[80%] md:w-[70%] lg:w-[65%] h-full"
                style={{
                  transform: `translateX(calc(-50% + ${offset * 40}%)) scale(${isActive ? 1 : 0.88})`,
                  opacity: isActive ? 1 : 0.5,
                  zIndex: isActive ? 30 : 10,
                  transition: "transform 700ms ease-out, opacity 700ms ease-out",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <div
                  className={`group relative h-full overflow-hidden ${
                    isActive ? "shadow-2xl" : ""
                  }`}
                >
                  <VillaImageSlider images={c.images} alt={c.alt} />

                </div>
              </div>
            );
          })}
        </div>

        {/* Active villa info — synced to carousel */}
        <div className="mt-12 px-2">
          {/* Title + Price row */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3
                className="text-3xl md:text-4xl lg:text-5xl text-gray-900"
                style={{
                  fontVariant: "small-caps",
                  fontFamily: "var(--font-serif), serif",
                }}
              >
                {active.title}
              </h3>
              {active.minNights && (
                <p className="mt-2 text-base text-gray-600">
                  Minimum {active.minNights} night
                  {active.minNights > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="text-right shrink-0 ml-4">
              <span
                className="text-4xl md:text-5xl lg:text-6xl text-gray-900"
                style={{ fontFamily: "var(--font-serif), serif" }}
              >
                ${active.price}
              </span>
              <p className="text-base text-gray-600">per night</p>
            </div>
          </div>

          {/* Specs */}
          <div className="mt-6 text-base text-gray-700 flex items-center gap-8">
            <span>{active.bedrooms} Bedrooms</span>
            <span>{active.bathrooms} Bathrooms</span>
            <span>{active.guests} Guests</span>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex gap-4">
            <a
              href={`/villas/${active.id}`}
              className="flex-1 text-center py-4 rounded-lg border border-gray-900 bg-white text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition"
            >
              View Details
            </a>
            <a
              href="/booking"
              className="flex-1 text-center py-4 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition"
            >
              Book Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
