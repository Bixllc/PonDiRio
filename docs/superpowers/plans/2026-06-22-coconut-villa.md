# Add Coconut Villa Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a third villa, Coconut Villa, fully wired into the site — bookable, visible on the homepage/nav/villa pages, and manageable in the admin calendar-feeds page — using only a cover photo (no gallery yet).

**Architecture:** Coconut Villa is inserted as a `Villa` row in Postgres (matching the existing Palm/Bamboo row shape exactly), and surfaced through the same hardcoded frontend lists Palm/Bamboo already appear in (nav, homepage carousel, hero search dropdown), plus a new static villa detail page modeled on `bamboo-villa/page.tsx`. The admin calendar-feeds page, previously hardcoded to Palm Villa's ID, is refactored to a villa-selector pattern matching the existing `AvailabilityPageClient.tsx` filter convention. Booking, availability, and bookings-list admin pages need no changes — they already read villas from the DB.

**Tech Stack:** Next.js (App Router), Prisma + Postgres (Neon), Tailwind, TypeScript. No test framework exists in this repo (no jest/vitest) — verification is via `npm run lint`, `npm run build`, and manual checks against the running dev server.

**Spec:** `docs/superpowers/specs/2026-06-22-coconut-villa-design.md`

---

## Chunk 1: Coconut Villa

### Task 1: Insert the Coconut Villa database row

**Files:**
- Create (temporary, deleted at end of task): `scripts/tmp-add-coconut-villa.ts`

- [x] **Step 1: Write the one-off insert script**

```typescript
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/client";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const villa = await prisma.villa.create({
    data: {
      name: "Coconut Villa",
      slug: "coconut-villa",
      description: null,
      pricePerNight: 390,
      maxGuests: 4,
      isActive: true,
    },
  });
  console.log("Created villa:", villa.id, villa.name);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
```

- [x] **Step 2: Run it**

Run: `npx tsx scripts/tmp-add-coconut-villa.ts`
Expected output: `Created villa: <some-cuid> Coconut Villa`

- [x] **Step 3: Verify the row via a read-only query**

Run:
```bash
npx tsx -e "
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from './app/generated/prisma/client';
import 'dotenv/config';
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) });
prisma.villa.findMany().then(v => { console.log(JSON.stringify(v, null, 2)); prisma.\$disconnect(); });
"
```
Expected: the output includes a `Coconut Villa` row with `slug: "coconut-villa"`, `pricePerNight: "390"`, `maxGuests: 4`, `isActive: true`.

- [x] **Step 4: Delete the temporary script**

```bash
rm scripts/tmp-add-coconut-villa.ts
```

This matches how Palm Villa and Bamboo Villa were added — no committed script, just a one-time insert. There is nothing to commit for this task (no files added/changed in git).

---

### Task 2: Add the Coconut Villa cover image

**Files:**
- Create: `public/coconut-villa-cover.jpg`

- [x] **Step 1: Copy the source photo into `public/`**

```bash
cp "/Users/sheneskawilliams/Desktop/BIX/PDR/PDR-PICS/PHOTO-2026-03-16-11-27-26.jpg" "/Users/sheneskawilliams/PonDiRio/public/coconut-villa-cover.jpg"
```

- [x] **Step 2: Verify the file copied correctly**

Run: `file public/coconut-villa-cover.jpg`
Expected: a JPEG file, non-zero size (compare with `ls -la public/coconut-villa-cover.jpg` vs the source file size).

- [x] **Step 3: Commit**

```bash
git add public/coconut-villa-cover.jpg
git commit -m "feat: add Coconut Villa cover image"
```

---

### Task 3: Create the Coconut Villa detail page

**Files:**
- Create: `app/villas/coconut-villa/page.tsx`

This mirrors `app/villas/bamboo-villa/page.tsx` structure exactly, with the gallery section replaced by a "coming soon" placeholder, a CTA background reusing the cover photo (no dedicated CTA image exists yet), and an "other villas" section linking to both Palm and Bamboo.

- [x] **Step 1: Create the file**

