import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const manualBlocks = await prisma.availabilityBlock.findMany({
    where: { reason: "MANUAL" },
    include: { villa: { select: { name: true } } },
  });

  console.log(`Manual blocks found: ${manualBlocks.length}`);

  let deleted = 0;
  for (const block of manualBlocks) {
    console.log(`  - ${block.villa.name}: ${block.startDate.toISOString().split("T")[0]} to ${block.endDate.toISOString().split("T")[0]}`);

    const conflict = await prisma.booking.findFirst({
      where: {
        villaId: block.villaId,
        status: "CONFIRMED",
        checkIn: { lt: block.endDate },
        checkOut: { gt: block.startDate },
      },
      select: { guestName: true },
    });

    if (conflict) {
      console.log(`    -> Overlaps confirmed booking for ${conflict.guestName} — DELETING`);
      await prisma.availabilityBlock.delete({ where: { id: block.id } });
      deleted++;
    }
  }

  console.log(`\nDeleted ${deleted} overlapping manual blocks.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
