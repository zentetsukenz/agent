# Production Readiness Guide

**Last Updated**: January 5, 2026  
**Status**: ✅ Production Ready

This document consolidates all production improvements implemented for the load-tester application.

---

## Summary

| Category | Improvements | Status |
|----------|-------------|--------|
| Security | SSRF protection, body size limits, security headers | ✅ |
| Performance | Response compression (gzip/brotli) | ✅ |
| Reliability | Graceful shutdown, health checks | ✅ |
| Deployment | Dockerfile, API versioning | ✅ |
| Documentation | OpenAPI/Swagger | ✅ |
| Accessibility | WCAG 2.2 Level AA | ✅ |
| Code Quality | Legacy code removal | ✅ |

**Standards Compliance:**

- 12-Factor App: 10/12 factors
- OWASP Top 10: Protected against major risks
- Node.js Security Best Practices: 11/12 practices
- REST API Best Practices: 10/10
- WCAG 2.2 Accessibility: Level AA (0 automated violations)

---

## Security Hardening

### SSRF Protection

Prevents Server-Side Request Forgery attacks on load test target URLs.

**Implementation**: `apps/backend/src/features/endpoints/endpoints.service.js`

**Blocked by default:**

- Cloud metadata endpoints (169.254.169.254, metadata.google.internal)
- Localhost (127.0.0.1, localhost, ::1)
- Private IP ranges (10.x, 172.16-31.x, 192.168.x)

**Configuration:**

```bash
# Production (default) - blocks private IPs
BLOCK_PRIVATE_IPS=true

# Development - allows all
BLOCK_PRIVATE_IPS=false

# Allowlist specific internal hosts
SSRF_ALLOWLIST=internal-api.example.com,staging.example.com
```

### Body Size Limits

Prevents DoS via large payload uploads.

**Implementation**: `apps/backend/src/app.js`

```javascript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

Requests exceeding 10KB return HTTP 413 (Payload Too Large).

### Security Headers

Helmet.js provides security headers (CSP, X-Content-Type-Options, etc.).

**Additional protections:**

- CORS with origin allowlist
- Rate limiting (API: 100/15min, Load tests: 10/5min)
- Input validation via express-validator
- XSS protection via validator.escape()

---

## Performance

### Response Compression

60-80% reduction in response sizes via gzip/brotli.

**Implementation**: `apps/backend/src/app.js`

```javascript
const compression = require('compression');
app.use(compression({ threshold: 1024 }));
```

Only responses > 1KB are compressed.

**Verification:**

```bash
curl -H "Accept-Encoding: gzip" -I http://localhost:3001/api/v1/endpoints
# Look for: Content-Encoding: gzip
```

---

## Reliability

### Graceful Shutdown

Clean process termination with proper resource cleanup.

**Implementation**: `apps/backend/src/server.js`

**Handles:**

- SIGTERM (container orchestration)
- SIGINT (Ctrl+C)
- 10-second forced shutdown timeout

**Shutdown sequence:**

1. Stop accepting new connections
2. Complete in-flight requests
3. Close database connections
4. Exit with code 0

### Health Checks

**Endpoint**: `GET /api/health` (unversioned, no redirect)

```json
{"status": "ok", "timestamp": "2026-01-05T15:32:13.952Z"}
```

---

## Deployment

### Docker

Production-ready container with security hardening.

**File**: `load-tester/Dockerfile`

**Features:**

- Multi-stage build (builder + production)
- Non-root user (nodejs:nodejs, UID 1001)
- Alpine Linux base (minimal attack surface)
- OpenSSL for Prisma compatibility

**Build & Run:**

```bash
cd load-tester
docker build -t load-tester .
docker run -d -p 3000:3000 -e DATABASE_URL="file:./prisma/dev.db" load-tester
```

See [docker.md](docker.md) for complete guide.

### API Versioning

URL-based versioning at `/api/v1/`.

**Implementation**: `apps/backend/src/app.js`

**Behavior:**

| URL | Response |
|-----|----------|
| `/api/v1/endpoints` | 200 OK |
| `/api/endpoints` | 301 → `/api/v1/endpoints` |
| `/api/health` | 200 OK (no redirect) |

Query strings are preserved through redirects.

---

## Documentation

### OpenAPI/Swagger

Interactive API documentation.

**Access:**

- Swagger UI: <http://localhost:3001/api/docs>
- OpenAPI Spec: <http://localhost:3001/api/docs.json>

**Coverage:**

- 16 HTTP operations documented
- 8 component schemas
- Request/response examples
- Error response documentation

**Note**: Only available in development or with `ENABLE_SWAGGER=true`.

---

## Accessibility

### WCAG 2.2 Level AA Compliance

Zero automated accessibility violations (axe-core verified).

**Implementations:**

- Skip link with focus management
- Navigation landmarks with aria-labels
- Heading hierarchy (one h1/page, no skips)
- Decorative icons hidden (aria-hidden="true")
- Toast announcements (role="status", aria-live="polite")
- Visible focus indicators
- Sufficient color contrast (≥4.5:1)

**Verification:**

```bash
# Run axe-core scan via visual-qa subagent
# Or manually: Chrome DevTools → Lighthouse → Accessibility
```

---

## Code Quality

### Legacy Code Removal

Removed deprecated EJS-based application:

- `src/` - Legacy Express + EJS views
- `tests/` - Old test suite  
- `prisma/` - Outdated schema

All functionality now in `apps/backend/` and `apps/frontend/`.

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Prisma connection string |

### Optional (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PORT` | 3001 | Backend server port |
| `BLOCK_PRIVATE_IPS` | true (prod) | SSRF protection |
| `SSRF_ALLOWLIST` | (empty) | Comma-separated allowed hosts |
| `ENABLE_SWAGGER` | false | Enable Swagger in production |

---

## Verification Checklist

Before deploying to production:

- [ ] `NODE_ENV=production` set
- [ ] `DATABASE_URL` configured for production database
- [ ] `BLOCK_PRIVATE_IPS=true` (or unset for default)
- [ ] Health endpoint accessible: `GET /api/health`
- [ ] Swagger disabled (or intentionally enabled)
- [ ] Container runs as non-root user
- [ ] Graceful shutdown tested with SIGTERM

---

## Deferred Items

### CI Security (npm audit)

**Status**: Deferred until project separation

Add to CI pipeline when load-tester is moved to its own repository:

```yaml
- name: Security audit
  run: npm audit --audit-level=high
```

---

## References

- [12-Factor App](https://12factor.net/)
- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
