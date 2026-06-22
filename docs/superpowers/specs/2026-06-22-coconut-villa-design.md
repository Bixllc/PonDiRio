# Add Coconut Villa

## Context

Pon Di Rio currently has two villas, Palm Villa and Bamboo Villa. Both exist as `Villa` rows in Postgres (via Prisma). `prisma/seed.ts` is a committed, idempotent (`upsert`) script, but it only seeds a villa called "Pon Di River" (slug `pon-di-river`, price 350, maxGuests 6) — an earlier placeholder that is now `isActive: false` in the live DB. Palm Villa and Bamboo Villa were inserted separately, not through this seed script; their actual field values (price 390, maxGuests 4, description `null`, isActive `true`) were confirmed by directly querying the live `Villa` table, not by reading seed.ts.

Booking, availability, and admin pages that read from the DB already work for any villa; only frontend pages with hardcoded villa lists, and one admin page hardcoded to a single villa ID, need updates.

We're adding a third villa, Coconut Villa, with the same pricing/amenities/layout as the existing two. No photo gallery exists yet for Coconut Villa — only one cover photo, sourced from `/Users/sheneskawilliams/Desktop/BIX/PDR/PDR-PICS/PHOTO-2026-03-16-11-27-26.jpg`.

## Goals

- Coconut Villa is bookable end-to-end (booking form, availability blocking, admin bookings/availability) with zero special-casing — same as Palm/Bamboo.
- Coconut Villa appears on the homepage carousel, nav menus, and has its own villa detail page.
- Coconut Villa's detail page clearly shows a "gallery coming soon" placeholder instead of a broken/empty gallery.
- Admin calendar-feeds page can manage iCal feeds for any of the 3 villas, not just Palm.

## Non-goals

- No new gallery photos for Coconut Villa (out of scope until photos exist).
- No schema changes — the `Villa` model already has all needed fields.
- No new villa-creation admin UI — this is a one-off addition, matching how Palm/Bamboo were added.

## Design

### 1. Database row

Insert a `Villa` row matching the exact pattern used for Palm/Bamboo (verified live in the DB):

```
name: "Coconut Villa"
slug: "coconut-villa"
pricePerNight: 390
maxGuests: 4
description: null
isActive: true
```

This is a one-off insert (e.g. a temporary `tsx` script run once, then discarded), not an extension of `prisma/seed.ts` — consistent with how Palm Villa and Bamboo Villa were added (seed.ts seeds the unrelated, now-inactive "Pon Di River" placeholder and isn't the mechanism used for real villas).

### 2. Cover image

Copy `/Users/sheneskawilliams/Desktop/BIX/PDR/PDR-PICS/PHOTO-2026-03-16-11-27-26.jpg` to `/public/coconut-villa-cover.jpg`. This is the only image asset needed.

### 3. New villa page — `app/villas/coconut-villa/page.tsx`

Copy the structure of `app/villas/bamboo-villa/page.tsx` (hero, description + pricing card, amenities, CTA, other-villas section), with:

- Hero image: `/coconut-villa-cover.jpg`
- Pricing/specs: $390/night, min 2 nights, 2 bedrooms, 2 bathrooms, 4 guests (same as Palm/Bamboo)
- Amenities: same list as Palm/Bamboo (Internet, light housekeeping, river access, chef upon request)
- **Gallery section replaced** with a "Coming Soon" placeholder: show the cover image plus a short message (e.g. "Photo gallery coming soon") instead of the 5-image grid used on other villa pages
- "Check out other villas" section links to both Palm Villa and Bamboo Villa

### 4. Update existing villa pages' cross-links

`app/villas/palm-villa/page.tsx` and `app/villas/bamboo-villa/page.tsx` currently each link to only one other villa in their "Check out other villas" section. Update both so each links to the *other two* villas, now that there are three total.

### 5. Shared component updates

Each of these gets a third entry for Coconut Villa:

- `components/OurCabins.tsx` — add to the `cabins` array: slug `coconut-villa`, title "Coconut Villa", price 390, minNights 2, bedrooms 2, bathrooms 2, guests 4, image `/coconut-villa-cover.jpg`
- `components/HeroSection.tsx` — add `<option value="coconut-villa">Coconut Villa</option>` to the villa select dropdown
- `components/NavBar.tsx` — add a link to `/villas/coconut-villa` in both the desktop dropdown and the mobile menu

### 6. No changes needed (DB-driven already)

- `app/api/villas/route.ts` — fetches active villas from DB
- `app/booking/page.tsx` — fetches villa list from `/api/villas`
- `app/admin/availability/*` — fetches villas via `getVillas()`
- `app/admin/bookings/*` — fetches villas via `getVillas()`
- `app/opengraph-image.tsx` — hardcodes `bamboo-villa-cover.jpg` as the site-wide OG image background. This is global branding, not a per-villa list, so it's out of scope here and intentionally left unchanged.

### 7. Admin calendar-feeds page — villa selector

Currently `app/admin/calendar-feeds/page.tsx` hardcodes `VILLA_ID` to Palm Villa. Convert to support all villas, following the existing client-side filter pattern already used in `app/admin/availability/AvailabilityPageClient.tsx` (local `useState`, no URL params/routing):

- `page.tsx` becomes a server component that fetches `villas = await getVillas()` and `feeds = await getCalendarFeeds()` (calling with no argument returns feeds for all villas, since `getCalendarFeeds` already supports an optional `villaId`), then renders a new client component with this data.
- New `app/admin/calendar-feeds/CalendarFeedsClient.tsx`: holds `selectedVillaId` state (default: first villa in the fetched list), renders a `<select>` dropdown of villas, filters the already-fetched `feeds` array client-side by `villaId`, and passes `selectedVillaId` into `AddFeedForm`. This borrows the *local-state, client-side filtering* mechanic from `AvailabilityPageClient.tsx`, but diverges on the default value: that page defaults to an `"all"` sentinel (it's a read-only filter), whereas this page always needs one concrete villa selected because `AddFeedForm` requires a real `villaId` to submit against — so there's no `"all"` option here, just a default to the first villa.
- `SyncButton` and `RemoveFeedButton` are unchanged (already villa-agnostic).

## Open questions

None — all decisions confirmed with the user during brainstorming.
