# SSRF Protection

**Priority**: 🔴 Critical  
**Effort**: 2 hours  
**Standard**: OWASP Top 10 (A10: SSRF)

---

## Objective

Add URL validation to prevent Server-Side Request Forgery attacks when users configure load test target URLs.

---

## Current State

```javascript
// apps/backend/src/features/endpoints/endpoints.service.js
function validateAndSanitizeURL(url) {
  // Currently validates protocol (http/https) only
  // Comment notes: "we allow localhost and private IPs"
  // This is intentional but needs configurable protection
}
```

The app intentionally allows localhost/private IPs for local development testing, but production deployments need protection.

---

## Risk

Attackers could:

- Scan internal networks via the load tester
- Access cloud metadata endpoints (169.254.169.254)
- Hit internal services not meant to be public

---

## Implementation

### Target Files

- `apps/backend/src/features/endpoints/endpoints.service.js`
- `apps/backend/src/config/index.js`

### Strategy: Configurable Blocklist

```javascript
// config/index.js - Add SSRF config
ssrf: {
  // In production, block private ranges by default
  blockPrivateIPs: process.env.BLOCK_PRIVATE_IPS !== 'false',
  
  // Always block these regardless of setting
  blockedHosts: [
    '169.254.169.254',  // AWS/GCP metadata
    'metadata.google.internal',
    '127.0.0.1',
    'localhost',
  ],
  
  // Allow specific hosts even if private
  allowlist: process.env.SSRF_ALLOWLIST?.split(',') || [],
}
```

### URL Validation Enhancement

```javascript
function isPrivateIP(hostname) {
  // Check for private IP ranges
  // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  // Also check for IPv6 private ranges
}

function validateTargetURL(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  
  // Check blocklist first
  if (config.ssrf.blockedHosts.includes(hostname)) {
    return { valid: false, error: 'This host is blocked for security' };
  }
  
  // Check allowlist
  if (config.ssrf.allowlist.includes(hostname)) {
    return { valid: true };
  }
  
  // Check private IPs if blocking enabled
  if (config.ssrf.blockPrivateIPs && isPrivateIP(hostname)) {
    return { valid: false, error: 'Private IPs blocked in production' };
  }
  
  return { valid: true };
}
```

---

## Success Criteria

- [ ] Cloud metadata endpoints blocked (169.254.169.254)
- [ ] Private IPs blocked in production (configurable)
- [ ] Allowlist for legitimate internal targets
- [ ] Clear error messages for blocked URLs
- [ ] Development mode allows all (for local testing)
- [ ] Tests cover SSRF scenarios

---

## Verification

```bash
# Should be blocked
curl -X POST http://localhost:3000/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "url": "http://169.254.169.254/latest/meta-data"}'

# Should return error about blocked host
```

---

## Environment Variables

```bash
# Production - block private IPs (default)
BLOCK_PRIVATE_IPS=true

# Development - allow all
BLOCK_PRIVATE_IPS=false

# Allow specific internal hosts
SSRF_ALLOWLIST=internal-api.example.com,staging.example.com
```

---

## References

- [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [AWS Metadata Service](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html)
