---
type: Log
title: Wiki Changelog
description: Version history and updates to the agent wiki
tags: [changelog, log, history]
timestamp: 2026-01-07T00:00:00Z
---

# Wiki Changelog

Version history and updates to the agent wiki.

---

## v0.1 — Initial Content

**2026-01-07**

Initial wiki structure and content created.

### Added

**Principles** (4 files):

- `wisdom.md` — Core principles merged from `agent/docs/wisdom.md`
- `context-first.md` — Context-first philosophy and best practices
- `rpi.md` — Research → Plan → Implement workflow
- `verification-culture.md` — Verification discipline and checklist

**Patterns** (4 files):

- `backend-api-patterns.md` — Backend API implementation patterns (relocated)
- `prisma-patterns.md` — Prisma ORM patterns (relocated)
- `backend-api-gotchas.md` — Common pitfalls (relocated)
- `deep-modules.md` — Deep module design pattern (summarized from tdd/deep-modules.md)

**Environments** (2 files):

- `fish-shell.md` — Fish shell syntax and operations (relocated from SKILLS/fish-shell.md)
- `dev-servers.md` — Development server operations (generalized from SKILLS/server-operations.md, ports removed)

**Glossary** (1 file):

- `glossary/index.md` — Key terms and concepts

**Wiki Structure** (2 files):

- `index.md` — Wiki homepage and navigation
- `log.md` — This changelog

### Notes

- All files use OKF frontmatter with `type:` field
- Hardcoded ports (3001, 5173) removed from `dev-servers.md`
- Deep modules pattern summarized for wiki format
- Fish shell documentation relocated from SKILLS for reference access

---

## Role-Scoped Capabilities

**2026-07-24**

### Added

- `patterns/role-scoped-capabilities.md` — a role is a scoped capability set; enforcement is
  by withholding capabilities (no-`edit` as a forcing function), with generic capability
  names the adapter maps to harness tool names.
- `adr/adr-006-capability-based-roles.md`, `adr/adr-007-docs-lookup-capability.md`,
  `adr/adr-008-delivery-dispatchers.md`.
- Glossary: **Capability**, **Role**, **Dispatcher**, **Utility (dispatched) agent**;
  sharpened **Agent** and **Orchestrator**.

### Changed

- Mirai adapter: role-scoped capability grants; Delivery split into Planner + Orchestrator
  dispatchers plus a Verifier utility; per-stage quick base agent (`plan` for Shaping) +
  stance line; optional `docs-lookup` capability. See per-subtree logs
  (`adr/log.md`, `patterns/log.md`, `glossary/log.md`) for detail.

---

## Macro Project-Management vocabulary

**2026-08-12**

### Added

- `adr/adr-018-macro-project-management.md` — macro PM is a recursive wayfinding layer over
  SDLC runs (not a peer workflow), bound by an altitude-scoped substrate and a two-vocabulary
  label seam.
- Glossary: **Altitude**, **Substrate**, **Altitude seam**, **Resident agent** — the
  vocabulary the macro-PM protocol (and the pending wayfinder extension + `contract/`
  interview) will reference. See `glossary/log.md` and `adr/log.md` for detail.

### Changed

- `patterns/seam-artifact-protocol.md` — added the **networked/external store** substrate
  class, an **altitude-scoped** substrate subsection, and a **macro section +
  one-source-of-truth invariant** on the communication protocol document. See `patterns/log.md`.
- `SKILLS/planning/wayfinder/SKILL.md` — added an opt-in **macro mode**: ticket-as-sub-map
  recursion (Vision→Milestone→Epic as nested maps), the two-vocabulary seam (`wayfinder:*`
  down / `sdlc:*` up), and a **mechanical dispatch table** that translates a buildable `task`
  leaf into an SDLC run's `shaping/` seam artifact and reacts to `sdlc:*` returns
  (`done`/`needs-recharter`→sub-map/`needs-clarification`→`grilling` ticket). Reuses the
  existing charting loop; no parallel skill. Grounds ADR-018.
- `contract/interview.md` — added **§4f Macro project-management (optional)**, off by default:
  extends §4d with a macro substrate (default networked store), a fit-assessment gate, and
  provisioning of the two label vocabularies, written into the comm-protocol document's macro
  section under the one-source-of-truth invariant. The resident daemon stays an adapter
  concern (no new port; ADR-005 preserved). Grounds ADR-018.

---

## Single-Edge Board Graph vocabulary

**2026-09-09**

### Added

- Glossary: **Board**, **Board member**, **Membership edge**, **Ordering edge**, **Unmapped**,
  **Takeable**, **Frontier** — the 7 terms `domain-model.md` sharpened for the
  `board-api-distributable` effort, each linking to
  [ADR-029](adr/adr-029-single-edge-board-graph.md). `Takeable` now carries the corrected
  five-conjunct predicate (`member ∧ type ≠ map ∧ open ∧ no open blocker ∧ unassigned`),
  replacing the old three-conjunct `(open ∧ unblocked ∧ unassigned)` this ADR superseded at
  ADR-025 §8.

---

## Dispatch leaves wayfinder

**2026-09-21**

### Added

