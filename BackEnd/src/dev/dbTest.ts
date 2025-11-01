import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // create one place (skip if it already exists)
  const existing = await prisma.place.findFirst({
    where: { nameOfficial: "IK Building (test)" },
  });

  if (!existing) {
    await prisma.place.create({
      data: {
        nameOfficial: "IK Building (test)",
        campus: "Kassai út",
        lat: 47.5439,
        lng: 21.6406,
      },
    });
  }

  // read all places
  const places = await prisma.place.findMany();
  console.log("Places:", places);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });