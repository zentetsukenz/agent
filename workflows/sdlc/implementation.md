---
type: Pattern
title: SDLC — Implementation Phase
description: Policy governing how the Implementation phase performs — an Orchestrator dispatches right-sized tasks to the correct agent class, each executed with vertical-slice TDD
---

# Implementation Phase

> **Bucket:** `implementation/` · **Position:** 4 of 6 · **Stage:** Delivery · **Follows:** [Planning](planning.md) · **Precedes:** [Verification](verification.md)

## 1. Intent

Execute the plan's tasks into working, tested, documented changes — one right-sized task
at a time.

## 2. Gates

**Entry gate**

- A risk-ordered, right-sized task with acceptance criteria and a dispatch-context bundle
  exists.
- Any architecture/constitution prerequisite for the task has **already landed** (see the
  Orchestrator gate below).

**Exit gate**

- Each task's acceptance criteria are met with tests passing.
- The change is integrated with no known regressions left unaddressed.
- Documentation is updated for the task.

## 3. Recommended skills

1. [tdd](../../SKILLS/implementation/tdd/SKILL.md) — the default red-green-refactor loop (when applicable).
2. [diagnosing-bugs](../../SKILLS/implementation/diagnosing-bugs/SKILL.md) — when something breaks.
3. [architect-review](../../SKILLS/implementation/architect-review/SKILL.md) — checkpoint on non-trivial design.
4. [server-operations](../../SKILLS/implementation/server-operations/SKILL.md) — start/verify dev servers.
5. [resolving-merge-conflicts](../../SKILLS/implementation/resolving-merge-conflicts/SKILL.md) — when a commit at a gate hits an in-progress merge/rebase conflict.
6. [edit-article](../../SKILLS/meta/edit-article/SKILL.md) — write/update documentation as the task progresses.

## 4. Agent-effort policy

