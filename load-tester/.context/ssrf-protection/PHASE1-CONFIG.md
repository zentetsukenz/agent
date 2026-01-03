# Phase 1: SSRF Configuration

**Objective**: Add SSRF protection configuration to the backend config system

**Estimated time**: 15 minutes

---

## Files to Modify

### 1. `apps/backend/src/config/index.js`

**Current state**: Configuration has server, database, CORS, session, loadTest, and logging sections

**Required changes**: Add SSRF protection configuration section

---

## Implementation Details

### Add after the loadTest section (around line 50)

```javascript
  // SSRF Protection
  ssrf: {
    // Block private IPs in production, allow in dev/test for local testing
    blockPrivateIPs: process.env.BLOCK_PRIVATE_IPS === 'false' ? false : 
                     (process.env.NODE_ENV === 'production'),
    
    // Always block these hosts (cloud metadata endpoints, localhost variants)
    blockedHosts: [
      // AWS/Azure metadata service
      '169.254.169.254',
      // GCP metadata service
      'metadata.google.internal',
      'metadata.internal',
      // Localhost variants
      'localhost',
      '127.0.0.1',
      '::1',
      '0.0.0.0',
      '::',
    ],
    
    // Allow specific hosts even if they're private IPs
    // Format: Comma-separated in env: "internal-api.example.com,staging.example.com"
    allowlist: process.env.SSRF_ALLOWLIST 
      ? process.env.SSRF_ALLOWLIST.split(',').map(h => h.trim())
      : [],
  },
```

---

## Context Required

Load before implementing:

```fish
cat ~/workspace/agent/load-tester/apps/backend/src/config/index.js
```

---

## Implementation Strategy

1. Read the current config file (lines 1-70)
2. Locate the `loadTest` section
3. Add the `ssrf` section after it
4. Maintain consistent indentation and formatting
5. Keep comments clear and explanatory

---

## Verification Steps

After implementation:

```fish
# 1. Check syntax
cd ~/workspace/agent/load-tester/apps/backend
node -c src/config/index.js

# 2. Test config loads
node -e "const config = require('./src/config/index.js'); console.log(JSON.stringify(config.ssrf, null, 2))"

# 3. Expected output (development mode):
# {
#   "blockPrivateIPs": false,
#   "blockedHosts": ["169.254.169.254", "metadata.google.internal", ...],
#   "allowlist": []
# }
```

---

## Success Criteria

- [ ] Config file syntax valid (no errors)
- [ ] `config.ssrf` object exists with all three properties
- [ ] `blockPrivateIPs` is `false` in development, `true` in production
- [ ] `blockedHosts` array contains all metadata endpoints
- [ ] `allowlist` parses from environment variable correctly
- [ ] No existing config broken

---

## Pattern Reference

Follow existing patterns in config/index.js:

- Use ternary operators for conditional defaults
- Parse environment variables explicitly
- Include explanatory comments
- Maintain consistent code style
- Keep related config grouped

---

## Next Phase

After verification passes → Phase 2: Implement SSRF validation functions
