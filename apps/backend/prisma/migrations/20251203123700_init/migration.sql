-- CreateTable
CREATE TABLE "Endpoint" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'GET',
  "headers" TEXT,
  "body" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Test" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "endpointId" INTEGER NOT NULL,
  "duration" INTEGER NOT NULL,
  "connections" INTEGER NOT NULL,
  "rps" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "results" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" DATETIME,
  CONSTRAINT "Test_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
