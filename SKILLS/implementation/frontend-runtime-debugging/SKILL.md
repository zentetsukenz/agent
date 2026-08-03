---
name: frontend-runtime-debugging
description: 'Debug frontend runtime failures — console errors, failed network requests, broken rendering/hydration, and stale or racing state — by classifying the symptom, capturing structured browser evidence, and applying per-class fix patterns. Use when a page crashes, a component won''t render, data won''t load, the UI is stuck or stale, a hydration mismatch appears, or someone says "the frontend is broken", "console error", "it works locally but not in prod", "the page is blank".'
---

# Frontend Runtime Debugging

Runtime bugs in the browser hide behind vague symptoms — "it's broken", "blank page", "nothing happens". This skill turns a symptom into a **class**, tells you what **evidence** to capture, and points at the **fix patterns** for that class.

It is a frontend specialization of the general debugging loop. The root-cause discipline lives elsewhere; this skill adds the browser-specific layer on top:

- For the general root-cause method — feedback loop, reproduce, hypothesise, fix — → [diagnosing-bugs](../diagnosing-bugs/SKILL.md).

Use that for the _how do I isolate a cause_ mechanics. Use this for _what does this frontend symptom mean and how do I capture proof_.

---

## When to use

- A page crashes, is blank, or shows a stuck spinner.
- A red console error, an unhandled rejection, or a React/Vue/Svelte warning.
- Data won't load; a request 404s, 500s, or is blocked by CORS.
- The UI renders stale data, double-renders, or loops.
- "Works locally but not in prod / after deploy."
- Hydration mismatch warnings in an SSR app.

**Not for:**

- The dev server isn't running → [server-operations](../server-operations/SKILL.md).
- Backend returns wrong data but the request succeeds → debug the backend, not the browser.
- Pure visual/layout polish → [visual-verification](../../verification/visual-verification/SKILL.md).
- A green test that should be red / logic bug with no runtime error → [diagnosing-bugs](../diagnosing-bugs/SKILL.md).

---

## The loop

```
1. Reproduce   — concrete steps, on a running app
2. Classify    — map the symptom to a class (table below)
3. Capture     — pull structured evidence to a file, summarize into context
4. Locate      — read the class sub-file; find the origin, not the symptom
5. Fix + verify — apply the pattern, re-run the repro
```

Steps 1, 4-symptom-vs-origin, and 5 are the general loop — defer to
[diagnosing-bugs](../diagnosing-bugs/SKILL.md) for the discipline. Steps 2 and 3
are what this skill adds.

---

## Step 1 — Reproduce

You need concrete, replayable steps before capturing anything. Vague steps waste a capture pass.

```markdown
## Reproduction

1. Navigate to <exact URL, incl. path + query>
2. <concrete action — "click the Save button", not "save the form">
3. <concrete action>

## Expected

<what should happen>

## Actual

<what actually happens / the error observed>
```

Quality bar:

- [ ] URL is exact (path + relevant query/params), not "the settings page".
- [ ] Each action is a single concrete interaction.
- [ ] Expected vs actual is unambiguous.

Confirm the app is actually reachable before capturing — if the server is down, see
[server-operations](../server-operations/SKILL.md). Discover the URL/port from the project's
own config (`vite.config`, `next.config`, `package.json` scripts, `.env`, compose files); never
assume a port.

## Step 2 — Classify the symptom

Map what you see to a class. Classes overlap — start with the strongest signal, and expect to
re-classify once evidence arrives (e.g. a "blank page" often turns out to be a console error).

| Symptom                                                                | Likely class                                | Go to                                |
| ---------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------ |
| Red error / unhandled rejection / framework warning in console         | **Console**                                 | below                                |
| Blank page, stuck spinner, component missing, "white screen"           | **Console** first, then **Rendering**       | below → [RENDERING.md](RENDERING.md) |
| Request 404/500, CORS block, `Failed to fetch`, wrong/no data          | **Network**                                 | [NETWORK.md](NETWORK.md)             |
| Double render, infinite loop, laggy typing, "Maximum update depth"     | **Rendering**                               | [RENDERING.md](RENDERING.md)         |
| Hydration mismatch, "content did not match", SSR-only break            | **Rendering**                               | [RENDERING.md](RENDERING.md)         |
| Stale value, update lost, "works on refresh but not live", flaky order | **State**                                   | [STATE.md](STATE.md)                 |
| Works locally, breaks in prod/after deploy                             | classify by the above, then check build/env | relevant sub-file                    |

**Console** is the entry class and is covered here in `SKILL.md` — the console channel is a
catch-all (JS errors, resource-load failures, and framework warnings all surface there), so it's
almost always where you look first. The other classes get dedicated sub-files with capture
recipes, likely causes, and fix patterns.

## Step 3 — Capture structured evidence

**Capture to a file, summarize into context.** Raw console dumps, stack traces, and network
logs bloat working memory fast. Write the full evidence to a temp file
(`$TMPDIR`/`/tmp`/`%TEMP%`, e.g. `<tmpdir>/fe-debug-<timestamp>.json`) and pull only the
relevant summary into the conversation. This keeps context clean whether you're working solo or
an orchestrator has handed the capture to a separate session.

