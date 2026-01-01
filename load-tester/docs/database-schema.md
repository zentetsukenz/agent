# Load-Tester Database Schema

**Purpose**: Prisma data models, relationships, constraints, and indexes

---

## Overview

Load-tester uses:

- **Database**: SQLite (local development)
- **ORM**: Prisma 7 with `@prisma/adapter-better-sqlite3`
- **Migration Tool**: Prisma Migrate
- **Schema Location**: `apps/backend/prisma/schema.prisma`

---

## Models

### Endpoint

**Purpose**: API endpoints to load test

```prisma
model Endpoint {
  id        Int      @id @default(autoincrement())
  name      String
  url       String
  method    String   @default("GET")
  headers   String?  // JSON string
  body      String?  // JSON string
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tests     Test[]

  @@unique([url, method])  // Prevent duplicates
  @@index([createdAt(sort: Desc)])
  @@index([method])
}
```

**Fields**:

- `id` — Auto-incrementing primary key
- `name` — Human-readable name for the endpoint
- `url` — Full URL to test (e.g., `https://api.example.com/users`)
- `method` — HTTP method (GET, POST, PUT, DELETE, etc.)
- `headers` — Optional JSON string of request headers
- `body` — Optional JSON string for request body
- `createdAt` — Timestamp of creation
- `updatedAt` — Timestamp of last update
- `tests` — One-to-many relation to Test model

**Constraints**:

- Unique on `(url, method)` — Prevents duplicate endpoints
- Index on `createdAt` (descending) — Efficient recent-first queries
- Index on `method` — Efficient filtering by HTTP method

---

### Test

**Purpose**: Load test execution records

```prisma
model Test {
  id          Int       @id @default(autoincrement())
  endpointId  Int
  endpoint    Endpoint  @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  scenarioId  Int?      // Optional link to scenario
  scenario    Scenario? @relation(fields: [scenarioId], references: [id], onDelete: SetNull)
  duration    Int       // seconds
  connections Int       // concurrent connections
  rps         Int?      // requests per second (optional)
  timeout     Int       @default(300)  // request timeout in seconds
  status      String    @default("pending")  // pending|running|completed|failed|cancelled
  results     String?   // JSON string with autocannon results
  createdAt   DateTime  @default(now())
  completedAt DateTime?

  @@index([endpointId, createdAt(sort: Desc)])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}
```

**Fields**:

- `id` — Auto-incrementing primary key
- `endpointId` — Foreign key to Endpoint (required)
- `endpoint` — Many-to-one relation (cascade delete if endpoint deleted)
- `scenarioId` — Optional foreign key to Scenario
- `scenario` — Many-to-one relation (set null if scenario deleted)
- `duration` — Test duration in seconds
- `connections` — Number of concurrent connections
- `rps` — Optional requests per second limit
- `timeout` — Request timeout (default 300 seconds = 5 minutes)
- `status` — Current test status (see Status Values below)
- `results` — Optional JSON string with autocannon output
- `createdAt` — Timestamp when test was created
- `completedAt` — Optional timestamp when test finished

**Status Values**:

- `pending` — Test queued, not started
- `running` — Test currently executing
- `completed` — Test finished successfully
- `failed` — Test encountered error
- `cancelled` — Test was manually cancelled

**Constraints**:

- Composite index on `(endpointId, createdAt desc)` — Efficient endpoint history queries
- Index on `status` — Efficient filtering by status
- Index on `createdAt` (descending) — Recent tests first

---

### Scenario

**Purpose**: Configurable load test scenarios with multiple phases

```prisma
model Scenario {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  
  // Modes: "simple" (single endpoint) or "workflow" (multi-step)
  mode        String   @default("simple")
  
  // Simple mode: reference existing endpoint
  endpointId  Int?
  endpoint    Endpoint? @relation(fields: [endpointId], references: [id], onDelete: SetNull)
  
  // Workflow mode: setup, workflow, teardown steps (JSON arrays)
  setup       String?   // JSON array of setup steps
  workflow    String?   // JSON array of workflow steps
  teardown    String?   // JSON array of teardown steps
  
  // Load pattern - JSON array of Phase objects
  phases      String    // [{type, duration, connections, rps?}]
  
  // Error handling
  setupErrorHandling    String @default("abort")
  teardownErrorHandling String @default("ignore")
  
  // Template flag - templates are read-only
  isTemplate  Boolean  @default(false)
  
  tests       Test[]    // One-to-many relation
  
  @@index([name])
  @@index([isTemplate])
  @@index([mode])
}
```

**Fields**:

