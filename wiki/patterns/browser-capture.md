---
type: Pattern
title: Browser Capture Substrate
description: The shared, deterministic browser-drive contract two skills specialize — reach a running app, choose an automation tool, capture without contaminating the orchestrator's context
tags: [frontend, browser, capture, playwright, mcp, determinism, isolation, loom]
timestamp: 2026-07-27T00:00:00Z
---

# Browser Capture Substrate

> **Applied by two skills through different lenses:**
> [visual-verification](../../SKILLS/verification/visual-verification/SKILL.md) captures *pixels*
> and returns a text report; [frontend-runtime-debugging](../../SKILLS/implementation/frontend-runtime-debugging/SKILL.md)
> captures *runtime channels* (console/network/DOM) and returns an evidence file. This page is the
> substrate both share so the how-to-drive-a-browser knowledge lives in one module, not two.

## Core idea

Both "what does it look like" and "why does it misbehave" start with the **same three moves**:
reach the running app at the right URL, drive a real browser deterministically, and capture the
result **without dumping raw bytes into the working context**. Only the *lens* differs — pixels
vs. runtime channels. Keep the shared moves here; keep the lens in each skill.

## The shared moves

### 1. Reach the app — discover, never assume

- Discover the exact URL (path + relevant query/params) from the project's own config:
  `vite.config`, `next.config`, `package.json` scripts, `.env`, compose files. **Never hardcode a
  port.**
- Confirm the app is actually reachable before capturing. A dead server produces noise, not
  evidence — start/verify it first (see
  [server-operations](../../SKILLS/implementation/server-operations/SKILL.md)).

### 2. Choose an automation tool

The tool is your choice; it just has to satisfy the *consuming skill's* contract. In order of
preference:

- **Playwright MCP** — recommended default. The agent drives the browser through tool calls
  (navigate, set viewport, read console, inspect network, screenshot) with no capture code to
  write.
- **Chrome DevTools MCP** — heavier alternative when you need deep network/performance/CDP traces
  (waterfalls, protocol-level detail).
- **A Playwright/Puppeteer script** — when no MCP is available. Subscribe to `console`,
  `pageerror`, `requestfailed`, and `response` events; drive and capture programmatically.
- **Manual DevTools** — last resort when nothing can be automated.

### 3. Capture without contaminating context

Two contamination risks, one principle — **the heavy artifact never crosses into the working
context**:

- **Image bytes** → captured and analyzed in an *isolated, vision-capable* mechanism that returns
  a text report only (the `visual-verification` ISOLATE strategy). The orchestrator never sees the
  screenshot.
- **Raw logs** → console dumps, stack traces, and network logs go to a temp file
  (`$TMPDIR`/`/tmp`/`%TEMP%`); only the relevant summary is pulled into context (the
  `frontend-runtime-debugging` capture-to-file discipline).

### 4. Stabilize before capturing (when the lens is pixels or DOM)

Non-determinism is the main source of false positives. Before a capture that will be *compared*:

- **Exact viewport** — set it explicitly (mobile ~375×667, tablet ~768×1024, desktop ~1280×800);
  don't rely on the window's current size.
- **Wait for fonts** — web fonts swapping mid-capture shift text metrics.
- **Wait for network-idle** — capturing mid-fetch shows skeletons unless the loading state is
  itself under test.
- **Freeze or wait out animations/transitions** — a mid-transition frame is not a stable state.
- **Seed deterministic data** — mock live dates/random IDs/timestamps so repeated captures are
  comparable.
- **Repeat interactions exactly** — for any baseline comparison, the steps to reach the state must
  match the steps used for the baseline.

Runtime-debugging capture caveats live in the consuming skill (source maps for readable frames;
timing needs a *completing* request; framework warnings are signal) — they belong to the runtime
lens, not the shared substrate.

## Two lenses, one substrate

```text
                 ┌──────────────────────────────────────────┐
                 │  Browser Capture Substrate (this page)     │
                 │  reach app · drive tool · isolate/to-file  │
                 └──────────────────────────────────────────┘
                        ▲                          ▲
        pixels lens     │                          │   runtime lens
   ┌────────────────────┴───────┐      ┌───────────┴────────────────────┐
   │ visual-verification         │      │ frontend-runtime-debugging      │
   │ screenshot → text report    │      │ console/net/DOM → evidence file │
   │ dimensions · modes · budget │      │ classify · locate · fix pattern │
   └────────────────────────────┘      └─────────────────────────────────┘
```

## When to apply

- Adding or editing either capture skill — put shared drive/discover/isolate knowledge here, not
  in the skill.
- Building an agent (e.g. `frontend`) that exercises **both** skills — read this once instead of
  learning the browser-drive moves twice.

## Anti-patterns

- **Duplicating the drive contract** — re-specifying URL-discovery / tool-choice / isolation
  inside each skill, where the two copies drift.
- **Hardcoding a port** instead of discovering it from config.
- **Bytes in context** — a screenshot in the orchestrator's context, or a full log dump in the
  debugger's context.
- **Comparing an unstabilized capture** — a "diff" that is really today's date or a mid-transition
  frame.

## Related

- [visual-verification](../../SKILLS/verification/visual-verification/SKILL.md) — the pixels lens (ISOLATE strategy, dimensions, modes).
- [frontend-runtime-debugging](../../SKILLS/implementation/frontend-runtime-debugging/SKILL.md) — the runtime lens (classify, capture-to-file, fix patterns).
- [server-operations](../../SKILLS/implementation/server-operations/SKILL.md) — start/verify the dev server this substrate captures against.
- [role-scoped-capabilities](role-scoped-capabilities.md) — the role vocabulary for the `frontend` agent that uses both lenses.
