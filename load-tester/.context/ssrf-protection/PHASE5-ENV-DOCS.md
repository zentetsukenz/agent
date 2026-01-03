# Phase 5: Environment Configuration Documentation

**Objective**: Document new SSRF protection environment variables

**Estimated time**: 10 minutes

---

## Files to Modify

### 1. `.env.example` (if exists)

### 2. `apps/backend/README.md` (document env vars)

### 3. `load-tester/docs/environment.md` (add SSRF section)

---

## Implementation Details

### 1. Check and update .env.example

**Location**: `~/workspace/agent/load-tester/.env.example` or `~/workspace/agent/load-tester/apps/backend/.env.example`

**Add these lines**:

```bash
# SSRF Protection (Security)
# Block private IP addresses in production (recommended)
# Set to 'false' to allow local/internal endpoints (development only)
BLOCK_PRIVATE_IPS=true

# Allowlist specific internal hosts even when private IPs are blocked
# Comma-separated list of hostnames
SSRF_ALLOWLIST=internal-api.example.com,staging.example.com
```

### 2. Update apps/backend/README.md

**Add section** (find appropriate location, likely after Database or before Testing):

```markdown
## Security Configuration

### SSRF Protection

The application includes Server-Side Request Forgery (SSRF) protection to prevent attackers from using the load tester to scan internal networks or access cloud metadata endpoints.

**Environment Variables**:

- `BLOCK_PRIVATE_IPS`: Set to `true` (default in production) to block private IP addresses. Set to `false` in development to allow testing localhost endpoints.

- `SSRF_ALLOWLIST`: Comma-separated list of hostnames to allow even if they resolve to private IPs. Useful for legitimate internal APIs.

**What's blocked**:

- Cloud metadata endpoints (169.254.169.254, metadata.google.internal)
- Localhost variants (localhost, 127.0.0.1, ::1)
- Private IP ranges (when `BLOCK_PRIVATE_IPS=true`):
  - 10.0.0.0/8
  - 172.16.0.0/12
  - 192.168.0.0/16
  - Link-local addresses

**Example**:

```bash
# Production - secure by default
BLOCK_PRIVATE_IPS=true
SSRF_ALLOWLIST=internal-api.company.com

# Development - allow local testing
BLOCK_PRIVATE_IPS=false
```

```

### 3. Update load-tester/docs/environment.md

**Add section** after "Running the App" or in appropriate security section:

```markdown
## SSRF Protection Configuration

⚠️ **Production Security**: SSRF protection is enabled by default in production

The load tester includes protection against Server-Side Request Forgery attacks to prevent malicious users from:

- Scanning internal networks
- Accessing cloud metadata endpoints
- Hitting localhost/internal services

### Environment Variables

```bash
# Block private IPs (true in production, false in dev/test)
BLOCK_PRIVATE_IPS=true

# Allow specific internal hosts
SSRF_ALLOWLIST=internal-api.example.com,staging.example.com
```

### Default Behavior

**Production (`NODE_ENV=production`)**:

- Private IPs blocked by default
- Metadata endpoints always blocked
- Localhost always blocked

**Development/Test**:

- Private IPs allowed (for local testing)
- Metadata endpoints still blocked
- Localhost still blocked (use explicit IPs if needed)

### Testing Local Endpoints

If you need to test localhost endpoints in production mode:

1. Add them to the allowlist: `SSRF_ALLOWLIST=my-local-service.local`
2. Or set `BLOCK_PRIVATE_IPS=false` (not recommended in production)

### Always Blocked

These are blocked regardless of configuration:

- 169.254.169.254 (AWS/Azure/GCP metadata)
- metadata.google.internal
- localhost, 127.0.0.1, ::1

**Reference**: [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

```

---

## Context Required

Load before implementing:
```fish
# Check what env docs exist
ls -la ~/workspace/agent/load-tester/.env.example
ls -la ~/workspace/agent/load-tester/apps/backend/.env.example
ls -la ~/workspace/agent/load-tester/apps/backend/README.md

# Load environment docs
cat ~/workspace/agent/load-tester/docs/environment.md
```

---

## Implementation Strategy

1. Check which .env.example files exist
2. Add SSRF vars to appropriate .env.example
3. Update backend README with security section
4. Add SSRF section to environment.md
5. Keep documentation clear and example-focused
6. Maintain consistent formatting with existing docs

---

## Verification Steps

```fish
# 1. Verify syntax (no broken markdown)
# Read each file to check formatting

cat ~/workspace/agent/load-tester/.env.example
cat ~/workspace/agent/load-tester/apps/backend/README.md | grep -A 20 "SSRF"
cat ~/workspace/agent/load-tester/docs/environment.md | grep -A 30 "SSRF"

# 2. Verify examples are valid
# Copy .env.example vars and test parsing
grep SSRF ~/workspace/agent/load-tester/.env.example
```

---

## Success Criteria

- [ ] .env.example includes SSRF vars with comments
- [ ] Backend README documents security configuration
- [ ] environment.md explains behavior in prod vs dev
- [ ] Examples are clear and copy-pasteable
- [ ] Documentation mentions OWASP reference
- [ ] Consistent formatting with existing docs
- [ ] No broken markdown links or syntax

---

## Pattern Reference

Follow existing documentation patterns:

- Use clear section headers
- Include code examples in fenced blocks
- Use warning emojis (⚠️) for important notes
- Provide both the "what" and "why"
- Link to external references (OWASP)
- Keep explanations concise

---

## Next Phase

After verification passes → Phase 6: End-to-end verification
