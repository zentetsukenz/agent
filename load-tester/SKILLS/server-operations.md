# Server Operations

> **Purpose**: Start, stop, and reset development servers with consistent port configuration. Prevents port confusion and ensures servers are accessible before proceeding.

---

## Canonical Configuration

| Service  | Port | URL                        |
|----------|------|----------------------------|
| Backend  | 3001 | http://localhost:3001      |
| Frontend | 5173 | http://localhost:5173      |

**⚠️ CRITICAL: Never accept fallback ports (5174, 5175, etc.)**

If Vite says "Port 5173 is in use, trying 5174" — that's a failure state. Stop, clear the port, and restart.

---

## Quick Reference Commands

```fish
# Check what's running on ports
lsof -i :3001 | grep LISTEN
lsof -i :5173 | grep LISTEN

# Kill processes by port
lsof -i :3001 -t | xargs kill -9
lsof -i :5173 -t | xargs kill -9

# Start servers (use isBackground: true in run_in_terminal tool)
cd ~/workspace/agent/load-tester && npm run dev

# Start individual servers
cd ~/workspace/agent/load-tester && npm run backend
cd ~/workspace/agent/load-tester && npm run frontend

# Verify accessibility
curl -s http://localhost:3001/api/health
curl -s http://localhost:5173 | head -5
```

---

## Procedure: Start Server

### Step 1: Pre-flight Check

Check current state of canonical ports:

```fish
lsof -i :3001 | grep LISTEN
lsof -i :5173 | grep LISTEN
```

**Decision tree:**
- Port free → proceed to Step 3
- Our app already running → proceed to Step 5 (verify only)
- Zombie/other process → proceed to Step 2

### Step 2: Clear Ports (if needed)

Kill any process occupying the canonical ports:

```fish
lsof -i :3001 -t | xargs kill -9
lsof -i :5173 -t | xargs kill -9
```

Verify ports are now free:

```fish
lsof -i :3001 | grep LISTEN  # Should return nothing
lsof -i :5173 | grep LISTEN  # Should return nothing
```

### Step 3: Start Servers

**Using `run_in_terminal` tool:**
- Set `isBackground: true` 
- Command: `cd ~/workspace/agent/load-tester && npm run dev`

**For individual services:**
- Backend only: `cd ~/workspace/agent/load-tester && npm run backend`
- Frontend only: `cd ~/workspace/agent/load-tester && npm run frontend`

### Step 4: Watch for Fallback Port Warning

Check terminal output. If you see:

```
Port 5173 is in use, trying another one...
  ➜  Local:   http://localhost:5174/
```

**STOP IMMEDIATELY.** This is a failure state.
1. Stop the servers
2. Clear port 5173 (Step 2)
3. Restart from Step 1

### Step 5: Verify Accessibility

Wait for server initialization, then verify:

```fish
# Backend health check
curl -s http://localhost:3001/api/health

# Frontend accessibility
curl -s http://localhost:5173 | head -5
```

**Both must succeed before declaring "started".**

### Step 6: Report Status

```markdown
## Server Status

| Service  | Status  | URL                         |
|----------|---------|----------------------------|
| Backend  | Running | http://localhost:3001      |
| Frontend | Running | http://localhost:5173      |

Verified: ✓ Backend health check passed
Verified: ✓ Frontend returns HTML
```

---

## Procedure: Stop Server

### Step 1: Identify Processes

```fish
lsof -i :3001 -t
lsof -i :5173 -t
```

### Step 2: Kill Processes

```fish
lsof -i :3001 -t | xargs kill -9
lsof -i :5173 -t | xargs kill -9
```

### Step 3: Verify Stopped

```fish
lsof -i :3001 | grep LISTEN  # Should return nothing
lsof -i :5173 | grep LISTEN  # Should return nothing
```

### Step 4: Report Status

```markdown
## Server Status

| Service  | Status  | URL |
|----------|---------|-----|
| Backend  | Stopped | -   |
| Frontend | Stopped | -   |
```

---

## Procedure: Reset Server

1. Execute **Stop Server** procedure
2. Execute **Start Server** procedure
3. Full verification

---

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Port in use, trying 5174" | 5173 occupied | Kill process on 5173, restart |
| "ENOENT: package.json" | Wrong directory | Use `cd ~/workspace/agent/load-tester &&` prefix |
| Server starts but curl fails | Server still initializing | Wait 3-5 seconds, retry curl |
| "Address already in use" | Port not fully released | Wait 2 seconds, then kill again |
| Health check returns error | Backend crashed on startup | Check terminal output for error details |

---

## Anti-patterns

❌ **Don't** accept fallback ports — always use canonical 3001/5173  
❌ **Don't** run `npm run dev` without `cd ~/workspace/agent/load-tester &&`  
❌ **Don't** declare "started" without verifying with curl  
❌ **Don't** forget `isBackground: true` when using `run_in_terminal`  
❌ **Don't** proceed if health check fails — investigate first
