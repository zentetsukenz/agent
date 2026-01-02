# Response Compression

**Priority**: 🟡 Important  
**Effort**: 30 minutes  
**Standard**: Performance Best Practices

---

## Objective

Add gzip/brotli compression for API responses to reduce bandwidth and improve response times.

---

## Current State

No compression middleware configured. All responses sent uncompressed.

---

## Implementation

### Target File

- `apps/backend/src/app.js`

### Install Dependency

```bash
npm install compression --workspace=apps/backend
```

### Code Changes

```javascript
const compression = require('compression');

// Add early in middleware chain (after security, before routes)
app.use(compression({
  // Only compress responses > 1KB
  threshold: 1024,
  // Compression level (1-9, higher = more compression, slower)
  level: 6,
  // Filter function - compress JSON and text
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### Placement in app.js

```javascript
// Security headers
app.use(helmet({...}));

// Compression (before routes, after security)
app.use(compression({ threshold: 1024 }));

// Request ID and logging
app.use(requestId);
```

---

## Success Criteria

- [ ] `compression` package installed
- [ ] Middleware configured in app.js
- [ ] Responses > 1KB are compressed
- [ ] `Content-Encoding: gzip` header present
- [ ] Response sizes reduced (measurable)
- [ ] Tests pass

---

## Verification

```bash
# Check compression header
curl -H "Accept-Encoding: gzip" -I http://localhost:3000/api/endpoints

# Should see:
# Content-Encoding: gzip

# Compare sizes
curl http://localhost:3000/api/endpoints | wc -c
curl -H "Accept-Encoding: gzip" --compressed http://localhost:3000/api/endpoints | wc -c
```

---

## Expected Impact

- JSON responses: 60-80% size reduction
- Faster page loads on slow connections
- Reduced bandwidth costs

---

## References

- [compression middleware](https://www.npmjs.com/package/compression)
- [HTTP Compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Compression)
