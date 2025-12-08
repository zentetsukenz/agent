# Load Tester Backend API

REST API backend for the Load Tester application. This service provides endpoints for managing HTTP endpoints and executing load tests using autocannon.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Load Testing**: Autocannon
- **Testing**: Jest + Supertest

## Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Setup database
npm run db:setup

# Generate Prisma client
npm run prisma:generate
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./prisma/dev.db"

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API server will start on `http://localhost:3000`

## API Documentation

### Health Check

**GET** `/api/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-03T10:00:00.000Z"
}
```

### Endpoints Management

#### List All Endpoints

**GET** `/api/endpoints`

**Response:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Example API",
      "url": "https://api.example.com",
      "method": "GET",
      "headers": null,
      "body": null,
      "createdAt": "2025-12-03T10:00:00.000Z",
      "updatedAt": "2025-12-03T10:00:00.000Z"
    }
  ]
}
```

#### Get Single Endpoint

**GET** `/api/endpoints/:id`

**Response:**
```json
{
  "data": {
    "id": "1",
    "name": "Example API",
    "url": "https://api.example.com",
    "method": "GET",
    "headers": null,
    "body": null,
    "createdAt": "2025-12-03T10:00:00.000Z",
    "updatedAt": "2025-12-03T10:00:00.000Z"
  }
}
```

#### Create Endpoint

**POST** `/api/endpoints`

**Request Body:**
```json
{
  "name": "Example API",
  "url": "https://api.example.com",
  "method": "GET",
  "headers": "{\"Content-Type\": \"application/json\"}",
  "body": null
}
```

**Response:**
```json
{
  "data": {
    "id": "1",
    "name": "Example API",
    "url": "https://api.example.com",
    "method": "GET",
    "headers": "{\"Content-Type\": \"application/json\"}",
    "body": null,
    "createdAt": "2025-12-03T10:00:00.000Z",
    "updatedAt": "2025-12-03T10:00:00.000Z"
  },
  "message": "Endpoint created successfully"
}
```

#### Update Endpoint

**PUT** `/api/endpoints/:id`

**Request Body:**
```json
{
  "name": "Updated API",
  "url": "https://api.example.com/v2",
  "method": "POST",
  "headers": "{\"Content-Type\": \"application/json\"}",
  "body": "{\"key\": \"value\"}"
}
```

**Response:**
```json
{
  "data": {
    "id": "1",
    "name": "Updated API",
    "url": "https://api.example.com/v2",
    "method": "POST",
    "headers": "{\"Content-Type\": \"application/json\"}",
    "body": "{\"key\": \"value\"}",
    "createdAt": "2025-12-03T10:00:00.000Z",
    "updatedAt": "2025-12-03T10:00:00.000Z"
  },
  "message": "Endpoint updated successfully"
}
```

#### Delete Endpoint

**DELETE** `/api/endpoints/:id`

**Response:**
```json
{
  "message": "Endpoint deleted successfully"
}
```

### Load Testing

#### Execute Load Test

**POST** `/api/endpoints/:id/test`

**Request Body:**
```json
{
  "duration": 10,
  "connections": 10,
  "pipelining": 1
}
```

**Response:**
```json
{
  "data": {
    "id": "1",
    "endpointId": "1",
    "duration": 10,
    "connections": 10,
    "pipelining": 1,
    "status": "RUNNING",
    "results": null,
    "startedAt": "2025-12-03T10:00:00.000Z",
    "completedAt": null,
    "createdAt": "2025-12-03T10:00:00.000Z",
    "updatedAt": "2025-12-03T10:00:00.000Z"
  },
  "message": "Test started successfully"
}
```

#### Get Test Results

**GET** `/api/tests/:id`

**Response:**
```json
{
  "data": {
    "id": "1",
    "endpointId": "1",
    "duration": 10,
    "connections": 10,
    "pipelining": 1,
    "status": "COMPLETED",
    "results": {
      "requests": {
        "average": 1000,
        "mean": 1000,
        "stddev": 50,
        "min": 900,
        "max": 1100,
        "total": 10000
      },
      "latency": {
        "average": 10,
        "mean": 10,
        "stddev": 2,
        "min": 8,
        "max": 15
      },
      "throughput": {
        "average": 1048576,
        "mean": 1048576,
        "stddev": 10000,
        "min": 1000000,
        "max": 1100000
      }
    },
    "startedAt": "2025-12-03T10:00:00.000Z",
    "completedAt": "2025-12-03T10:00:10.000Z",
    "endpoint": {
      "id": "1",
      "name": "Example API",
      "url": "https://api.example.com",
      "method": "GET"
    }
  }
}
```

#### Get Test Status

**GET** `/api/tests/:id/status`

**Response:**
```json
{
  "data": {
    "id": "1",
    "status": "RUNNING",
    "completedAt": null
  }
}
```

### Error Responses

All error responses follow this format:

```json
{
  "error": true,
  "message": "Error description",
  "details": ["Validation error 1", "Validation error 2"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Testing

```bash
# Run all tests with coverage
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Watch mode for development
npm run test:watch
```

## Database Management

```bash
# Run migrations
npm run prisma:migrate

# Open Prisma Studio (DB GUI)
npm run prisma:studio

# Generate Prisma Client
npm run prisma:generate

# Full database setup
npm run db:setup
```

## Project Structure

```
apps/backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   └── features/
│       ├── endpoints/
│       │   ├── endpoints.controller.js    # HTTP handlers
│       │   └── endpoints.service.js       # Business logic
│       └── tests/
│           ├── tests.controller.js        # HTTP handlers
│           └── tests.service.js           # Load testing logic
├── tests/
│   ├── setup.js                  # Test configuration
│   ├── integration/              # API integration tests
│   └── unit/                     # Unit tests
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── package.json
└── README.md
```

## Development Guidelines

### Adding New Endpoints

1. Add route in `src/app.js`
2. Create controller function
3. Implement business logic in service
4. Write tests (unit + integration)
5. Update API documentation

### Error Handling

- Use `next(error)` to pass errors to error handler
- Handle Prisma errors (P2025 = record not found)
- Validate input data before processing
- Return appropriate HTTP status codes

### CORS Configuration

The API accepts requests from the frontend configured in `CORS_ORIGIN` environment variable. Default is `http://localhost:5173`.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Issues

```bash
# Reset database
rm prisma/dev.db
npm run db:setup
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npm run prisma:generate
```

## License

MIT
