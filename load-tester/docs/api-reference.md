# Load-Tester API Reference

**Purpose**: REST API endpoints, request/response formats, and status codes

---

## Base URL

- **Development**: `http://localhost:3001`
- **API Prefix**: `/api/v1`

**Versioning**: API uses URL prefix versioning (`/api/v1`, `/api/v2`, etc.) to enable future breaking changes without disrupting existing clients.

**Backwards Compatibility**: Unversioned `/api/*` routes redirect to `/api/v1/*` with HTTP 301 status.

**Health Check Exception**: `/api/health` remains unversioned for monitoring tools that expect stable endpoints.

---

## Versioning Strategy

### Current Version: v1

All API routes are prefixed with `/api/v1/` to enable future evolution.

### Version Support Policy

- **Latest stable**: v1 (current)
- **Backwards compatibility**: Unversioned `/api/*` routes redirect (301) to `/api/v1/*`
- **Deprecation**: When v2 is released, v1 will remain available with deprecation headers
- **Sunset**: Deprecated versions supported for minimum 6 months after replacement

### Future Breaking Changes

When introducing breaking changes (schema modifications, behavior changes, etc.):

1. Create new version (e.g., `/api/v2`)
2. Add deprecation headers to previous version
3. Maintain both versions during transition
4. Sunset older version after deprecation period

---

## Health Check

### GET /api/health

**Purpose**: Verify API is running

**Request**: None

**Response**: `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

---

## Endpoints

### GET /api/v1/endpoints

**Purpose**: List all endpoints

**Request**: None

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "name": "User API",
    "url": "https://api.example.com/users",
    "method": "GET",
    "headers": null,
    "body": null,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
]
```

---

### GET /api/v1/endpoints/:id

**Purpose**: Get single endpoint by ID

**Request**: None

**Response**: `200 OK`

```json
{
  "id": 1,
  "name": "User API",
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": "{\"Authorization\":\"Bearer token\"}",
  "body": null,
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T10:00:00.000Z"
}
```

**Errors**:

- `404 Not Found` — Endpoint with given ID doesn't exist

---

### POST /api/v1/endpoints

**Purpose**: Create new endpoint

**Request**: `Content-Type: application/json`

```json
{
  "name": "User API",
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": "{\"Authorization\":\"Bearer token\"}",
  "body": null
}
```

**Validation**:

- `name` — Required, string, 1-255 characters
- `url` — Required, valid URL format
- `method` — Required, valid HTTP method (GET, POST, PUT, DELETE, PATCH)
- `headers` — Optional, valid JSON string
- `body` — Optional, valid JSON string

**Response**: `201 Created`

```json
{
  "id": 1,
  "name": "User API",
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": "{\"Authorization\":\"Bearer token\"}",
  "body": null,
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T10:00:00.000Z"
}
```

**Errors**:

- `400 Bad Request` — Validation errors
- `409 Conflict` — Endpoint with same URL+method already exists

---

### PUT /api/v1/endpoints/:id

**Purpose**: Update existing endpoint

**Request**: `Content-Type: application/json`

```json
{
  "name": "Updated User API",
  "url": "https://api.example.com/v2/users",
  "method": "GET",
  "headers": "{\"Authorization\":\"Bearer newtoken\"}",
  "body": null
}
```

**Validation**: Same as POST

**Response**: `200 OK`

```json
{
  "id": 1,
  "name": "Updated User API",
  "url": "https://api.example.com/v2/users",
  "method": "GET",
  "headers": "{\"Authorization\":\"Bearer newtoken\"}",
  "body": null,
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T12:00:00.000Z"
}
```

**Errors**:

- `400 Bad Request` — Validation errors
- `404 Not Found` — Endpoint with given ID doesn't exist
- `409 Conflict` — Updated URL+method conflicts with another endpoint

---

### DELETE /api/v1/endpoints/:id

**Purpose**: Delete endpoint (cascades to all tests)

**Request**: None

**Response**: `204 No Content`

**Errors**:

- `404 Not Found` — Endpoint with given ID doesn't exist

**Side effects**: All tests for this endpoint are deleted (cascade)

---

## Tests

