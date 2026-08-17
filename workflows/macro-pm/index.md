---
type: Index
title: Macro-PM Workflow
description: A prose-first reactive-lifecycle orchestration seed for macro-scale project management — a resident agent charts many efforts as nested wayfinder maps on a single source of truth and dispatches their buildable leaves down into SDLC runs, looping forever rather than terminating.
---

# Macro-PM Workflow

An ordered orchestration seed for **macro-scale project management** — the lifecycle *above* a
single [SDLC](../sdlc/index.md) run. Where SDLC is a **terminating** lifecycle (one shaped change
flows Discovery → … → Preservation and *ends* in a straight line), macro-PM is a **reactive**
lifecycle with the opposite topology: a resident agent **recursively walks a growing tree** of
decision tickets on a single source of truth — charting, dispatching buildable leaves down into SDLC
runs, integrating what they return, and growing new tickets ahead as fog clears. Any one tree-walk
terminates locally (the way becomes clear); the resident loop never does, because the trees keep
growing and new efforts keep arriving. Both are prose seeds an adapter's interpreting agent compiles
into a concrete harness; they differ in *shape*, not in kind. See
[workflows](../index.md) for the two lifecycle kinds and the prose-first principle, and
[ADR-018](../../wiki/adr/adr-018-macro-project-management.md) for the decision behind this seed.

## Two altitudes

Macro-PM sits at the **macro [altitude](../../wiki/glossary/index.md#altitude)**; SDLC sits at the
**micro** altitude. Macro-PM does not re-implement planning or building — it **charts** effort too
big for one SDLC run and **dispatches** buildable pieces down into SDLC runs, then integrates what
they return.

```text
┌─ MACRO-PM (reactive lifecycle, this seed) ─────────────────────────────────┐
│  a resident agent, watching the single source of truth (the "board")       │
│  charts nested wayfinder maps · routes tickets · dispatches · integrates    │
│      │  altitude seam (dispatch DOWN / report UP)                           │
│      ▼                                                                       │
│  ┌ SDLC run ┐  ┌ SDLC run ┐  ┌ SDLC run ┐   ← each a terminating lifecycle  │
│  └──────────┘  └──────────┘  └──────────┘     rendered by a per-invocation  │
│                                               harness (see harness-archetypes)│
└─────────────────────────────────────────────────────────────────────────────┘
```

The macro→micro crossing is the [altitude seam](../../wiki/glossary/index.md#altitude-seam); the
resident agent is its **translator**. Rendering the resident agent onto a concrete
[resident harness](../../wiki/patterns/harness-archetypes.md) (e.g. Hermes) is an **adapter**
concern — this seed is harness-agnostic prose ([ADR-018](../../wiki/adr/adr-018-macro-project-management.md) #8).

## Charting is a skill; this seed orchestrates it

The *act* of charting a map — naming a destination, mapping the frontier, working decision tickets,
clearing fog — is the [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) skill's
[macro mode](../../SKILLS/planning/wayfinder/SKILL.md#macro-mode-dispatching-into-sdlc-runs). This
seed does not restate it; it **references** it, the same way SDLC phases reference the skills they
use. What this seed adds is the *reactive lifecycle around* charting: the recursive tree-walk, the
tick loop, the dispatch seam, and the standing invariants.

## The reactive lifecycle: a recursive tree-walk

SDLC is a **fixed straight line** — a shaped change flows Discovery → … → Preservation and ends.
Macro-PM is the opposite topology: a **recursive walk over a tree that grows as you walk it**. A
[wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) map is a **rooted tree** of decision tickets,
and this seed's lifecycle is the resident agent *walking* that tree — descending the frontier,
resolving nodes, and letting each resolution grow new nodes ahead. The traversal shape, not a linear
pipeline, is the essence macro-PM inherits from wayfinding.

### The tree

A map is a tree of five node kinds (defined by
[wayfinder ticket types](../../SKILLS/planning/wayfinder/SKILL.md#ticket-types); gisted here):

- **`map`** — the (sub)tree root. Its *destination* is why the subtree exists.
- **`research`** (AFK) — a scout sent ahead to surface a fact a decision waits on.
- **`grilling`** (HITL) — a crossroads: a decision only a stakeholder can make.
- **`prototype`** (HITL) — a cheap, real artifact built to gauge how to proceed.
- **`task`** — one real step toward the destination.

The recursion lives in **`task`**. A task small enough is a **buildable leaf** — dispatched *down*
into an SDLC run. A task too big to plan **graduates into a sub-map** — the walker *descends into a
new subtree* whose destination is that task's question. That is Vision → Milestone → Epic as
**recursion, not new levels** (see
[wayfinder nesting](../../SKILLS/planning/wayfinder/SKILL.md#nesting-a-ticket-that-is-itself-a-map)):

```text
                        ┌ map (root) ┐  destination = the effort
                        └─────┬──────┘
        ┌──────────────┬──────┼───────────────┬─────────────────┐
     research       grilling  │            prototype           task ──────────┐
     (scout)       (crossroad)│            (gauge it)      ┌────┴─────┐        │
                              │                            │ buildable │   too big │
                          task│(sub-map)                   │  leaf     │  to plan  │
                        ┌─────┴──────┐                     └────┬─────┘        │
                        │ map (child)│  ← recursion              │ dispatch    │ graduate
                        └─────┬──────┘                           ▼ DOWN        ▼ to sub-map
                     research · grilling · prototype · task   ┌ SDLC run ┐  ┌ map ┐
                              (walk continues, deeper)        └──────────┘  └─────┘
   · · · · · · · · · · · · · · · · · fog of war · · · · · · · · · · · · · · · · · · · ·
   (dim frontier — resolving any node above clears fog here, materializing new nodes)
```

The tree is **self-extending**: you never walk a fixed structure. Resolving a node clears the
[fog of war](../../SKILLS/planning/wayfinder/SKILL.md#fog-of-war) ahead of it, and whatever is now
sharp enough **graduates into fresh sibling tickets** — one patch may become several nodes, one
node, or none. The tree grows in front of the walker.

### The two directions across the seam

The walk drives work down and integrates results up — both expressed as label vocabularies on the
source of truth ([the two-vocabulary seam](#the-two-vocabulary-seam)), no side channel:

```text
   DOWN  wayfinder:*                          UP  sdlc:*
   ───────────────────▶                       ◀───────────────────
   a buildable-leaf task                      the SDLC run writes back an evolving status:
   dispatches into an        ┌ SDLC run ┐       sdlc:in-progress  → claimed; leave it
   SDLC run (translated   ──▶│ (micro   │──┐    sdlc:done         → close leaf, advance frontier
   into a shaping/ seam      │  altitude)│  │   sdlc:needs-recharter    → graduate leaf to sub-map (AFK)
   artifact in the ledger)   └──────────┘  │   sdlc:needs-clarification → open a grilling ticket (HITL)
                                           └──▶ the walk reacts, mechanically
```

`wayfinder:*` says what the board hands *into* a run; `sdlc:*` is what a finished run reports *back*.
Crucially the up-vocabulary **folds back into the down-vocabulary**: `needs-recharter` becomes a new
sub-map, `needs-clarification` becomes a new `grilling` ticket — the loop closes on itself with no
new mechanism. Full tables live in
[wayfinder macro mode](../../SKILLS/planning/wayfinder/SKILL.md#the-two-vocabulary-seam).

### A single node's lifecycle, nested in the walk

Inside the recursive walk, each *individual* node advances through a small, mechanical lifecycle —
this is the per-node view, one level down from the tree-walk:

```text
       (charted)              dispatched            returns
  ┌──────────────┐   task    ┌──────────────┐   sdlc:*   ┌──────────────┐
  │  frontier    │ ────────▶ │ sdlc:in-      │ ─────────▶ │  resolved /  │
  │  ticket      │           │ progress     │            │  re-charter /│
  └──────────────┘           └──────────────┘            │  clarify     │
        ▲  research/grilling/prototype resolved in place        │
        └───────────────────────────────────────────────────────┘
                 (fog clears → new frontier tickets graduate)
```

- **Local termination, global reaction.** A single tree-walk *does* bottom out — "the way is clear,
  no tickets remain" — so the recursion terminates locally. What never terminates is the **resident
  loop**: the tree keeps growing under the walker, and new efforts keep arriving.
- **A forest, not one tree.** The resident agent walks **many root maps concurrently** — a whole
  forest of independent efforts on the one source of truth. Each root is a separate destination; the
  walker interleaves them tick by tick, never assuming the forest is "done". This is the *temporal*
  sense of "reactive"; the *structural* sense is the per-tree recursion above.
- **The trees adapt.** The set of nodes, their blocking edges, and the fog are all mutable; each tick
  may add, resolve, re-block, graduate to a sub-map, or rule nodes out of scope. That mutation *is*
  the lifecycle.

## The tick loop

The resident agent runs one **tick** per interval (or per board event). A tick is one step of the
[recursive tree-walk](#the-reactive-lifecycle-a-recursive-tree-walk) — across the *whole forest*, not
one tree. Each tick is a **fresh, stateless session**: it carries nothing forward; it reconstructs
its whole picture from the source of truth:

1. **Read the frontier** — the open, unblocked, unclaimed tickets across *every* root map on the
   source of truth (the forest's combined frontier).
2. **Route mechanically** — for each takeable ticket, apply the [dispatch table](#mechanical-routing)
   by *label + status only*. No judgment; the ticket's type decides.
3. **Dispatch or resolve** — dispatch a buildable leaf DOWN into an SDLC run (altitude seam); resolve
   a decision ticket in place (HITL or via a subagent).
4. **Integrate returns** — read `sdlc:*` statuses written back by finished runs and apply them (close,
   graduate to sub-map, or surface for clarification).
5. **Exit** — the session ends; state lives entirely on the board. The next tick starts fresh.

Statelessness is not an optimization — it is the **restart-safety** guarantee: a fresh agent on
another server, pointed at the same source of truth, ticks identically ([ADR-018](../../wiki/adr/adr-018-macro-project-management.md) #5).

## The two-vocabulary seam

The altitude seam is expressed as two label vocabularies on the source of truth — no side channel.
Defined in full by [wayfinder macro mode](../../SKILLS/planning/wayfinder/SKILL.md#the-two-vocabulary-seam);
gisted here:

- **`wayfinder:*` flows down** — `research` · `prototype` · `grilling` · `task`. A `task` with the
  execution override is a **buildable leaf**, dispatched into an SDLC run; the others are decision
  tickets resolved at the macro altitude.
- **`sdlc:*` flows up** — an evolving *status* a finished SDLC run writes back: `in-progress` ·
  `done` · `needs-recharter` (AFK — graduate the leaf to a sub-map) · `needs-clarification` (HITL —
  fold back into a `wayfinder:grilling` ticket). Labels route by *target*; the *cause* lives in the
  linked artifact.
- **`qa:regression-failed` is a *third origin*** — not down, not up. Posted by CI when the standing
  regression suite goes red (no leaf produced it), it is handled AFK by **seeding a fresh terminating
  root map** ("restore green"). See [System-scoped QA](#system-scoped-qa--a-third-origin-closing-the-quality-loop).

## Mechanical routing

Routing is a **pure state→action lookup**, never agent judgment — the property that keeps the source
of truth authoritative and the loop restart-safe. It is a
[routing table](../../SKILLS/planning/wayfinder/SKILL.md#dispatch-is-mechanical--the-ticket-decides-not-the-agent),
not a decision the agent reasons through. Right-sizing needs no predictor: a leaf too big to plan
returns `sdlc:needs-recharter` from the SDLC run's own Planning gate, and the machine graduates it to
a sub-map (see [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md)).

## The altitude seam — dispatch down, report up

The resident agent is the **translator** across the seam, reusing the
[Seam Artifact Protocol](../../wiki/patterns/seam-artifact-protocol.md) PRODUCE/DISCOVER contract:

- **Down** — translate a buildable-leaf ticket + its linked artifacts into a `shaping/<milestone>/`
  seam artifact in the SDLC run's **micro ledger**, set the ticket `sdlc:in-progress`, and dispatch
  the run. The macro loop does not follow the run into its inner loop.
- **Up** — read the finished run's `sdlc:*` status and its `delivery/<milestone>/verified-change`
  artifact, and apply the return table.

**Cross-harness constraint.** When the resident (macro) harness dispatches into a *different*
(micro) harness — the common case, since resident harnesses dispatch into per-invocation ones
([harness-archetypes](../../wiki/patterns/harness-archetypes.md)) — the micro ledger **must** be a
**shared, on-disk** [substrate](../../wiki/glossary/index.md#substrate) both harnesses can read, and
it is **gitignored** (ephemeral coordination is never version-controlled — durable knowledge goes to
the wiki). Harness memory cannot carry the baton across a harness boundary. See the
[seam-artifact protocol](../../wiki/patterns/seam-artifact-protocol.md#substrate-is-also-altitude-scoped).

## System-scoped QA — a third origin, closing the quality loop

Per [ADR-020](../../wiki/adr/adr-020-system-scoped-qa.md), system-scoped QA is not a separate
workflow — it is woven into this loop through **two reuses and one new origin**, all charting-side:

- **Coverage folds into the destination.** A **user-facing** effort's map destination is *"built
  **and** its user journeys guarded by passing e2e checks in the standing suite"* — so the ordinary
  "no tickets remain" completion enforces coverage with **no new gate**. The
  [derive-e2e-coverage](../../SKILLS/verification/derive-e2e-coverage/SKILL.md) judgment reads the
  effort's closed (`sdlc:done`) leaves' user-perspective criteria and graduates **e2e-authoring
  leaves** that build the scenarios and add them to the suite. Conditional on the behavioral-artifact
  test — surfaceless efforts owe nothing. See
  [wayfinder: coverage in the destination](../../SKILLS/planning/wayfinder/SKILL.md#coverage-in-the-destination-user-facing-efforts).
- **CI runs the suite; the resident agent triggers and reacts.** The standing suite executes in
  **CI** at deterministic points (staging deploy, pre-production gate), never in the tick loop —
  preserving the altitude boundary (macro *routes*, micro/CI *executes*). The resident agent may
  *trigger* an on-demand run, but never runs tests itself.
- **A regression is a third origin.** When the suite goes red, CI posts a **`qa:regression-failed`**
  ticket (evidence linked). This is neither a `wayfinder:*` down-dispatch nor an `sdlc:*` up-return —
  no leaf produced it. The loop handles it **mechanically and AFK**: **seed a fresh terminating root
  map** (destination *"restore check `<X>` to green"*, first ticket a `wayfinder:grilling` triage),
  then close the trigger ticket. **Seed, not chart** — the destination is mechanical and the judgment
  is deferred into the seeded map's triage, the same AFK map-creation the loop performs for
  `sdlc:needs-recharter`, applied to a net-new root. A regression is thus its **own** effort in the
  forest; it never reopens the closed effort map that shipped the feature. See
  [wayfinder: a third origin](../../SKILLS/planning/wayfinder/SKILL.md#a-third-origin-a-regression-seeds-a-fresh-map-not-down-not-up).

## Cross-cutting invariants

Woven into every tick, not deferred:

- **The board is the single source of truth.** All project state lives on the registered source of
  truth. The resident agent's private memory holds only continuity/persona/skills — **never** project
  state. The test: *"if this agent died and a fresh one booted elsewhere, would the project stall
  without this datum?"* If yes, it belongs on the board.
- **Exactly one source of truth.** A second, unregistered tracker (a stray `TODO.md`, an off-board
  list) is a violation, whatever substrate was chosen — see the
  [one-source-of-truth invariant](../../wiki/patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant).
- **Memory is scarce by design.** A bounded memory budget is a forcing function: it pushes project
  state back to the board where it belongs. Do not enlarge memory to hold more project state.
- **Mechanical over judgment.** Routing is a lookup; judgment lives in *charting* (a human/HITL act),
  not in the tick loop.
- **HITL surfaces, never self-answers.** A `grilling`/`prototype`/`needs-clarification` ticket is
  worked *with* a human; the resident agent surfaces it, it does not stand in for the human.

## Related

- [workflows index](../index.md) — the two lifecycle kinds (terminating | reactive) and the prose-first principle.
- [sdlc workflow](../sdlc/index.md) — the terminating lifecycle this seed dispatches into.
- [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) — the charting skill (macro mode) this seed orchestrates.
- [ADR-018](../../wiki/adr/adr-018-macro-project-management.md) — the decision behind macro-PM.
- [harness-archetypes](../../wiki/patterns/harness-archetypes.md) — why a resident harness renders this seed and a per-invocation harness renders SDLC.
- [seam-artifact-protocol](../../wiki/patterns/seam-artifact-protocol.md) — the ledger contract the altitude seam reuses; the substrate + one-source-of-truth rules.
- [glossary: altitude, altitude seam, resident agent, substrate](../../wiki/glossary/index.md#altitude).
