---
type: Pattern
title: Prisma 7 Patterns
---

# Prisma 7 Patterns

> **Critical**: This project uses Prisma 7 with the adapter pattern. Prisma 5 patterns will NOT work.

---

## Prisma 7 Setup (This Project)

### Schema Configuration

The schema does NOT include database URL (Prisma 7 change):

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  // Note: No 'url' field here in Prisma 7
}
```

### Config File (New in Prisma 7)

Database URL is now configured in `prisma.config.ts`:

```typescript
// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### Client Initialization (Adapter Pattern)

Prisma 7 requires an adapter for SQLite:

```javascript
// src/config/database.js
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

let prisma;

function getPrismaClient() {
  if (!prisma) {
    const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });
    
    prisma = new PrismaClient({
      adapter,  // Required in Prisma 7
      log: process.env.NODE_ENV === "development" 
        ? ["query", "error", "warn"] 
        : ["error"],
    });
  }
  return prisma;
}
```

---

## Common Operations

### Basic CRUD

```javascript
const prisma = getPrismaClient();

// Create
const endpoint = await prisma.endpoint.create({
  data: {
    name: "Production API",
    url: "https://api.example.com",
    method: "GET",
  },
});

// Read one
const endpoint = await prisma.endpoint.findUnique({
  where: { id: parseInt(id) },
});

// Read many
const endpoints = await prisma.endpoint.findMany({
  orderBy: { createdAt: "desc" },
});

// Update
const updated = await prisma.endpoint.update({
  where: { id: parseInt(id) },
  data: { name: "New Name" },
});

// Delete
await prisma.endpoint.delete({
  where: { id: parseInt(id) },
});
```

### Relations

```javascript
// Include related data
const endpoint = await prisma.endpoint.findUnique({
  where: { id: parseInt(id) },
  include: { 
    tests: {
      orderBy: { createdAt: "desc" },
      take: 10,
    }
  },
});

// Create with relation
const test = await prisma.test.create({
  data: {
    endpointId: parseInt(endpointId),
    duration: 30,
    connections: 10,
  },
});
```

### Unique Constraint Handling

This project has a unique constraint on `Endpoint(url, method)`:

```javascript
// ✅ GOOD: Check for existing before create
const existing = await prisma.endpoint.findFirst({
  where: { url, method },
});

if (existing) {
  throw new ConflictError("Endpoint with this URL and method already exists");
}

// Or use upsert for update-or-create
const endpoint = await prisma.endpoint.upsert({
  where: {
    endpoint_url_method_unique: { url, method },
  },
  update: { name, headers, body },
  create: { name, url, method, headers, body },
});
```

### Filtering and Sorting

```javascript
// With pagination
const tests = await prisma.test.findMany({
  where: {
    endpointId: parseInt(endpointId),
    status: "completed",
  },
  orderBy: { createdAt: "desc" },
  skip: (page - 1) * limit,
  take: limit,
});

// Count for pagination
const total = await prisma.test.count({
  where: { endpointId: parseInt(endpointId) },
});

// Multiple conditions
const tests = await prisma.test.findMany({
  where: {
    OR: [
      { status: "running" },
      { status: "pending" },
    ],
  },
});
```

---

## Schema Changes (Migrations)

### Creating a Migration

```fish
cd apps/backend
npm run prisma:migrate
# Enter migration name when prompted
```

### Migration Best Practices

1. **Add nullable fields first**: If adding a required field to existing data
   ```prisma
   // Step 1: Add as nullable
   newField String?
   
   // Step 2: Migrate, backfill data
   // Step 3: Make required
   newField String
   ```

2. **Add indexes for query performance**:
   ```prisma
   model Test {
     // ... fields ...
     
     @@index([endpointId, createdAt(sort: Desc)])
     @@index([status])
   }
   ```

3. **Use cascade delete for child records**:
   ```prisma
   model Test {
     endpoint Endpoint @relation(fields: [endpointId], references: [id], onDelete: Cascade)
   }
   ```

---

## Testing with Prisma

### Test Setup

Tests use a separate database (`prisma/test.db`):

```javascript
// tests/setup.js
beforeAll(async () => {
  // Test setup runs migrations on test.db
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
  });
});

afterAll(async () => {
  // Cleanup test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});
```

### Test Isolation

```javascript
// tests/helpers/prisma.js
const { getPrismaClient } = require("../../src/config/database");

async function cleanDatabase() {
  const prisma = getPrismaClient();
  // Delete in correct order (child before parent)
  await prisma.test.deleteMany();
  await prisma.endpoint.deleteMany();
}

// Use in tests
beforeEach(async () => {
  await cleanDatabase();
});
```

---

## Common Errors & Solutions

### "Can't reach database server"
```
Error: Can't reach database server at localhost:5432
```
**Solution**: Check DATABASE_URL in `.env`. For SQLite, should be `file:./prisma/dev.db`

### "Prisma Client not generated"
```
Error: @prisma/client did not initialize yet
```
**Solution**: Run `npm run prisma:generate` in `apps/backend`

### "Unique constraint violation"
```
Error: Unique constraint failed on the constraint: `endpoint_url_method_unique`
```
**Solution**: Check for existing record before create, or use upsert

### "Foreign key constraint failed"
```
Error: Foreign key constraint failed on the field: `endpointId`
```
**Solution**: Ensure parent record exists before creating child, or use cascade delete

### "Migration failed"
```
Error: Migration failed to apply
```
**Solutions**:
1. Check for syntax errors in schema
2. For breaking changes, may need to reset: `npx prisma migrate reset`
3. Check migration SQL in `prisma/migrations/[timestamp]/migration.sql`

---

## Prisma 5 vs 7 Migration Notes

| Aspect | Prisma 5 | Prisma 7 |
|--------|----------|----------|
| Database URL | In schema.prisma `url` field | In prisma.config.ts |
| SQLite connection | Direct driver | Requires adapter |
| Client init | `new PrismaClient()` | `new PrismaClient({ adapter })` |
| Config file | None | `prisma.config.ts` required |

**If you see deprecation warnings about URL configuration**, ensure:
1. `prisma.config.ts` exists with `datasource.url`
2. Schema has no `url` field in datasource block
3. Client is initialized with adapter pattern
