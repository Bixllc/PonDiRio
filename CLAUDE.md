# Claude Project Instructions — Pon Di Rio

You are helping build the backend for a villa booking platform.

---

## Tech Context

- Frontend is already built
- Backend is being added incrementally
- Preferred stack:
  - Next.js (API routes or server actions)
  - PostgreSQL
  - Prisma ORM
  - FAC (PowerTranz) for payments

---

## Core Rules

- NEVER allow double bookings
- Booking is only confirmed after successful payment
- External calendar (Airbnb/iCal) must block availability
- Do NOT store card details
- Use FAC hosted payment page
- Keep architecture simple and production-ready

---

## Calendar Logic

Availability must consider:
1. confirmed bookings
2. manual admin blocks
3. external calendar events (Airbnb/iCal)

If any overlap exists → dates are unavailable

---

## Payment Rules

- Payment is handled via FAC hosted page
- Backend only:
  - creates payment request
  - receives callback
  - verifies transaction
- Booking is confirmed ONLY after verified success

---

## Admin Requirements

- simple admin dashboard (not over-engineered)
- must support:
  - viewing bookings
  - blocking dates
  - managing calendar feeds
  - triggering sync

---

## Working Instructions

Before generating code:
1. Read `docs/backend-booking-spec.md`
2. Follow the spec strictly
3. Do NOT invent new flows

When generating code:
- explain what files to create/update
- explain why
- provide exact commands to run
- keep changes small and incremental

---

## Build Strategy

Always work in this order:

1. Database schema (Prisma)
2. Availability logic
3. Booking creation
4. Payment integration
5. External calendar sync
6. Admin endpoints

Do NOT skip steps.

---

## General Guidance

- prioritize clarity over complexity
- avoid over-engineering
- assume real users and real payments
- keep everything secure and predictable