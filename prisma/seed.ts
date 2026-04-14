import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/client";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const villa = await prisma.villa.upsert({
    where: { slug: "pon-di-river" },
    update: {},
    create: {
      name: "Pon Di River",
      slug: "pon-di-river",
      description:
        "A stunning riverside villa nestled in the lush hills of Retreat, St. Mary, Jamaica. Private pool, chef services available, and direct river access.",
      pricePerNight: 350,
      maxGuests: 6,
      isActive: true,
    },
  });

  console.log("Seeded villa:", villa.id, villa.name);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
