---
type: ADR
title: Context-passing is three named lanes over one ledger home — rename handoff to stage-handoff, add an unregistered within-stage lane
status: Accepted
timestamp: 2026-08-03T00:00:00Z
tags: [handoff, seam, artifact, ledger, checkpoint, dispatch-context, communication, multi-agent, sdlc, loom]
---

# ADR-015: Communication-line refinement

## Context

[ADR-011](adr-011-seam-artifact-protocol.md) consolidated three shallow context-movers
(`handoff`, `session-bootstrap`, `dispatch-context`) behind one deep contract — the
[Seam Artifact Protocol](../patterns/seam-artifact-protocol.md): a namespaced, manifest-indexed
ledger. That decision fixed *where the cross-stage baton lives*. Two rough edges remained:

1. **The name `handoff` was ambiguous.** It read as a generic "summarize the session" action, so
   it collided conceptually with `checkpoint` (also "write a summary"). Their SKILL bodies had in
   fact drifted into near-duplicates — the same trigger table, the same template — even though one
   is a *formal cross-stage seam artifact* and the other is *informal within-session self-notes*.
   A reader could not tell from the name which to reach for.

2. **Within-stage traffic had no organized home.** ADR-011 deliberately made within-stage
   passing (dispatcher ↔ utility, planner ↔ orchestrator) *advisory and ephemeral*. In practice
   that meant it was **unstructured** — `dispatch-context` also carried obsolete "how to spawn a
   subagent" mechanics that modern harnesses already handle, obscuring its real value (deciding
   *what* context to pass). A multi-agent workflow passes context between peers constantly; that
   exchange deserves an organized place, even if it stays transient.

A proposal to **split** `handoff` into per-seam skills (`handoff-planning`, `handoff-closing`)
was considered and rejected — see below.

## Decision

Treat context-passing as **three named lanes over the one ledger home** ADR-011 established,
distinguished by scope × recipient × lifetime. Keep three skills; sharpen each to one lane.

1. **Rename `handoff` → `stage-handoff`; keep stage as a runtime parameter.** The skill is the
   **PRODUCE** adapter for the *cross-stage* seam only. Its identity is now unambiguous in its
   name: it fires on **ownership change** at a stage seam, is **mandatory** there, and writes a
   manifest-registered artifact for the *next stage's* agent.

2. **`checkpoint` becomes the informal within-session lane.** It is selective **decision→result
   journalling** into the **memory system** (not a committed file), producing a traceable trail —
   a session-scale wayfinder map — so a run can compress fearlessly. Best fit: utility agents
   (`quick`, `deep`) driving toward a goal. It is explicitly *not* a cross-stage artifact.

3. **`dispatch-context` becomes the organized within-stage lane.** Drop the obsolete
   subagent-invocation mechanics. Add an **unregistered `working/` lane** inside the same ledger
   namespace (`<ledger-root>/<stage>/<milestone>/working/`) where peers park transient payloads.
   Only cross-stage seam artifacts are manifest-registered; within-stage payloads are not. If
   within-stage work yields something the next stage needs, it is **promoted** via `stage-handoff`.

The three lanes:

| Skill | Scope | Recipient | Lifetime | Registered? |
|---|---|---|---|---|
| `checkpoint` | within-session | your future self | informal, in memory | no |
| `dispatch-context` | within-stage | a peer (dispatcher ↔ utility) | transient, organized | no |
| `stage-handoff` | cross-stage | the next stage's owner | durable | **yes (manifest)** |

## Considered options

| Option | Verdict |
|---|---|
| **Split `handoff` into `handoff-planning` + `handoff-closing`** | Rejected — ADR-011 made *stage* a parameter of one deep module (`<ledger-root>/<stage>/`). Two skills differing only by a stage string **re-shallows** it (fails the deletion test: deleting one just moves complexity). The real problem was the *name*, not the module count. |
| **Merge `checkpoint` into `stage-handoff` (one skill, lightweight mode)** | Rejected — loses the "works without the full protocol" fallback; conflates ownership-change (formal) with context-pressure (informal), the exact ambiguity we're removing. |
| **Leave within-stage passing fully unstructured (ADR-011 status quo)** | Rejected — a multi-agent workflow passes peer context constantly; scattering it wastes the ledger home already available. |
| **Register within-stage payloads in the manifest too** | Rejected — manifest is for discoverable cross-stage batons; registering transient payloads pollutes discovery and blurs the seam. |
| **Rename to `stage-handoff` + informal `checkpoint` lane + organized-but-unregistered within-stage lane** | **Chosen** — three unambiguous lanes, one ledger home; ceremony proportional to scope. |

## Consequences

- `SKILLS/preservation/handoff/` → `SKILLS/preservation/stage-handoff/` (name field + folder).
  Its body drops the copied context-pressure trigger table (that belongs to `checkpoint`) and
  states its cross-stage, ownership-change identity.
- `checkpoint` and `dispatch-context` SKILL bodies are rewritten to their lanes (see decision).
- The [Seam Artifact Protocol](../patterns/seam-artifact-protocol.md) pattern gains the `working/`
  within-stage lane in its namespace diagram and notes the three-lane framing; it now names the
  PRODUCE adapter `stage-handoff`.
- **The communication protocol substrate, manifest contract, and adapters are unchanged.** The
  `.loom/handoffs/` ledger path, the Mirai `handoffs:` frontmatter primitive, and
  `handoff.instructions.md` are protocol/harness mechanics — *not* the renamed skill — so they
  keep their names. Only skill references to `preservation/handoff` are repointed to
  `preservation/stage-handoff`.
- This ADR **amends** ADR-011; ADR-011 stays Accepted (the consolidation still holds — this
  refines naming and adds the within-stage lane).

## Related

- [ADR-011](adr-011-seam-artifact-protocol.md) — the protocol this ADR refines.
- [wiki/patterns/seam-artifact-protocol.md](../patterns/seam-artifact-protocol.md) — updated with the within-stage lane.
- [wiki/patterns/deep-modules.md](../patterns/deep-modules.md) — the deletion test behind rejecting the per-seam split.
- [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md), [checkpoint](../../SKILLS/preservation/checkpoint/SKILL.md), [dispatch-context](../../SKILLS/planning/dispatch-context/SKILL.md) — the three refined lanes.
