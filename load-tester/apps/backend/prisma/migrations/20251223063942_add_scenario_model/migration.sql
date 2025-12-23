-- CreateTable
CREATE TABLE "Scenario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'simple',
    "endpointId" INTEGER,
    "setup" TEXT,
    "workflow" TEXT,
    "teardown" TEXT,
    "phases" TEXT NOT NULL,
    "setupErrorHandling" TEXT NOT NULL DEFAULT 'abort',
    "setupRetryCount" INTEGER NOT NULL DEFAULT 3,
    "teardownErrorHandling" TEXT NOT NULL DEFAULT 'ignore',
    "teardownRetryCount" INTEGER NOT NULL DEFAULT 3,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scenario_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Test" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endpointId" INTEGER NOT NULL,
    "scenarioId" INTEGER,
    "duration" INTEGER NOT NULL,
    "connections" INTEGER NOT NULL,
    "rps" INTEGER,
    "timeout" INTEGER NOT NULL DEFAULT 300,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "results" TEXT,
    "phaseResults" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Test_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Test_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("completedAt", "connections", "createdAt", "duration", "endpointId", "id", "results", "rps", "status", "timeout") SELECT "completedAt", "connections", "createdAt", "duration", "endpointId", "id", "results", "rps", "status", "timeout" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
CREATE INDEX "Test_endpointId_createdAt_idx" ON "Test"("endpointId", "createdAt" DESC);
CREATE INDEX "Test_scenarioId_createdAt_idx" ON "Test"("scenarioId", "createdAt" DESC);
CREATE INDEX "Test_status_idx" ON "Test"("status");
CREATE INDEX "Test_createdAt_idx" ON "Test"("createdAt" DESC);
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Scenario_name_key" ON "Scenario"("name");

-- CreateIndex
CREATE INDEX "Scenario_name_idx" ON "Scenario"("name");

-- CreateIndex
CREATE INDEX "Scenario_isTemplate_idx" ON "Scenario"("isTemplate");

-- CreateIndex
CREATE INDEX "Scenario_mode_idx" ON "Scenario"("mode");

-- CreateIndex
CREATE INDEX "Scenario_createdAt_idx" ON "Scenario"("createdAt" DESC);
