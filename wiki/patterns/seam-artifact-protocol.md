---
type: Pattern
title: Seam Artifact Protocol
description: A single deep contract for handing context across stage seams — a producing agent writes a namespaced, manifest-indexed seam artifact to a ledger, and the receiving agent discovers and loads it. Consolidates handoff, session-bootstrap, and dispatch-context behind one interface.
tags: [handoff, seam, artifact, ledger, multi-agent, communication, sdlc, persist, loom]
timestamp: 2026-07-30T00:00:00Z
---

# Seam Artifact Protocol

> **Applied vocabulary:** see the glossary for [Seam artifact](../glossary/index.md#seam-artifact),
> [Ledger](../glossary/index.md#ledger), [Communication protocol document](../glossary/index.md#communication-protocol-document),
> [Stage](../glossary/index.md#stage), and [Capability](../glossary/index.md#capability). This page is the
> conceptual reference; [ADR-011](../adr/adr-011-seam-artifact-protocol.md) records the decision to adopt it.

## The problem

A multi-agent SDLC only pays off if context survives the moment ownership changes hands. The
[SDLC workflow](../../workflows/sdlc/index.md) already names a **seam artifact** at every stage
boundary — "a milestone with design docs", "a shipped verified change", "durable knowledge" —
but historically that artifact was *named yet never located*. Three separate, shallow modules
moved context, each with its own mechanism and no shared contract:

- `preservation/handoff` wrote to a flat, un-namespaced `.omo/handoffs/` directory,
- `discovery/session-bootstrap` read a single `CHECKPOINT.md`,
- `planning/dispatch-context` engineered an in-memory subagent payload.

Nothing bound **produce → persist → discover**. A Shaping agent could research and design a
solution, but the Planner that took over had no defined place to *find* the findings — it
assumed they lived in the conversation. When the conversation reset, the baton dropped.

## Core idea

**Handoff is a seam contract triggered by ownership change — not a housekeeping task triggered
by context pressure.** One deep module replaces the three shallow movers: a producing agent
writes a **seam artifact** to a well-known, namespaced **ledger** and registers it in a
**manifest**; the receiving agent reads the manifest and loads the latest artifact for its seam.
The three former movers become thin adapters over this one interface.

```text
┌─ producing agent ─┐     writes            ┌─ ledger ────────────────┐     reads      ┌─ receiving agent ─┐
│ (exit gate)       │ ───────────────────▶  │ <root>/<stage>/         │ ─────────────▶ │ (entry gate)      │
│ PRODUCE obligation│                        │   <milestone>/*.md      │                │ DISCOVER obligation│
└───────────────────┘                        │ <root>/index.md (manifest)│              └───────────────────┘
                                             └─────────────────────────┘
```

## The contract

### 1. The ledger and its namespace

The ledger is the durable store for seam artifacts. Its **root** is resolved through the
[`persist`](role-scoped-capabilities.md) capability, so the abstract protocol stays
harness-agnostic and each [adapter](../glossary/index.md#adapter) points it at a concrete
substrate (see [Substrate is an adapter choice](#substrate-is-an-adapter-choice)).

Artifacts are addressed by **stage + milestone slug**:

```text
<ledger-root>/
├── index.md                          ← the manifest (see §3)
├── shaping/
│   └── <milestone-slug>/
│       ├── findings.md               ← research + evidence backing each resolved unknown
│       ├── domain-model.md           ← or a link to where it already lives
│       └── design-decisions.md       ← interfaces, ADR references
├── delivery/
│   └── <milestone-slug>/
│       ├── verified-change.md        ← what shipped, acceptance evidence, links to PRs/commits
│       └── working/                  ← within-stage lane (NOT manifest-registered — see below)
└── closing/
    └── <milestone-slug>/
        └── knowledge.md              ← durable learnings, links to wiki entries
```

The milestone slug is human-readable (`add-oauth-login`, not a timestamp), so the namespace
doubles as a browsable index of the project's work.

### Three lanes over one home

Per [ADR-015](../adr/adr-015-communication-line-refinement.md), context-passing is **three named
lanes** over this one ledger home, distinguished by scope × recipient × lifetime:

| Lane | Skill | Scope | Registered in manifest? |
|---|---|---|---|
| Cross-stage baton | [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md) | ownership changes hands at a seam | **yes** |
| Within-stage payload | [dispatch-context](../../SKILLS/planning/dispatch-context/SKILL.md) | peer ↔ peer inside a stage (`working/`) | no — transient |
| Within-session trail | [checkpoint](../../SKILLS/preservation/checkpoint/SKILL.md) | an agent's own thread, in the memory system | no |

Only the **cross-stage** lane is a manifest-registered seam artifact. The `working/` lane holds
transient within-stage payloads; if within-stage work yields something the *next* stage needs, it
is **promoted** to a seam artifact via `stage-handoff`.

### 2. Produce on exit, discover on entry — at stage seams

The protocol binds to the **three stage seams** — the points where ownership actually changes
hands. It is a **gate obligation** there, not a nudge:

| Seam | Producing side (PRODUCE @ exit gate) | Receiving side (DISCOVER @ entry gate) |
|---|---|---|
| **Shaping → Delivery** | Shaping writes `shaping/<milestone>/` (findings, domain model or link, design decisions) | Planning reads it as the shaped-solution input |
| **Delivery → Closing** | Verification writes `delivery/<milestone>/verified-change.md` (evidence) | Preservation reads it to know what to curate |

Within a stage (phase-to-phase, or dispatcher → utility), handoff is **advisory** — use it when
context is heavy, but no gate blocks on it. Cross-stage, it is **mandatory**: a stage's exit gate
is not satisfied until its seam artifact is written and registered.

> **Do not duplicate.** A seam artifact references PRDs, plans, ADRs, issues, commits, and diffs
> by path or URL — it never re-embeds them. It carries the *connective tissue* the next agent needs
> to find and trust those artifacts, not a copy of them. This is the same discipline the
> [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md) skill has always enforced, now scoped to a seam.

### 3. The manifest — how discovery closes the loop

Discovery is explicit, not a fragile glob. Every produce step appends or updates a row in the
ledger manifest at `<ledger-root>/index.md`, so the receiving agent has exactly one place to look:

```markdown
# Handoff Ledger

| Milestone | Stage | Artifact | Status | Updated |
|---|---|---|---|---|
| add-oauth-login | shaping | shaping/add-oauth-login/ | ready-for-delivery | 2026-07-30 |
| add-oauth-login | delivery | delivery/add-oauth-login/verified-change.md | shipped | 2026-07-31 |
```

`Status` names where the baton is (`in-progress`, `ready-for-delivery`, `shipped`, `preserved`);
**latest row for a milestone wins**. The receiving agent reads the manifest, finds the newest
`ready-for-*` row for the milestone it was asked to work on, and loads only that artifact — keeping
the [session-bootstrap](../../SKILLS/discovery/session-bootstrap/SKILL.md) "start at <10% context"
budget intact.

### 4. The communication protocol document

Every project that adopts loom gets a **dedicated, standalone communication protocol document**
that states — for *that project* — where the ledger lives, the namespace convention, and each
stage's expected artifacts. It is separate from per-project context (`AGENTS.md`) and from any
single agent or skill: it is the shared contract they all point at. Agents and skills that
participate in handoff **must reference it** rather than re-deriving the convention. Each adapter
concretizes it in the harness's native "always-available, on-demand" form (for Mirai, a
description-triggered [file instruction](../environments/mirai.md#2-file-instructions)).

## Substrate is an adapter choice

The protocol names an abstract ledger; the **substrate** — where bytes actually land — is chosen
per project at setup and is changeable later, because the trade-off is real and local:

| Substrate | Trade-off |
|---|---|
| **Harness memory** (e.g. Mirai repo memory `/memories/repo/loom/…`) | Survives across conversations, fast agent discovery — but not git-committed, so invisible to teammates and PRs. |
| **Committed repo folder** (e.g. `.loom/handoffs/…`) | Harness-neutral, reviewable in PRs, diffable — but adds files to the tree. |
| **Both** | Durable committed artifacts + a lightweight manifest pointer in memory for fast discovery. |

The choice is made in the [setup interview](../../adapters/mirai/references/interview.md) and can
be revised by re-running the guided `update`. The [`persist`](role-scoped-capabilities.md)
capability resolver decides the concrete tool/path; the protocol never hardcodes it.

## Why this is a deep module

Applying the [deletion test](deep-modules.md): deleting the protocol would scatter the
"where does the baton live and how is it named?" decision back across three skills and every
agent, re-introducing the drift it removes. It **concentrates** that complexity behind one small
interface (write-to-namespace, register-in-manifest, read-from-manifest). The three former movers
keep their distinct *strategies* — `stage-handoff` COMPRESSES, `session-bootstrap` SELECTS,
`dispatch-context` ISOLATES — but now share one *location and naming contract*, so an agent never
has to bounce between modules to answer "where is the handoff?"

## Related

- [ADR-011](../adr/adr-011-seam-artifact-protocol.md) — the decision record for this protocol.
- [ADR-015](../adr/adr-015-communication-line-refinement.md) — refines this into three named lanes; renames the PRODUCE adapter to `stage-handoff`.
- [Deep Modules](deep-modules.md) — the depth principle this consolidation applies.
- [Role-Scoped Capabilities](role-scoped-capabilities.md) — `persist` is the capability that resolves the substrate.
- [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md) — the PRODUCE adapter (writes a seam artifact).
- [session-bootstrap](../../SKILLS/discovery/session-bootstrap/SKILL.md) — the DISCOVER adapter (reads the manifest).
- [dispatch-context](../../SKILLS/planning/dispatch-context/SKILL.md) — within-stage ISOLATE dispatch, aware of the protocol.
- [SDLC workflow](../../workflows/sdlc/index.md) — the stages and seam artifacts this protocol locates.
