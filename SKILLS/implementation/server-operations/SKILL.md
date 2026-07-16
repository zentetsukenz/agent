---
name: server-operations
description: Start, stop, and verify development servers using separate terminals to avoid stdin signal conflicts. Use when launching or restarting backend/frontend dev servers, checking ports, or verifying server health during implementation and verification.
---

# Server Operations

> Start, stop, and verify development servers. Uses separate terminals to avoid signal conflicts.

## Configuration

**Never hardcode ports, hosts, or paths.** Read them from the project's own config
(`package.json` scripts, `vite.config`, `next.config`, `docker-compose.yml`, `.env`, or project docs)
before running any command below. Substitute the placeholders accordingly:

| Placeholder       | Meaning                           | Where to find it                         |
| ----------------- | --------------------------------- | ---------------------------------------- |
| `<PROJECT_DIR>`   | Absolute path to the project root | Workspace layout / user                  |
| `<START_CMD>`     | Dev server start command          | `package.json` scripts, README, Makefile |
| `<BACKEND_PORT>`  | Backend/API port                  | `.env`, server config, compose files     |
| `<FRONTEND_PORT>` | Frontend/dev-server port          | `vite.config`, `next.config`, `.env`     |
| `<HEALTH_PATH>`   | Backend health endpoint (if any)  | Backend routes / docs                    |

If the project provides a coordinates file (e.g. `.qa-witness.env`), source it instead of
guessing: `set -a; source .qa-witness.env; set +a`.

**⚠️ Never accept fallback ports** — if a dev server (e.g. Vite) falls back to another port
because the configured one is occupied, kill the occupant and restart on the intended port.

---

## Start Servers

### 1. Check/Clear Ports

```fish
lsof -i :<BACKEND_PORT> | grep LISTEN
lsof -i :<FRONTEND_PORT> | grep LISTEN
# If occupied: lsof -i :<PORT> -t | xargs kill -9
```

### 2. Start (isBackground: true)

```fish
cd <PROJECT_DIR> && <START_CMD>
```

**⚠️ Use `isBackground: true`** — opens dedicated terminal, returns terminal ID.

**Save the terminal ID** for log access.

### 3. Verify (isBackground: true, NEW terminal)

```fish
sleep 5; curl -s -o /dev/null -w "Backend: %{http_code}\n" --max-time 3 http://localhost:<BACKEND_PORT><HEALTH_PATH>; curl -s -o /dev/null -w "Frontend: %{http_code}\n" --max-time 3 http://localhost:<FRONTEND_PORT>
```

**⚠️ Must also use `isBackground: true`** — creates separate terminal, avoids signal conflicts.

**Expected:** `Backend: 200` and `Frontend: 200`

### 4. Check Logs

Use `get_terminal_output` with saved server terminal ID.

---

## Stop Servers

```fish
lsof -i :<BACKEND_PORT> -t | xargs kill -9
lsof -i :<FRONTEND_PORT> -t | xargs kill -9
```

---

## Why Separate Terminals?

Many dev servers (e.g. Vite) have interactive stdin (keyboard shortcuts h/r/o/c/q). With `& disown`:

- Stdin not detached → server blocks on read → process stops (SIGTTOU)
- Curl in same terminal causes signal conflicts

**Solution:** `isBackground: true` for both server and verification = separate terminals, no conflicts.

---

## Common Issues

| Symptom                       | Fix                                     |
| ----------------------------- | --------------------------------------- |
| curl timeout/hangs            | Use `isBackground: true` for curl       |
| exit code 130                 | Signal conflict — use separate terminal |
| "Port in use, trying <other>" | Kill the intended port, restart         |
| curl code 7                   | Server not running — check logs         |
