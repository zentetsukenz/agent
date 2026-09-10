---
type: ADR
title: A single edge kind — a ticket `blocks` its map exactly as it `blocks` another ticket — replaces ADR-025's two-edge-kind split, and `takeable` gains an explicit board-membership conjunct after live data showed the old predicate over-collects to 9 items including the map itself; `reconcile`'s repair set is cut from four rules to three plus one migration rule
status: Accepted
timestamp: 2026-09-09T00:00:00Z
tags: [board, wayfinder, macro-pm, issue-dependencies, supersedes-adr-025, takeable, membership, reconcile, github-issues, loom]
---

# ADR-029: Single-Edge Board Graph + Corrected `takeable`

> **Partially supersedes [ADR-025](adr-025-deterministic-board-api.md)** (status stays
> `Accepted` — the supersession is narrow, see *What this supersedes*) on two specific pieces
> of text: decision **§6** (the two-edge-kind graph model) and decision **§8**'s `takeable`
> parenthetical plus the reconcile repair set it incorporates by reference from the issue-#19
> resolution. It does **not** reverse ADR-025's distributable placement, four-verb contract,
> exit-code tiers, or prose-first split — see *What is NOT reversed*. Records design decisions
> D1–D3 from the `board-api-distributable` shaping effort's
> [design-decisions.md](../../.loom/handoffs/shaping/board-api-distributable/design-decisions.md).

## Context

ADR-025 (Accepted, 2026-09-09) decided the board graph would use **two edge kinds** — native
issue-dependency edges (`blockedBy`/`blocking`) for blocking, plus sub-issue nesting
(`parent`/`subIssues`) for shallow grouping — and defined `takeable` as the parenthetical
`(open ∧ unblocked ∧ unassigned)`, with a reconcile repair set incorporated by reference from
the issue-#19 grilling session.

Live-board measurement (`gh 2.98.0`, `node v26.7.0`; findings F1–F9) refuted both:

- **The old `takeable` predicate over-collects to 9 items** on the live board
  (`13,15,16,17,20,23,24,25,26`) — including `wayfinder:map` issue **`#17`**. A tick that ticked
  the frontier as computed would have **dispatched a map**, which is not a workable unit.
- **The two-edge-kind split never defined board membership.** Nothing said which tickets are
  *on* a given map versus merely open in the repo, so untriaged issues collected into the
  frontier alongside real tickets.
- **`parent`/`subIssues` reading still requires BFS** and is capped at 7 levels of nesting —
  the exact limitation ADR-025 §6 cites as its own reason for demoting sub-issues to "shallow
  grouping" in the first place, yet the two-edge split kept reading them for grouping.
- **The reconcile rule that mirrors `Blocked by:` body lines into edges would invent structure
  from prose**: issues `#17`, `#18`, `#19` contain the literal string "Blocked by:" only inside
  narrative paragraphs, not as a structured line — a mirroring rule would misparse commentary
  as a dependency edge.
- **The reconcile rule that removes a "closed ticket still listed as blocking" edge would
  detach history** once membership becomes an edge (D2): under the old rule, a closed ticket
  finishing its work would have its only edge to its map deleted, silently dropping it from
  `tree` and from "Decisions so far".

No additional ADR-025 claim beyond §6 and §8 was found to contradict D1–D3. The four-verb
contract, JSON envelope, exit-code tiers, and distributable placement (§§1–5, 7) all stand.

## What this supersedes

Two specific pieces of ADR-025 text, quoted verbatim:

- **§6** (the sixth Decision bullet): *"So **sub-issues are demoted to optional shallow
  grouping**, and **all depth + blocking live in dependency edges**."* — together with the
  two-edge-kind split that sentence describes (native dependency edges for blocking,
  `parent`/`subIssues` nesting for grouping).
