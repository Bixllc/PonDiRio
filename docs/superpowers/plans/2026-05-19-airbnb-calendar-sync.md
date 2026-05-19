# Airbnb Calendar Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable bidirectional iCal calendar sync between Pon Di Rio and Airbnb, with hourly automated import and a public export endpoint.

**Architecture:** A new public `GET /api/calendar/export.ics` route generates a valid iCal file from confirmed bookings and manual blocks so Airbnb can subscribe. A `vercel.json` cron triggers the existing sync route hourly. The sync route's auth is updated to accept Vercel's `CRON_SECRET`-based `Authorization` header in addition to the existing `SYNC_SECRET` header.

**Tech Stack:** Next.js App Router route handlers, Prisma, `ical-generator` npm package, Vercel Cron

---

## Chunk 1: iCal Export Endpoint

### File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/api/calendar/export.ics/route.ts` | Create | Serve confirmed bookings + manual blocks as an iCal feed |

---

### Task 1: Install `ical-generator`

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install the package**

```bash
npm install ical-generator
```

Expected output: package added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Verify install**

```bash
node -e "require('ical-generator'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add ical-generator dependency"
```

---

### Task 2: Create the iCal export route

**Files:**
- Create: `app/api/calendar/export.ics/route.ts`

- [ ] **Step 1: Create the file**

Create `app/api/calendar/export.ics/route.ts` with this content:

```typescript
import { NextRequest, NextResponse } from "next/server";
import ical from "ical-generator";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const villaId = request.nextUrl.searchParams.get("villaId");

  if (!villaId) {
    return NextResponse.json({ error: "villaId is required" }, { status: 400 });
  }

  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { id: true, name: true },
  });

  if (!villa) {
    return NextResponse.json({ error: "Villa not found" }, { status: 400 });
  }

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: { villaId, status: "CONFIRMED" },
      select: { id: true, checkIn: true, checkOut: true },
    }),
    prisma.availabilityBlock.findMany({
      where: { villaId, bookingId: null },
      select: { id: true, startDate: true, endDate: true },
    }),
  ]);

  const calendar = ical({ name: villa.name });

  for (const booking of bookings) {
    calendar.createEvent({
      uid: `booking-${booking.id}@pondiriorivercottagesja.com`,
      start: booking.checkIn,
      end: booking.checkOut,
      summary: "Reserved",
      allDay: true,
    });
  }

  for (const block of blocks) {
    calendar.createEvent({
      uid: `block-${block.id}@pondiriorivercottagesja.com`,
      start: block.startDate,
      end: block.endDate,
      summary: "Reserved",
      allDay: true,
    });
  }

  return new NextResponse(calendar.toString(), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="calendar.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 3: Verify the endpoint returns a valid iCal response**

In a new terminal:

```bash
curl "http://localhost:3000/api/calendar/export.ics?villaId=cmn854tso0000ck3p78a7zy4x"
```

Expected: Response starting with `BEGIN:VCALENDAR` and ending with `END:VCALENDAR`. Content-Type header should be `text/calendar`.

- [ ] **Step 4: Verify missing villaId returns 400**

```bash
curl -i "http://localhost:3000/api/calendar/export.ics"
```

Expected: `HTTP/1.1 400` with `{"error":"villaId is required"}`

- [ ] **Step 5: Verify invalid villaId returns 400**

```bash
curl -i "http://localhost:3000/api/calendar/export.ics?villaId=doesnotexist"
```

Expected: `HTTP/1.1 400` with `{"error":"Villa not found"}`

- [ ] **Step 6: Commit**

```bash
git add app/api/calendar/export.ics/route.ts
git commit -m "feat: add iCal export endpoint for Airbnb subscription"
```

---

## Chunk 2: Sync Route Auth Update + Vercel Cron

### File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/api/calendar/sync/route.ts` | Modify | Accept `CRON_SECRET`-based auth from Vercel cron in addition to `SYNC_SECRET` |
| `vercel.json` | Create | Configure hourly Vercel cron job |

---

### Task 3: Update sync route to accept Vercel cron auth

**Files:**
- Modify: `app/api/calendar/sync/route.ts`

Current file at `app/api/calendar/sync/route.ts`:
```typescript
export async function POST(request: NextRequest) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) {
    console.error("SYNC_SECRET environment variable is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const provided = request.headers.get("x-sync-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...
}
```

- [ ] **Step 1: Replace the auth block**