Per the [Output-Plan Policy](planning.md#output-plan-policy), ~80% of tasks are
small-agent-executable — that is the *point* of good Planning. The ~20% of
high-complexity or architecturally-sensitive tasks escalate to a higher-intelligence
agent, gated by [architect-review](../../SKILLS/implementation/architect-review/SKILL.md).

## The Orchestrator

An **Orchestrator**-class agent runs the whole Implementation loop. Because a small agent
cannot reliably self-assess its own limits ("you don't know what you don't know"), the
Orchestrator — not the executing agent — owns task routing:

- **Gauge** each task's true size against the plan's sizing.
- **Dispatch** each task to the correct implementation-agent class (high / mid / low
  intelligence) to maximize the chance of success. A big task must never land on a small
  coding agent — the failure mode is the agent quietly ruining the surrounding code.
- **Enforce the architecture-prerequisite gate:** do **not** dispatch a code task whose
  prerequisite architecture or constitution change has not yet landed (see
  [architecture-first](../../wiki/principles/architecture-first.md)).
- **Re-route on mis-size:** if a task turns out mis-sized mid-flight, the Orchestrator
  pulls it back and re-dispatches to a more capable class rather than letting the current
  agent push through.
- **Hold the quality gate:** the Orchestrator does not advance to the next slice until the
  current one has passed its **review-and-commit gate** (below) — verified, reviewed, and
  committed. Un-committed green work is not "done"; a failing gate is never advanced past.

## Quality gates

A **quality gate** is a checkpoint the plan places at slice boundaries where verified work
is reviewed and **committed** before the next slice begins. It is the same family as the
Planning [Architecture Gate](planning.md#architecture-gate-mandatory-for-complex-work) and
the [Verification](verification.md) exit gate — a place where work must *prove itself* to
proceed. Each gate has three steps, in order:

### 1. Verify

Run the slice's verification commands (Phase 4 below) **plus the project's
[quality baseline](../../wiki/patterns/quality-baseline.md)** for the aspects the slice's diff
touches — lint, code-quality, security, coverage. They must be green **and** no baseline aspect
may drop below its recorded floor (a ratchet, by default) — no "done" with a failing check or an
eroded metric ([verification-culture](../../wiki/principles/verification-culture.md),
[ADR-017](../../wiki/adr/adr-017-quality-baseline.md)). A baseline breach is a failed gate: fix
and re-run, never commit past it; a breach revealing a deeper design problem escalates like a
Review finding.

### 2. Review (two axes)

Review the slice's diff against a fixed point (`git diff <last-gate>...HEAD`) along **two
axes**, so a green test suite is never mistaken for a good change:

- **Standards** — does the diff follow the repo's documented coding standards (`CONTRIBUTING.md`,
  any `CODING_STANDARDS.md`), and is it free of the common code smells (mysterious names,
  duplicated logic, feature envy, primitive obsession, speculative generality, shotgun surgery)?
  A documented repo standard always overrides the smell baseline.
- **Spec** — does the diff faithfully implement what the originating task / spec / issue asked
  for — no more (no speculative scope), no less (no missing acceptance criteria)?

Findings are fixed **before** the commit, or — if they reveal a deeper problem — escalated:
architectural smell that resists a local fix hands off to
[improve-codebase-architecture](../../SKILLS/design/improve-codebase-architecture/SKILL.md);
a spec gap loops back to [Planning](planning.md).

### 3. Commit

Once verify **and** review are green, **commit the slice** before continuing, per
[commit-often](../../wiki/principles/commit-often.md). The message names what the slice
delivers and notes the review outcome. This commit is the reversible restore point the next
slice builds on, and — at the final gate — the one the Delivery seam artifact references.

**Gate cadence is planned, not improvised.** The plan (see
[Planning §review-gate cadence](planning.md#review-gate-cadence)) marks which task boundaries
are gates; the Orchestrator enforces them. Trivial single-slice work has one gate at the end;
multi-slice work gates at each tracer-bullet boundary.

## 5. Shift-left obligation

- Tests are written *with or before* the code (TDD), not after.
- Per-task self-review happens before "done" — formalized as the review step of the
  [quality gate](#quality-gates).
- The Verification *phase* confirms the whole; Implementation confirms each unit and
  **commits it behind a green gate** ([commit-often](../../wiki/principles/commit-often.md)).
- Documentation is updated per task (consolidated later in [Preservation](preservation.md)).

## 6. Artifacts

- Working, integrated, unit-tested changes per task, **each committed behind a green quality gate**.
- A small, reversible, reviewed commit per slice (not one end-of-phase drop).
- Updated docs.
- Any reusable pattern worth capturing, flagged for Preservation.
- Saved verification evidence per task.

---

## Operational DNA — task execution

Each dispatched task runs through five phases. Do not skip Orient/Scout to "save time".

### Phase 1 — ORIENT

Read the task file completely; read every file in "Context to Load" and every "Exemplar".
Identify the single objective. **Check prerequisites — if any incomplete (including an
un-landed architecture change), STOP and report.** If blast radius exceeds the files
listed, flag before proceeding.

### Phase 2 — SCOUT

Recon before implementing. Find existing patterns (match them, don't invent). Read
callers/consumers of code you'll touch. Detect traps: circular deps, implicit contracts,
hidden side effects, stale types. If the riskiest assumption is untested, write a
throwaway spike (≤10 min, delete after).

### Phase 3 — IMPLEMENT (vertical-slice TDD)

**One test → one implementation → repeat. Never write all tests first.**

```text
RED → GREEN: test1 → impl1
RED → GREEN: test2 → impl2
RED → GREEN: test3 → impl3
```

Tests written in bulk test *imagined* behavior; tests written after seeing each slice test
*actual* behavior. Write minimal code to pass the current test. Refactor only when GREEN —
never while RED. Test **what**, not **how**: assert observable outcomes, mock only at
system boundaries (external APIs, DB, time/randomness), never internal collaborators.

### Phase 4 — VERIFY

Run **every** verification command from the task, **plus the project's
[quality baseline](../../wiki/patterns/quality-baseline.md)** (lint, code-quality, security,
coverage) for the aspects this slice touches. Self-review the diff (logic errors, edge cases,
dead code, type-safety gaps, naming). Run the full relevant suite, not just new tests. **If any
criterion fails, or any baseline aspect drops below its floor → fix and re-run all verification.
No "done" with a failing check or an eroded metric.** This is step 1 (Verify) of the slice's
[quality gate](#quality-gates).

### Phase 5 — REVIEW, COMMIT, MARK DONE

Only after Phase 4 passes completely, run the rest of the [quality gate](#quality-gates):

1. **Review** the slice diff on both axes — **Standards** (repo conventions + code-smell
   baseline) and **Spec** (matches the task's acceptance criteria, nothing more). Fix findings
   before committing; escalate an architectural smell to
   [improve-codebase-architecture](../../SKILLS/design/improve-codebase-architecture/SKILL.md)
   or a spec gap back to [Planning](planning.md).
2. **Commit** the slice before continuing, per
   [commit-often](../../wiki/principles/commit-often.md) — message names what it delivers and
   the review outcome. If the commit hits an in-progress merge/rebase conflict, resolve it with
   [resolving-merge-conflicts](../../SKILLS/implementation/resolving-merge-conflicts/SKILL.md).
3. Remove debug artifacts, mark the task done, and save evidence.

### Escape hatches

- Stuck > 5 min on an unexpected issue → **STOP**, escalate.
- Blast radius grows beyond task scope → **STOP**, flag scope creep.
- A "must escalate" item is hit → **STOP**, ask the human/Orchestrator.
- A prerequisite task (or architecture change) is incomplete → **STOP**, do not proceed.

## Related

- [Planning](planning.md) — produces the task documents, sizing, and review-gate cadence this phase executes.
- [Verification](verification.md) — confirms the whole once tasks complete; its exit is the final quality gate.
- [architecture-first](../../wiki/principles/architecture-first.md) — the prerequisite gate the Orchestrator enforces.
- [commit-often](../../wiki/principles/commit-often.md) — the principle behind the review-and-commit gate.
- [verification-culture](../../wiki/principles/verification-culture.md) — the evidence-before-done gate the review step builds on.
- [quality-baseline](../../wiki/patterns/quality-baseline.md) — the four-aspect floor the gate's Verify step re-checks every slice.
- [adr-016-embedded-review-gate](../../wiki/adr/adr-016-embedded-review-gate.md) — the decision to embed code-review as a gate instead of a standalone skill.
- [adr-017-quality-baseline](../../wiki/adr/adr-017-quality-baseline.md) — the decision that gives the gate a standing quality floor.
</content>
