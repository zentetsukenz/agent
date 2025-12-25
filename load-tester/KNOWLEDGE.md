# Load Tester - Project Knowledge

> **Purpose**: Persistent semantic memory for agents. Read this at session start to understand the project.

## Quick Reference

| Aspect | Details |
|--------|---------|
| **Type** | Monorepo (npm workspaces) |
| **Backend** | Express.js 4.18 + Prisma 7 + SQLite |
| **Frontend** | React 19 + Vite 7 + Tailwind 4 |
| **Testing** | Jest (backend), Vitest (frontend) |
| **Shell** | Fish (macOS) - NOT bash |

---

## Tech Stack (Verified from package.json)

### Root Monorepo
- **Package Manager**: npm with workspaces
- **Version**: 2.0.0
- **Concurrency**: `concurrently ^8.2.2`

### Backend (`apps/backend`)

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| @prisma/client | ^7.0.0 | Database ORM |
| prisma | ^7.0.0 | CLI + migrations |
| @prisma/adapter-better-sqlite3 | ^7.1.0 | SQLite adapter (Prisma 7 requirement) |
| better-sqlite3 | ^12.5.0 | SQLite driver |
| autocannon | ^7.14.0 | Load testing engine |
| helmet | ^8.1.0 | Security headers |
| cors | ^2.8.5 | CORS middleware |
| express-validator | ^7.3.1 | Request validation |
| express-rate-limit | ^8.2.1 | Rate limiting |
| validator | ^13.15.23 | String sanitization |
| jest | ^29.7.0 | Testing framework |
| supertest | ^6.3.3 | HTTP testing |

### Frontend (`apps/frontend`)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI framework |
| react-dom | ^19.2.0 | React DOM |
| react-router-dom | ^7.10.1 | Routing |
| react-hook-form | ^7.68.0 | Form handling |
| react-hot-toast | ^2.6.0 | Notifications |
| axios | ^1.13.2 | HTTP client |
| recharts | ^3.5.1 | Charts |
| tailwindcss | ^4.1.17 | Styling |
| vite | ^7.2.4 | Build tool |
| vitest | ^4.0.15 | Testing |
| @testing-library/react | ^16.3.0 | React testing |
| msw | ^2.12.4 | API mocking |

---

## Architecture

### Monorepo Structure
```
load-tester/
├── package.json              # Workspace root - runs both apps
├── apps/
│   ├── backend/              # Express REST API (port 3001)
│   │   ├── src/
│   │   │   ├── app.js        # Express app setup
│   │   │   ├── server.js     # Server entry point
│   │   │   ├── config/       # Configuration + database singleton
│   │   │   ├── features/     # Feature-based modules
│   │   │   │   ├── endpoints/  # CRUD for API endpoints
│   │   │   │   └── tests/      # Load test execution
│   │   │   ├── middleware/   # Express middleware
│   │   │   └── utils/        # Errors, logging, helpers
│   │   ├── prisma/           # Schema + migrations
│   │   └── tests/            # Jest tests (unit + integration)
│   │
│   └── frontend/             # React SPA (port 5173)
│       └── src/
│           ├── components/   # UI components (organized by feature)
│           ├── pages/        # Route pages
│           ├── hooks/        # Custom React hooks
│           ├── services/     # API client layer
│           └── utils/        # Helper functions
└── docs/
    └── API_DESIGN.md
```

### Design Patterns

1. **Feature-Based Backend Structure**
   - Each feature has: `controller.js` (HTTP), `service.js` (business logic)
   - Services handle validation, controllers handle routing
   - Clear separation of concerns

2. **Singleton Database Connection**
   - `src/config/database.js` provides `getPrismaClient()`
   - Prevents connection pool exhaustion
   - Handles graceful shutdown

3. **Custom Error Classes**
   - `AppError` base class with `statusCode` and `isOperational`
   - `ValidationError`, `NotFoundError`, `ConflictError`, `TimeoutError`
   - Centralized error handling in middleware

4. **Frontend Service Layer**
   - Axios instance with interceptors in `services/api.js`
   - Feature-specific services (`endpoints.js`, `tests.js`)
   - Automatic error extraction from responses

5. **Component Organization**
   - `components/ui/` - Reusable primitives (Button, Loading, ErrorMessage)
   - `components/endpoints/` - Endpoint-specific components
   - `components/tests/` - Test-related components
   - `components/layout/` - App shell

---

## Database Schema

### Models

**Endpoint** - API endpoints to load test
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

**Test** - Load test executions
```prisma
model Test {
  id          Int       @id @default(autoincrement())
  endpointId  Int
  endpoint    Endpoint  @relation(onDelete: Cascade)
  duration    Int       // seconds
  connections Int       // concurrent connections
  rps         Int?      // requests per second (optional)
  timeout     Int       @default(300)  // request timeout
  status      String    @default("pending")  // pending|running|completed|failed|cancelled
  results     String?   // JSON string with autocannon results
  createdAt   DateTime  @default(now())
  completedAt DateTime?

  @@index([endpointId, createdAt(sort: Desc)])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}
```

