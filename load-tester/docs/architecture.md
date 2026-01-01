# Load-Tester Architecture

**Purpose**: System design, monorepo structure, and core design patterns

---

## Overview

Load-tester is a **monorepo application** for API load testing, built with:

- **Backend**: Express.js REST API + Prisma ORM + SQLite
- **Frontend**: React 19 SPA + Vite + Tailwind 4
- **Testing**: Jest (backend), Vitest (frontend)
- **Package Manager**: npm workspaces

---

## Monorepo Structure

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
    ├── index.md              # This library manifest
    ├── architecture.md       # This file
    └── [other docs]
```

---

## Core Design Patterns

### 1. Feature-Based Backend Structure

**Pattern**: Organize by domain feature, not technical layer

```
features/
├── endpoints/
│   ├── endpoints.controller.js  # HTTP routes
│   └── endpoints.service.js     # Business logic
└── tests/
    ├── tests.controller.js
    └── tests.service.js
```

**Responsibilities**:

- **Controllers**: Handle HTTP (routing, request/response)
- **Services**: Contain business logic, validation, database access
- **Clear separation**: Controllers don't talk to database, services don't know about HTTP

**Benefits**:

- Related code lives together
- Easy to find and modify features
- Scalable as app grows

---

### 2. Singleton Database Connection

**Pattern**: Single Prisma client instance shared across app

**Implementation**: `src/config/database.js`

```javascript
let prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient(/* ... */);
  }
  return prisma;
}
```

**Why**:

- Prevents connection pool exhaustion
- Enables graceful shutdown
- Consistent database access

**Usage**: All services call `getPrismaClient()`, never create new instances

---

### 3. Custom Error Classes

**Pattern**: Type-specific errors with HTTP status codes

**Implementation**: `src/utils/errors.js`

**Classes**:

- `AppError` — Base class with `statusCode` and `isOperational`
- `ValidationError` (400) — Invalid input
- `NotFoundError` (404) — Resource not found
- `ConflictError` (409) — Duplicate/constraint violation
- `TimeoutError` (408) — Request timeout

**Benefits**:

- Automatic HTTP status mapping
- Centralized error handling
- User-friendly error messages

**Usage**:

```javascript
if (!endpoint) {
  throw new NotFoundError('Endpoint');  // Returns 404 automatically
}
```

---

### 4. Frontend Service Layer

**Pattern**: Axios instance with interceptors + feature-specific services

**Implementation**:

- `services/api.js` — Base axios instance, error interceptors
- `services/endpoints.js` — Endpoint-specific API calls
- `services/tests.js` — Test-specific API calls

**Benefits**:

- Centralized API configuration
- Automatic error extraction
- Type-safe API calls
- Easy to mock for testing

**Usage**:

```javascript
import endpointService from '@/services/endpoints';

const endpoints = await endpointService.getAll();
```

---

### 5. Component Organization

**Pattern**: Organize by feature, with shared UI primitives

```
components/
├── ui/            # Reusable primitives (Button, Loading, ErrorMessage)
├── endpoints/     # Endpoint-specific components
├── tests/         # Test-related components
├── scenarios/     # Scenario builder components
└── layout/        # App shell (Header, Sidebar, etc.)
```

**Benefits**:

- UI components are discoverable
- Shared components avoid duplication
- Feature components are focused

---

## Data Flow

### Creating a Feature End-to-End

**Flow**: Schema → Migration → Service → Controller → Frontend

1. **Schema** (`apps/backend/prisma/schema.prisma`)
   - Define data model
   - Add relationships, constraints, indexes

2. **Migration** (`npx prisma migrate dev`)
   - Generate SQL migration
   - Update Prisma client

3. **Service** (`apps/backend/src/features/*/service.js`)
   - Business logic
   - Validation
   - Database access

4. **Controller** (`apps/backend/src/features/*/controller.js`)
   - HTTP routes
   - Request/response handling

5. **Frontend Service** (`apps/frontend/src/services/*.js`)
   - API client methods

6. **Frontend Components** (`apps/frontend/src/components/*`)
   - UI implementation

---

## Integration Points

### Backend ↔ Frontend

**Connection**: REST API over HTTP

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

**CORS**: Configured in backend to allow frontend origin

**Error handling**: Backend returns structured errors, frontend extracts messages

---

### Backend ↔ Database

**Connection**: Prisma ORM → SQLite

- Development DB: `apps/backend/prisma/dev.db`
- Test DB: `apps/backend/prisma/test.db` (auto-created/destroyed)

**Adapter**: Prisma 7 requires `@prisma/adapter-better-sqlite3`

---

## Key Principles

1. **Separation of Concerns** — Controllers route, services contain logic
2. **Single Responsibility** — Each file/class has one clear purpose
3. **Feature Cohesion** — Related code lives together
4. **Type Safety** — Leverage TypeScript/Prisma types where possible
5. **Testability** — Services are pure functions, easy to unit test
6. **Error Handling** — Explicit error types, not generic catches

---

## References

- Database schema → [database-schema.md](database-schema.md)
- Backend patterns → [backend-patterns.md](backend-patterns.md)
- Frontend patterns → [frontend-patterns.md](frontend-patterns.md)
- API contracts → [api-reference.md](api-reference.md)

---

**Last Updated**: January 1, 2026