- [ADR-030](adr/adr-030-altitude-handoff-skill.md) — dispatch is not a wayfinding concern. The
  `## Macro mode` section (**63 of 205 lines, 31%** of `SKILLS/planning/wayfinder/SKILL.md`, serving
  a resident PM rather than a charting human) becomes **`SKILLS/planning/altitude-handoff`**, named
  after [ADR-018](adr/adr-018-macro-project-management.md) #4's own framing — `stage-handoff`'s
  PRODUCE/DISCOVER contract one [altitude](../CONTEXT.md#altitude) up. The dependency is
  **one-way**: wayfinder ends with zero references to dispatch. Also names the new skill the spec
  for `board apply`'s six transitions, and confirms no new adapter port is owed.

### Changed

- **Amends ADR-018** on three clauses only — "do not add a parallel skill", the *New macro-PM skill
  beside wayfinder* rejection row, and "no new planning skill is created". Its model (recursive
  wayfinding layer, mechanical router, two-vocabulary seam, altitude-scoped substrate) stands.
  Distinct from the clause [ADR-019](adr/adr-019-loom-hermes-setup.md) amended.
- Glossary **See** lines for **Altitude**, **Altitude seam**, **Resident agent** and
  **`qa:regression-failed`** now cite ADR-030. Their bodies still name `wayfinder` as the home of
  dispatch, which holds until the atomic move lands the new skill.

---

## Glossary (moved to CONTEXT.md)

`wiki/glossary/` is retired: its content is now root [CONTEXT.md](../CONTEXT.md), and its own
`log.md` is folded in here, verbatim, as this one archival section.

- 2026-07-07 — v0.1 initial content
- 2026-07-21 — Added **Harness** and **Setup contract**; sharpened **Adapter** to loom's
  harness-adapter sense (was generic). Bakes the harness-agnostic setup vocabulary that
  `SETUP.md` and `adapters/*` rely on into the domain language.
- 2026-07-24 — Added **Capability**, **Role**, **Dispatcher**, **Utility (dispatched) agent**;
  sharpened **Agent** (now also defined by its capability grant, not domain alone) and
  **Orchestrator** (canonical Dispatcher: `delegate` yes, `edit` no). Establishes the
  role-scoped-capability vocabulary for the new pattern and ADR-006/008.
- 2026-07-27 — Added **Domain-specialized utility** — a Utility (dispatched) agent scoped
  to a problem domain (e.g. frontend) rather than an intelligence tier; wires the domain's
  skill cluster. Names the role kind introduced by the `frontend` agent (ADR-009) and
  closes on the wisdom principle "specialize by problem domain, not technology."
- 2026-07-30 — Added **Stage**, **Seam artifact**, **Ledger**, and **Communication protocol
  document** — the vocabulary for the Seam Artifact Protocol (ADR-011): stages are the
  ownership seams, a seam artifact is the baton, the ledger is its namespaced+manifested
  store, and the communication protocol document is the per-project contract agents reference.
- 2026-07-31 — Added **Invocation surface** — the entry points that may *start* a role
  (human picker vs. subagent dispatch), a facet parallel to the capability set. Names the
  two surfaces `front-door` (stage agents; human/handoff-entered, not subagent-invocable)
  and `dispatched` (the utility roster; subagent-only). Orthogonal to the dispatcher/utility
  split. Establishes the vocabulary for ADR-012.
- 2026-08-12 — Added **Altitude**, **Substrate**, **Altitude seam**, and **Resident agent** —
  the vocabulary for macro project-management (ADR-018): altitude is the macro/micro scale
  split, substrate generalizes "where the ledger lands" to three classes (memory / committed
  folder / networked store) chosen per-project *and* per-altitude, the altitude seam is the
  translator (two-vocabulary label protocol: `wayfinder:*` down, `sdlc:*` up) joining the two,
  and the resident agent is the memory-bearing reactive worker that runs the macro altitude
  over a networked source of truth (board = single source of truth; the daemon is an adapter
  concern).
- 2026-08-17 — Added **Standing regression suite** and **`qa:regression-failed` (regression
  origin)**, and rewrote **Verification Culture** to carry the **iron law** — the vocabulary for
  system-scoped QA (ADR-020): the standing suite is the system-scoped e2e asset that accretes 1:1
  from user-facing efforts and runs in CI; `qa:regression-failed` is the CI-posted *third origin*
  (neither `wayfinder:*` down nor `sdlc:*` up) handled AFK by seeding a fresh terminating
  "restore-green" map; and Verification Culture is now the iron-law principle (evidence before any
  claim, harness-agnostic), the procedural skill being its operationalization.
- 2026-08-17 — Sharpened **Dispatcher** (ADR-021): **Shaping** is now a second, *read-only*
  dispatcher (dispatches recon/research to `explore`, spikes to `quick`/`deep`, stays `edit`-free),
  and being a Dispatcher is clarified as **orthogonal** to the invocation surface — `delegate`
  governs *dispatching out*, the invocation surface governs *being entered*, so a Dispatcher can be
  a `front-door` (Shaping) as well as `dispatched` (the Orchestrator).
- 2026-09-04 — Added **Form slop**, **Recall slop**, **Judgment slop**, **Gate**, **Evidence
  producer**, **Criterion type**, **Mechanism**, **Graduation**, **Ratchet**, and
  **Re-executing reality** — the vocabulary for the Core/Gate/Mechanism layer model
  (ADR-026): three layers, each owning one kind of slop, each enforced by a mechanism suited
  to what it owns (reasoning + a different actor for judgment slop; exit codes + withheld
  capabilities for form slop; re-executing reality for recall slop).
- 2026-09-21 — Pointed **Altitude**, **Altitude seam**, **Resident agent** and
  **`qa:regression-failed`** at [ADR-030](adr/adr-030-altitude-handoff-skill.md), which moves
  dispatch out of `wayfinder` into `SKILLS/planning/altitude-handoff`. Only the **See** lines change
  here: each term's body still names `wayfinder` as the home of dispatch, which stays true until the
  atomic move ([#51](https://github.com/zentetsukenz/agent/issues/51)) creates the skill — a
  glossary body pointing at a file that does not exist yet would be a broken link, not a capture.
  The prose rewiring lands with the move.
