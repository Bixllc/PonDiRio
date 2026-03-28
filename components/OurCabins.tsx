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
      {/* Current image */}
      <img
        src={safeImages[index]}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
      />

      {/* Controls only if there are multiple images */}
      {safeImages.length > 1 && (
        <>
          {/* Left / Right buttons */}
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

          {/* Dots */}
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
      images: ["/img8.JPG","/img15.JPG", "/img9.JPG", "/img19.JPG", "/img10.JPG","/img12.JPG", "/img20.JPG","/img13.JPG","/img14.JPG","/img17.JPG", "/img18.JPG","/img6.JPG"], 
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
      images: ["/logotransparent.png"], 
      alt: "Bamboo Villa at Pon Di Rio",
      comingSoon: true,
    },
    {
      id: 2,
      title: "Bamboo Villa",
      price: 390,
      minNights: 2,
      bedrooms: 2,
      bathrooms: 1,
      guests: 4,
      images: ["/logotransparent.png"], 
      alt: "Bamboo Villa at Pon Di Rio",
      comingSoon: true,
    },
    
  ];

  const money = (n: number) =>
    n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  return (
    <section id="villas" className="py-24 px-4 lg:px-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-6 uppercase">
            PON DI RIO
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-tight max-w-4xl mx-auto">
            Our Villas
          </h2>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {cabins.map((c) => (
            <article key={c.id} className="group">
              {/* Image wrapper */}
              <div className="relative mb-6 overflow-hidden rounded-[20px] shadow-sm ring-1 ring-black/5">
                <div className="aspect-[16/9]">
                  <VillaImageSlider images={c.images} alt={c.alt} />
                </div>

                {/* Coming soon overlay (does NOT block slider clicks) */}
                {c.comingSoon && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/60 text-white text-lg font-medium">
                    Coming Soon
                  </div>
                )}
              </div>

              {/* Title & price */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl text-gray-900">{c.title}</h3>
                <div className="text-2xl text-gray-900 ml-4 shrink-0">
                  {money(c.price)}
                </div>
              </div>

              {/* Minimum nights */}
              {c.minNights && (
                <p className="mt-1 text-sm text-gray-500">
                  Minimum {c.minNights} night{c.minNights > 1 ? "s" : ""}
                </p>
              )}


              {/* Details */}
              <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600 flex items-center gap-6">
                <span>{c.bedrooms} Bedrooms</span>
                <span className="h-4 w-px bg-gray-200" />
                <span>{c.bathrooms} Bathrooms</span>

                {"guests" in c && c.guests ? (
                  <>
                    <span className="h-4 w-px bg-gray-200" />
                    <span>{c.guests} Guests</span>
                  </>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
