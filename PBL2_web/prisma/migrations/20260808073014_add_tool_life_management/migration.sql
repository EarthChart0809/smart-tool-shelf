-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tool" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "boxId" INTEGER NOT NULL,
    "lifeLimit" INTEGER NOT NULL DEFAULT 200,
    "useCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Tool" ("boxId", "id", "name", "stock") SELECT "boxId", "id", "name", "stock" FROM "Tool";
DROP TABLE "Tool";
ALTER TABLE "new_Tool" RENAME TO "Tool";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