- `id` — Auto-incrementing primary key
- `name` — Unique scenario name
- `description` — Optional description
- `mode` — `"simple"` (single endpoint) or `"workflow"` (multi-step)
- `endpointId` — Foreign key for simple mode (set null if endpoint deleted)
- `endpoint` — Many-to-one relation for simple mode
- `setup` — JSON array of setup steps (workflow mode)
- `workflow` — JSON array of main workflow steps (workflow mode)
- `teardown` — JSON array of cleanup steps (workflow mode)
- `phases` — JSON array of Phase objects (load pattern)
- `setupErrorHandling` — `"abort"` or `"ignore"` for setup failures
- `teardownErrorHandling` — `"abort"` or `"ignore"` for teardown failures
- `isTemplate` — If true, scenario is read-only template
- `tests` — One-to-many relation to Test model

**Constraints**:

- Unique on `name` — No duplicate scenario names
- Index on `name` — Efficient name-based lookups
- Index on `isTemplate` — Efficient template filtering
- Index on `mode` — Efficient mode-based filtering

---

## JSON Field Formats

### Phase Object (in Scenario.phases)

```json
{
  "type": "rampUp|sustained|rampDown|spike",
  "duration": 30,           // seconds
  "connections": 100,       // target concurrent connections
  "startConnections": 10,   // for rampUp/rampDown (optional)
  "rps": 1000              // optional requests per second limit
}
```

**Phase Types**:

- `rampUp` — Gradually increase connections from `startConnections` to `connections`
- `sustained` — Maintain constant `connections` for entire `duration`
- `rampDown` — Gradually decrease connections from `connections` to `startConnections`
- `spike` — Sudden burst to `connections`, then drop

**Example phases array**:

```json
[
  {"type": "rampUp", "duration": 30, "startConnections": 10, "connections": 100},
  {"type": "sustained", "duration": 60, "connections": 100, "rps": 1000},
  {"type": "rampDown", "duration": 30, "startConnections": 10, "connections": 100}
]
```

---

### Headers and Body (in Endpoint model)

**Headers format** (JSON string):

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer token123",
  "X-Custom-Header": "value"
}
```

**Body format** (JSON string):

```json
{
  "userId": 123,
  "action": "create",
  "data": {
    "name": "Example"
  }
}
```

---

### Results (in Test model)

**Autocannon results format** (JSON string):

```json
{
  "url": "http://localhost:3000/api/endpoint",
  "requests": {
    "average": 1000,
    "mean": 1000,
    "stddev": 50,
    "min": 800,
    "max": 1200,
    "total": 60000,
    "sent": 60000
  },
  "latency": {
    "average": 10.5,
    "mean": 10.2,
    "stddev": 2.1,
    "min": 5,
    "max": 50
  },
  "throughput": {
    "average": 1048576,
    "mean": 1048576,
    "stddev": 50000,
    "min": 900000,
    "max": 1200000
  },
  "errors": 0,
  "timeouts": 0,
  "duration": 60,
  "start": "2026-01-01T12:00:00.000Z",
  "finish": "2026-01-01T12:01:00.000Z"
}
```

---

## Relationships

```
Endpoint
  ↓ (1:many, cascade delete)
Test
  ↑ (many:1, set null)
Scenario

Scenario
  ↓ (1:many, set null)
Endpoint
```

**Delete behaviors**:

- Delete Endpoint → Cascades to all Tests for that endpoint
- Delete Scenario → Sets `scenarioId` to null in Tests (preserves test history)
- Delete Endpoint referenced by Scenario → Sets `endpointId` to null in Scenario

---

## Migration Notes

### Prisma 7 Upgrade

**Changed from Prisma 5 to 7**:

- No `url` in `datasource db` block
- Requires adapter pattern in code
- Uses `@prisma/adapter-better-sqlite3`

**Schema datasource** (no URL):

```prisma
datasource db {
  provider = "sqlite"
}
```

**Client instantiation** (in code):

```javascript
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSQLite } from '@prisma/adapter-better-sqlite3';

const db = new Database(process.env.DATABASE_URL);
const adapter = new PrismaBetterSQLite(db);
const prisma = new PrismaClient({ adapter });
```

**Full patterns**: See `docs/prisma-patterns.md` in workspace root

---

## Database Commands

```fish
cd ~/workspace/agent/load-tester/apps/backend

# Create migration and apply
npm run prisma:migrate

# Generate Prisma client (after schema changes)
npm run prisma:generate

# Visual database browser
npm run prisma:studio

# Complete setup (migrate + generate)
npm run db:setup
```

---

## Performance Considerations

**Indexes optimize**:

- Recent endpoints/tests first (`createdAt desc`)
- Filtering by HTTP method
- Test status queries
- Endpoint history lookups

**JSON fields**:

- Stored as strings in SQLite
- Parsed/stringified in application code
- Consider extracting frequently-queried fields to columns

---

**Last Updated**: January 1, 2026
