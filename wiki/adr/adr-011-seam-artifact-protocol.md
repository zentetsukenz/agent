---
type: ADR
title: Seam artifacts cross stage boundaries through a namespaced, manifest-indexed ledger
status: Accepted
timestamp: 2026-07-30T00:00:00Z
tags: [handoff, seam, artifact, ledger, communication, multi-agent, sdlc, persist, mirai, loom]
---

# ADR-011: Seam Artifact Protocol

## Context

loom's [SDLC workflow](../../workflows/sdlc/index.md) is deliberately multi-agent: the three
stages (Shaping, Delivery, Closing) mark the seams where **ownership changes hands**, and each
seam names a **seam artifact** that is supposed to cross it. But the workflow only *named* those
artifacts — it never *located* them. Three separate, shallow modules moved context, each with its
own mechanism and no shared contract:

- `handoff` (now [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md), renamed in
  [ADR-015](adr-015-communication-line-refinement.md)) wrote to a flat, un-namespaced
  `.omo/handoffs/` directory (a stale path from an earlier harness), triggered by *context
  pressure* rather than by a seam;
- [session-bootstrap](../../SKILLS/discovery/session-bootstrap/SKILL.md) read a single
  `CHECKPOINT.md`;
- [dispatch-context](../../SKILLS/planning/dispatch-context/SKILL.md) engineered an in-memory
  subagent payload.

Nothing bound **produce → persist → discover**. The canonical failure: a Shaping agent researches
and designs a solution, but the Planner that takes over has no defined place to *find* the
findings — it assumes they're in the conversation. When the conversation resets (a new session, a
different agent), the baton drops. For a multi-agent workflow this is not a nicety; it is the seam
where the whole model leaks.

## Decision

Adopt a single **Seam Artifact Protocol** (see
[wiki/patterns/seam-artifact-protocol.md](../patterns/seam-artifact-protocol.md)) — one deep
contract that the three shallow movers become thin adapters over:

1. **A ledger with a stage+milestone namespace.** Seam artifacts live at
   `<ledger-root>/<stage>/<milestone-slug>/*.md`. The root resolves through the
   [`persist`](../patterns/role-scoped-capabilities.md) capability, so the protocol stays
   harness-agnostic.
2. **Produce on exit, discover on entry — mandatory at stage seams only.** Writing and
   registering the seam artifact is part of a **stage's exit gate**; discovering it is part of
   the next **stage's entry gate**. Within a stage (phase-to-phase, dispatcher → utility),
   handoff stays **advisory**. This keeps ceremony proportional: gates only at the boundaries
   where ownership actually changes.
3. **A manifest closes the discovery loop.** Every produce step registers a row in
   `<ledger-root>/index.md` (milestone, stage, artifact, status, updated); the receiving agent
   reads the manifest — latest row wins — instead of globbing. Explicit discovery, not a fragile
   convention.
4. **A dedicated communication protocol document.** Each project gets a standalone document
   stating where its ledger lives, the namespace convention, and each stage's expected artifacts —
   separate from `AGENTS.md` (per-project context) and from any single agent/skill. Participating
   agents and skills **reference** it rather than re-deriving the convention.
5. **Substrate is a setup-interview choice, changeable via `update`.** The concrete store
   (harness memory / committed repo folder / both) is chosen per project because the trade-off
   (durability & speed vs. reviewability in PRs) is real and local. The adapter's `persist`
   resolver, not the protocol, decides the concrete path.

## Considered options

| Option | Verdict |
|---|---|
| **Status quo** — three independent movers, no shared location | Rejected — the baton drops at seams; "where is the handoff?" has three different answers. |
| **Trigger handoff on context-% only** (keep it a housekeeping task) | Rejected — context pressure is orthogonal to ownership change; the seam still has no defined artifact location. |
| **Mandatory handoff at every phase boundary (all 6)** | Rejected — ceremony out of proportion; within-stage phases share an owner, so the seam artifact adds friction without a real handoff. |
| **Hardcode the ledger in a committed folder** | Rejected — some teams want cross-conversation memory speed; harness-neutral committing is a *choice*, not a universal. |
| **Namespaced ledger + manifest, mandatory at stage seams, substrate chosen at setup** | **Chosen** — one deep contract; discovery is explicit; ceremony proportional; substrate trade-off left to the project. |

## Consequences

- `handoff` becomes the **PRODUCE** adapter (writes to the ledger namespace, registers in the
  manifest; the stale `.omo/` path is retired). `session-bootstrap` becomes the **DISCOVER**
  adapter (reads the manifest, loads the latest seam artifact). `dispatch-context` references the
  protocol for within-stage ISOLATE dispatch. Each keeps its distinct *strategy* (COMPRESS /
  SELECT / ISOLATE) but shares one *location and naming contract*.
- The SDLC phase files gain explicit gate language: Shaping/Design **produces** the seam artifact
  at its exit; Planning **discovers** it at its entry; Verification **produces** the Delivery seam
  artifact; Preservation **discovers** it.
- The Mirai adapter gains an interview table (substrate + namespace + per-stage docs), emits the
  communication protocol document as a description-triggered file instruction, seeds the ledger
  manifest, and wires `handoffs:`/`persist` between stage agents.
- Slightly more up-front artifact writing at each stage seam; accepted as the cost of a
  multi-agent workflow whose context actually survives the handoff.

## Related

- [wiki/patterns/seam-artifact-protocol.md](../patterns/seam-artifact-protocol.md) — the contract this ADR adopts.
- [ADR-006](adr-006-capability-based-roles.md) — `persist` is the capability that resolves the ledger substrate.
- [ADR-008](adr-008-delivery-dispatchers.md) — the Planner's "read Design + findings" input is exactly a discovered seam artifact.
- [workflows/sdlc/index.md](../../workflows/sdlc/index.md) — the stages and seam artifacts this protocol locates.
- [wiki/patterns/deep-modules.md](../patterns/deep-modules.md) — the depth principle behind consolidating three movers into one.
