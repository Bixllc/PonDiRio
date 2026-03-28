# Pon Di Rio Booking Backend Specification

## Project Goal
Build a backend for Pon Di Rio that supports villa bookings, availability management, payments through FAC/PowerTranz, Airbnb/iCal calendar syncing, booking confirmation, and a simple admin dashboard.

---

## Phase 1 Scope
- availability checking
- booking creation
- prevention of double bookings
- FAC hosted payment flow
- booking confirmation after successful payment
- admin bookings view
- manual date blocking
- email confirmation
- Airbnb / iCal calendar sync for blocked dates and external reservations

---

## Out of Scope for Phase 1
- full chat/messaging system
- advanced analytics
- multi-role staff permissions

---

## Core Booking Rules
- minimum stay: 2 nights
- bookings are based on check-in and check-out dates
- a villa cannot be double booked
- dates are unavailable if:
  - already booked
  - manually blocked by admin
  - blocked by external calendar (Airbnb/iCal)
- booking is only confirmed after successful payment
- failed or abandoned payments must not block dates permanently

---

## Core Data Models

### Villa
- id
- name
- slug
- description
- price_per_night
- max_guests
- is_active

### Booking
- id
- villa_id
- guest_name
- guest_email
- guest_phone
- check_in
- check_out
- guest_count
- special_requests
- status (draft, pending_payment, confirmed, cancelled, failed)
- total_amount
- currency
- created_at
- updated_at

### AvailabilityBlock
- id
- villa_id
- start_date
- end_date
- reason (booking, maintenance, manual, external)
- source (internal, external)
- booking_id (optional)
- created_at

### Payment
- id
- booking_id
- provider (FAC)
- amount
- currency
- status (pending, success, failed, refunded)
- external_transaction_id
- created_at
- updated_at

### ExternalCalendarFeed
- id
- villa_id
- source_name (Airbnb, etc.)
- feed_url
- is_active
- last_synced_at

### ExternalCalendarEvent
- id
- villa_id
- external_feed_id
- external_event_uid
- start_date
- end_date
- summary
- raw_payload
- created_at
- updated_at

---

## Booking Statuses
- draft
- pending_payment
- confirmed
- cancelled
- failed

---

## Payment Statuses
- pending
- success
- failed
- refunded

---

## Booking Flow

1. User selects dates and submits booking request
2. Backend checks availability:
   - existing bookings
   - manual blocks
   - external calendar events
3. If available:
   - create booking with status = pending_payment
4. Backend initiates payment request
5. User is redirected to FAC hosted payment page
6. User completes payment
7. FAC returns success or failure response
8. Backend verifies payment
9. If payment is successful:
   - booking → confirmed
   - payment → success
   - dates → blocked
   - confirmation email sent
10. If payment fails:
   - booking → failed
   - dates remain available

---

## External Calendar Sync Requirements

- support importing Airbnb/iCal feeds
- imported events must block availability
- external events should not be treated as internal bookings
- overlapping external events must prevent booking
- sync should:
  - run periodically (cron later)
  - support manual trigger via admin
- external events should be stored separately from bookings

---

## Admin Requirements

Admin users can:
- view all bookings
- view booking details
- view payment status
- manually block/unblock dates
- cancel bookings
- manage Airbnb/iCal feed URLs
- manually trigger calendar sync
- view external blocked dates

---

## API Requirements

### Public
- GET /api/villas
- GET /api/villas/:id/availability
- POST /api/bookings/quote
- POST /api/bookings
- POST /api/payments/fac/initiate
- POST /api/payments/fac/callback

### Admin
- GET /api/admin/bookings
- GET /api/admin/bookings/:id
- POST /api/admin/availability/blocks
- GET /api/admin/calendar-feeds
- POST /api/admin/calendar-feeds
- POST /api/admin/calendar-sync/run

---

## Payment Integration (FAC / PowerTranz)

- use FAC Hosted Payment Page
- users are redirected to FAC to enter card details
- no card details are stored on Pon Di Rio servers
- backend stores transaction reference only

### Flow:
- backend generates payment request
- redirect user to FAC
- FAC processes payment
- FAC returns response
- backend verifies and updates booking

---

## Compliance Requirements (NCB / FAC)

- no storage of full card details
- use secure hosted payment page
- transaction receipts must include:
  - transaction ID
  - amount
  - date
  - customer name
- website must include:
  - refund policy
  - cancellation policy
  - terms & conditions
  - contact information

---

## Future Enhancements

- card verification flow (NCB CVP)
- advanced admin dashboard
- automated scheduled calendar sync
- two-way sync improvements