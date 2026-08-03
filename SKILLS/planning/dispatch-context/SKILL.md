---
name: dispatch-context
description: Engineer the minimal, essential context for within-stage delegation (dispatcher ↔ utility, planner ↔ orchestrator) and park it in an organized, transient lane of the ledger so peers can pick it up without polluting anyone's window. Use when delegating work to a peer agent inside a stage. NOT a cross-stage seam artifact (that is stage-handoff) and NOT self-notes (that is checkpoint).
---

> **Shared primitive:** Compression steps invoke the `meta/context-compression` core primitive.
> See [context-compression](../../meta/context-compression/SKILL.md).

# Dispatch Context

> **Strategy**: ISOLATE + ORGANIZE (within-stage)
> **Purpose**: Give a peer exactly the context it needs — no more, no less — in a known place

This is the **within-stage** context-mover in the [Seam Artifact Protocol](../../../wiki/patterns/seam-artifact-protocol.md)
family. Where [stage-handoff](../../preservation/stage-handoff/SKILL.md) writes a durable seam
artifact **across** a stage boundary and [checkpoint](../../preservation/checkpoint/SKILL.md)
keeps **your own** thread, this skill engineers the context a **peer inside the same stage** needs
— dispatcher → utility, planner ↔ orchestrator.

Modern harnesses already know *how* to spawn a subagent; you do not need to teach them the
mechanics. The value this skill adds is entirely in **what context to pass** and **where to put
it** so the exchange stays clean and organized.

## The within-stage lane

Cross-stage artifacts are registered in the manifest; within-stage payloads are **not** — they
are transient by design. But transient does not mean scattered. Park them in an organized,
**unregistered** lane of the same ledger home:

```text
<ledger-root>/<stage>/<milestone-slug>/
├── findings.md            ← seam artifacts (manifest-registered, cross-stage)
├── ...
└── working/               ← the within-stage lane (NOT manifest-registered)
    └── <dispatch-slug>.md  ← the payload a peer picks up
```

Rules for the `working/` lane:

- **Not** registered in the manifest (only cross-stage seam artifacts are).
- Same substrate as the ledger (resolve via the [communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document)).
- Cleared or ignored once the stage produces its real seam artifact — if within-stage work
  yields something the *next* stage needs, promote it via [stage-handoff](../../preservation/stage-handoff/SKILL.md).
- If the harness has no ledger, an in-conversation payload is fine — the discipline below still applies.

## What to include

Engineer the payload down to what the peer genuinely needs:

**Include**
- Goal in one sentence, plus success criteria the peer can self-check against.
- Only the specific code/artifacts in scope — by path, with the relevant snippet if small.
- Constraints: the rules, patterns, ADRs, or glossary terms that bound the work.
- The return shape you expect back (so integration is cheap).

**Exclude**
- Full conversation history and your internal reasoning.
- Unrelated files, prior failed attempts (unless they inform the task).
- Anything the peer can look up itself from a referenced path.

## Payload template

```markdown
# Dispatch: [one-line goal]

**Stage / milestone:** [stage] / [slug]
**For:** [peer role — e.g. orchestrator, deep, explore]

## Context
[2-3 sentences: what this is, why we're delegating]

## In scope (by path)
- [path] — [why it matters] (+ snippet only if small)

## Constraints
- [rule / pattern / ADR / glossary term]

## Success criteria
- [ ] [verifiable]

## Return shape
[what to report back, and how compact]
```

## Anti-patterns

- ❌ Explaining *how* to call a subagent — the harness handles that
- ❌ Dumping full history or whole files instead of scoped paths + snippets
- ❌ Registering a within-stage payload in the manifest (only cross-stage seam artifacts belong there)
- ❌ Leaving payloads scattered instead of in the `working/` lane
- ❌ Using this to cross a stage seam (promote via [stage-handoff](../../preservation/stage-handoff/SKILL.md))

## Related Skills

- [stage-handoff](../../preservation/stage-handoff/SKILL.md) — cross-stage, formal, manifest-registered
- [checkpoint](../../preservation/checkpoint/SKILL.md) — within-session self-continuity
- [seam-artifact-protocol](../../../wiki/patterns/seam-artifact-protocol.md) — the ledger home this lane lives in
- [task-sizing](../task-sizing/SKILL.md) — decide whether the work is worth delegating at all
- [context-compression](../../meta/context-compression/SKILL.md) — the compression primitive
