/// <reference types="node" />

import { PrismaClient } from "../src/generated/prisma";
import items from "../src/data/items";

const prisma = new PrismaClient();

async function main() {
  for (const item of items) {
    // check if the place already exists
    const existing = await prisma.place.findFirst({
      where: { name: item.name },
    });
    if (!existing) {
      await prisma.place.create({
        data: item,
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
