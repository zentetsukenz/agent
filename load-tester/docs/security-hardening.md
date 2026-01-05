# Security Hardening Guide

**Last Updated**: January 5, 2026  
**Standards**: OWASP Top 10, Node.js Security Best Practices

This document provides security patterns implemented in load-tester that can be referenced for other projects.

---

## Quick Reference

| Protection | Implementation | File |
|------------|---------------|------|
| SSRF | URL validation + blocklist | endpoints.service.js |
| DoS (body) | Request size limits | app.js |
| XSS | Input sanitization + CSP | validation, Helmet |
| Injection | Prisma parameterized queries | services |
| Headers | Helmet.js middleware | app.js |
| Rate Limiting | express-rate-limit | app.js |

---

## SSRF Protection

### Problem

Server-Side Request Forgery allows attackers to:

- Scan internal networks via the application
- Access cloud metadata endpoints (AWS/GCP credentials)
- Hit internal services not meant to be public

### Solution

Validate and block dangerous URLs before making requests.

### Implementation

```javascript
// config/index.js
ssrf: {
  blockPrivateIPs: process.env.BLOCK_PRIVATE_IPS !== 'false',
  blockedHosts: [
    '169.254.169.254',      // AWS/GCP metadata
    'metadata.google.internal',
    '127.0.0.1',
    'localhost',
    '::1',
  ],
  allowlist: process.env.SSRF_ALLOWLIST?.split(',') || [],
}

// URL validation function
function validateTargetURL(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  
  // 1. Check blocklist (always blocked)
  if (config.ssrf.blockedHosts.includes(hostname)) {
    throw new ValidationError('This host is blocked for security reasons');
  }
  
  // 2. Check allowlist (bypass private IP check)
  if (config.ssrf.allowlist.includes(hostname)) {
    return true;
  }
  
  // 3. Check private IPs (if enabled)
  if (config.ssrf.blockPrivateIPs && isPrivateIP(hostname)) {
    throw new ValidationError('Private IP addresses are blocked');
  }
  
  return true;
}

function isPrivateIP(hostname) {
  // IPv4 private ranges
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (loopback)
    /^0\./,                     // 0.0.0.0/8
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
  ];
  
  return privateRanges.some(range => range.test(hostname));
}
```

### Environment Variables

```bash
# Production (default)
BLOCK_PRIVATE_IPS=true

# Development (allow localhost testing)
BLOCK_PRIVATE_IPS=false

# Allowlist specific internal hosts
SSRF_ALLOWLIST=internal-api.example.com,staging.example.com
```

### Testing

```bash
# Should be blocked
curl -X POST http://localhost:3001/api/v1/endpoints \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "url": "http://169.254.169.254/latest/meta-data"}'
# Expected: 400 error about blocked host

# Should be blocked (private IP)
curl -X POST http://localhost:3001/api/v1/endpoints \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "url": "http://192.168.1.1/admin"}'
# Expected: 400 error about private IP (in production)
```

---

## Request Body Size Limits

### Problem

Without limits, attackers can send massive payloads causing:

- Memory exhaustion
- CPU spike (parsing large JSON)
- Denial of service

### Solution

Limit request body size at the middleware level.

### Implementation

```javascript
// app.js
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

### Error Handling

```javascript
// errorHandler.js
if (err.type === 'entity.too.large') {
  error = new ValidationError('Request body too large');
  error.statusCode = 413;
  error.isOperational = true;
}
```

### Testing

```bash
# Create 15KB payload (exceeds 10KB limit)
node -e "
const payload = JSON.stringify({
  name: 'x'.repeat(15000),
  url: 'https://example.com'
});
console.log('Size:', payload.length, 'bytes');
"
# Expected: HTTP 413 Payload Too Large
```

---

## Security Headers (Helmet.js)

### Implementation

```javascript
// app.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // For dev tools compatibility
}));
```

### Headers Set

| Header | Purpose |
|--------|---------|
| Content-Security-Policy | Prevent XSS, injection attacks |
| X-Content-Type-Options | Prevent MIME sniffing |
| X-Frame-Options | Prevent clickjacking |
| X-XSS-Protection | Legacy XSS filter |
| Strict-Transport-Security | Force HTTPS |
| Referrer-Policy | Control referrer information |

---

## Rate Limiting

### Implementation

```javascript
// app.js
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: true, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for load tests (expensive operation)
const testLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: { error: true, message: 'Too many load tests' },
});

app.use('/api', apiLimiter);
app.use('/api/v1/tests', testLimiter);
```

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| All API | 100 requests | 15 minutes |
| Load tests | 10 requests | 5 minutes |

---

## Input Validation & Sanitization

### Validation (express-validator)

```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateEndpoint = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('url')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'] }).withMessage('Invalid URL'),
  body('method')
    .isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).withMessage('Invalid method'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: true, 
        message: 'Validation failed',
        details: errors.array() 
      });
    }
    next();
  }
];
```

### Sanitization (XSS Prevention)

```javascript
// utils/sanitization.js
const validator = require('validator');

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return validator.escape(input);
}

function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
```

---

## SQL Injection Prevention

### Solution: Prisma ORM

Prisma uses parameterized queries by default:

```javascript
// Safe - Prisma parameterizes automatically
const endpoint = await prisma.endpoint.findUnique({
  where: { id: userInput }  // Safe even with malicious input
});

// Safe - Prisma escapes values
const endpoints = await prisma.endpoint.findMany({
  where: { name: { contains: userInput } }
});
```

### Never Do

```javascript
// DANGEROUS - Raw SQL with string concatenation
const result = await prisma.$queryRaw`
  SELECT * FROM endpoints WHERE name = '${userInput}'
`;

// Safe alternative
const result = await prisma.$queryRaw`
  SELECT * FROM endpoints WHERE name = ${userInput}
`;
```

---

## CORS Configuration

### Implementation

```javascript
// app.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
```

### Environment Variable

```bash
# Single origin
CORS_ORIGIN=https://app.example.com

# Multiple origins (implement custom function)
CORS_ORIGINS=https://app.example.com,https://admin.example.com
```

---

## Security Checklist

### Before Deployment

- [ ] `NODE_ENV=production` set
- [ ] SSRF protection enabled (`BLOCK_PRIVATE_IPS=true` or unset)
- [ ] Body size limits configured
- [ ] Rate limiting active
- [ ] Helmet.js security headers enabled
- [ ] CORS configured for production origin
- [ ] Database credentials not in code
- [ ] Debug/dev endpoints disabled
- [ ] Error stack traces hidden in production

### Ongoing

- [ ] Run `npm audit` regularly
- [ ] Update dependencies monthly
- [ ] Review access logs for anomalies
- [ ] Test security controls after changes

---

## References

- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit)
