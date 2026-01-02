# Server Operations Skill — Problem Report

**Date**: January 2, 2026  
**Context**: Response compression implementation  
**Task**: Start backend server, verify compression via curl

---

## Summary

While implementing response compression, I encountered several issues when following the server-operations skill that revealed gaps in the documented procedures. The task was eventually completed successfully, but the process highlighted areas where the skill needs improvement.

---

## What Worked Well ✅

### 1. Port Management Procedures

- **lsof commands worked perfectly** for checking port availability
- **Canonical port enforcement** (3001/5173) is clear and well-documented
- **Kill process commands** (`lsof -i :PORT -t | xargs kill -9`) worked as expected

### 2. Clear Structure

- **Decision tree approach** (check → clear → start → verify) is logical
- **Background process guidance** (`isBackground: true`) is correct
- **Verification steps** with curl are conceptually sound

### 3. Server Startup

- Server successfully started with `cd ~/workspace/agent/load-tester && npm run backend`
- Background process ran correctly
- Server logs showed proper initialization

---

## Problems Encountered ❌

### Problem 1: Node.js Version Management (CRITICAL)

**Issue**: First server start attempt failed with asdf error:

```
No version is set for nodejs; please run `asdf set [options] nodejs <version>`
```

**Impact**: Immediate failure, blocked progress

**Root Cause**: server-operations.md doesn't cover environment prerequisites

**Workaround Used**: Started from backend directory directly: `cd ~/workspace/agent/load-tester/apps/backend && node src/server.js`

**Status**: Not addressed in skill documentation

---

### Problem 2: Terminal Interference with Background Servers (HIGH)

**Issue**: When server ran in background (`isBackground: true`), subsequent curl commands were interrupted or failed:

**Evidence**:

```fish
# Attempt 1
curl -s http://localhost:3001/api/health
Command exited with code 7

# Attempt 2  
curl -H "Accept-Encoding: gzip" -I http://localhost:3001/api/endpoints
Command exited with code 130 (SIGINT)
```

**Impact**: Cannot verify server is running, verification steps fail

**Root Cause**: Terminal state confusion when mixing background processes with foreground commands in `run_in_terminal` tool

**Workaround Used**: Combined server start + verification in one command:

```fish
cd ~/workspace/agent/load-tester/apps/backend && node src/server.js &; sleep 3; curl -I http://localhost:3001/api/health
```

**Status**: Not documented in skill

---

### Problem 3: Port Check vs. Server Ready (MEDIUM)

**Issue**: `lsof -i :3001 | grep LISTEN` showed no process, but server terminal output indicated it was running

**Evidence**:

```
Terminal output: "🚀 Load Tester server running on http://localhost:3001"
Port check: Command exited with code 1 (nothing found)
```

**Impact**: Confusion about actual server state

**Root Cause**: Server process terminated shortly after starting, but exact timing unclear

**Status**: Verification procedure needs strengthening

---

### Problem 4: Timing Issues (MEDIUM)

**Issue**: Server needs time to initialize before curl requests succeed

**Current Guidance**: "Wait for server initialization" (vague)

**What Actually Worked**: `sleep 3` between server start and curl

**Impact**: Verification fails if attempted too quickly

**Status**: No specific timing guidance in skill

---

## What Needs Improvement 📋

### 1. Environment Prerequisites Section (CRITICAL)

Add new section to server-operations.md:

```markdown
## Prerequisites

Before starting servers, ensure:

**Node.js Version**: 
- If using asdf: `asdf current nodejs` should show a version
- If not set: System may not have node/npm in PATH
- Workaround: Start from backend directory directly or ensure asdf is configured

**Database Setup**:
- Backend requires Prisma migrations to be run
- If database doesn't exist: `cd ~/workspace/agent/load-tester && npm run backend:db:setup`
```

### 2. Background Server + Verification Pattern (HIGH)

Add new subsection to "Procedure: Start Server":

```markdown
### Step 5a: Verify Accessibility (Background Server Pattern)

When server runs in background, terminal state can interfere with subsequent commands.

**Option A: Combined Command (RECOMMENDED)**
```fish
cd ~/workspace/agent/load-tester/apps/backend && node src/server.js &; sleep 3; curl -I http://localhost:3001/api/health
```

**Option B: Separate Commands (if Option A fails)**

1. Start server in background
2. Wait 3-5 seconds for initialization
3. Use separate terminal for curl commands

**Why**: The `run_in_terminal` tool can have terminal state issues when mixing background processes with foreground commands in quick succession.

```