- **§8** (the eighth Decision bullet)'s `takeable` parenthetical: *"`takeable` is a precomputed
  frontier predicate **(open ∧ unblocked ∧ unassigned)**"* — and the reconcile repair set that
  bullet's own opening line incorporates by reference (*"resolved over the
  [issue-#19 grilling session](https://github.com/zentetsukenz/agent/issues/19)… that ticket
  carries the full detail"*), which is where the four-rule set actually lives.

Nothing else in ADR-025 is touched.

## Decision

**D1 — Board membership is explicit; `takeable` gains a membership conjunct.**
`takeable = member ∧ type ≠ map ∧ open ∧ no open blocker ∧ unassigned`. `type ≠ map` is kept as
an explicit guard even though D2 makes maps naturally non-takeable — belt and braces, and it
documents intent. **Evidence:** the old predicate returns **9** items on the live board
including map `#17` — a tick would have dispatched a map.

**D2 — One edge kind, not two.** A ticket `blocks` its map exactly as it `blocks` another
ticket; membership versus ordering is read off the **far node's type**, not a different edge
kind: ticket → `wayfinder:map` is membership, ticket → ticket is ordering. `parent` and
`subIssues` are neither read nor written. **Evidence:** no 7-level nesting cap, and no BFS — one
`gh issue list --json blockedBy,blocking` call returns every edge inline.

**D3 — `reconcile`'s repair set is three rules, not four, plus one migration rule.**
**Kept:** an issue carrying `sdlc:done` but still open ⇒ close it. **Kept, scoped to
repo-level:** a missing loom-vocabulary label ⇒ create the label *definition*, never edit any
issue's labels. **Added:** a `parent` edge not yet expressed as a `blocking` edge ⇒ migrate it
(the mechanical fix for the 10 existing `parent` edges D2 orphans). **Dropped, rule 1** (mirror
`Blocked by:` body lines into native edges) — would invent edges from prose: `#17`, `#18`,
`#19` contain "Blocked by:" only inside narrative paragraphs. **Dropped, rule 4** (remove a
closed-ticket-still-blocking edge) — would detach a closed ticket from its map under D2's
membership rule, deleting map history. Closing an issue is a **state** change only, never an
**edge** change.

## What is NOT reversed

This is the load-bearing scope guard — four ADR-025 commitments stand **untouched**:

1. **Distributable placement** (§1) — board mechanics still ship as a `scripts/loom/`
   distributable the harness installs, not seed content.
2. **The four-verb contract** (§2) — `read`, `tree`, `apply`, `reconcile` are unchanged; D1–D3
   correct what those verbs *compute*, not the verb surface itself.
3. **Exit-code tiers** (§8) — `0`/`1`/`2`/`3` and the `noop`/`changed[]` audit shape are
   unaffected; `apply`'s idempotence guarantee is orthogonal to the graph model.
4. **The prose-first split** (§5) — the seed still holds only the CLI contract as illustrative
   pseudo-code; the corrected predicate and edge model live in the distributable's code, never
   in the seed.

## Consequences

- **`read --unmapped` becomes necessary.** Strict membership makes any open, untriaged issue
  invisible to `read`'s default payload — it still needs to reach a human, so a dedicated
  `--unmapped` flag lists open non-members. Not a fifth verb, not part of the default payload.
- **The `parent`→`blocking` migration is a prerequisite of a meaningful frontier, not an
  independent check.** Pre-migration, membership only reaches a map for a subset of tickets;
  the corrected `takeable`/`frontier` numbers are only valid once D3's migration rule has run.
- **Untyped tickets are never auto-labelled.** Typing a ticket is human judgment; `reconcile`
  only surfaces it via `--unmapped`, never repairs it.
- **Follow-up (owned by companion tasks, not this ADR):** ADR-025 itself needs a
  partial-supersession pointer at §6 and §8 (this ADR does not edit ADR-025 to keep that diff
  reviewable); the ADR [index](index.md) and [log](log.md) need a new row/entry; the domain
  model's sharpened terms (board member, membership edge, ordering edge, unmapped, takeable,
  frontier) need to land in the [glossary](../glossary/index.md).

## Alternatives considered

- **Keep the two-edge-kind split and accept the 7-level nesting cap.** Rejected — a nested
  sub-map tree needs uncapped depth, and BFS-over-`subIssues` is strictly more code than one
  `gh issue list` call plus in-process transitive closure.
- **Keep the old `takeable` predicate and treat the 9-item over-collection as tolerable noise.**
  Rejected — it dispatches a map, which breaks the frontier's basic contract (a takeable item
  must be a workable unit).
- **Keep all four original reconcile rules.** Rejected — rule 1 invents edges from prose (no
  structured signal exists to mirror), and rule 4 actively destroys map history once membership
  is edge-based.
- **Fully supersede ADR-025 (flip its status to `Superseded`).** Rejected — the distributable
  placement, four-verb contract, exit-code tiers, and prose-first split all survived
  measurement intact; a full supersession would misrepresent how much of ADR-025 still stands.

## Related

- [ADR-025](adr-025-deterministic-board-api.md) — the ADR this partially supersedes at §6 and §8.
- [ADR-026](adr-026-gate-mechanism-layer-model.md) — the structural exemplar for partial supersession this ADR's section shape follows.
- [ADR-027](adr-027-mechanism-install-port.md) — the `mechanism→install` port that places the `scripts/loom/` distributable this ADR's corrected predicate/edge model will be implemented in.
- [ADR-018](adr-018-macro-project-management.md) — the macro-PM protocol whose frontier/takeable vocabulary this ADR corrects.
