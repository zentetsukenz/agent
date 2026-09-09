---
type: ADR
title: The macro tick mutates the board through a deterministic board-API distributable, not model-reasoned prose — so a small model can tick reliably, and prose-first is preserved by holding only the CLI contract as pseudo-code
status: Accepted
timestamp: 2026-09-09T00:00:00Z
tags: [macro-pm, wayfinder, board, tracker, determinism, distributable, mechanics, pseudo-code, prose-first, github-issues, issue-dependencies, mermaid, mcp, altitude, loom]
---

# ADR-025: A Deterministic Board API for the Macro Tick

> Extends [ADR-018](adr-018-macro-project-management.md) (macro-PM as a mechanical, restart-safe
> router over a single source of truth) and honours the **prose-first principle**
> ([ADR-001](adr-001-adapter-pattern.md), [ADR-002](adr-002-workflow-as-adapter-seed.md) —
> prose-first-for-judgment is preserved, not superseded, by [ADR-026](adr-026-gate-mechanism-layer-model.md),
> which this ADR's own "seed holds the contract, distributable holds the code" split anticipated). It adds
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

2. **A tiny, stable verb contract — four verbs, invoked as `loom board …`** — the part the seed
   pseudo-codes and the part tests pin:

   ```
   loom board read [--frontier]              # JSON: the board, or just the takeable set
   loom board tree [--format=tree|mermaid]   # read-only render; default tree
   loom board apply <ticket> <transition>    # atomic, idempotent state move
   loom board reconcile [--dry-run]          # detect-drift → repair
   ```

   Every verb emits JSON and exits nonzero on drift/conflict. Backends hide behind these verbs; the
   pseudo-code in the seed specifies *the verbs and the tick's call order*, never a tracker's
   internals.

   **`heal` is dropped; `reconcile` is the single name.** The original draft kept both, "named by
   intent at each site" — but two names for one identical behaviour is a synonym, and synonyms in a
   CLI contract invite readers to hunt for a difference that does not exist. One behaviour, one
   interface.

3. **The tick prose is the activation schedule** (Hermes has no hooks). The board API is invoked at
   fixed steps of a single, named tick, now **bookended by the same call**:

   ```
   Reconcile → Read → Route → Act → Integrate → Reconcile → Exit
   ```

   The opening `reconcile` repairs drift *before* the tick reads, so it acts on truth; the closing
   `reconcile` repairs drift the tick itself introduced before exit. It is **literally the same
   call at both ends** — more honest than the old `Heal → … → Reconcile` asymmetry, which dressed
   one operation in two names. Drift then survives at most one tick. Running the human's standalone
   "fix the board" is that same command.

4. **This is what licenses a small model on the tick.** The model **picks** a transition (already a
   lookup, per ADR-018's mechanical routing) and the **script performs** it atomically. Mutation no
   longer depends on model reasoning, so a cheaper/smaller model ticks deterministically.

5. **Prose-first is preserved.** The seed and skills hold **prose + illustrative pseudo-code**
   describing the CLI contract — exactly as the seed already describes "dispatch into the configured
   SDLC harness" without embedding a dispatcher. Executable code stays in the distributable, off the
   seed. No new normative layer between prose and adapter.

6. **The board is plain GitHub Issues, not a Projects v2 board — the graph is native issue
   dependencies, and `loom board tree` renders it.** GitHub Issues express the full wayfinder graph with
   no Projects board. The dependency DAG uses **native [issue dependencies](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies)**
   — `blockedBy`/`blocking`, first-class in `gh` (`gh issue edit --add-blocked-by`, `gh issue view
   --json blockedBy,blocking`) — which are **structured JSON (no body-line parsing)** and have **no
   depth limit**. This **supersedes the earlier `Blocked by: #n` body-line convention**: when this
   ADR was first drafted (2026-08-19) GitHub shipped no dependency API, but the feature landed and
   testing (2026-08-25) also exposed that **sub-issue nesting is capped at 7 levels** — too shallow
   to carry a deep wayfinder tree (nested sub-maps). So **sub-issues are demoted to optional shallow
   grouping**, and **all depth + blocking live in dependency edges**. A "solid dependency-graph
   renderer" removes any need for a Projects board, so `loom board tree` is a first-class verb, not a
   nicety. It emits **two keyless outputs**: an **indented Unicode tree** for terminal inspection,
   and a **Mermaid `graph TD`** block that GitHub renders natively when posted to an issue/README —
   chosen over Graphviz (`dot`)/`graph-easy`/`mmdc` because those carry a system-package, Perl, or
   Node+Chromium install the Mermaid-emit path avoids (keyless, low-install, per
   [ADR-010](adr-010-keyless-by-default-recommendations.md)).

7. **The invocation surface is `loom board …`, namespaced under a single distributable — not a
   standalone `board`.** [ADR-027](adr-027-mechanism-install-port.md) (Accepted, 2026-09-06)
   mandates a *single* Mechanism-layer distributable exposing namespaced verbs (`loom board …`,
   `loom size score`, `loom check gates`); building `board` standalone would create exactly the
   drift that rule forbids. The entrypoint is **`node scripts/loom/index.js board <verb>`**, living
   at **`scripts/loom/`** (not `scripts/board/`). **No packaging** — no `package.json`, no `bin`
   entry, no npm, no install step; it is invoked by path. *Namespacing* (the argv shape) and
   *packaging* (the install story) are independent concerns: this decision **takes the namespace
   and rejects the packaging**.

8. **The CLI contract — transitions, JSON shape, exit codes, preconditions** (resolved over the
   [issue-#19 grilling session](https://github.com/zentetsukenz/agent/issues/19), 2026-09-09; that
   ticket carries the full detail):

   - **Six transitions**, named by **intent**; `apply` owns all `wayfinder:*`/`sdlc:*` label
     vocabulary and the caller never names a label string: `claim`, `dispatch`,
     `close --pointer <url>`, `graduate-recharter`, `open-clarification`, `seed-regression-map`. A
     target-state vocabulary (e.g. `apply 19 sdlc:done`) was **rejected** because `sdlc:done` means
     *close + record pointer + advance frontier* — three operations — so "set this label"
     understates every row and leaves the model reasoning out the rest, the very drift this ADR
     exists to prevent. `close --pointer` deliberately serves both "resolve a HITL/research ticket"
     and "close an `sdlc:done` leaf": the mechanical action is identical (close, append pointer),
     only the kind of URL differs.
   - **JSON is normalised loom-native**, wrapped in an envelope `{"ok": true, …}` /
     `{"ok": false, "error": {…}}` — the error payload carries the cause, the exit code carries the
     class. A ticket object exposes `number`, `title`, `url`, `type`, `status`, `assignee`,
     `blockedBy`, `state`, `takeable`. There is **no raw `labels` passthrough** — the mirror image
     of hiding labels on the write side; `type`/`status` are the parsed forms and `takeable` is a
     precomputed frontier predicate (open ∧ unblocked ∧ unassigned) so the tick never recomputes
     it. `apply` returns a `changed[]` audit trail plus a `noop` bool.
   - **Exit codes are tiered**: `0` success (including an idempotent no-op), `1` generic
     failure/bug, `2` conflict-or-drift (the board moved underneath the caller), `3` precondition
     violation. The class lives in the code so the tick can branch without parsing JSON; the
     specific cause lives in the JSON `error`.
   - **`apply` is idempotent — refuse contradiction, absorb agreement** (backing
     [ADR-018](adr-018-macro-project-management.md)'s restart-safety): `claim` on someone else's
     ticket or `dispatch` on a blocked/closed ticket is a precondition violation (**exit 3** — the
     concurrent-session guard); `claim` on a ticket already yours or `close` on an already-closed
     ticket is **exit 0 with `noop: true`**. `noop` distinguishes "I did it" from "it was already
     so".
   - **`reconcile` reports every repair, never silent** (`--dry-run` supported). A silent
     auto-repairer on a tick loop is how you get an unexplainable board.
   - **`tree` is read-only with zero side effects.** `--format` selects (never concatenates)
     `tree` (default, indented Unicode) or `mermaid` (a `graph TD` block that renders natively on
     GitHub and must arrive clean on stdout to be pasteable). It **does not post back to the map** —
     a verb that both renders and mutates would fight `reconcile` for ownership of the map body;
     auto-posting, if wanted later, earns a separate verb.
   - **`--help` and `--version` are present** (`--help` lets a fresh tick session discover the verb
     set without reading the seed; `--version` gives `reconcile` something to report). A
     semver/pinning policy is **deferred** — no second consumer exists, and inventing a pinning
     protocol for one caller is speculative flexibility.
   - **Repo/auth targeting inherits `gh`'s cwd-derived context**; `--repo owner/name` is an
     optional override for the resident/cron case where cwd is not the repo. Keyless per
     [ADR-010](adr-010-keyless-by-default-recommendations.md); zero config.

## Consequences

- **Determinism becomes executable, not aspirational.** ADR-018 #5's restart-safety is now backed by
  a tool: a fresh session on the same board runs the same `board` verbs and reaches the same state.
- **The board interface deepens.** `read`/`tree`/`apply`/`reconcile` collapse the operator's
  read/fix/inspect scripts into one cohesive module whose interface *is* the board — operator and
  agent can no longer see divergent views (they call the same verbs).
- **`#3` (status-not-updated) becomes structurally impossible to accumulate** — the bookended
  `reconcile` brackets every tick.
- **Small-model tick is unlocked** — the cost win macro-PM wanted.
- **MCP is demoted, not discarded** — it remains an optional *later* consumption path (a human's rich
  agent talking to the board conversationally) layered on top of the deterministic verbs, never the
  core mutation path.
- **A maintenance surface is accepted deliberately** — loom now owns a small board-API distributable.
  Kept minimal by the verb contract and the single-tracker start.
- **Follow-on ripple from the five-verb → four-verb collapse and the `scripts/loom/` placement.**
  The [build leaf (#20)](https://github.com/zentetsukenz/agent/issues/20) body/title and the
  [research ticket (#18)](https://github.com/zentetsukenz/agent/issues/18) title still say "five
  verbs" and reference `scripts/board/`; the glossary's
  [Board reconcile](../glossary/index.md#board-reconcile) entry has been updated to the four-verb,
  `loom board …` / `scripts/loom/` reality; #18 and #20 still need updating.

## Alternatives considered

- **Reuse an off-the-shelf unified tracker library.** Rejected — research found none maintained that
  covers GitHub (Issues or Projects v2) alongside Linear/Notion.
- **Drive a GitHub Projects v2 board instead of plain Issues.** Rejected — native sub-issues +
  `Blocked by:` lines + a `loom board tree` renderer express the whole graph on plain Issues; a Projects
  board adds a second surface (single-select status fields, project item IDs) to keep in sync for no
  gain here.
- **Use an MCP server (e.g. GitHub's official) as the mutation core.** Rejected — MCP tools are
  LLM-tool-shaped (freeform intent), re-introducing the very model-reasoned drift this ADR removes.
  Kept as an optional consumption layer instead.
- **A hook system to force deterministic board writes.** Rejected — Hermes has no hook primitive
  (only cron/gateway); the tick prose is the only available schedule. Determinism comes from moving
  mutation into the tool, not from enforcing a call around it.
- **Embed executable mechanics directly in the prose seed.** Rejected — breaks prose-first
  ([ADR-002](adr-002-workflow-as-adapter-seed.md), the seed/distributable split
  [ADR-026](adr-026-gate-mechanism-layer-model.md) explicitly keeps); the seed holds the
  *contract*, the distributable holds the *code*.
- **A new normative "reference implementation" layer between prose and adapter.** Rejected as
  over-engineering — the deletion test says it moves complexity rather than concentrating it; skill
  `scripts/` + adapter-installed distributable already carry executables.

## Related

- [ADR-018](adr-018-macro-project-management.md) — the macro-PM protocol whose mechanical/restart-safe router this makes executable (unchanged).
- [ADR-001](adr-001-adapter-pattern.md) / [ADR-002](adr-002-workflow-as-adapter-seed.md) — the prose-first principle this preserves (contract in prose, code in the distributable; the split [ADR-026](adr-026-gate-mechanism-layer-model.md) builds on, not reverses).
- [ADR-010](adr-010-keyless-by-default-recommendations.md) — keyless-first; the `gh`-backed board API needs no API key.
- [ADR-027](adr-027-mechanism-install-port.md) — the `mechanism→install` port that mandates the single `loom …`-namespaced distributable this ADR's `loom board …` verbs live under.
- [workflows/macro-pm/index.md](../../workflows/macro-pm/index.md#the-tick-loop) — the tick loop this ADR gives an executable board API and a bookended Reconcile→…→Reconcile shape.
- [SKILLS/planning/wayfinder/SKILL.md](../../SKILLS/planning/wayfinder/SKILL.md#the-two-vocabulary-seam) — macro mode's dispatch table the board verbs execute.
- [wiki/environments/issue-tracker.md](../environments/issue-tracker.md) — the tracker abstraction the board backends realise (GitHub first).
- [wiki/environments/hermes.md](../environments/hermes.md) — no hook primitive; cron/gateway are the only triggers.
