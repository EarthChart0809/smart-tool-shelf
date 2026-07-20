import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma", // ← sqlite側のschema
  migrations: {
    path: "prisma/migrations", // ← sqlite側のmigrations
  },
  datasource: {
    url: env("SQLITE_URL"),
  },
});
