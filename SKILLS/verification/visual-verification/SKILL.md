---
name: visual-verification
description: Verify frontend UI/UX changes visually — layout, spacing, typography, contrast, responsive behavior, component states, and design conformance — by delegating capture and pixel-level analysis to an isolated mechanism, keeping image bytes out of the main context. Use before claiming UI work is complete, when debugging a visual issue code inspection can't explain, or when checking a change against a design spec or prior baseline.
---

# Visual Verification

> **Strategy**: ISOLATE
> **Purpose**: Verify frontend UI/UX is correct without letting screenshot bytes enter your context

This is the frontend specialization for _what does it look like_. For _why does it misbehave_
(console errors, failed requests, render loops, stale state) — that's a different question, answered by
[frontend-runtime-debugging](../../implementation/frontend-runtime-debugging/SKILL.md).

---

## ⚠️ CRITICAL: Never Take Screenshots Directly Into Your Context

Screenshots are expensive (~100KB–1.5MB each) and WILL overflow your context. Worse: **most
orchestrator models cannot see images at all** — if yours can't, a screenshot in your context is
dead weight, not evidence.

**The solution: capture and pixel-analysis happen in an isolated mechanism that returns ONLY
structured text (~500 tokens) to you.**

The mechanism is your choice — see [CAPTURE.md](CAPTURE.md) for the capability contract any of
these must satisfy:

- The `visual-qa` subagent (reference implementation: [agents/visual-qa.md](../../../agents/visual-qa.md)) — run via `runSubagent`.
- A vision-capable tool call inside a scoped sub-conversation.
- Any browser-automation MCP (Chrome DevTools, Playwright) driven from a context you discard after
  extracting the text report.

Whichever you pick, **you never look at the raw image** — only the text report crosses back into
your working context.

---

## Trigger

Use this skill when:

- UI changes need visual verification (layout, styling, responsiveness, polish).
- Debugging a visual issue you can't understand from code alone.
- Checking a change against a design spec/mockup, or against a prior known-good baseline.
- Before claiming UI work is "done".

**NOT for:**

- After every small CSS tweak (wasteful — batch checks at meaningful checkpoints).
- Non-visual changes (use code inspection).
- Functional/runtime failures with no visual symptom → [frontend-runtime-debugging](../../implementation/frontend-runtime-debugging/SKILL.md).
- When you can verify via reading component code alone.

---

## Input

Before dispatching, determine:

- [ ] **URL(s)** — discovered from project config (`vite.config`, `next.config`,
      `package.json` scripts, `.env`, compose files), never assumed/hardcoded.
- [ ] **Interactions needed** — auth, seed data, clicks, form fills, state to reach.
- [ ] **Mode** — exploratory, baseline-regression, or spec-conformance (see [MODES.md](MODES.md)).
- [ ] **Dimensions to check** — which of the categories in [DIMENSIONS.md](DIMENSIONS.md) matter
      for this change (don't check all of them by default — scope to what changed).
- [ ] **Viewport(s)** — desktop, mobile, tablet; specify explicitly when responsive matters.

---

## Procedure

### 1. Scope the check

Pick the mode (exploratory / baseline-regression / spec-conformance) and the dimensions from
[DIMENSIONS.md](DIMENSIONS.md) relevant to what changed. Scoping is what keeps this skill from
being "screenshot everything and hope" — a targeted 2-screenshot check beats an unfocused 5.

### 2. Dispatch to an isolated mechanism

Construct instructions that are concrete, not vague. Include: URL(s), viewport(s),
interactions/setup, the mode, and the specific dimensions to focus on. See
[CAPTURE.md](CAPTURE.md) for the full capability contract, stabilization steps (fonts loaded,
network idle, animations frozen — non-deterministic captures produce false diffs), and
instruction examples (basic, authenticated, interaction-based, mobile viewport, focused-area).

Example shape (mechanism-agnostic):

```
Navigate to <discovered URL>
Set viewport to <size>
<interactions/setup, if any>
Mode: <exploratory | baseline-regression | spec-conformance>
Check: <specific dimensions — e.g. "table column alignment, status badge color consistency">
Report as structured text only — never return image bytes.
```

### 3. Receive and act on the report

The mechanism returns a structured text report (~500 tokens) — see [MODES.md](MODES.md) for the
exact report shape per mode. Fix issues found; re-dispatch only the affected view to confirm,
rather than re-checking everything.

---

## Output

- Text description of UI state (~500 tokens) — never raw image bytes.
- List of visual issues found, scoped to the dimensions checked.
- Priority-ordered recommendations.

---

## Screenshot Budget: Maximum 5 Per Dispatch

To prevent context overflow inside the isolated mechanism itself:

**Hard limit: 5 screenshots maximum per dispatch.**

```
✅ Good: "Check homepage, endpoints page, and test results" (3 screenshots)
✅ Good: "Verify desktop and mobile views of dashboard" (2 screenshots)
❌ Bad: "Check all 10 pages of the application" (exceeds limit)
```

If more than 5 views are needed: split into multiple dispatches, prioritize the most critical
views first, and group related views per dispatch.

---

## Strategic Pattern

```
Code change
    ↓
Is this visual?  → NO  → Verify via tests/code
    ↓ YES
Is it a meaningful visual change (not a 1px tweak)?  → NO → Trust the code, skip
    ↓ YES
Scope: mode + dimensions + viewport(s)
    ↓
Dispatch to isolated mechanism (CAPTURE.md contract)
    ↓
Receive text report
    ↓
Fix issues if any → re-dispatch only the affected view
    ↓
Continue with clean context
```

---

## Anti-patterns

- ❌ Taking screenshots directly into your own context.
- ❌ Dispatching after every tiny CSS change.
- ❌ Vague instructions ("check if it looks good") instead of named dimensions.
- ❌ Requesting more than 5 screenshots per dispatch.
- ❌ Not specifying viewport when responsive behavior is in question.
- ❌ Hardcoding a dev-server URL/port instead of discovering it from project config.
- ❌ Skipping stabilization (fonts/animations/network) — produces flaky, non-reproducible diffs.

---

## Related

- [DIMENSIONS.md](DIMENSIONS.md) — what to check: the full verification-dimension taxonomy.
- [CAPTURE.md](CAPTURE.md) — the capability contract any capture mechanism must satisfy, plus deterministic-capture recipe and instruction examples.
- [MODES.md](MODES.md) — exploratory vs. baseline-regression vs. spec-conformance, with report shapes.
- [agents/visual-qa.md](../../../agents/visual-qa.md) — reference agent implementing the capture contract.
- [verification-before-completion](../verification-before-completion/SKILL.md) — full verification checklist (Phase 6 dispatches here).
- [frontend-runtime-debugging](../../implementation/frontend-runtime-debugging/SKILL.md) — debug frontend runtime _failures_ (console/network/rendering/state), not visual polish.
