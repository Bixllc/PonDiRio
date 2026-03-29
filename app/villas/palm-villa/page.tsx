import Image from "next/image";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";

export default function PalmVillaPage() {
  return (
    <main className="min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative h-screen w-full">
        <Image
          src="/img8.JPG"
          alt="Palm Villa"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-24 text-white text-center">
          <h1
            className="text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.15em]"
            style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
          >
            Palm Villa
          </h1>
          <p className="mt-4 text-lg md:text-xl tracking-wide text-white/90">
            Pon Di Rio, St. Mary, Jamaica
          </p>
        </div>
      </section>

      {/* Description & Pricing Section */}
      <section className="bg-[#f5f0eb] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left - Description */}
            <div className="space-y-8">
              <p className="text-xl md:text-2xl leading-[1.7] text-[#2a3444] font-light">
                Palm Villa offers an intimate sanctuary where modern luxury meets tropical serenity. Floor-to-ceiling windows frame lush riverside views, while handcrafted hardwood furnishings and vaulted ceilings create an airy, sophisticated retreat.
              </p>
              <p className="text-base md:text-lg leading-[1.8] text-[#2a3444]/75 font-light">
                Wake to the sound of gentle river currents and birdsong in this thoughtfully designed villa. Natural materials and contemporary design create a seamless connection between interior comfort and the surrounding tropical landscape. The spacious layout flows effortlessly from sleeping quarters to private outdoor spaces, offering multiple vantage points to appreciate Jamaica&apos;s natural beauty.
              </p>
            </div>

            {/* Right - Pricing Card */}
            <div>
              <h2
                className="text-7xl md:text-8xl font-light text-[#1a2332]"
                style={{ fontFamily: "var(--font-serif), serif" }}
              >
                $390
              </h2>
              <p className="mt-2 text-[#1a2332]/70 text-base">
                per night &middot; Minimum 2 nights
              </p>

              <hr className="my-8 border-[#1a2332]/15" />

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p
                    className="text-4xl md:text-5xl font-light text-[#1a2332]"
                    style={{ fontFamily: "var(--font-serif), serif" }}
                  >
                    2
                  </p>
                  <p className="mt-1 text-sm text-[#1a2332]/70">Bedrooms</p>
                </div>
                <div>
                  <p
                    className="text-4xl md:text-5xl font-light text-[#1a2332]"
                    style={{ fontFamily: "var(--font-serif), serif" }}
                  >
                    2
                  </p>
                  <p className="mt-1 text-sm text-[#1a2332]/70">Bathrooms</p>
                </div>
                <div>
                  <p
                    className="text-4xl md:text-5xl font-light text-[#1a2332]"
                    style={{ fontFamily: "var(--font-serif), serif" }}
                  >
                    4
                  </p>
                  <p className="mt-1 text-sm text-[#1a2332]/70">Guests</p>
                </div>
              </div>

              <hr className="my-8 border-[#1a2332]/15" />

              <a
                href="/booking"
                className="block w-full text-center py-4 rounded-lg bg-amber-600 text-white text-base font-medium shadow-lg hover:bg-amber-700 transition-all"
              >
                Book Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <h2
            className="text-5xl md:text-6xl lg:text-7xl text-[#1a2332] mb-16"
            style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
          >
            Amenities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-6">
            {[
              "Internet",
              "Light housekeeping daily between 9–11",
              "Access to river",
              "Chef upon request",
            ].map((amenity) => (
              <div key={amenity} className="flex items-center gap-3 py-3">
                <svg
                  className="w-5 h-5 text-[#1a2332]/60 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[#1a2332] text-base">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-[#f5f0eb] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <h2
            className="text-5xl md:text-6xl lg:text-7xl text-[#1a2332] mb-16"
            style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
          >
            Gallery
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Row 1: tall left, two stacked right */}
            <div className="relative md:row-span-2 overflow-hidden h-full min-h-[500px]">
              <Image src="/footer-bg.jpg" alt="Palm Villa Exterior" fill className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden ">
              <Image src="/img11.JPG" alt="Open-Air Bathroom" fill className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden ">
              <Image src="/img12.JPG" alt="Living Area" fill className="object-cover" />
            </div>

            {/* Row 2: two side by side, then full width */}
            <div className="relative aspect-[4/3] overflow-hidden ">
              <Image src="/img15.JPG" alt="Riverside Deck" fill className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden ">
              <Image src="/img20.JPG" alt="Outdoor Space" fill className="object-cover" />
            </div>

            {/* Row 3: full width */}
            <div className="relative aspect-[16/7] md:col-span-2 overflow-hidden ">
              <Image src="/img19.JPG" alt="Villa Exterior" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 md:py-36">
        <Image
          src="/cta-bg.jpg"
          alt=""
          fill
          className="object-cover"
          quality={85}
        />
        <div className="absolute inset-0 bg-[#1a2332]/70" />

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <h2
            className="text-4xl md:text-6xl lg:text-7xl text-white"
            style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
          >
            Ready to experience Palm Villa?
          </h2>
          <p className="mt-6 text-lg text-white/80 max-w-xl">
            Book your stay and discover the perfect blend of luxury and natural beauty.
          </p>
          <a
            href="/booking"
            className="mt-10 inline-block px-12 py-4 bg-amber-600 text-white text-base font-medium rounded-lg shadow-lg hover:bg-amber-700 transition-all"
          >
            Book Now
          </a>
        </div>
      </section>

      {/* Other Villas Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <h2
            className="text-5xl md:text-6xl lg:text-7xl text-[#1a2332] mb-16"
            style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
          >
            Check out other villas
          </h2>

          <a href="/villas/bamboo-villa" className="group block max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/bamboo-villa-cover.jpg"
                alt="Bamboo Villa"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3
                  className="text-3xl md:text-4xl"
                  style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                >
                  Bamboo Villa
                </h3>
                <p className="mt-1 text-white/80 text-sm">$390 per night</p>
              </div>
            </div>
            <p className="mt-6 text-gray-600 text-base leading-relaxed max-w-md">
              Bamboo Villa embodies tranquil elegance with natural textures and expansive river views. Designed for those seeking peaceful immersion in nature, this villa combines refined comfort with authentic tropical living.
            </p>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
