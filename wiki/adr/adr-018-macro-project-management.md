---
type: ADR
title: Macro project-management is a recursive wayfinding layer over SDLC runs, bound by an altitude-scoped substrate and a two-vocabulary label seam — not a peer workflow
status: Accepted
timestamp: 2026-08-12T00:00:00Z
tags: [project-management, macro, wayfinder, sdlc, seam, altitude, substrate, tracker, resident-agent, router, communication, loom]
---

# ADR-018: Macro Project-Management as a Recursive Wayfinding Layer over SDLC

> **Amended by [ADR-019](adr-019-loom-hermes-setup.md) (2026-08-14).** This ADR's decision #1 says
> macro-PM is "**not** a peer workflow." That held under the *old, narrow* definition of workflow (an
> ordered, terminating phase-pipeline). `workflows/` now recognizes **two lifecycle kinds** —
> terminating and reactive — so macro-PM **is** a peer *workflow*: the **reactive-lifecycle** member,
> living at [`workflows/macro-pm/`](../../workflows/macro-pm/index.md). It is still **not** a peer
> *phase-pipeline*, and every other decision below (recursive wayfinding, dispatch into SDLC runs, the
> resident agent, altitude-scoped substrate, the two-vocabulary seam) stands unchanged. Read "not a
> peer workflow" below as "not a peer *phase-pipeline*."

## Context

The [SDLC workflow](../../workflows/sdlc/index.md) is a **single-effort, terminating
pipeline**: one shaped change flows Discovery → … → Preservation and ends. Point it at a
large, multi-session effort ("build the product", "migrate the platform") and it either
never terminates — violating its pipeline shape — or it silently narrows scope and reports
"done" prematurely, the exact [60% barrier](../../docs/framework-design.md) loom exists to
defeat.

The gap is **macro-scale project management**: charting effort above the size of one SDLC
run (a Vision/Milestone/Epic decomposition), moving tickets, tracking status across many
runs, and communicating up and down the chain — potentially driven by a resident agent
running unattended (e.g. a [Hermes](https://hermes-agent.nousresearch.com/)-style agent
watching a board 24/7).

The tempting framing is "add `workflows/pm/` as a second workflow beside SDLC." This ADR
rejects that framing. A workflow in loom is an **ordered, terminating lifecycle** (see
[workflows](../../workflows/index.md)); macro PM is a **continuous, non-terminating,
recursive decomposition** whose *leaves are SDLC runs*. Modelling a recursive control loop
as an ordered pipeline is a category error that leaks the first time an Epic spawns an Epic.

loom already owns most of the needed machinery, which the "new workflow" framing would
duplicate — violating the [reference-not-restate](adr-013-shared-adapter-contract-core.md)
discipline:

- [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) already charts multi-session work as
  a **map of decision tickets** on the issue tracker, resolved one at a time, with a
  **fog-of-war** rule (chart only what you can see) and a **HITL/AFK** ticket-type split.
  "The map is an index, not a store."
- The [Seam Artifact Protocol](../patterns/seam-artifact-protocol.md) already passes context
  across ownership seams via a namespaced, manifest-indexed **ledger**, and already declares
  **"substrate is an adapter choice"** ([ADR-011](adr-011-seam-artifact-protocol.md),
  [ADR-015](adr-015-communication-line-refinement.md)).
- Planning's **Output-Plan Policy** (≈80% of tasks small-agent-executable) is already an
  objective test of whether work is right-sized (see [planning.md](../../workflows/sdlc/planning.md)).

## Decision

Macro PM is a **recursive wayfinding layer that sits above SDLC and dispatches into SDLC
runs**, expressed as prose protocol. Concretely:

1. **Not a peer workflow — a recursive layer over `wayfinder`.** Reuse `wayfinder`; do not
   add a parallel skill (less to maintain). A macro effort is a `wayfinder:map` (an Epic); a
   ticket may itself graduate into a sub-map, giving Vision→Milestone→Epic nesting without a
   new tree engine. Fixed Scrum-style levels (notably "Sprint" as a time-box) are **not**
   modelled — the frontier already *is* "the currently dispatchable leaves."

2. **The tracker is the single source of truth; the resident agent is a reactive worker.**
   All **project state** lives on the tracker (the "board"). A resident agent may carry
   **private memory**, but that memory holds **only** non-load-bearing continuity — persona,
   user preferences, learned skills, conversation continuity — and **never** project state.
   Test: *"if this agent died and a fresh one booted on another server, would the project
   stall without this datum?"* If yes, it belongs on the board, never in private memory.

3. **Altitude-scoped substrate.** The seam-artifact protocol's "substrate is a choice" is
   generalized from *per-project* to *per-altitude*: the **macro** altitude uses a networked
   store (the board), the **micro** altitude (planner → orchestrator inside an SDLC run) uses
   harness memory. This requires a **third substrate class the protocol lacked — a
   networked/external store** — because the existing two (harness memory, committed repo
   folder) each fail macro PM: memory does not distribute across agents on different servers,
   and a committed folder pollutes the code tree with state that fails the
   [deletion test](../patterns/deep-modules.md) for the repo (unlike an ADR, a PM ledger is
   not code-load-bearing).

4. **The altitude seam is a translator, not a shared bus.** The resident agent performs two
   translations, reusing the existing PRODUCE/DISCOVER contract across the altitude boundary:
   **down** — a board ticket + its linked artifacts become a `shaping/<milestone>/` seam
   artifact in the SDLC run's memory ledger, which Planning's DISCOVER gate already expects;
   **up** — the run's `delivery/<milestone>/verified-change.md` becomes a board update (close
   the ticket, attach the PR/commit link, advance the frontier). The micro inner loop stays
   in memory, oblivious to the board.

