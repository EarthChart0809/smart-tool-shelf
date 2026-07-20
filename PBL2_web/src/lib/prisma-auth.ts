import { PrismaClient } from "@/generated/prisma-auth/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrismaAuth = global as unknown as {
  prismaAuth: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prismaAuth =
  globalForPrismaAuth.prismaAuth ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrismaAuth.prismaAuth = prismaAuth;
}
