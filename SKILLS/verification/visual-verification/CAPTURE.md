# Capture Contract & Deterministic Recipe

> The generic browser-drive moves (discover the URL from config, choose Playwright/Chrome
> DevTools MCP, isolate/capture, stabilize) live in the shared
> [wiki/patterns/browser-capture.md](../../../wiki/patterns/browser-capture.md). This file adds the
> *pixels lens* on top: the vision + isolation contract and the visual-specific instruction
> examples. The runtime-debug skill adds its own lens to the same substrate.

## The capability contract

The capture mechanism is your choice — the `visual-qa` subagent, a browser-automation MCP, a
scoped sub-conversation, whatever the environment provides. It just has to deliver:

- [ ] **Isolation** — screenshot/image bytes are captured and analyzed in a context that is
      discarded, never surfaced to the orchestrator. Only a text report crosses back.
- [ ] **Vision capability** — the model doing the pixel-level looking must actually support
      vision. This is not guaranteed by default — confirm it, don't assume it. (Spike finding:
      some orchestrator/subagent models cannot see images at all; dispatching a screenshot-review
      task to one silently produces a report describing nothing real. Pin a vision-capable model
      on the capturing mechanism — see [agents/visual-qa.md](../../../agents/visual-qa.md).)
- [ ] **Deterministic setup** — navigates to an exact URL, sets an exact viewport, and performs
      the exact interactions specified (not "the settings page", not "roughly logged in").
- [ ] **Stabilization before capture** — see recipe below. An unstabilized capture produces false
      diffs and flaky reports.
- [ ] **Structured text output** — a report shaped like [MODES.md](MODES.md)'s templates, not a
      free-form paragraph and not the image itself.

Any mechanism satisfying all five is a valid adapter. Don't couple the skill's judgment (what to
check, how to scope, how to report) to one specific tool.

## Deterministic capture recipe

Non-determinism is the main source of false positives in visual checks. Before capturing:

1. **Exact URL** — full path + relevant query/params, discovered from project config
   (`vite.config`, `next.config`, `package.json` scripts, `.env`, compose files). Never assume a
   port.
2. **Exact viewport** — set explicitly; don't rely on whatever the browser window happens to be.
   Common sizes: mobile ~375×667, tablet ~768×1024, desktop ~1280×800.
3. **Wait for fonts to load** — web fonts swapping in mid-capture shifts text metrics and produces
   spurious layout diffs.
4. **Wait for network-idle** — capturing mid-fetch shows loading skeletons instead of real
   content, unless the loading state is specifically what's under test.
5. **Freeze or wait out animations/transitions** — a mid-transition capture is not a stable state;
   either wait for the transition to finish or disable animations for the capture.
6. **Seed deterministic data** — if the view depends on data (dates, random IDs, live timestamps),
   seed or mock it so repeated captures are comparable. A "changed" screenshot that's actually just
   today's date is a wasted report.
7. **Repeat interactions exactly** — for baseline-regression mode, the steps to reach the state
   must match the steps used to capture the original baseline, or the comparison is meaningless.

## Instruction examples

#### Basic exploratory check

```
Navigate to <discovered URL> and analyze the current UI state.
Report any visual issues, layout problems, or polish concerns.
```

#### With authentication

```
Navigate to <discovered URL>
Login with: <credentials from project seed/fixtures, not invented>
Wait for network idle, then check the dashboard.
Focus: layout, spacing, component states.
```

#### With interactions

```
Navigate to <discovered URL>/endpoints
Click "Create New"
Wait for the form to render and animations to settle.
Check: field layout, label alignment, button placement.
```

#### Mobile viewport

```
Navigate to <discovered URL>
Set viewport to 375x667
Check: does navigation collapse correctly, does content stack without overlap,
are touch targets at least ~44x44px?
```

#### Specific focus area

```
Navigate to <discovered URL>/tests
Focus specifically on:
1. Table column alignment
2. Status badge color consistency
3. Action button spacing
Report only on these three items.
```

## Screenshot budget

Max 5 screenshots per dispatch (see [SKILL.md](SKILL.md)) — this exists to keep the *capturing*
mechanism's own context from overflowing, independent of the isolation from the orchestrator.
