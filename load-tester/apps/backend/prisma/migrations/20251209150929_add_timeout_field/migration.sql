-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Test" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endpointId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "connections" INTEGER NOT NULL,
    "rps" INTEGER,
    "timeout" INTEGER NOT NULL DEFAULT 300,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "results" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Test_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("completedAt", "connections", "createdAt", "duration", "endpointId", "id", "results", "rps", "status") SELECT "completedAt", "connections", "createdAt", "duration", "endpointId", "id", "results", "rps", "status" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