> The generic browser-drive moves (discover the URL from config, choose the automation tool,
> capture without contaminating context) are shared with the visual skill — see
> [wiki/patterns/browser-capture.md](../../../wiki/patterns/browser-capture.md). This step adds the
> _runtime lens_: the channels below and the capture caveats specific to runtime evidence.

### Capability checklist — what any capture must provide

The capture tool is your choice; it just has to deliver these channels:

- [ ] **Console messages** — type (`log`/`warn`/`error`), text, and source location.
- [ ] **Uncaught errors** — page-level exceptions and unhandled promise rejections, _separate_
      from console (a real crash may not print a normal `console.error`).
- [ ] **Failed requests** — URL, method, and the failure reason (e.g. `ERR_CONNECTION_REFUSED`,
      CORS block, DNS).
- [ ] **Responses + timing** — status code and timing for requests that _complete_ (needed for
      4xx/5xx and slow-request diagnosis; a request that fails at the connection level yields no
      response).
- [ ] **DOM / screenshot snapshot** — the rendered state at the moment of failure (for Rendering
      bugs). For visual review specifically, see
      [visual-verification](../../verification/visual-verification/SKILL.md).

### Tools that satisfy the checklist

- **Playwright MCP** — recommended default. The agent drives the browser directly through tool
  calls (navigate, read console, inspect network) and gets the channels above without writing
  capture code. Same engine validated in the prototype below.
- **Chrome DevTools MCP** — heavier alternative when you need deep network/performance/CDP
  traces (waterfalls, protocol-level detail).
- **A Playwright/Puppeteer script** — when no MCP is available. Subscribe to the browser's
  `console`, `pageerror`, `requestfailed`, and `response` events and dump JSON. (This is exactly
  what the prototype in this repo did — see the validation note below.)
- **Manual DevTools** — last resort when nothing can be automated; paste the Console and Network
  panel contents into an evidence file yourself.

### Capture caveats

- **Source maps.** If frames point at bundled/minified files, enable source maps in the dev
  build so locations resolve to real files. Locations captured from an origin-less page (e.g. raw
  HTML with no server) come back with an empty `url` — capture against the running dev server.
- **Timing needs a completing request.** A connection-level failure fires only the failed-request
  channel, never a response. To measure slowness, capture a request that finishes.
- **Warnings are signal.** Framework warnings (React keys, hydration, deprecated props) are the
  cheapest early evidence — don't filter them out.

## Step 4 — Locate the origin

With evidence in hand, open the sub-file for the class and trace from symptom to **origin**, not
to the first line the stack trace names. The sub-files list the usual origins per class.

Symptom-vs-origin tracing is core debugging discipline — see
[diagnosing-bugs](../diagnosing-bugs/SKILL.md) (root-cause investigation, backward tracing,
feedback loops) for the method.

## Step 5 — Fix and verify

Apply the fix pattern from the sub-file, then **re-run the exact reproduction** and re-capture to
confirm the evidence is now clean (no error, request succeeds, render is stable). A fix you
didn't watch reproduce-then-pass is not verified — see
[verification-before-completion](../../verification/verification-before-completion/SKILL.md).

---

## Quick reference

```markdown
## Frontend debug checklist

- [ ] Reproduction steps are concrete; app is reachable (right port from config)
- [ ] Symptom classified (Console / Network / Rendering / State)
- [ ] Evidence captured to a temp file; only the summary pulled into context
- [ ] Capture covered: console, uncaught errors, failed requests, responses/timing
- [ ] Traced to origin (sub-file), not the symptom line
- [ ] Fix applied; repro re-run and re-captured clean
```

---

## Anti-patterns

- ❌ Capturing with vague steps ("check the page") — you'll get noise, not evidence.
- ❌ Dumping full console/network logs into context — write them to a file, summarize.
- ❌ Fixing the line the stack trace names without tracing to the origin.
- ❌ Hardcoding a port/URL — read it from the project's config.
- ❌ Debugging against a dead server — verify reachability first.
- ❌ Re-running the same repro after a non-reproduction — refine the steps instead.
- ❌ Filtering out framework warnings — they're often the cheapest lead.

---

## Related skills

- [diagnosing-bugs](../diagnosing-bugs/SKILL.md) — general root-cause method + feedback loops for hard/intermittent bugs.
- [server-operations](../server-operations/SKILL.md) — start/verify dev servers.
- [visual-verification](../../verification/visual-verification/SKILL.md) — visual UI review.
- [verification-before-completion](../../verification/verification-before-completion/SKILL.md) — evidence before "done".
- [wiki/patterns/browser-capture.md](../../../wiki/patterns/browser-capture.md) — the shared browser-drive substrate this skill specializes with a _runtime_ lens.
- [agents/frontend.md](../../../agents/frontend.md) — the domain-specialized utility that wires this skill as its primary.

---

> **Prototype validation.** The capability checklist above was confirmed against Playwright
> (Python) driving Chromium: console messages, uncaught errors (`pageerror`), and failed requests
> (`requestfailed`, with `net::ERR_CONNECTION_REFUSED`) were all captured on distinct channels;
> response/timing requires a completing request. Since Playwright MCP wraps the same engine, an
> agent can produce a full structured report through tool calls alone.
