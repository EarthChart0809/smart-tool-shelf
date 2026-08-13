import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // マイグレーション実行時はプーリングを経由しない直接接続を使う
    url: env("DIRECT_URL"),
  },
});
