---
type: ADR
title: The macro tick mutates the board through a deterministic board-API distributable, not model-reasoned prose — so a small model can tick reliably, and prose-first is preserved by holding only the CLI contract as pseudo-code
status: Proposed
timestamp: 2026-08-19T00:00:00Z
tags: [macro-pm, wayfinder, board, tracker, determinism, distributable, mechanics, pseudo-code, prose-first, github-issues, issue-dependencies, mermaid, mcp, altitude, loom]
---

# ADR-025: A Deterministic Board API for the Macro Tick

> Extends [ADR-018](adr-018-macro-project-management.md) (macro-PM as a mechanical, restart-safe
> router over a single source of truth) and honours the **prose-first principle**
> ([ADR-001](adr-001-adapter-pattern.md), [ADR-002](adr-002-workflow-as-adapter-seed.md)). It adds
> **no new seed layer and no new port** — it names *where executable board mechanics live* (a
> distributable the harness installs) and *how the seed refers to them* (as a CLI contract in
> illustrative pseudo-code). The macro-PM protocol vocabularies, dispatch table, recursion, and
> returns are unchanged.

## Context

macro-PM's [tick loop](../../workflows/macro-pm/index.md#the-tick-loop) is *specified* as mechanical
and restart-safe: routing is a pure `label + status → action` lookup, each tick a fresh stateless
session that reconstructs its picture from the board ([ADR-018](adr-018-macro-project-management.md)

# 5). In practice, three frictions surfaced running it against a real board

- **Board drift.** The tick did not reliably write `sdlc:*` status back, so the board fell out of
  sync with reality — the human had to hand-run a "fix the board" script.
- **No safe way to look.** Reading the board and rendering its issues as a tree for inspection were
  ad-hoc scripts, not a first-class operation.
- **Determinism lived in prose, executed by judgment.** Although the *routing* is a lookup, the
  *mutation* was performed by the model reasoning its way through tracker calls — exactly where a
  smaller/cheaper model drifts. The restart-safety guarantee was **aspirational** (stated in prose)
  rather than **executable**.

The deeper reading: the **board is the interface** of the [altitude seam](../../wiki/glossary/index.md#altitude-seam),
and it was **shallow** — operator and agent kept reaching in to repair or re-render it by hand.

**Research on reuse** ([grill session, 2026-08-19]) found: no maintained open-source library
abstracts GitHub Projects v2 + Linear + Notion behind one interface; official MCP servers exist
(GitHub's covers Projects v2) but are **LLM-tool-shaped** (freeform intent) — the *opposite* of the
determinism we need; and `gh project` already exposes full Projects v2 CRUD, keyless. Reuse of a
drop-in abstraction is therefore not available; MCP is a *consumption* surface, not a *determinism*
surface.

Note also that Hermes has **no hook primitive** (only `cron` and `gateway` triggers —
[wiki/environments/hermes.md](../environments/hermes.md)). There is no harness mechanism to *force*
a call around a tool. So determinism cannot be enforced by a hook; it must come from **moving the
mutation itself out of model reasoning and into a tool the model merely invokes**.

## Decision

**Board mutation on the macro tick is performed by a deterministic board API — a small
distributable the harness installs — which the tick prose calls at fixed steps. The framework holds
only the CLI *contract* (in illustrative pseudo-code); the *executable* lives outside the seed.**

1. **A board-API distributable, not seed content.** Board mechanics ship as repo-tooling + a small
   installable (initially a thin wrapper over `gh` for **plain GitHub Issues** — see the graph
   model below), living alongside `scripts/`, independently testable, versioned. It is **not**
   copied verbatim into every harness like skill `scripts/` — the *adapter* installs/points to it
   at setup (the same discipline as the [`capability→tool` port](../../contract/PORTS.md)). **Start
   small** (GitHub Issues only); additional backends (Linear, Notion) sit behind the same verb
   contract and are added only when a second tracker actually arrives (YAGNI).

2. **A tiny, stable verb contract** — the part the seed pseudo-codes and the part tests pin:

   ```
   board read [--frontier]        # JSON: the board, or just the takeable set
   board tree                     # human-readable issue tree for inspection
   board apply <ticket> <transition>   # atomic, idempotent state move
   board heal | board reconcile   # one idempotent detect-drift → repair op
   ```

   Every verb emits JSON and exits nonzero on drift/conflict. Backends hide behind these verbs; the
   pseudo-code in the seed specifies *the verbs and the tick's call order*, never a tracker's
   internals.

3. **The tick prose is the activation schedule** (Hermes has no hooks). The board API is invoked at
   fixed steps of a single, named tick:

   ```
   Heal → Read → Route → Act → Integrate → Reconcile → Exit
   ```

   `heal` (step 0) repairs drift *before* the tick reads, so it acts on truth; `reconcile` (final
   step) repairs drift the tick itself introduced before exit. Both are the **same idempotent
   operation**, named by intent at each site — so running the human's standalone "fix the board" is
   the *same command*, one artifact with two entry points. Drift then survives at most one tick.

4. **This is what licenses a small model on the tick.** The model **picks** a transition (already a
   lookup, per ADR-018's mechanical routing) and the **script performs** it atomically. Mutation no
   longer depends on model reasoning, so a cheaper/smaller model ticks deterministically.

5. **Prose-first is preserved.** The seed and skills hold **prose + illustrative pseudo-code**
   describing the CLI contract — exactly as the seed already describes "dispatch into the configured
   SDLC harness" without embedding a dispatcher. Executable code stays in the distributable, off the
   seed. No new normative layer between prose and adapter.

6. **The board is plain GitHub Issues, not a Projects v2 board — the graph is native issue
   dependencies, and `board tree` renders it.** GitHub Issues express the full wayfinder graph with
   no Projects board. The dependency DAG uses **native [issue dependencies](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies)**
   — `blockedBy`/`blocking`, first-class in `gh` (`gh issue edit --add-blocked-by`, `gh issue view
   --json blockedBy,blocking`) — which are **structured JSON (no body-line parsing)** and have **no
   depth limit**. This **supersedes the earlier `Blocked by: #n` body-line convention**: when this
   ADR was first drafted (2026-08-19) GitHub shipped no dependency API, but the feature landed and
   testing (2026-08-25) also exposed that **sub-issue nesting is capped at 7 levels** — too shallow
   to carry a deep wayfinder tree (nested sub-maps). So **sub-issues are demoted to optional shallow
   grouping**, and **all depth + blocking live in dependency edges**. A "solid dependency-graph
   renderer" removes any need for a Projects board, so `board tree` is a first-class verb, not a
   nicety. It emits **two keyless outputs**: an **indented Unicode tree** for terminal inspection,
   and a **Mermaid `graph TD`** block that GitHub renders natively when posted to an issue/README —
   chosen over Graphviz (`dot`)/`graph-easy`/`mmdc` because those carry a system-package, Perl, or
   Node+Chromium install the Mermaid-emit path avoids (keyless, low-install, per
   [ADR-010](adr-010-keyless-by-default-recommendations.md)).

## Consequences

- **Determinism becomes executable, not aspirational.** ADR-018 #5's restart-safety is now backed by
  a tool: a fresh session on the same board runs the same `board` verbs and reaches the same state.
- **The board interface deepens.** `#read`/`#tree`/`#apply`/`heal`/`reconcile` collapse the operator's
  read/fix/inspect scripts into one cohesive module whose interface *is* the board — operator and
  agent can no longer see divergent views (they call the same verbs).
- **`#3` (status-not-updated) becomes structurally impossible to accumulate** — heal/reconcile
  bracket every tick.
- **Small-model tick is unlocked** — the cost win macro-PM wanted.
- **MCP is demoted, not discarded** — it remains an optional *later* consumption path (a human's rich
  agent talking to the board conversationally) layered on top of the deterministic verbs, never the
  core mutation path.
- **A maintenance surface is accepted deliberately** — loom now owns a small board-API distributable.
  Kept minimal by the verb contract and the single-tracker start.

## Alternatives considered

- **Reuse an off-the-shelf unified tracker library.** Rejected — research found none maintained that
  covers GitHub (Issues or Projects v2) alongside Linear/Notion.
- **Drive a GitHub Projects v2 board instead of plain Issues.** Rejected — native sub-issues +
  `Blocked by:` lines + a `board tree` renderer express the whole graph on plain Issues; a Projects
  board adds a second surface (single-select status fields, project item IDs) to keep in sync for no
  gain here.
- **Use an MCP server (e.g. GitHub's official) as the mutation core.** Rejected — MCP tools are
  LLM-tool-shaped (freeform intent), re-introducing the very model-reasoned drift this ADR removes.
  Kept as an optional consumption layer instead.
- **A hook system to force deterministic board writes.** Rejected — Hermes has no hook primitive
  (only cron/gateway); the tick prose is the only available schedule. Determinism comes from moving
  mutation into the tool, not from enforcing a call around it.
- **Embed executable mechanics directly in the prose seed.** Rejected — breaks prose-first
  ([ADR-002](adr-002-workflow-as-adapter-seed.md)); the seed holds the *contract*, the distributable
  holds the *code*.
- **A new normative "reference implementation" layer between prose and adapter.** Rejected as
  over-engineering — the deletion test says it moves complexity rather than concentrating it; skill
  `scripts/` + adapter-installed distributable already carry executables.

## Related

- [ADR-018](adr-018-macro-project-management.md) — the macro-PM protocol whose mechanical/restart-safe router this makes executable (unchanged).
- [ADR-001](adr-001-adapter-pattern.md) / [ADR-002](adr-002-workflow-as-adapter-seed.md) — the prose-first principle this preserves (contract in prose, code in the distributable).
- [ADR-010](adr-010-keyless-by-default-recommendations.md) — keyless-first; the `gh`-backed board API needs no API key.
- [workflows/macro-pm/index.md](../../workflows/macro-pm/index.md#the-tick-loop) — the tick loop this ADR gives an executable board API and a named Heal→…→Reconcile shape.
- [SKILLS/planning/wayfinder/SKILL.md](../../SKILLS/planning/wayfinder/SKILL.md#the-two-vocabulary-seam) — macro mode's dispatch table the board verbs execute.
- [wiki/environments/issue-tracker.md](../environments/issue-tracker.md) — the tracker abstraction the board backends realise (GitHub first).
- [wiki/environments/hermes.md](../environments/hermes.md) — no hook primitive; cron/gateway are the only triggers.