### GET /api/v1/tests

**Purpose**: List all tests

**Request**: None

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "endpointId": 1,
    "scenarioId": null,
    "duration": 60,
    "connections": 100,
    "rps": null,
    "timeout": 300,
    "status": "completed",
    "results": "{\"requests\":{\"total\":6000},...}",
    "createdAt": "2026-01-01T11:00:00.000Z",
    "completedAt": "2026-01-01T11:01:00.000Z"
  }
]
```

---

### GET /api/v1/tests/:id

**Purpose**: Get single test by ID

**Request**: None

**Response**: `200 OK`

```json
{
  "id": 1,
  "endpointId": 1,
  "endpoint": {
    "id": 1,
    "name": "User API",
    "url": "https://api.example.com/users",
    "method": "GET"
  },
  "scenarioId": null,
  "duration": 60,
  "connections": 100,
  "rps": null,
  "timeout": 300,
  "status": "completed",
  "results": "{\"requests\":{\"total\":6000},...}",
  "createdAt": "2026-01-01T11:00:00.000Z",
  "completedAt": "2026-01-01T11:01:00.000Z"
}
```

**Errors**:

- `404 Not Found` — Test with given ID doesn't exist

---

### POST /api/v1/endpoints/:id/test

**Purpose**: Execute load test on endpoint

**Request**: `Content-Type: application/json`

```json
{
  "duration": 60,
  "connections": 100,
  "rps": 1000,
  "timeout": 300
}
```

**Validation**:

- `duration` — Required, integer, 1-3600 seconds
- `connections` — Required, integer, 1-10000
- `rps` — Optional, integer, 1-100000
- `timeout` — Optional, integer, 1-3600 seconds (default: 300)

**Response**: `201 Created`

```json
{
  "id": 1,
  "endpointId": 1,
  "status": "pending",
  "duration": 60,
  "connections": 100,
  "rps": 1000,
  "timeout": 300,
  "createdAt": "2026-01-01T11:00:00.000Z"
}
```

**Errors**:

- `400 Bad Request` — Validation errors
- `404 Not Found` — Endpoint with given ID doesn't exist

**Side effects**: Test starts executing asynchronously, status changes to "running"

---

### GET /api/v1/tests/:id/status

**Purpose**: Poll test status (for real-time updates)

**Request**: None

**Response**: `200 OK`

```json
{
  "id": 1,
  "status": "running",
  "progress": 45,
  "createdAt": "2026-01-01T11:00:00.000Z",
  "completedAt": null
}
```

**Status values**: `pending`, `running`, `completed`, `failed`, `cancelled`

**Errors**:

- `404 Not Found` — Test with given ID doesn't exist

---

### DELETE /api/v1/tests/:id/cancel

**Purpose**: Cancel running test

**Request**: None

**Response**: `200 OK`

```json
{
  "id": 1,
  "status": "cancelled",
  "completedAt": "2026-01-01T11:00:30.000Z"
}
```

**Errors**:

- `404 Not Found` — Test with given ID doesn't exist
- `400 Bad Request` — Test is not in cancellable state (already completed/failed/cancelled)

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PUT, or action |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation errors, invalid input |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource (unique constraint violated) |
| `408` | Request Timeout | Request took too long |
| `500` | Internal Server Error | Unexpected server error |

### Error Examples

**400 Bad Request** (validation):

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "fields": {
      "url": "Must be a valid URL",
      "duration": "Must be between 1 and 3600"
    }
  }
}
```

**404 Not Found**:

```json
{
  "error": "Endpoint not found",
  "code": "NOT_FOUND"
}
```

**409 Conflict**:

```json
{
  "error": "Endpoint with this URL and method already exists",
  "code": "DUPLICATE_ENDPOINT"
}
```

---

## CORS

**Allowed origins**:

- `http://localhost:5173` (frontend dev server)

**Allowed methods**: GET, POST, PUT, DELETE, OPTIONS

**Allowed headers**: Content-Type, Authorization

---

## Rate Limiting

Currently not implemented. To be added in future.

---

## Authentication

Currently not implemented. All endpoints are public.

---

**Last Updated**: January 1, 2026
