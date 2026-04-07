/**
 * One-time cleanup script:
 * 1. Delete AvailabilityBlocks linked to non-CONFIRMED bookings
 * 2. Delete Payments for non-confirmed bookings (DRAFT, PENDING_PAYMENT, FAILED)
 * 3. Delete the non-confirmed bookings themselves
 *
 * Run: npx tsx scripts/cleanup-test-bookings.ts
 */

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Find all non-confirmed bookings
  const testBookings = await prisma.booking.findMany({
    where: {
      status: { in: ["DRAFT", "PENDING_PAYMENT", "FAILED"] },
    },
    select: { id: true, guestName: true, status: true, checkIn: true },
  });

  console.log(`Found ${testBookings.length} non-confirmed bookings to clean up:`);
  for (const b of testBookings) {
    console.log(`  - ${b.guestName} | ${b.status} | check-in: ${b.checkIn.toISOString().split("T")[0]}`);
  }

  if (testBookings.length === 0) {
    console.log("Nothing to clean up.");
    return;
  }

  const bookingIds = testBookings.map((b) => b.id);

  // 2. Delete AvailabilityBlocks linked to these bookings
  const deletedBlocks = await prisma.availabilityBlock.deleteMany({
    where: { bookingId: { in: bookingIds } },
  });
  console.log(`\nDeleted ${deletedBlocks.count} availability blocks linked to non-confirmed bookings.`);

  // 3. Delete Payments for these bookings
  const deletedPayments = await prisma.payment.deleteMany({
    where: { bookingId: { in: bookingIds } },
  });
  console.log(`Deleted ${deletedPayments.count} payments for non-confirmed bookings.`);

  // 4. Delete the bookings themselves
  const deletedBookings = await prisma.booking.deleteMany({
    where: { id: { in: bookingIds } },
  });
  console.log(`Deleted ${deletedBookings.count} non-confirmed bookings.`);

  // Summary: what's left
  const remaining = await prisma.booking.findMany({
    select: { id: true, guestName: true, status: true, checkIn: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(`\nRemaining bookings (${remaining.length}):`);
  for (const b of remaining) {
    console.log(`  - ${b.guestName} | ${b.status} | check-in: ${b.checkIn.toISOString().split("T")[0]}`);
  }
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
