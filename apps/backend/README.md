# Load Tester Backend API

REST API backend for the Load Tester application - A load testing tool using autocannon.

## Architecture

This is a REST API-only backend built with Express.js and Prisma ORM, designed to work in a monorepo architecture with a separate frontend application.

## Features

- **Endpoints Management**: CRUD operations for HTTP endpoints
- **Load Testing**: Execute load tests using autocannon
- **Test Results**: View and track test execution results
- **Health Check**: API health monitoring endpoint

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Load Testing**: Autocannon
- **Testing**: Jest + Supertest

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Setup database
npm run db:setup
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="file:./dev.db"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

## Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check

#### GET `/api/health`
Check API health status

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-03T10:00:00.000Z",
  "environment": "development"
}
```

### Endpoints Management

#### GET `/api/endpoints`
Get all endpoints

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Example API",
      "url": "https://api.example.com",
      "method": "GET",
      "headers": null,
      "body": null,
      "createdAt": "2025-12-03T10:00:00.000Z",
      "tests": []
    }
  ]
}
```

#### GET `/api/endpoints/:id`
Get single endpoint by ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Example API",
    "url": "https://api.example.com",
    "method": "GET",
    "headers": null,
    "body": null,
    "createdAt": "2025-12-03T10:00:00.000Z",
    "tests": []
  }
}
```

**Error Response (404):**
```json
{
  "error": true,
  "message": "Endpoint not found"
}
```

#### POST `/api/endpoints`
Create new endpoint

**Request Body:**
```json
{
  "name": "Example API",
  "url": "https://api.example.com",
  "method": "GET",
  "headers": "{\"Authorization\": \"Bearer token\"}",
  "body": "{\"key\": \"value\"}"
}
```

**Response (201):**
```json
{
  "data": {
    "id": 1,
    "name": "Example API",
    "url": "https://api.example.com",
    "method": "GET",
    "headers": "{\"Authorization\": \"Bearer token\"}",
    "body": "{\"key\": \"value\"}",
    "createdAt": "2025-12-03T10:00:00.000Z"
  },
  "message": "Endpoint created successfully"
}
```

**Error Response (400):**
```json
{
  "error": true,
  "message": "Validation failed",
  "details": [
    "Name is required",
    "URL must be valid (http:// or https://)"
  ]
}
```

#### PUT `/api/endpoints/:id`
Update endpoint

**Request Body:**
```json
{
  "name": "Updated API",
  "url": "https://api.updated.com",
  "method": "POST",
  "headers": "{\"Content-Type\": \"application/json\"}",
  "body": "{\"data\": \"test\"}"
}
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Updated API",
    "url": "https://api.updated.com",
    "method": "POST",
    "headers": "{\"Content-Type\": \"application/json\"}",
    "body": "{\"data\": \"test\"}",
    "createdAt": "2025-12-03T10:00:00.000Z"
  },
  "message": "Endpoint updated successfully"
}
```

#### DELETE `/api/endpoints/:id`
Delete endpoint (cascade deletes associated tests)

**Response (200):**
```json
{
  "message": "Endpoint deleted successfully"
}
```

### Load Testing

#### POST `/api/endpoints/:id/test`
Execute load test on endpoint

**Request Body:**
```json
{
  "duration": 30,
  "connections": 10,
  "rps": 100
}
```

**Validation Rules:**
- `duration`: 1-300 seconds (required)
- `connections`: 1-1000 (required)
- `rps`: 1-100000 (optional)

**Response (201):**
```json
{
  "data": {
    "id": 1,
    "endpointId": 1,
    "duration": 30,
    "connections": 10,
    "rps": 100,
    "status": "pending",
    "results": null,
    "createdAt": "2025-12-03T10:00:00.000Z",
    "completedAt": null
  },
  "message": "Load test started"
}
```

#### GET `/api/tests/:id`
Get test results

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "endpointId": 1,
    "duration": 30,
    "connections": 10,
    "rps": 100,
    "status": "completed",
    "createdAt": "2025-12-03T10:00:00.000Z",
    "completedAt": "2025-12-03T10:00:30.000Z",
    "results": {
      "requests": {
        "total": 1000,
        "average": 33.33,
        "sent": 1000
      },
      "latency": {
        "min": 10,
        "max": 100,
        "mean": 50,
        "p50": 45,
        "p90": 80,
        "p95": 90,
        "p99": 95
      },
      "throughput": {
        "average": 1000000,
        "total": 30000000
      },
      "errors": 0,
      "timeouts": 0,
      "successRate": "100.00",
      "duration": 30
    },
    "endpoint": {
      "id": 1,
      "name": "Example API",
      "url": "https://api.example.com",
      "method": "GET"
    }
  }
}
```

**Test Status Values:**
- `pending`: Test created, waiting to start
- `running`: Test in progress
- `completed`: Test finished successfully
- `failed`: Test encountered an error

#### GET `/api/tests/:id/status`
Get test status (lightweight endpoint for polling)

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "status": "running",
    "completedAt": null
  }
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": true,
  "message": "Error description",
  "details": ["Optional array of detailed errors"]
}
```

**HTTP Status Codes:**
- `200`: Success (GET, PUT, DELETE)
- `201`: Created (POST)
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Testing

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

**Coverage Requirements:**
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Database

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### Schema

```prisma
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

## CORS Configuration

The API is configured to accept requests from the frontend origin specified in `CORS_ORIGIN` environment variable.

Default: `http://localhost:5173`

To allow multiple origins in production, modify the CORS configuration in `src/app.js`.

## Project Structure

```
apps/backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Server entry point
│   ├── features/
│   │   ├── endpoints/
│   │   │   ├── endpoints.controller.js
│   │   │   └── endpoints.service.js
│   │   └── tests/
│   │       ├── tests.controller.js
│   │       └── tests.service.js
│   └── middleware/
│       └── errorHandler.js
├── tests/
│   ├── setup.js
│   ├── integration/
│   │   ├── endpoints.test.js
│   │   └── tests.test.js
│   └── unit/
│       ├── endpoints/
│       │   └── endpoints.service.test.js
│       └── tests/
│           └── tests.service.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Development Guidelines

### Service Layer
- Contains all business logic
- Handles validation
- Interacts with database via Prisma

### Controller Layer
- Handles HTTP request/response
- Calls service layer methods
- Returns JSON responses
- Uses error handling middleware

### Validation
- Endpoint validation in `endpoints.service.js`
- Test configuration validation in `tests.service.js`
- Returns `{ valid: boolean, errors: string[] }`

## License

MIT