```tsx
import Image from "next/image";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";

export default function CoconutVillaPage() {
  return (
    <main className="min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative h-screen w-full">
        <Image
          src="/coconut-villa-cover.jpg"
          alt="Coconut Villa"
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
            Coconut Villa
          </h1>
          <p className="mt-4 text-lg md:text-xl tracking-wide text-white/90">
            Pon Di Rio, Retreat, St. Mary, Jamaica
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
                Coconut Villa brings together easy island living and quiet garden surroundings, just steps from the river that runs through Pon Di Rio. Surrounded by towering palms and tropical greenery, this villa is a relaxed retreat for guests seeking comfort without pretense.
              </p>
              <p className="text-base md:text-lg leading-[1.8] text-[#2a3444]/75 font-light">
                Inside, comfortable furnishings and an open layout create a welcoming space to unwind after a day exploring St. Mary. Step outside to a private gazebo and garden setting, with the sounds of the river and rustling palms setting the pace for your stay.
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
                href="/booking?villa=coconut-villa"
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

      {/* Gallery Section — coming soon placeholder (no gallery photos yet) */}
      <section className="bg-[#f5f0eb] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <h2
            className="text-5xl md:text-6xl lg:text-7xl text-[#1a2332] mb-16"
            style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
          >
            Gallery
          </h2>

          <div className="relative aspect-[16/9] overflow-hidden">
            <Image src="/coconut-villa-cover.jpg" alt="Coconut Villa" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <p
                className="text-white text-2xl md:text-3xl tracking-wide"
                style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
              >
                Photo gallery coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 md:py-36">
        <Image
          src="/coconut-villa-cover.jpg"
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
            Ready to experience Coconut Villa?
          </h2>
          <p className="mt-6 text-lg text-white/80 max-w-xl">
            Book your stay and discover the perfect blend of luxury and natural beauty.
          </p>
          <a
            href="/booking?villa=coconut-villa"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <a href="/villas/palm-villa" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/img8.JPG"
                  alt="Palm Villa"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3
                    className="text-3xl md:text-4xl"
                    style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                  >
                    Palm Villa
                  </h3>
                  <p className="mt-1 text-white/80 text-sm">$390 per night</p>
                </div>
              </div>
              <p className="mt-6 text-gray-600 text-base leading-relaxed">
                Palm Villa offers an intimate sanctuary where modern luxury meets tropical serenity. Floor-to-ceiling windows frame lush riverside views, while handcrafted hardwood furnishings and vaulted ceilings create an airy, sophisticated retreat.
              </p>
            </a>

            <a href="/villas/bamboo-villa" className="group block">
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
              <p className="mt-6 text-gray-600 text-base leading-relaxed">
                Bamboo Villa embodies tranquil elegance with natural textures and expansive river views. Designed for those seeking peaceful immersion in nature, this villa combines refined comfort with authentic tropical living.
              </p>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
```

- [x] **Step 2: Verify with the dev server**

Run: `npm run dev` (if not already running), then open `http://localhost:3000/villas/coconut-villa`
Expected: page renders with the cover photo as hero/CTA background, "Photo gallery coming soon" placeholder visible, pricing card shows $390/2/2/4, "Book Now" links go to `/booking?villa=coconut-villa`, and the "Check out other villas" section shows both Palm Villa and Bamboo Villa cards side by side.

- [x] **Step 3: Commit**

```bash
git add app/villas/coconut-villa/page.tsx
git commit -m "feat: add Coconut Villa detail page"
```

---

### Task 4: Update Palm Villa and Bamboo Villa "other villas" sections to link to both remaining villas

**Files:**
- Modify: `app/villas/palm-villa/page.tsx:210-248`
- Modify: `app/villas/bamboo-villa/page.tsx:205-243`

- [x] **Step 1: Update Palm Villa's "Other Villas" section**

In `app/villas/palm-villa/page.tsx`, replace the existing single-card block (lines 220-247, the `<a href="/villas/bamboo-villa">...</a>` block) so the section contains a two-column grid linking to Bamboo Villa and Coconut Villa:

