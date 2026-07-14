---
name: server-operations
description: Start, stop, and verify development servers using separate terminals to avoid stdin signal conflicts. Use when launching or restarting backend/frontend dev servers, checking ports, or verifying server health during implementation and verification.
---

# Server Operations

> Start, stop, and verify development servers. Uses separate terminals to avoid signal conflicts.

## Configuration

| Service  | Port | URL                     |
|----------|------|-------------------------|
| Backend  | 3001 | <http://localhost:3001>   |
| Frontend | 5173 | <http://localhost:5173>   |

**⚠️ Never accept fallback ports (5174, etc.)** — kill and restart if Vite falls back.

---

## Start Servers

### 1. Check/Clear Ports

```fish
lsof -i :3001 | grep LISTEN
lsof -i :5173 | grep LISTEN
# If occupied: lsof -i :PORT -t | xargs kill -9
```

### 2. Start (isBackground: true)

```fish
cd ~/workspace/agent/load-tester && npm run dev
```

**⚠️ Use `isBackground: true`** — opens dedicated terminal, returns terminal ID.

**Save the terminal ID** for log access.

### 3. Verify (isBackground: true, NEW terminal)

```fish
sleep 5; curl -s -o /dev/null -w "Backend: %{http_code}\n" --max-time 3 http://localhost:3001/api/health; curl -s -o /dev/null -w "Frontend: %{http_code}\n" --max-time 3 http://localhost:5173
```

**⚠️ Must also use `isBackground: true`** — creates separate terminal, avoids signal conflicts.

**Expected:** `Backend: 200` and `Frontend: 200`

### 4. Check Logs

Use `get_terminal_output` with saved server terminal ID.

---

## Stop Servers

```fish
lsof -i :3001 -t | xargs kill -9
lsof -i :5173 -t | xargs kill -9
```

---

## Why Separate Terminals?

Vite has interactive stdin (keyboard shortcuts h/r/o/c/q). With `& disown`:

- Stdin not detached → Vite blocks on read → process stops (SIGTTOU)
- Curl in same terminal causes signal conflicts

**Solution:** `isBackground: true` for both server and verification = separate terminals, no conflicts.

---

## Common Issues

| Symptom | Fix |
|---------|-----|
| curl timeout/hangs | Use `isBackground: true` for curl |
| exit code 130 | Signal conflict — use separate terminal |
| "Port in use, trying 5174" | Kill port 5173, restart |
| curl code 7 | Server not running — check logs |