5. **A mechanical, table-driven router — no agent judgment.** The ticket's label + status
   *fully determines* the dispatch target. Determinism is what makes the router restart-safe
   and keeps the board authoritative: a fresh agent, given the same board state, routes
   identically. Two label vocabularies form the seam:
   - **`wayfinder:*` (down):** reuse wayfinder's four types — `research` → Shaping;
     `grilling`/`prototype` → HITL (surface to human); `task` (with execution-override) → a
     buildable leaf dispatched to Planner → Orchestrator. The router matches exactly what
     wayfinder emits; no new down-type is added.
   - **`sdlc:*` (up):** an **evolving status** (not an immutable type) mirroring wayfinder's
     HITL/AFK split. **AFK** returns the router handles autonomously (`sdlc:needs-recharter`
     → graduate the leaf to a `wayfinder:map`; `sdlc:blocked` → re-block). **HITL** returns
     **fold back into a `wayfinder:grilling` ticket** (`sdlc:needs-clarification`, e.g. a PR
     that fails verification repeatedly, signalling spec ambiguity), so the up-vocabulary
     closes into the down-vocabulary and the loop closes on itself. Labels route by *target*;
     the *cause* lives in the linked artifact.

6. **Right-sizing is a boundary rejection, not a prediction.** No new macro sizer is built.
   A leaf's size is confirmed at Planning's DISCOVER gate: if Planning produces a well-formed
   ≈80/20 plan, the leaf was right-sized; if it cannot decompose, Planning **only reports**
   `sdlc:needs-recharter` (it does not itself re-chart — that would drag macro structure into
   the micro SDLC), and the router graduates the leaf into a sub-map. Recursion terminates
   because the destination is fixed (fog only gathers toward it).

