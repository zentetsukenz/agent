# Load Tester API Design

## Phase 1: API Design

### Overview
A simple load testing application with server-side rendering using Express.js and EJS templates.

### Routes Design

#### Web UI Routes (Server-Side Rendered)

| Method | Path | Description | View Template | Controller |
|--------|------|-------------|---------------|------------|
| GET | `/` | Home page - list all endpoints | `index.ejs` | `endpoints.controller.js` |
| GET | `/endpoints/new` | Form to add new endpoint | `endpoints/new.ejs` | `endpoints.controller.js` |
| POST | `/endpoints` | Create new endpoint | Redirect to `/` | `endpoints.controller.js` |
| GET | `/endpoints/:id/edit` | Edit form for endpoint | `endpoints/edit.ejs` | `endpoints.controller.js` |
| PUT | `/endpoints/:id` | Update endpoint | Redirect to `/` | `endpoints.controller.js` |
| DELETE | `/endpoints/:id` | Delete endpoint | Redirect to `/` | `endpoints.controller.js` |
| GET | `/endpoints/:id/test` | Load test configuration page | `test/configure.ejs` | `tests.controller.js` |
| POST | `/endpoints/:id/test` | Execute load test | Redirect to results | `tests.controller.js` |
| GET | `/tests/:id/results` | View test results | `test/results.ejs` | `tests.controller.js` |

### Data Models

#### Endpoint Model
```typescript
{
  id: number (auto-increment)
  name: string (required, max 255)
  url: string (required, valid URL)
  method: string (default: "GET", enum: GET|POST|PUT|DELETE|PATCH)
  headers: string (JSON string, optional)
  body: string (JSON string, optional)
  createdAt: DateTime (auto)
}
```

**Validation Rules:**
- `name`: Required, 1-255 characters
- `url`: Required, valid URL format
- `method`: Must be one of: GET, POST, PUT, DELETE, PATCH
- `headers`: Must be valid JSON if provided
- `body`: Must be valid JSON if provided

#### Test Model
```typescript
{
  id: number (auto-increment)
  endpointId: number (foreign key)
  duration: number (required, 1-300 seconds)
  connections: number (required, 1-1000)
  rps: number (optional, 1-100000)
  status: string (default: "pending", enum: pending|running|completed|failed)
  results: string (JSON string with test results)
  createdAt: DateTime (auto)
  completedAt: DateTime (optional)
}
```

**Validation Rules:**
- `duration`: Required, integer, 1-300 seconds
- `connections`: Required, integer, 1-1000
- `rps`: Optional, integer, 1-100000
- `status`: Managed by system

#### Test Results Format (JSON)
```typescript
{
  requests: {
    total: number
    average: number  // requests per second
    sent: number
  }
  latency: {
    min: number      // milliseconds
    max: number      // milliseconds
    mean: number     // milliseconds
    p50: number      // milliseconds
    p90: number      // milliseconds
    p95: number      // milliseconds
    p99: number      // milliseconds
  }
  throughput: {
    average: number  // bytes per second
    total: number    // total bytes
  }
  errors: number
  timeouts: number
  successRate: number  // percentage
  duration: number     // actual duration in seconds
}
```

### Request/Response Formats

#### POST /endpoints
**Request Body:**
```json
{
  "name": "Example API",
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": "{\"Authorization\": \"Bearer token\"}",
  "body": "{\"key\": \"value\"}"
}
```

**Response:** Redirect to `/` with flash message

#### POST /endpoints/:id/test
**Request Body:**
```json
{
  "duration": 30,
  "connections": 10,
  "rps": 100
}
```

**Response:** Redirect to `/tests/:id/results`

### Error Handling

#### HTTP Status Codes
- `200 OK`: Successful GET request
- `201 Created`: Successful POST (redirect with 303 See Other)
- `400 Bad Request`: Validation error
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

#### Error Response Format (for AJAX/API endpoints if needed)
```json
{
  "error": true,
  "message": "Error description",
  "details": ["Validation error 1", "Validation error 2"]
}
```

### Database Schema (Prisma)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Endpoint {
  id        Int      @id @default(autoincrement())
  name      String
  url       String
  method    String   @default("GET")
  headers   String?
  body      String?
  createdAt DateTime @default(now())
  tests     Test[]
}

model Test {
  id          Int       @id @default(autoincrement())
  endpointId  Int
  endpoint    Endpoint  @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  duration    Int
  connections Int
  rps         Int?
  status      String    @default("pending")
  results     String?
  createdAt   DateTime  @default(now())
  completedAt DateTime?
}
```

### Middleware Stack

1. **express.json()** - Parse JSON bodies
2. **express.urlencoded()** - Parse form data
3. **express.static()** - Serve static files
4. **method-override** - Support PUT/DELETE from forms
5. **express-session** - Session management for flash messages
6. **connect-flash** - Flash messages for user feedback

### Service Layer Architecture

```
Controllers (HTTP handling)
    ↓
Services (Business logic)
    ↓
Repositories (Data access)
    ↓
Prisma Client (Database)
```

#### Endpoints Service
- `getAllEndpoints()`: Get all endpoints
- `getEndpointById(id)`: Get single endpoint
- `createEndpoint(data)`: Create new endpoint
- `updateEndpoint(id, data)`: Update endpoint
- `deleteEndpoint(id)`: Delete endpoint
- `validateEndpointData(data)`: Validate endpoint data

#### Tests Service
- `createTest(endpointId, config)`: Create test record
- `executeTest(testId)`: Run load test using autocannon
- `getTestResults(testId)`: Get test results
- `updateTestStatus(testId, status)`: Update test status
- `formatResults(rawResults)`: Format autocannon results

### Dependencies

#### Production
- `express`: ^4.18.0
- `ejs`: ^3.1.9
- `prisma`: ^5.0.0
- `@prisma/client`: ^5.0.0
- `autocannon`: ^7.12.0
- `express-session`: ^1.17.3
- `connect-flash`: ^0.1.1
- `method-override`: ^3.0.0
- `dotenv`: ^16.0.3

#### Development
- `jest`: ^29.0.0
- `supertest`: ^6.3.0
- `nodemon`: ^3.0.0
- `@types/jest`: ^29.0.0
- `@types/node`: ^20.0.0

### Security Considerations

1. **Input Validation**: Validate all user inputs
2. **URL Validation**: Ensure URLs are valid and safe
3. **Rate Limiting**: Consider adding rate limiting for test execution
4. **JSON Parsing**: Safely parse JSON strings with try-catch
5. **SQL Injection**: Prisma provides protection
6. **XSS Protection**: EJS auto-escapes by default

### Performance Considerations

1. **Async Operations**: All I/O operations are async
2. **Connection Pooling**: Prisma handles database connections
3. **Test Execution**: Run tests asynchronously, update status
4. **Resource Limits**: Enforce limits on duration, connections, RPS

---

## Phase 1 Complete ✓

Next Phase: Phase 2 - TDD (Test-Driven Development)
