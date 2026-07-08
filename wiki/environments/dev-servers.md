---
type: Environment
title: Development Servers
description: Starting, stopping, and verifying development servers
tags: [servers, development, operations]
timestamp: 2026-01-07T00:00:00Z
---

# Development Servers

Starting, stopping, and verifying development servers. Uses separate terminals to avoid signal conflicts.

---

## Configuration

Check your project's `package.json`, `docker-compose.yml`, or `.env` for actual port numbers.

| Service | Port | URL |
|---------|------|-----|
| Backend | Check config | `http://localhost:<PORT>` |
| Frontend | Check config | `http://localhost:<PORT>` |

**Note**: Port numbers vary by project. Do not hardcode ports in scripts. Always check your project's configuration first.

---

## Start Servers

### 1. Check/Clear Ports

```fish
# Check if port is in use
lsof -i :<PORT> | grep LISTEN

# If occupied, kill the process
lsof -i :<PORT> -t | xargs kill -9
```

### 2. Start (isBackground: true)

```fish
cd ~/workspace/your-project && npm run dev
```

**Note**: Use `isBackground: true` — opens dedicated terminal, returns terminal ID.

**Save the terminal ID** for log access.

### 3. Verify (isBackground: true, NEW terminal)

```fish
sleep 5; curl -s -o /dev/null -w "Backend: %{http_code}\n" --max-time 3 http://localhost:<BACKEND_PORT>; curl -s -o /dev/null -w "Frontend: %{http_code}\n" --max-time 3 http://localhost:<FRONTEND_PORT>
```

**Note**: Must also use `isBackground: true` — creates separate terminal, avoids signal conflicts.

**Expected**: `Backend: 200` and `Frontend: 200`

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

Vite has interactive stdin (keyboard shortcuts h/r/o/c/q). With `& disown`:

- Stdin not detached → Vite blocks on read → process stops (SIGTTOU)
- Curl in same terminal causes signal conflicts

**Solution**: `isBackground: true` for both server and verification = separate terminals, no conflicts.

---

## Common Issues

| Symptom | Fix |
|---------|-----|
| curl timeout/hangs | Use `isBackground: true` for curl |
| exit code 130 | Signal conflict — use separate terminal |
| "Port in use, trying fallback" | Kill port, restart |
| curl code 7 | Server not running — check logs |

---

## See Also

- `mem:environments/fish-shell` — Fish shell syntax and operations