7. **The source of truth is a user choice, named in the communication protocol document,
   and there is exactly ONE.** The default substrate is a networked board (any PM tool /
   issue tracker), but at `init`/`update` the user may choose another substrate (even a local
   folder on their own machine); the setup agent must **gauge how loom's protocol** (the two
   vocabularies, map-as-index, linked-not-embedded artifacts) maps onto the chosen tool and
   validate the fit — the choice, and convincing loom it works, is the user's responsibility.
   The [communication protocol document](../patterns/seam-artifact-protocol.md#4-the-communication-protocol-document)
   grows an **altitude-aware macro section** naming the chosen source of truth. The
   anti-drift **invariant is substrate-agnostic**: *there is exactly one registered source of
   truth; creating a second, unregistered tracker (a stray `TODO.md`, an off-board issue) is
   the violation* — not the choice of substrate. Every participating agent's identity **must
   reference** the communication protocol document.

8. **Protocol in loom core; the daemon is an adapter concern.** The macro-PM protocol
   (vocabularies, translator, router rules, recursion, returns) is harness-agnostic prose and
   lands in loom core (extending `wayfinder` and the communication protocol document, plus new
   macro interview questions in the shared [`contract/`](../../contract/index.md)). The
   **resident 24/7 agent** that runs the loop unattended is an **adapter binding** (e.g. a
   future `adapters/hermes/`), not part of the protocol — a human, a cron job, or a daemon
   could each run the same prose. Baking a daemon into the protocol would violate the
   harness-agnostic stance of [ADR-005](adr-005-harness-agnostic-setup.md).

## Considered options

| Option | Verdict |
|---|---|
| **Embed macro PM inside SDLC** | Rejected — SDLC is a terminating single-effort pipeline; macro PM is continuous and recursive. |
| **`workflows/pm/` as a peer workflow** | Rejected — macro PM has no ordered, terminating lifecycle; it is a plane/layer, and a peer workflow would duplicate wayfinder + the seam protocol. |
| **New macro-PM skill beside wayfinder** | Rejected — more to maintain; wayfinder already does the hard part. Extend it instead. |
| **Stateful resident agent as source of truth** | Rejected — re-privatizes shared state; a second agent on another server can't see it; not restart-safe. |
| **Shared substrate across altitudes (SDLC reads the board directly)** | Rejected — drags networked-substrate latency and PM noise into the fast micro loop. |
| **Judgment-based router** | Rejected — non-deterministic routing means the board is no longer the source of truth. |
| **Predictive macro task-sizer** | Rejected — hard, subjective, re-introduces agent judgment; the Planning gate rejects oversized leaves objectively for free. |
| **Hard rule "the board is the only tracker"** | Rejected — hardcodes a substrate, violating "substrate is a choice." Replaced by the substrate-agnostic one-source-of-truth invariant. |
| **Recursive wayfinding layer + translator seam + mechanical two-vocabulary router + gate-based sizing** | **Chosen.** |

## Consequences

- `wayfinder` gains a recursive/macro mode and the two-vocabulary seam (`wayfinder:*` down,
  `sdlc:*` up); no new planning skill is created.
- The Seam Artifact Protocol gains a **third substrate class** (networked/external store) and
  an **altitude-scoped** substrate resolver; the communication protocol document gains a macro
  section and a substrate-agnostic one-source-of-truth invariant.
- The shared setup contract gains macro-PM interview questions (source-of-truth choice,
  substrate-per-altitude, board identity, label provisioning).
- SDLC runs stay unchanged internally and remain board-oblivious; they only learn to emit
  `sdlc:*` status on completion/return.
- A resident-agent harness (Hermes or otherwise) becomes a **separate, later adapter port**,
  not a prerequisite for the protocol.
- Only four genuinely new inventions result: the networked substrate class, the
  altitude-scoped resolver, the resident agent as translator/router, and the `sdlc:*` return
  status. Everything else reuses existing machinery — a signal the design is found, not forced.

## Related

- [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) — the skill this layer extends.
- [seam-artifact-protocol](../patterns/seam-artifact-protocol.md) — the ledger/manifest contract the translator reuses, and where the third substrate class and altitude-scoping land.
- [ADR-011](adr-011-seam-artifact-protocol.md), [ADR-015](adr-015-communication-line-refinement.md) — the seam-artifact protocol and its lanes/"substrate is a choice" stance.
- [workflows/sdlc/planning.md](../../workflows/sdlc/planning.md) — the Output-Plan Policy / DISCOVER gate that objectively sizes a leaf.
- [ADR-005](adr-005-harness-agnostic-setup.md) — the harness-agnostic setup contract that keeps the daemon an adapter concern.
- [ADR-013](adr-013-shared-adapter-contract-core.md) — the shared contract core the new interview questions extend; the reference-not-restate rule this ADR honors.
- [workflows/index.md](../../workflows/index.md) — the definition of "workflow" that macro PM is *not*.
- [docs/framework-design.md](../../docs/framework-design.md) — the 60% barrier and context-engineering rationale.