```tsx
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <a href="/villas/bamboo-villa" className="group block">
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
              <p className="mt-6 text-gray-600 text-base leading-relaxed">
                Bamboo Villa embodies tranquil elegance with natural textures and expansive river views. Designed for those seeking peaceful immersion in nature, this villa combines refined comfort with authentic tropical living.
              </p>
            </a>

            <a href="/villas/coconut-villa" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/coconut-villa-cover.jpg"
                  alt="Coconut Villa"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3
                    className="text-3xl md:text-4xl"
                    style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                  >
                    Coconut Villa
                  </h3>
                  <p className="mt-1 text-white/80 text-sm">$390 per night</p>
                </div>
              </div>
              <p className="mt-6 text-gray-600 text-base leading-relaxed">
                Coconut Villa brings together easy island living and quiet garden surroundings, just steps from the river that runs through Pon Di Rio.
              </p>
            </a>
          </div>
```

(Note: remove the old single `<a>` block's `max-w-md` class — the two-column grid handles width now.)

- [x] **Step 2: Update Bamboo Villa's "Other Villas" section**

In `app/villas/bamboo-villa/page.tsx`, replace the existing single-card block (lines 215-242, the `<a href="/villas/palm-villa">...</a>` block) the same way, but linking to Palm Villa and Coconut Villa:

```tsx
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <a href="/villas/palm-villa" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/img8.JPG"
                  alt="Palm Villa"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3
                    className="text-3xl md:text-4xl"
                    style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                  >
                    Palm Villa
                  </h3>
                  <p className="mt-1 text-white/80 text-sm">$390 per night</p>
                </div>
              </div>
              <p className="mt-6 text-gray-600 text-base leading-relaxed">
                Palm Villa offers an intimate sanctuary where modern luxury meets tropical serenity. Floor-to-ceiling windows frame lush riverside views, while handcrafted hardwood furnishings and vaulted ceilings create an airy, sophisticated retreat.
              </p>
            </a>

            <a href="/villas/coconut-villa" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/coconut-villa-cover.jpg"
                  alt="Coconut Villa"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3
                    className="text-3xl md:text-4xl"
                    style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                  >
                    Coconut Villa
                  </h3>
                  <p className="mt-1 text-white/80 text-sm">$390 per night</p>
                </div>
              </div>
              <p className="mt-6 text-gray-600 text-base leading-relaxed">
                Coconut Villa brings together easy island living and quiet garden surroundings, just steps from the river that runs through Pon Di Rio.
              </p>
            </a>
          </div>
```

- [x] **Step 3: Verify with the dev server**

Open `http://localhost:3000/villas/palm-villa` and `http://localhost:3000/villas/bamboo-villa`.
Expected: both pages' "Check out other villas" sections show two cards side by side (Bamboo+Coconut on the Palm page; Palm+Coconut on the Bamboo page), all links navigate correctly.

- [x] **Step 4: Commit**

```bash
git add app/villas/palm-villa/page.tsx app/villas/bamboo-villa/page.tsx
git commit -m "feat: link Palm and Bamboo villa pages to Coconut Villa"
```

---

### Task 5: Add Coconut Villa to the homepage carousel

**Files:**
- Modify: `components/OurCabins.tsx:85-110`

- [x] **Step 1: Add a third entry to the `cabins` array**

```tsx
  const cabins = [
    {
      id: 1,
      slug: "palm-villa",
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
      slug: "bamboo-villa",
      title: "Bamboo Villa",
      price: 390,
      minNights: 2,
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      images: ["/bamboo-villa-cover.jpg"],
      alt: "Bamboo Villa at Pon Di Rio",
    },
    {
      id: 3,
      slug: "coconut-villa",
      title: "Coconut Villa",
      price: 390,
      minNights: 2,
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      images: ["/coconut-villa-cover.jpg"],
      alt: "Coconut Villa at Pon Di Rio",
    },
  ];
```

- [x] **Step 2: Verify with the dev server**

Open `http://localhost:3000/` and scroll to "Our Villas". Click the carousel's next/prev arrows.
Expected: a third card for Coconut Villa appears and is reachable via the carousel arrows; "View Details" goes to `/villas/coconut-villa`, "Book Now" goes to `/booking?villa=coconut-villa`.

- [x] **Step 3: Commit**

```bash
git add components/OurCabins.tsx
git commit -m "feat: add Coconut Villa to homepage carousel"
```

---

### Task 6: Add Coconut Villa to the hero booking-bar villa dropdown

**Files:**
- Modify: `components/HeroSection.tsx:201-209`

- [x] **Step 1: Add the option**

```tsx
                  <select
                    value={villa}
                    onChange={(e) => setVilla(e.target.value)}
                    className="h-[48px] w-full bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-gray-900 border-0 focus:ring-2 focus:ring-white/50 outline-none"
                  >
                    <option value="">All Villas</option>
                    <option value="palm-villa">Palm Villa</option>
                    <option value="bamboo-villa">Bamboo Villa</option>
                    <option value="coconut-villa">Coconut Villa</option>
                  </select>
```

- [x] **Step 2: Verify with the dev server**

Open `http://localhost:3000/` and check the hero booking bar's "Villa" dropdown.
Expected: "Coconut Villa" appears as an option.

- [x] **Step 3: Commit**

```bash
git add components/HeroSection.tsx
git commit -m "feat: add Coconut Villa to hero booking bar dropdown"
```

---

### Task 7: Add Coconut Villa to the nav bar (desktop + mobile)

**Files:**
- Modify: `components/NavBar.tsx:84-96` (desktop dropdown)
- Modify: `components/NavBar.tsx:164-185` (mobile menu)

- [x] **Step 1: Add to the desktop "Villas" dropdown**

```tsx
            <a
              href="/villas/palm-villa"
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Palm Villa
            </a>
            <a
              href="/villas/bamboo-villa"
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Bamboo Villa
            </a>
            <a
              href="/villas/coconut-villa"
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Coconut Villa
            </a>
```

- [x] **Step 2: Add to the mobile menu, right after the Bamboo Villa link**

```tsx
            <a
              href="/villas/bamboo-villa"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-3 text-sm tracking-wide ${
                shouldShowScrolledStyle
                  ? "text-gray-700 hover:text-gray-900"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Bamboo Villa
            </a>
            <a
              href="/villas/coconut-villa"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-3 text-sm tracking-wide ${
                shouldShowScrolledStyle
                  ? "text-gray-700 hover:text-gray-900"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Coconut Villa
            </a>
```

- [x] **Step 3: Verify with the dev server**

Open `http://localhost:3000/` and check both the desktop "Villas" hover dropdown and (resize to mobile width or use device toolbar) the hamburger menu.
Expected: "Coconut Villa" appears in both, links to `/villas/coconut-villa`.

- [x] **Step 4: Commit**

```bash
git add components/NavBar.tsx
git commit -m "feat: add Coconut Villa to nav bar"
```

---

### Task 8: Refactor the admin calendar-feeds page to support all villas

**Files:**
- Modify: `app/admin/calendar-feeds/page.tsx` (full rewrite)
- Create: `app/admin/calendar-feeds/CalendarFeedsClient.tsx`

Currently `page.tsx` hardcodes `VILLA_ID` to Palm Villa and renders everything itself. We split it: `page.tsx` becomes a thin server component that fetches villas + all feeds, and a new client component owns the villa-selector state and rendering — following the same local-`useState`-filter pattern as `AvailabilityPageClient.tsx`'s `AvailabilityBlocksTable`, except this page always needs one concrete villa selected (no "all" option) because `AddFeedForm` requires a real `villaId` to submit against.

- [x] **Step 1: Create `CalendarFeedsClient.tsx`**

```tsx
"use client";

import { useState } from "react";
import { AddFeedForm } from "./AddFeedForm";
import { RemoveFeedButton } from "./RemoveFeedButton";

type Villa = { id: string; name: string; slug: string };

type Feed = {
  id: string;
  villaId: string;
  sourceName: string;
  feedUrl: string;
  isActive: boolean;
  lastSyncedAt: string | null;
};

function formatDate(date: string | null) {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Jamaica",
  });
}

export function CalendarFeedsClient({
  villas,
  feeds,
}: {
  villas: Villa[];
  feeds: Feed[];
}) {
  const [selectedVillaId, setSelectedVillaId] = useState(villas[0]?.id ?? "");

  const filteredFeeds = feeds.filter((f) => f.villaId === selectedVillaId);

  return (
    <div>
      <div className="mb-6">
        <label className="mb-1 block text-sm text-gray-600">Villa</label>
        <select
          value={selectedVillaId}
          onChange={(e) => setSelectedVillaId(e.target.value)}
          className="h-10 rounded-md border border-gray-300 px-3 text-sm"
        >
          {villas.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Add Feed</h2>
        {selectedVillaId && <AddFeedForm villaId={selectedVillaId} />}
      </div>

      {filteredFeeds.length === 0 ? (
        <p className="text-gray-500">No calendar feeds configured.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Feed URL</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Last Synced</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFeeds.map((feed) => (
                <tr key={feed.id} className={`hover:bg-gray-50 ${!feed.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{feed.sourceName}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="inline-block max-w-xs truncate text-xs" title={feed.feedUrl}>
                      {feed.feedUrl}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {feed.isActive ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(feed.lastSyncedAt)}</td>
                  <td className="px-4 py-3">
                    {feed.isActive && <RemoveFeedButton feedId={feed.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 2: Rewrite `page.tsx`**

```tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getCalendarFeeds, getVillas } from "@/app/actions/admin";
import { CalendarFeedsClient } from "./CalendarFeedsClient";
import { SyncButton } from "./SyncButton";

export default async function CalendarFeedsPage() {
  const [villas, feeds] = await Promise.all([getVillas(), getCalendarFeeds()]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Calendar Feeds</h1>
        <SyncButton />
      </div>

      <CalendarFeedsClient villas={villas} feeds={feeds} />
    </div>
  );
}
```

- [x] **Step 3: Confirm the `Feed` type matches reality**

`getCalendarFeeds()` (`app/actions/admin.ts:170`) is an async function called from a Server Component (`page.tsx`) and its result is passed as a prop into the Client Component `CalendarFeedsClient`. Next.js serializes `Date` values to ISO strings when crossing that server→client boundary — this is runtime behavior that `tsc`/`npm run build` will NOT catch as a type error, since the type-checker only sees the in-process Prisma type. The `Feed` type above is already written as `lastSyncedAt: string | null` to match this (consistent with the existing convention in `AvailabilityPageClient.tsx`'s `Block` type, which also types its date fields as `string`). `formatDate` already handles a string input via `new Date(date)`. No action needed here — this step is just a sanity check that the type wasn't left as `Date | null`.

- [x] **Step 4: Run the type checker / build**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [x] **Step 5: Verify with the dev server**

Open `http://localhost:3000/admin/calendar-feeds`.
Expected: a "Villa" dropdown defaults to the first villa (alphabetically, "Bamboo Villa"), shows that villa's feeds (Palm Villa's existing Airbnb feed should NOT show until you switch the dropdown to Palm Villa). Switch the dropdown to Palm Villa and confirm its existing feed(s) appear. Switch to Coconut Villa and confirm "No calendar feeds configured." shows, and that adding a feed there works (use a placeholder URL if you don't have a real Coconut Villa iCal link yet, then remove it after testing).

- [x] **Step 6: Commit**

```bash
git add app/admin/calendar-feeds/page.tsx app/admin/calendar-feeds/CalendarFeedsClient.tsx
git commit -m "feat: add villa selector to admin calendar-feeds page"
```

---

### Task 9: Final verification pass

- [x] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors.

- [x] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds, including the new `/villas/coconut-villa` route appearing in the build output's route list.

- [x] **Step 3: Manual smoke test on the booking flow**

With the dev server running, open `http://localhost:3000/booking`, select "Coconut Villa" from the villa dropdown, pick valid dates, and confirm the form behaves the same as it does for Palm/Bamboo (price shown, availability check works, no console errors). This page is DB-driven so it should work automatically from Task 1's insert — this step is to catch any surprise (e.g. a missed `isActive` filter elsewhere).

- [x] **Step 4: Manual smoke test on admin bookings/availability**

Open `http://localhost:3000/admin/availability` and `http://localhost:3000/admin/bookings`; confirm "Coconut Villa" appears in both pages' villa filters/selectors with no code changes needed (this just confirms Task 1 took effect end-to-end).

- [x] **Step 5: Final commit (if any cleanup was needed)**

If Steps 1-4 required any fixes, commit them now with a clear message (e.g. `fix: correct Feed type in CalendarFeedsClient`).
