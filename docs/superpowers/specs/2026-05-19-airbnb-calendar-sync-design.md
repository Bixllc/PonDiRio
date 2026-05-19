# Airbnb Calendar Sync — Design Spec

**Date:** 2026-05-19
**Status:** Approved

---

## Goal

Enable bidirectional calendar sync between the Pon Di Rio site and the Airbnb listing so that bookings on either platform automatically block availability on the other, preventing double bookings.

---

## Scope

### In scope
- `GET /api/calendar/export.ics` — iCal export endpoint (Site → Airbnb)
- `vercel.json` cron job — hourly automated sync (Airbnb → Site)
- Update `/api/calendar/sync` to accept Vercel cron requests in addition to `SYNC_SECRET`

### Out of scope
- Multi-villa export (single villa only for now)
- Two-way write-back (cancelling on one platform cancels the other)
- Guest detail exposure in exported events

---

## Architecture

```
Airbnb calendar                   Pon Di Rio site
──────────────                    ──────────────────────────────────────
Airbnb .ics URL  ──(hourly pull)──▶  POST /api/calendar/sync
                                       ↓ syncAllFeeds()
                                       ↓ upserts ExternalCalendarEvent rows
                                       ↓ availability checks block these dates

Confirmed bookings ◀──(Airbnb subscribes)──  GET /api/calendar/export.ics
+ manual blocks                               (generated iCal, public endpoint)
```

### Direction 1: Airbnb → Site (import)
Already built. Admin adds the Airbnb iCal URL via `/admin/calendar-feeds`. The sync fetches it and stores events as `ExternalCalendarEvent` rows. Availability checks (`lib/availability.ts`) already query these rows and block conflicting dates.

### Direction 2: Site → Airbnb (export)
New endpoint. Reads confirmed bookings and manual `AvailabilityBlock` rows, generates a valid iCal (`.ics`) response. Airbnb subscribes to this URL from their host calendar settings.

### Automated sync
New `vercel.json` cron runs `POST /api/calendar/sync` at the top of every hour (`0 * * * *`). Vercel injects the `x-vercel-cron: 1` header on cron-triggered requests — the sync route is updated to accept this header as an alternative to `SYNC_SECRET`.

---

## Components

### 1. `app/api/calendar/export.ics/route.ts` (new file)

- Method: `GET`
- Query param: `villaId` (required)
- No authentication — must be publicly accessible for Airbnb to fetch
- Reads from DB:
  - `Booking` where `status = CONFIRMED` and `villaId` matches
  - `AvailabilityBlock` where `villaId` matches
- Returns:
  - `Content-Type: text/calendar; charset=utf-8`
  - `Content-Disposition: inline; filename="calendar.ics"`
  - Valid iCal body (VCALENDAR wrapping VEVENT entries)
- Event format per entry:
  - `UID`: `{id}@pondiriorivercottagesja.com`
  - `DTSTART`: check-in / startDate (DATE format, no time)
  - `DTEND`: check-out / endDate (DATE format, no time)
  - `SUMMARY`: `Reserved` (no guest details exposed)
  - `DTSTAMP`: current timestamp

### 2. `app/api/calendar/sync/route.ts` (update existing)

Current auth: checks `x-sync-secret` header against `SYNC_SECRET` env var.

Updated auth: accept the request if **either**:
- `x-sync-secret` matches `SYNC_SECRET`, OR
- `x-vercel-cron` header equals `"1"` (Vercel injects this on cron-triggered calls)

This keeps manual admin triggers working while enabling the automated cron.

### 3. `vercel.json` (new file)

```json
{
  "crons": [
    {
      "path": "/api/calendar/sync",
      "schedule": "0 * * * *"
    }
  ]
}
```

Triggers hourly sync of all active calendar feeds. Vercel sends a `POST` request to the route with the `x-vercel-cron: 1` header.

---

## Data Flow

### Import (Airbnb → Site)
1. Vercel cron fires at top of hour → `POST /api/calendar/sync`
2. `syncAllFeeds()` fetches all active `ExternalCalendarFeed` records
3. For each feed, fetches the iCal URL and parses VEVENT entries
4. Upserts `ExternalCalendarEvent` rows; removes stale events
5. Updates `lastSyncedAt` on the feed
6. Any date range in `ExternalCalendarEvent` now blocks availability site-wide

### Export (Site → Airbnb)
1. Airbnb fetches `GET /api/calendar/export.ics?villaId=...` on their own schedule (typically every few hours)
2. Route queries confirmed bookings + availability blocks from DB
3. Returns iCal file with `Reserved` events for each blocked range
4. Airbnb marks those dates as unavailable on the listing

---

## Setup Steps (one-time, manual)

### Adding Airbnb → Site feed
1. Client gets Airbnb iCal export URL from Airbnb host dashboard:
   - Calendar → select listing → Availability settings → Export calendar → copy link
2. Admin pastes URL into `/admin/calendar-feeds` with source name `Airbnb`
3. Click **Sync Now** to pull immediately

### Adding Site → Airbnb feed
1. Copy the export URL: `https://www.pondiriorivercottagesja.com/api/calendar/export.ics?villaId=cmn854tso0000ck3p78a7zy4x`
2. In Airbnb host dashboard: Calendar → Availability settings → Import calendar → paste URL

---

## Error Handling

- If a feed fetch fails during sync, the error is logged and returned in the sync response — other feeds continue processing (already implemented in `syncAllFeeds`)
- If the export endpoint cannot reach the DB, returns `500` — Airbnb will retry on its own schedule
- No partial writes — each feed sync is independent

---

## Files Changed

| File | Action |
|------|--------|
| `app/api/calendar/export.ics/route.ts` | Create |
| `app/api/calendar/sync/route.ts` | Update auth logic |
| `vercel.json` | Create |