Replace the auth section (lines 7–15 of the current file) with this updated version that accepts either auth method:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { syncAllFeeds } from "@/lib/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const syncSecret = process.env.SYNC_SECRET;
  const cronSecret = process.env.CRON_SECRET;

  const providedSyncSecret = request.headers.get("x-sync-secret");
  const providedAuth = request.headers.get("authorization");
  const isVercelCron = providedAuth === `Bearer ${cronSecret}` && !!cronSecret;
  const isManualTrigger = !!syncSecret && providedSyncSecret === syncSecret;

  if (!isVercelCron && !isManualTrigger) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncAllFeeds();

    const failed = results.filter((r) => r.error);
    const status = failed.length === results.length && results.length > 0 ? 502 : 200;

    return NextResponse.json({ results }, { status });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json({ error: "Calendar sync failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify manual trigger still works (dev server must be running)**

```bash
curl -i -X POST http://localhost:3000/api/calendar/sync \
  -H "x-sync-secret: $(grep SYNC_SECRET .env.local | cut -d= -f2)"
```

Expected: `HTTP/1.1 200` with `{"results":[]}`  (empty if no feeds added yet, otherwise feed results)

- [ ] **Step 3: Verify unauthorized request is rejected**

```bash
curl -i -X POST http://localhost:3000/api/calendar/sync \
  -H "x-sync-secret: wrongsecret"
```

Expected: `HTTP/1.1 401` with `{"error":"Unauthorized"}`

- [ ] **Step 4: Verify Vercel cron auth works**

Set a test value and verify it's accepted:

```bash
CRON_SECRET=testcronvalue curl -i -X POST http://localhost:3000/api/calendar/sync \
  -H "Authorization: Bearer testcronvalue"
```

Note: This won't work locally because `CRON_SECRET` must be in your env. Instead, add `CRON_SECRET=testcronvalue` to `.env.local` temporarily, restart dev server, then run:

```bash
curl -i -X POST http://localhost:3000/api/calendar/sync \
  -H "Authorization: Bearer testcronvalue"
```

Expected: `HTTP/1.1 200`

Remove `CRON_SECRET=testcronvalue` from `.env.local` after verifying (it will be set in Vercel's environment, not locally).

- [ ] **Step 5: Commit**

```bash
git add app/api/calendar/sync/route.ts
git commit -m "feat: accept Vercel CRON_SECRET auth on calendar sync route"
```

---

### Task 4: Add Vercel cron configuration

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json` at project root**

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

Note: `0 * * * *` = top of every hour. Vercel sends a `POST` request with `Authorization: Bearer {CRON_SECRET}` automatically.

- [ ] **Step 2: Verify the file is valid JSON**

```bash
node -e "require('./vercel.json'); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: add Vercel cron for hourly Airbnb calendar sync"
```

---

## Chunk 3: Environment Setup + Feed Registration

### Task 5: Set CRON_SECRET in Vercel

- [ ] **Step 1: Generate a secure random secret**

```bash
openssl rand -hex 32
```

Copy the output — this is your `CRON_SECRET`.

- [ ] **Step 2: Add to Vercel project settings**

1. Go to your Vercel dashboard → Pon Di Rio project → Settings → Environment Variables
2. Add: `CRON_SECRET` = (the value from step 1)
3. Set scope to: Production + Preview
4. Save

- [ ] **Step 3: Deploy to production**

```bash
git push origin main
```

Wait for Vercel deployment to complete.

- [ ] **Step 4: Verify the export endpoint is live**

```bash
curl "https://www.pondiriorivercottagesja.com/api/calendar/export.ics?villaId=cmn854tso0000ck3p78a7zy4x"
```

Expected: Valid iCal response starting with `BEGIN:VCALENDAR`

---

### Task 6: Register the Airbnb calendar feed (import)

- [ ] **Step 1: Go to admin calendar feeds page**

Open: `https://www.pondiriorivercottagesja.com/admin/calendar-feeds`

- [ ] **Step 2: Add the Airbnb feed**

- Source Name: `Airbnb`
- Feed URL: `https://www.airbnb.com/calendar/ical/1629783572543988451.ics?t=b29eddaf703340429dae8468c108c468&locale=en-CA`
- Click **Add Feed**

- [ ] **Step 3: Trigger an immediate sync**

Click **Sync Now** on the Calendar Feeds page.

- [ ] **Step 4: Verify sync worked**

The feed row should show a recent "Last Synced" timestamp. Check admin availability page to confirm any existing Airbnb bookings appear as blocked dates.

---

### Task 7: Register the site's calendar in Airbnb (export)

- [ ] **Step 1: Copy the export URL**

```
https://www.pondiriorivercottagesja.com/api/calendar/export.ics?villaId=cmn854tso0000ck3p78a7zy4x
```

- [ ] **Step 2: Add to Airbnb**

1. Log into Airbnb → Calendar
2. Select the Pon Di Rio listing
3. Go to Availability settings → Sync calendars → Import calendar
4. Paste the URL above
5. Save

- [ ] **Step 3: Verify Airbnb accepted it**

Airbnb should show the calendar as connected. Any confirmed bookings from your site will now appear as blocked on Airbnb (Airbnb fetches the URL on their own schedule, typically within a few hours).

---

## Summary of Changes

| File | Action |
|------|--------|
| `app/api/calendar/export.ics/route.ts` | Created — serves iCal feed for Airbnb |
| `app/api/calendar/sync/route.ts` | Updated — accepts `CRON_SECRET` auth |
| `vercel.json` | Created — hourly cron job |
| Vercel env vars | `CRON_SECRET` added |
| Admin: Calendar Feeds | Airbnb feed URL added |
| Airbnb host settings | Site export URL added |
