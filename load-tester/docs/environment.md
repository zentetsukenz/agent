# Load-Tester Environment & Gotchas

**Purpose**: Local development setup, critical gotchas, common issues, and fixes

---

## Critical: Fish Shell

⚠️ **This project uses Fish shell on macOS, NOT bash**

Fish syntax differs significantly from bash. **Always** check syntax before running commands.

**Quick reference**:

```fish
# Fish (CORRECT for this project)
set MY_VAR "value"
echo $MY_VAR
cd ~/workspace/agent/load-tester && npm run dev

# Bash (WRONG - will fail)
export MY_VAR="value"
cd ~/workspace/agent/load-tester; npm run dev
```

**Full reference**: See `SKILLS/fish-shell.md` in workspace root

---

## Canonical Ports (Non-Negotiable)

| Service | Port | URL |
|---------|------|-----|
| Backend | 3001 | <http://localhost:3001> |
| Frontend | 5173 | <http://localhost:5173> |

⚠️ **NEVER accept fallback ports**

If Vite says "Port 5173 is in use, trying 5174" — **STOP**. Clear the port and restart.

**Why**: Port confusion wastes hours of debugging. Always use canonical ports.

**Full procedure**: See `SKILLS/server-operations.md` in workspace root

---

## Running the App

### ⚠️ CRITICAL: Always Run from Project Root

```fish
# CORRECT - always use this pattern
cd ~/workspace/agent/load-tester && npm run dev

# WRONG - will fail with "ENOENT: package.json"
npm run dev
```

### Start Both Apps (Recommended)

```fish
cd ~/workspace/agent/load-tester && npm run dev
```

Runs backend (3001) and frontend (5173) concurrently.

### Start Individually

```fish
# Backend only
cd ~/workspace/agent/load-tester && npm run backend

# Frontend only
cd ~/workspace/agent/load-tester && npm run frontend
```

---

## Running Tests

```fish
cd ~/workspace/agent/load-tester

# All tests (backend + frontend)
npm run test:all

# Backend tests
npm run backend:test
npm run backend:test:unit
npm run backend:test:integration

# Frontend tests
npm run frontend:test
```

**Coverage requirement**: 80%+ for backend

---

## Database Commands

```fish
cd ~/workspace/agent/load-tester/apps/backend

# Setup (migrate + generate client)
npm run db:setup

# Individual commands
npm run prisma:migrate   # Create migration
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Visual database browser
```

**Test database**: Automatically created at `prisma/test.db` during test runs, destroyed after

---

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

---

## Common Issues & Fixes

### 1. "DATABASE_URL not set"

**Cause**: Missing `.env` file

**Fix**:

```fish
cd ~/workspace/agent/load-tester/apps/backend
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env
```

---

### 2. Prisma Client Out of Sync

**Symptoms**:

- "PrismaClient is not configured yet"
- "Unknown field" errors

**Fix**:

```fish
cd ~/workspace/agent/load-tester/apps/backend
npm run prisma:generate
```

Run after any schema changes.

---

### 3. Port Already in Use

**Symptoms**:

- "Port 3001 is already in use"
- "Port 5173 is already in use"

**Fix**:

```fish
# Check what's using the ports
lsof -i :3001 | grep LISTEN
lsof -i :5173 | grep LISTEN

# Kill processes on canonical ports
lsof -i :3001 -t | xargs kill -9
lsof -i :5173 -t | xargs kill -9

# Verify ports are free
lsof -i :3001 | grep LISTEN  # Should return nothing
lsof -i :5173 | grep LISTEN  # Should return nothing

# Now start servers
cd ~/workspace/agent/load-tester && npm run dev
```

**Full procedure**: See `SKILLS/server-operations.md`

---

### 4. "ENOENT: package.json"

**Cause**: Running npm commands from wrong directory

**Fix**: Always use full path with `cd &&` pattern:

```fish
cd ~/workspace/agent/load-tester && npm run dev
```

---

### 5. Network Error in Frontend

**Symptoms**: Frontend shows "Network Error" or "Cannot connect"

**Causes & Fixes**:

1. **Backend not running**

   ```fish
   # Check if backend is accessible
   curl http://localhost:3001/api/health
   
   # If fails, start backend
   cd ~/workspace/agent/load-tester && npm run backend
   ```

2. **Backend on wrong port**

   ```fish
   # Verify backend port
   lsof -i :3001 | grep LISTEN  # Should show node process
   
   # If backend is on different port, kill and restart on 3001
   ```

3. **CORS issue**
   - Check backend `app.js` has CORS middleware configured
   - Should allow `http://localhost:5173`

---

### 6. Test Database Issues

**Symptoms**: Tests fail with database errors

**Cause**: Test database not properly created/destroyed

**Fix**: Test setup handles this automatically. If issues persist:

```fish
cd ~/workspace/agent/load-tester/apps/backend
rm -f prisma/test.db
npm run backend:test
```

Test setup (`tests/setup.js`) recreates database fresh for each run.

---

### 7. Fallback Port Accepted (WRONG)

**Symptoms**: Vite starts on port 5174, 5175, etc.

**Why this is a problem**:

- Frontend tries to reach backend at wrong origin
- CORS errors occur
- Wastes debugging time

**Fix**: NEVER accept fallback ports. Clear canonical port:

```fish
lsof -i :5173 -t | xargs kill -9
cd ~/workspace/agent/load-tester && npm run frontend
```

---

## Prisma 7 Migration Notes

⚠️ **Recently upgraded from Prisma 5 to 7**

**Key changes**:

- Requires adapter pattern (no direct DATABASE_URL in schema)
- Uses `@prisma/adapter-better-sqlite3`
- Schema has no `url` in datasource

**Current patterns**: See `docs/prisma-patterns.md` in workspace root

---

## File Quick Links

When you need to modify specific functionality:

| Task | Files to Check |
|------|----------------|
| Add API endpoint | `apps/backend/src/app.js`, `apps/backend/src/features/` |
| Database changes | `apps/backend/prisma/schema.prisma` |
| Add frontend page | `apps/frontend/src/pages/`, `apps/frontend/src/App.jsx` |
| Add UI component | `apps/frontend/src/components/` |
| Backend validation | `apps/backend/src/middleware/validation.js` |
| Error handling | `apps/backend/src/utils/errors.js`, `apps/backend/src/middleware/errorHandler.js` |
| Test config | `apps/backend/tests/setup.js`, `apps/frontend/vitest.config.js` |
| Database singleton | `apps/backend/src/config/database.js` |
| API client | `apps/frontend/src/services/api.js` |

---

## Before Starting Work

**Always verify**:

1. Running from correct directory (`~/workspace/agent/load-tester`)
2. Ports are free (3001 and 5173)
3. Backend is accessible (`curl http://localhost:3001/api/health`)
4. Frontend loads without console errors

**Reference**:

- Server operations: `SKILLS/server-operations.md`
- Fish shell syntax: `SKILLS/fish-shell.md`
- Visual verification: `SKILLS/visual-verification.md`
- Browser debugging: `SKILLS/browser-console-debugging.md`

---

**Last Updated**: January 1, 2026
