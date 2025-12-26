# Load Tester API Design

## Overview

A load testing application with React SPA frontend and Express.js REST API backend. Supports endpoint management, load test execution, and advanced scenario-based testing.

## API Routes

### Health Check
```
GET /api/health
```

### Endpoints API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/endpoints` | List all endpoints |
| GET | `/api/endpoints/:id` | Get single endpoint |
| POST | `/api/endpoints` | Create endpoint |
| PUT | `/api/endpoints/:id` | Update endpoint |
| DELETE | `/api/endpoints/:id` | Delete endpoint |

### Tests API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tests` | List all tests |
| POST | `/api/endpoints/:id/test` | Execute load test |
| GET | `/api/tests/:id` | Get test results |
| GET | `/api/tests/:id/status` | Get test status (polling) |
| DELETE | `/api/tests/:id/cancel` | Cancel running test |

### Scenarios API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scenarios` | List all scenarios |
| GET | `/api/scenarios/:id` | Get single scenario |
| POST | `/api/scenarios` | Create scenario |
| PUT | `/api/scenarios/:id` | Update scenario |
| DELETE | `/api/scenarios/:id` | Delete scenario |
| POST | `/api/scenarios/:id/duplicate` | Duplicate scenario |

## Data Models

### Endpoint Model
```typescript
{
  id: number (auto-increment)
  name: string (required, max 255)
  url: string (required, valid URL)
  method: string (default: "GET", enum: GET|POST|PUT|DELETE|PATCH)
  headers: string (JSON string, optional)
  body: string (JSON string, optional)
  createdAt: DateTime (auto)
  updatedAt: DateTime (auto)
}
```

### Test Model
```typescript
{
  id: number (auto-increment)
  endpointId: number (foreign key)
  scenarioId: number (optional foreign key)
  duration: number (required, 1-300 seconds)
  connections: number (required, 1-1000)
  rps: number (optional, 1-100000)
  timeout: number (default: 300)
  status: string (pending|running|completed|failed|cancelled)
  results: string (JSON with test results)
  createdAt: DateTime (auto)
  completedAt: DateTime (optional)
}
```

### Scenario Model
```typescript
{
  id: number (auto-increment)
  name: string (required, unique)
  description: string (optional)
  mode: string ("simple"|"workflow")
  
  // Simple mode
  endpointId: number (optional, reference to endpoint)
  
  // Workflow mode
  setup: string (JSON array of setup steps)
  workflow: string (JSON array of workflow steps)  
  teardown: string (JSON array of teardown steps)
  
  // Load pattern (all modes)
  phases: string (JSON array of Phase objects)
  
  // Error handling
  setupErrorHandling: string ("abort"|"continue"|"retry")
  setupRetryCount: number (default: 3)
  teardownErrorHandling: string ("abort"|"continue"|"ignore")
  teardownRetryCount: number (default: 3)
  
  // Template flag
  isTemplate: boolean (default: false)
  
  createdAt: DateTime (auto)
  updatedAt: DateTime (auto)
}
```

### Phase Object
```typescript
{
  type: string ("rampUp"|"sustained"|"rampDown"|"spike")
  duration: number (seconds)
  connections: number (target concurrent connections)
  startConnections: number (for ramp phases)
  rps: number (optional, requests per second)
  name: string (optional, phase display name)
}
```

### Test Results Format
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

## Request/Response Examples

### Create Endpoint
**POST /api/endpoints**
```json
{
  "name": "Example API",
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": "{\"Authorization\": \"Bearer token\"}",
  "body": null
}
```

### Execute Load Test
**POST /api/endpoints/:id/test**
```json
{
  "duration": 30,
  "connections": 10,
  "rps": 100
}
```

### Create Scenario
**POST /api/scenarios**
```json
{
  "name": "API Stress Test",
  "description": "Gradual ramp up to peak load",
  "mode": "simple",
  "endpointId": 1,
  "phases": [
    {"type": "rampUp", "duration": 30, "startConnections": 1, "connections": 50},
    {"type": "sustained", "duration": 60, "connections": 50},
    {"type": "rampDown", "duration": 30, "startConnections": 50, "connections": 1}
  ]
}
```

## Error Handling

### HTTP Status Codes
- `200 OK`: Successful GET/PUT request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Validation error
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Response Format
```json
{
  "error": "NotFoundError",
  "message": "Endpoint not found",
  "statusCode": 404
}
```

### Validation Error Format
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    {"field": "url", "message": "URL is required"},
    {"field": "name", "message": "Name must be at least 1 character"}
  ]
}
```

## Architecture

### Backend Stack
- **Framework**: Express.js 4.x
- **Database**: SQLite with Prisma ORM 7.x
- **Load Testing**: Autocannon
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator

### Frontend Stack
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Charts**: Recharts

### Service Layer Pattern
```
Controllers (HTTP handling)
    ↓
Services (Business logic)
    ↓
Prisma Client (Database)
```

---

**Version**: 2.0.0  
**Last Updated**: December 2025