---

## Environment & Gotchas

### Critical: Fish Shell
- **This project uses Fish shell on macOS, NOT bash**
- Fish syntax differs significantly from bash
- See `SKILLS/fish-shell.md` for correct syntax

### Prisma 7 Migration
- Recently upgraded from Prisma 5 to 7
- Requires adapter pattern (no direct URL in schema)
- See `SKILLS/prisma-patterns.md` for current patterns

### Running the App

**⚠️ CRITICAL: Always run from the project root directory**

```fish
# CORRECT - always use this pattern
cd ~/workspace/agent/load-tester && npm run dev

# Start both apps (recommended)
npm run dev

# Start individually
npm run backend    # Express on :3001
npm run frontend   # Vite on :5173
```

**Canonical Ports (non-negotiable):**

| Service | Port | URL |
|---------|------|-----|
| Backend | 3001 | http://localhost:3001 |
| Frontend | 5173 | http://localhost:5173 |

**⚠️ Never accept fallback ports.** If Vite says "Port 5173 is in use, trying 5174"—STOP, clear the port, and restart. See `SKILLS/server-operations.md` for the full procedure.

### Running Tests
```fish
# All tests
npm run test:all

# Backend only
npm run backend:test
npm run backend:test:unit
npm run backend:test:integration

# Frontend only
npm run frontend:test
```

### Database Commands
```fish
cd apps/backend

# Setup (migrate + generate client)
npm run db:setup

# Individual commands
npm run prisma:migrate   # Create migration
npm run prisma:generate  # Generate client
npm run prisma:studio    # Visual browser
```

### Common Issues

1. **"DATABASE_URL not set"** - Create `.env` file in `apps/backend/`
2. **Prisma client out of sync** - Run `npm run prisma:generate` in `apps/backend/`
3. **Port already in use** - See detailed fix below
4. **Test database issues** - Test setup auto-creates/destroys `prisma/test.db`
5. **"ENOENT: package.json"** - Wrong directory; use `cd ~/workspace/agent/load-tester &&` prefix
6. **Network Error in frontend** - Check backend is running on :3001, not frontend on wrong port

### Port Conflict Resolution

When you see "Port X is in use" or "Address already in use":

```fish
# Check what's using the ports
lsof -i :3001 | grep LISTEN
lsof -i :5173 | grep LISTEN

# Kill processes on canonical ports
lsof -i :3001 -t | xargs kill -9
lsof -i :5173 -t | xargs kill -9

# Verify ports are free
lsof -i :3001 | grep LISTEN  # Should return nothing
lsof -i :5173 | grep LISTEN  # Should return nothing

# Now start servers
cd ~/workspace/agent/load-tester && npm run dev
```

**Full procedure:** See `SKILLS/server-operations.md`

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/health | Health check |
| GET | /api/endpoints | List all endpoints |
| GET | /api/endpoints/:id | Get single endpoint |
| POST | /api/endpoints | Create endpoint |
| PUT | /api/endpoints/:id | Update endpoint |
| DELETE | /api/endpoints/:id | Delete endpoint |
| GET | /api/tests | List all tests |
| POST | /api/endpoints/:id/test | Execute load test |
| GET | /api/tests/:id | Get test details |
| GET | /api/tests/:id/status | Poll test status |
| DELETE | /api/tests/:id/cancel | Cancel running test |

---

## Recent Learnings

> **Add new learnings here as the project evolves**

### December 2025
- Created `SKILLS/server-operations.md` for port management and server lifecycle
- Created `SKILLS/browser-console-debugging.md` for frontend runtime debugging
- Lesson learned: Never accept fallback ports (5174, 5175) - always clear canonical ports
- Lesson learned: Always delegate browser debugging to subagent for clean context

### December 2024
- Upgraded Prisma 5 → 7 with adapter pattern
- Added `timeout` field to Test model
- Added database indexes for performance
- Added unique constraint on Endpoint(url, method)

---

## File Quick Links

When you need to modify specific functionality:

| Task | Files to Check |
|------|---------------|
| Add API endpoint | `apps/backend/src/app.js`, `apps/backend/src/features/` |
| Database changes | `apps/backend/prisma/schema.prisma` |
| Add frontend page | `apps/frontend/src/pages/`, `apps/frontend/src/App.jsx` |
| Add UI component | `apps/frontend/src/components/` |
| Backend validation | `apps/backend/src/middleware/validation.js` |
| Error handling | `apps/backend/src/utils/errors.js`, `apps/backend/src/middleware/errorHandler.js` |
| Test config | `apps/backend/tests/setup.js`, `apps/frontend/vitest.config.js` |