### 3. Troubleshooting Decision Tree (HIGH)

Add comprehensive troubleshooting section:

```markdown
## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| "No version is set for nodejs" | asdf not configured | Start from apps/backend directory directly |
| curl exits with code 7 | Server not listening / wrong port | Verify with `lsof -i :3001` |
| curl exits with code 130 | Terminal interference | Use combined command pattern |
| Server logs show running, but curl fails | Not enough time to initialize | Add `sleep 3` before curl |
| "Port in use" but lsof shows nothing | Port not fully released | Wait 2 seconds, check again |
| Database table doesn't exist | Migrations not run | Run `npm run backend:db:setup` |
```

### 4. Verification Reliability (MEDIUM)

Current Step 5 verification is fragile. Improve:

```markdown
### Step 5: Verify Accessibility (IMPROVED)

**Timing**: Wait 3-5 seconds after server start before verification

**Health Check**:
```fish
curl -s http://localhost:3001/api/health
```

**Expected**: `{"status":"ok","timestamp":"..."}`
**Actual Error States**:

- `curl: (7)` = Connection refused (server not listening)
- `curl: (130)` = Command interrupted (terminal state issue)
- `500 error` = Server running but internal error (check logs)

**If health check fails**:

1. Check server logs in background terminal
2. Verify port with `lsof -i :3001`
3. Try combined command pattern (Step 5a)

```

### 5. Background Process Management (MEDIUM)

Add guidance on managing background server after starting:

```markdown
## Managing Background Servers

**Check Server Status**:
```fish
lsof -i :3001  # Shows PID if running
```

**View Server Logs**:

- Use `get_terminal_output` tool with terminal ID
- Check for startup errors or runtime issues

**Stop Background Server**:

```fish
lsof -i :3001 -t | xargs kill -9
```

**Restart Background Server**:

```fish
# Stop first
lsof -i :3001 -t | xargs kill -9
# Wait for port release
sleep 2
# Start again
cd ~/workspace/agent/load-tester && npm run backend
```

```

---

## Workarounds That Succeeded ✅

### 1. Combined Start + Verify Pattern
```fish
cd ~/workspace/agent/load-tester/apps/backend && node src/server.js &; sleep 3; curl -I http://localhost:3001/api/health
```

**Why it worked**: Single command context, explicit timing, immediate verification

### 2. Testing Compression via Vary Header

```fish
curl -H "Accept-Encoding: gzip" -I http://localhost:3001/api/health 2>&1 | grep -E "Vary" -i
```

**Result**: `Vary: Origin, Accept-Encoding` confirmed compression middleware active

**Why it worked**: /api/health is small (< 1KB) so no gzip encoding, but Vary header proves middleware is configured

---

## Recommendations

### Immediate (Should Fix Now)

1. **Add environment prerequisites section** covering asdf/node setup
2. **Document combined command pattern** for background server + verification
3. **Add timing guidance** (sleep 3) to verification steps

### Short-term (Should Add Soon)

1. **Expand troubleshooting table** with actual error codes encountered
2. **Add "Background Process Management"** section
3. **Include database setup** in prerequisites

### Long-term (Future Enhancement)

1. **Create checklist-style verification** that's more reliable
2. **Add "Common Failure Patterns"** section with real examples
3. **Document tool limitations** (run_in_terminal behavior with background processes)

---

## Impact Assessment

**Task Completion**: ✅ Success (despite issues)  
**Time Cost**: ~3x expected (5 min → 15 min due to troubleshooting)  
**Skill Reliability**: 6/10 (worked eventually, but required multiple workarounds)  
**Documentation Gap**: Significant (missing critical failure modes)

---

## Conclusion

The server-operations skill provides a solid foundation but lacks critical real-world failure handling. The documented "happy path" works, but common issues (asdf, terminal interference, timing) are not covered.

**Key Insight**: The skill was written from a "what should happen" perspective, but needs to evolve to "what actually happens" based on real usage patterns.

**Priority Fix**: Add the "Combined Start + Verify Pattern" immediately—this is the most reliable approach for agent-based server operations where terminal state management is challenging.
