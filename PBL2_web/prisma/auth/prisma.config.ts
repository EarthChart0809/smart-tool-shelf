import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "schema.prisma", // ← "prisma/auth/schema.prisma" ではなく相対パス
  migrations: {
    path: "migrations", // ← 同様に相対パス
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
