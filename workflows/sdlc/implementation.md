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
2. [systematic-debugging](../../SKILLS/implementation/systematic-debugging/SKILL.md) / [diagnose](../../SKILLS/implementation/diagnose/SKILL.md) — when something breaks.
3. [architect-review](../../SKILLS/implementation/architect-review/SKILL.md) — checkpoint on non-trivial design.
4. [server-operations](../../SKILLS/implementation/server-operations/SKILL.md) — start/verify dev servers.
5. [edit-article](../../SKILLS/meta/edit-article/SKILL.md) — write/update documentation as the task progresses.

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

## 5. Shift-left obligation

- Tests are written *with or before* the code (TDD), not after.
- Per-task self-review happens before "done".
- The Verification *phase* confirms the whole; Implementation confirms each unit.
- Documentation is updated per task (consolidated later in [Preservation](preservation.md)).

## 6. Artifacts

- Working, integrated, unit-tested changes per task.
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

Run **every** verification command from the task. Self-review the diff (logic errors,
edge cases, dead code, type-safety gaps, naming). Run the full relevant suite, not just
new tests. **If any criterion fails → fix and re-run all verification. No "done" with a
failing check.**

### Phase 5 — MARK DONE

Only after Phase 4 passes completely: remove debug artifacts, mark the task done, save
evidence.

### Escape hatches

- Stuck > 5 min on an unexpected issue → **STOP**, escalate.
- Blast radius grows beyond task scope → **STOP**, flag scope creep.
- A "must escalate" item is hit → **STOP**, ask the human/Orchestrator.
- A prerequisite task (or architecture change) is incomplete → **STOP**, do not proceed.

## Related

- [Planning](planning.md) — produces the task documents and sizing this phase executes.
- [Verification](verification.md) — confirms the whole once tasks complete.
- [architecture-first](../../wiki/principles/architecture-first.md) — the prerequisite gate the Orchestrator enforces.
</content>
