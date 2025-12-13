/*
Warnings:

- Added the required column `updatedAt` to the `Endpoint` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys = ON;

PRAGMA foreign_keys = OFF;

CREATE TABLE "new_Endpoint" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'GET',
  "headers" TEXT,
  "body" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

INSERT INTO
  "new_Endpoint" (
    "body",
    "createdAt",
    "headers",
    "id",
    "method",
    "name",
    "url",
    "updatedAt"
  )
SELECT
  "body",
  "createdAt",
  "headers",
  "id",
  "method",
  "name",
  "url",
  COALESCE("createdAt", CURRENT_TIMESTAMP)
FROM
  "Endpoint";

DROP TABLE "Endpoint";

ALTER TABLE "new_Endpoint"
RENAME TO "Endpoint";

CREATE INDEX "Endpoint_createdAt_idx" ON "Endpoint" ("createdAt" DESC);

CREATE INDEX "Endpoint_method_idx" ON "Endpoint" ("method");

CREATE UNIQUE INDEX "Endpoint_url_method_key" ON "Endpoint" ("url", "method");

PRAGMA foreign_keys = ON;

PRAGMA defer_foreign_keys = OFF;

-- CreateIndex
CREATE INDEX "Test_endpointId_createdAt_idx" ON "Test" ("endpointId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Test_status_idx" ON "Test" ("status");

-- CreateIndex
CREATE INDEX "Test_createdAt_idx" ON "Test" ("createdAt" DESC);
