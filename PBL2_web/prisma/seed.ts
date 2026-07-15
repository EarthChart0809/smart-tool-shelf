import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.tool.deleteMany();

  await prisma.tool.createMany({
    data: [
      {
        name: "3mmドリル",
        stock: 5,
        boxId: 1,
      },
      {
        name: "5mmドリル",
        stock: 4,
        boxId: 2,
      },
      {
        name: "8mmドリル",
        stock: 2,
        boxId: 3,
      },
    ],
  });

  console.log("Seed Complete");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });