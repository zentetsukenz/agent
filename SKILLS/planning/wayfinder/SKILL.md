---
name: wayfinder
description: Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear. In opt-in macro mode, nest maps and dispatch buildable leaves down into SDLC runs across the altitude seam.
disable-model-invocation: true
---

> **Path flexibility:** Tracker operations below (map, child ticket, blocking, frontier, claim, resolve) resolve
> against the project's issue tracker in priority order: `loom.toml#paths.tracker` (when the loom adapter ships) →
> a project's own `docs/agents/issue-tracker.md` → the [Issue Tracker](../../../wiki/environments/issue-tracker.md)
> environment doc's local-markdown default and "Wayfinding operations" section. In [macro mode](#macro-mode-dispatching-into-sdlc-runs)
> the tracker is also the macro **source of truth** named in the project's
> [communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant).

A loose idea has arrived — too big for one agent session, and wrapped in fog: the way from here to the **destination** isn't visible yet. Wayfinding is about finding that way, not charging at the destination. This skill charts the way as a **shared map** on the repo's issue tracker, then works its **decision tickets** — questions whose resolution is a decision, not slices of a build to execute — one at a time until the route is clear.

The destination varies per effort, and naming it is the first act of charting — it shapes every ticket. It might be a spec to hand off and iterate on, a decision to lock before planning starts, or a change made in place like a data-structure migration. The map is domain-agnostic — engineering work, course content, whatever fits the shape.

## Plan, don't do

Wayfinder is **planning** by default: each ticket resolves a decision, and the map is done when the way is clear — nothing left to decide before someone goes and does the thing. The pull to just do the work is usually the signal you've reached the edge of the map and it's time to hand off. An effort can override this in its **Notes** — carrying execution into the map itself — but absent that, produce decisions, not deliverables.

> **Macro mode** ([below](#macro-mode-dispatching-into-sdlc-runs)) is exactly that override, formalized: a `task` ticket's execution is not done in the map session — it is **dispatched into an SDLC run** across the [altitude seam](../../../wiki/glossary/index.md#altitude-seam). The map stays a planner; the building happens one altitude down. Absent macro mode, this section stands unchanged.

## Refer by name

Every map and ticket is an issue, so it has a **name** — its title. In everything the human reads — narration, the map's Decisions-so-far — refer to it by that name, never by a bare id, number, or slug. A wall of `#42, #43, #44` is illegible; names read at a glance. The id and URL don't vanish — a name wraps its link — but they ride _inside_ the name, never stand in for it.

## The Map

The map is a single issue on this repo's issue tracker, labelled `wayfinder:map` — the canonical artifact. Its tickets are child issues of the map.

The map is an **index**, not a store. It lists the decisions made and points at the tickets that hold their detail; a decision lives in exactly one place — its ticket — so the map never restates it, only gists it and links.

**Where the map, its child tickets, blocking, and frontier queries physically live is tracker-specific.** Consult the [Issue Tracker](../../../wiki/environments/issue-tracker.md) environment doc's "Wayfinding operations" section for how _this_ repo expresses them — it defaults to the local-markdown tracker (`.scratch/<effort-slug>/map.md` + `.scratch/<effort-slug>/issues/`) unless the project's own `docs/agents/issue-tracker.md` names GitHub, GitLab, or another tracker with native issues.

### The map body

The whole map at low resolution, loaded once per session. Open tickets are **not** listed — they are open child issues, found by query.

```markdown
## Destination

<what reaching the end of this map looks like — the spec, decision, or change this effort is finding its way to. One or two lines; every session orients to it before choosing a ticket.>

## Notes

<domain; skills every session should consult; standing preferences for this effort>

## Decisions so far

<!-- the index — one line per closed ticket: enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [<closed ticket title>](link) — <one-line gist of the answer>

## Not yet specified

<!-- see "Fog of war": in-scope fog you can't ticket yet; graduates as the frontier advances -->

## Out of scope

<!-- see "Out of scope": work ruled beyond the destination; closed, never graduates -->
```

### Tickets

Each ticket is a **child issue** of the map; the tracker's issue id is its identity. Its body is the question, sized to one 100K token agent session:

```markdown
## Question

<the decision or investigation this ticket resolves>
```

Each ticket carries a `wayfinder:<type>` label — one of `research`, `prototype`, `grilling`, `task` (see [Ticket Types](#ticket-types)).

A session **claims** a ticket by assigning it to the dev driving the map, **first**, before any work, so concurrent sessions skip it. That assignee _is_ the claim: an open, unassigned ticket is unclaimed.

Blocking uses the tracker's **native** dependency relationship — essential because it renders the frontier _visually_ in the tracker's own UI, so the human sees what's takeable without opening the map. Only a tracker that lacks native blocking falls back to a body convention. A ticket is **unblocked** when every ticket blocking it is closed; the **frontier** is the open, unblocked, unclaimed children — the edge of the known.

The answer isn't part of the body — it's recorded on resolution (see [Work through the map](#work-through-the-map)). Assets created while resolving a ticket are linked from the issue, not pasted in.

## Ticket Types

Every ticket is either **HITL** — human in the loop, worked _with_ a human who speaks for themselves — or **AFK**, driven by the agent alone. A HITL ticket only resolves through that live exchange; the agent never stands in for the human's side of it (a grilling agent that answers its own questions has broken this).

- **Research** (AFK): Reading documentation, third-party APIs, or local resources like knowledge bases to surface a fact a decision waits on. Resolved by the [research](../../discovery/research/SKILL.md) skill's background subagent. Use when knowledge outside the current working directory is required.
- **Prototype** (HITL): Raise the fidelity of the discussion by making a cheap, rough, concrete artifact to react to — an outline, a rough take, a stub, or UI/logic code via the [prototype](../../implementation/prototype/SKILL.md) skill. Links the prototype as an asset. Use when "how should it look" or "how should it behave" is the key question.
- **Grilling** (HITL): Conversation via the [grill-with-docs](../../discovery/grill-with-docs/SKILL.md) skill, one question at a time. The default case.
- **Task** (HITL or AFK): Manual work that must happen before a _decision_ can be made — nothing to decide, prototype, or research, but the discussion is blocked until it's done. Signing up for a service so its API can be judged, provisioning access, moving data so its shape can be seen. This is the one type that _does_ rather than decides — and it earns its place by unblocking a decision, not by delivering the destination. The agent drives it alone where it can (AFK); otherwise it hands the human a precise checklist (HITL). Resolved when the work is done; the answer records what was done and any resulting facts (credentials location, new URLs, row counts) later tickets depend on.

> In **[macro mode](#macro-mode-dispatching-into-sdlc-runs)** a `task` ticket carries a further sense: a **buildable leaf** — a decided, specified chunk of the destination — dispatched _down_ into an SDLC run rather than done in the map session. This is the "carry execution into the map" override from [Plan, don't do](#plan-dont-do). Outside macro mode, `task` keeps only its decision-unblocking sense above.

## Fog of war

The map is _deliberately_ incomplete: don't chart what you can't yet see. Beyond the live tickets lies the **fog of war** — the dim view of decisions and investigations you can tell are coming but can't yet pin down, because they hang on questions still open. Resolving a ticket clears the fog ahead of it, graduating whatever's now specifiable into fresh tickets — one at a time, until the way to the destination is clear and no tickets remain.

The map's **Not yet specified** section is where that dim view is written down: the suspected question, the area to revisit later. It's the undiscovered frontier _toward_ the destination — everything here is in scope, just not sharp enough to ticket. Write as loosely or as fully as the view allows; it doubles as a signpost for collaborators reading where the effort is headed.

**Fog or ticket?** The test is whether you can state the question precisely now — _not_ whether you can answer it now.

- **Ticket when** the question is already sharp — even if it's blocked and you can't act on it yet.
- **Not yet specified when** you can't yet phrase it that sharply. Don't pre-slice the fog into ticket-sized pieces: it's coarser than a ticket, and one patch may graduate into several tickets, or none, once the frontier reaches it.

**Not yet specified** excludes what's already decided (Decisions so far), what's already a live ticket, and what's out of scope (the next section).

## Out of scope

Fog only ever gathers _toward_ the destination. The destination fixes the scope, so work beyond it is **out of scope** — it isn't fog, and it doesn't belong in **Not yet specified**. It gets its own **Out of scope** section on the map: work you've consciously ruled out of _this_ effort. Scope, not sharpness, lands it here.

Out-of-scope work never graduates — the frontier stops at the destination — so it returns only if the destination is redrawn, and then as a fresh effort, not a resumption.

Ruling something out of scope is a scoping act, not a step on the route. When a ticket that already exists turns out to sit past the destination — mis-scoped in while charting, or exposed by a resolution — **close it** (a closed ticket is unambiguously off the frontier) and leave one line in the **Out of scope** section: the gist plus why it's out of scope, linking the closed ticket. It stays out of **Decisions so far**, which records the route actually walked — a scope boundary isn't a step on it.

## Invocation

Two modes. Either way, **never resolve more than one ticket per session** — with the exception of research tickets.

### Chart the map

User invokes with a loose idea.

1. **Name the destination.** Run a [grill-with-docs](../../discovery/grill-with-docs/SKILL.md) session to pin down what this map is finding its way to — the spec, decision, or change. The destination fixes the scope, so it's settled first.
2. **Map the frontier.** Grill again, **breadth-first** this time: fan out across the whole space rather than deep on any one thread, surfacing the open decisions and the first steps takeable now. **If this surfaces no fog** — the way to the destination is already clear, the whole journey small enough for one session — you don't need a map. Stop and ask the user how they'd like to proceed.
3. **Create the map** (label `wayfinder:map`): Destination and Notes filled in, Decisions-so-far empty, the fog sketched into **Not yet specified**.
4. **Create the tickets you can specify now** as child issues of the map — then wire blocking edges in a **second pass** (issues need ids before they can reference each other). Wiring sorts them into the frontier and the blocked; everything you can't yet specify stays in the fog — the **Not yet specified** section.
5. **Fire the research subagents.** For each `research` ticket you just created, spin up the [research](../../discovery/research/SKILL.md) skill's subagent to resolve it in parallel, capturing its findings on a throwaway `research/<name>` branch with a context pointer from the ticket.
6. Stop — charting is one session's work; it hand-resolves nothing.

### Work through the map

User invokes with a map (URL or number). A ticket is **optional** — without one, you pick the next decision, not the user.

1. Load the **map** — the low-res view, not every ticket body.
2. Choose the ticket. If the user named one, use it. Otherwise take the first frontier ticket in order. **Claim it**: assign it to yourself before any work.
3. Resolve it — **zoom as needed**: fetch the full body of any related or closed ticket on demand; invoke the skills the `## Notes` block names. If in doubt, use [grill-with-docs](../../discovery/grill-with-docs/SKILL.md).
4. Record the resolution: post the answer as a **resolution comment**, **close** the issue, and **append a context pointer** to the map's Decisions-so-far.
5. Add newly-surfaced tickets (create-then-wire); graduate any fog the answer has made specifiable, clearing each graduated patch from **Not yet specified** so it lives only as its new ticket. If the answer reveals a ticket — this one or another — sits beyond the destination, **rule it out of scope** rather than resolving it on the route. If the decision invalidates other parts of the map, update or delete those tickets.

The user may run unblocked tickets in parallel, so expect other sessions to be editing the tracker concurrently.

## Macro mode: dispatching into SDLC runs

Everything above is wayfinding at the **macro [altitude](../../../wiki/glossary/index.md#altitude)** — charting effort too big for one [SDLC](../../../workflows/sdlc/index.md) run. **Macro mode** turns the map from a pure planner into the layer that _drives_ the build: its buildable leaves are dispatched **down** into SDLC runs, and those runs report **up** to the map. It is the [Plan, don't do](#plan-dont-do) override made concrete, and it is governed by [ADR-018](../../../wiki/adr/adr-018-macro-project-management.md). Absent macro mode, ignore this section — wayfinder plans and hands off, unchanged.

Macro mode is **opt-in per effort**, enabled from the map's **Notes** (e.g. `mode: macro`). It requires the project's [communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant) to name the macro **source of truth** (this tracker) — the map obeys the **one-source-of-truth invariant**: do not open a second, unregistered tracker (a local `TODO.md`, an off-board list) for state that belongs on the map.

### Coverage in the destination (user-facing efforts)

For an effort that ships a **user-perceivable surface** (a rendered UI, an HTTP/API endpoint, a CLI, or a consumed artifact), the map's **destination is not reached when the feature is merely built** — it is reached when the feature is built **and its user journeys are guarded by passing end-to-end checks in the project's standing regression suite**. Fold that clause into the destination text when charting such a map (per [ADR-020](../../../wiki/adr/adr-020-system-scoped-qa.md)):

> Destination: `<feature> shipped` **and** its user journeys guarded by passing e2e checks in the standing suite.

This needs **no new completion gate**. wayfinder's ordinary rule — the way is clear only when _no tickets remain_ — already enforces it: the [derive-e2e-coverage](../../verification/derive-e2e-coverage/SKILL.md) judgment reads the effort's closed (`sdlc:done`) leaves' user-perspective success criteria and graduates **e2e-authoring tickets** (buildable leaves that build the scenarios and add them to the suite). Until those leaves are charted, dispatched, and closed, the frontier is non-empty and the map cannot complete.

The obligation is **conditional**: apply the [behavioral-artifact test](../../verification/derive-e2e-coverage/SKILL.md#when-to-use-this-skill). A **surfaceless** effort (an internal refactor, a config change, a doc-only edit) ships no user-perceivable behavior and owes **no** e2e clause in its destination — do not manufacture coverage busywork for it.

### Nesting: a ticket that is itself a map

Vision → Milestone → Epic is **recursion, not new levels**: a ticket may graduate into its own **sub-map** (a child `wayfinder:map`) when resolving it turns out to need more than one session of its own charting. The parent ticket links its sub-map; the sub-map's destination is that ticket's question. This is the ordinary [fog-of-war](#fog-of-war) graduation — a patch of fog becoming _a map_ instead of _a ticket_ — so nothing new is needed to chart deep work: an Epic is a map, its Milestone a parent map, and so on up. Keep nesting shallow: only split into a sub-map when a single map can't hold the effort, never to mirror an org chart.

### The two-vocabulary seam

The map talks to SDLC runs through two label vocabularies on the tracker — the whole [altitude seam](../../../wiki/glossary/index.md#altitude-seam), no side channel:

- **`wayfinder:*` flows down** — the ticket types this skill already emits (`research`, `prototype`, `grilling`, `task`). They say what the board hands _into_ a run.
- **`sdlc:*` flows up** — an **evolving status** an SDLC run writes back on the leaf it was dispatched from. It mirrors this skill's own HITL/AFK split:

| `sdlc:*` status            | Kind     | What the map does (mechanically)                                                                                                                                                             |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sdlc:in-progress`         | —        | A run has claimed the leaf; leave it.                                                                                                                                                        |
| `sdlc:done`                | terminal | Close the leaf, record the linked PR/commit in **Decisions so far**, advance the frontier.                                                                                                   |
| `sdlc:needs-recharter`     | AFK      | The run couldn't decompose the leaf (too big). **Graduate it to a sub-map** (see nesting) and re-chart.                                                                                      |
| `sdlc:needs-clarification` | HITL     | The run hit spec ambiguity (e.g. repeated verification failure). **Open a `wayfinder:grilling` ticket** and surface it to the human — the up-vocabulary folds back into the down-vocabulary. |

The status names the **routing target**; the _cause_ (why it needs re-charter or clarification) lives in the linked artifact, not the label.

### Dispatch is mechanical — the ticket decides, not the agent

A macro session **routes by label + status, never by its own judgment** — this is what keeps the tracker the single source of truth and the loop restart-safe (a fresh session on the same board routes identically). The routing table:

| Frontier ticket                              | Dispatch to                                                       | Translation (down)                                                                                                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wayfinder:research`                         | [research](../../discovery/research/SKILL.md) subagent (as today) | —                                                                                                                                                                                                     |
| `wayfinder:grilling` / `wayfinder:prototype` | HITL — worked in-session with the human (as today)                | —                                                                                                                                                                                                     |
| `wayfinder:task` (buildable leaf)            | an **SDLC run**                                                   | write the ticket + its linked artifacts as a `shaping/<milestone>/` [seam artifact](../../../wiki/glossary/index.md#seam-artifact) in the run's memory ledger, which Planning's DISCOVER gate expects |

**Down** (dispatch a leaf): translate the ticket into the SDLC run's entry artifact, set the leaf `sdlc:in-progress`, and let the run proceed in _its own_ (memory) substrate — the map does not follow it into the inner loop. If the leaf is still fuzzy (a `research`/`grilling` ticket), it is **not** a buildable leaf yet; resolve it as a decision first — a leaf only dispatches to a build once it is decided and specified.

**Up** (a run returns): read the `sdlc:*` status the run wrote and apply the table above. Only `sdlc:done` closes the leaf; the AFK/HITL returns feed straight back into this skill's own machinery (a sub-map, or a `grilling` ticket) — no new mechanism.

Right-sizing needs no predictor: a leaf that was too big **announces itself** as `sdlc:needs-recharter` when the SDLC run's Planning can't produce a well-formed plan. The map reacts (graduate to sub-map); it does not try to guess size up front.

### A third origin: a regression seeds a fresh map (not down, not up)

The standing regression suite (built by the [coverage clause](#coverage-in-the-destination-user-facing-efforts) above) runs in **CI** at deterministic points — a staging deploy, a pre-production gate — never in the macro session itself. When it goes **red**, CI posts one ticket to the board marked **`qa:regression-failed`** with the failing run's evidence linked. This is a **third origin**, distinct from the two-vocabulary seam: it is neither a `wayfinder:*` leaf the map dispatched **down** nor an `sdlc:*` status a dispatched run reported **up** — no leaf produced it, so it rides neither vocabulary.

The macro session handles it **mechanically**, and — like [`sdlc:needs-recharter`](#the-two-vocabulary-seam) — **AFK**:

| Inbound origin         | Kind | What the map does (mechanically)                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qa:regression-failed` | AFK  | **Seed a fresh root map** (a net-new `wayfinder:map`) whose destination is _"restore failing check `<X>` to green"_, link the CI evidence, and open its first frontier ticket as a `wayfinder:grilling` **triage** ("real regression, flake, or intended change?"). Then close the `qa:regression-failed` ticket — its job was only to trigger the seed. |

**Seed, not chart.** Charting exercises judgment (naming a destination, mapping a frontier — a HITL act forbidden in the mechanical loop). Seeding is allowed here because the destination is **mechanically determined** ("restore green") and the judgment is **deferred into the seeded map's first triage ticket**, not exercised now. This is the same AFK map-creation the loop already performs for `sdlc:needs-recharter` — applied to a **net-new root** rather than an existing leaf. Once seeded, the new map is an ordinary terminating effort: it is walked, its fix dispatched as a buildable leaf, and it **closes** when the check is green again. A regression therefore never reopens the long-closed effort map that shipped the feature — it is its **own** effort in the forest.
