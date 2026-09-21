---
type: ADR
title: Dispatch is not a wayfinding concern — the altitude seam becomes its own skill, `planning/altitude-handoff`, and wayfinder is charting-only; reverses ADR-018's rejection of a skill beside wayfinder
status: Accepted
timestamp: 2026-09-21T00:00:00Z
tags: [skill, wayfinder, altitude, seam, dispatch, macro, deep-modules, board-api, amends-adr-018, contract, loom]
---

# ADR-030: Dispatch Is Not a Wayfinding Concern

> **Amends [ADR-018](adr-018-macro-project-management.md) (2026-09-21).** ADR-018 decision #1 says
> "Reuse `wayfinder`; **do not add a parallel skill** (less to maintain)"; its *Considered options*
> table rejects "**New macro-PM skill beside wayfinder**"; its *Consequences* state "**no new
> planning skill is created**." This ADR reverses those three clauses and **only** those three.
> ADR-018's model stands entirely: macro PM is still a **recursive wayfinding layer over SDLC
> runs**, the tracker is still the single source of truth, the substrate is still altitude-scoped,
> routing is still mechanical, and the two-vocabulary seam is unchanged. What moves is the
> *machinery*, not the *model*. This is a different clause from the one
> [ADR-019](adr-019-loom-hermes-setup.md) amended ("not a peer workflow" → "not a peer
> *phase-pipeline*"), which stands as ADR-019 left it.

## Context

`SKILLS/planning/wayfinder/SKILL.md` does two unrelated jobs. Its
`## Macro mode: dispatching into SDLC runs` section is **63 of 205 lines — 31% of the file** — and
serves a different caller than the rest: a resident PM walking a board, versus a human charting a
map. [deep-modules](../patterns/deep-modules.md) is the governing pattern — a module is deep when a
small interface hides a lot — and wayfinder exposes two interfaces to two callers.

The sharper finding is that the dispatch machinery already lives in **four** places, none of which
is its named home (measured 2026-09-20):

| Where | What it holds |
|---|---|
| `SKILLS/planning/wayfinder/SKILL.md:143-205` | the prose contract |
| [`workflows/macro-pm/index.md`](../../workflows/macro-pm/index.md) `:105-195` | the seam and routing, gisted |
| `.claude/agents/pm.md:47`, `.claude/commands/tick.md:18-19` | the Claude Code render, restated |
| `scripts/loom/board/model.js` | the executable half — six transitions, ten labels |

A thing with four descriptions and no name is the defect; the 31% figure is a symptom. The blast
radius confirms it is contract-level, not a skill edit: **17 files** reference macro mode —
including [`contract/interview.md`](../../contract/interview.md) and three Hermes adapter files —
and **19 anchor links** point into the section, which `scripts/validate.sh` checks.

ADR-018 weighed this question once and decided the other way. It weighed **maintenance cost** only
("more to maintain"), on a section that did not yet exist in the form it now takes. Two facts have
since changed: the section grew to a third of the file with a second caller, and
[ADR-020](adr-020-system-scoped-qa.md) added the `qa:regression-failed` third origin, which splits
across the seam. This is new evidence, not a change of taste.

## Decision

### 1. Wayfinder is charting-only, with a one-way dependency

Wayfinder names the destination and charts the map. Nothing else. It ends with **zero** references
to the dispatch skill: the three inline macro notes (`SKILL.md:10-12`, `:22`, `:91`) are **deleted,
not repointed**, and the frontmatter `description` drops its macro sentence. The new skill depends
on wayfinder; wayfinder does not know it exists.

A cut that left forward links behind would be cosmetic — wayfinder would still document a second
caller, just by link instead of by section, and deep-modules would be unsatisfied.

### 2. The name is `altitude-handoff`; the bucket is `planning`

`SKILLS/planning/altitude-handoff/SKILL.md`.

**The name.** ADR-018 decision #4 already frames this thing as "reusing the existing
PRODUCE/DISCOVER contract **across the altitude boundary**" — that is
[`stage-handoff`](../../SKILLS/preservation/stage-handoff/SKILL.md)'s contract, one
[altitude](../glossary/index.md#altitude) up. PRODUCE/DISCOVER is two-sided by construction, so
"handoff" covers the `sdlc:*` up-return without stretching. Both words are existing exact terms;
the name coins no new vocabulary.

**The bucket.** `planning`, beside wayfinder — its only dependency, and where a reader asking "how
does the board hand work down?" will look. The honest objection (raised in the grilling: dispatch is
arguably not planning) is true but does not discriminate: the rosters in
[`contract/primitives.md`](../../contract/primitives.md) are **per-SDLC-stage** and have **no macro
slot**, so `planning/wayfinder` already sits in the Planner roster without a Planner ever invoking
it. Placing `altitude-handoff` in `planning` keeps that misfit at one instance; `preservation`
(symmetry with `stage-handoff`) would add a second by putting a macro skill in the micro
Delivery→Closing roster, and `meta` is scoped to shared primitives other skills reference and
requires `model-invoked`/`core primitive` in the description ([SPEC.md](../../SPEC.md)), which this
is not.

The missing macro slot in the stage rosters is a real finding. It is recorded separately, not fixed
here.

### 3. What `altitude-handoff` carries — and what it does not

**Carries:** the opt-in (macro mode is on when the project's
[communication protocol document](../patterns/seam-artifact-protocol.md#the-macro-section-and-the-one-source-of-truth-invariant)
names this tracker as the macro source of truth); the two-vocabulary seam (`wayfinder:*` down,
`sdlc:*` up); the routing table as *contract*; the **routing** half of `qa:regression-failed`; and
both translations — a buildable leaf down into a `shaping/<milestone>/`
[seam artifact](../glossary/index.md#seam-artifact), an `sdlc:*` status back up.

**Does not carry:** the tick loop, which stays in
[`workflows/macro-pm/`](../../workflows/macro-pm/index.md); and charting, which stays in wayfinder.

**Stays in wayfinder**, because each is a charting rule:

| Rule | Why it is charting |
|---|---|
| Coverage in the destination | a rule about what a destination says |
| Nesting: a ticket that is itself a map | fog graduating into a sub-map |
| The **map-seeding** half of `qa:regression-failed` | seeding a root map is map-creation |

The cut is by **altitude, not by section boundary**: cutting at the `##` heading would evict two
rules the charting skill should own.

Two consequences follow from the one-way dependency in decision 1. First, the coverage clause
currently reads "the effort's closed (`sdlc:done`) leaves' user-perspective success criteria"; it
becomes "**closed** leaves", with the `sdlc:done` → closed mapping owned by `altitude-handoff`.
Second, `qa:regression-failed` needs no named home in wayfinder: `altitude-handoff` routes the
label and invokes wayfinder's existing **Chart the map** entry point, so the seeding act is the
charting act wayfinder already documents.

### 4. `altitude-handoff` is the spec for `board apply`'s six transitions

[ADR-025](adr-025-deterministic-board-api.md)'s rule is *"the seed holds the contract, the
distributable holds the code."* This ADR renames where that contract lives, so it says so
explicitly: the six transition names in `scripts/loom/board/model.js` —
`claim`, `dispatch`, `close`, `graduate-recharter`, `open-clarification`, `seed-regression-map` —
are specified by `planning/altitude-handoff`, and the comments citing their spec cite it by that
name.

Without this clause the distributable is left quoting a home that was silently retired. `scripts/`
is not in `validate.sh`'s link roots, so nothing would ever catch it.

The two transitions that currently refuse to run, returning a named doctrine gap rather than
inventing an answer (`planGraduateRecharter`, `planSeedRegressionMap`), are **not** resolved here —
they belong to the board-machinery map, not to this one.

### 5. No new adapter port

Port 4's skill binding is a **wildcard** row in every adapter
(`adapters/*/MAPPING.md` §1: `SKILLS/<bucket>/<slug>/SKILL.md` → `<target>/skills/<slug>/`), so a
skill is picked up by roster membership, not enumeration. Adding `altitude-handoff` obliges **no**
adapter change. The only shared-prose edits are the Planner roster line in `contract/primitives.md`
and the `SKILLS/planning/index.md` row.

`altitude-handoff` is invoked by the resident PM, not by a human, so it omits
`disable-model-invocation` (which means front-door-only) and gets **no** `commands/` wrapper.

## Considered options

| Option | Verdict |
|---|---|
| **Leave macro mode in wayfinder** (ADR-018's answer) | Rejected — 31% of the file, a second caller, and four undated copies of the machinery. ADR-018 weighed maintenance cost on a much smaller section. |
| **Keep opt-in pointers in wayfinder** | Rejected — wayfinder would still document a second caller, by link instead of by section. Cosmetic. |
| **Move the coverage clause out too** | Rejected — it is a rule about writing a destination. Its one dispatch dependency (`sdlc:done`) is reworded away instead. |
| Name it **`altitude-seam`** | Rejected — the glossary term for the boundary; a skill is an act, and sharing the name confuses concept with procedure. |
| Name it **`seam-router`** | Rejected — "router" is ADR prose, not glossary vocabulary, and it undersells the translation: a ticket becoming a `shaping/` artifact is more than routing. |
| Name it **`leaf-dispatch`** | Rejected — covers only the down direction, and collides in register with the unrelated `planning/dispatch-context`. |
| Bucket **`preservation`** | Rejected — maximal name symmetry, but it puts a macro skill in the micro Delivery→Closing roster: a second misfit rather than a shared one. |
| Bucket **`meta`** | Rejected — meta is shared primitives other skills reference, and requires `model-invoked`/`core primitive` in the description. |
| **Two skills** (seam + procedure) | Rejected — ~60 lines across two files, two index rows, two roster entries; the split re-creates the coupling it claims to remove. |
| **Delete the routing table, leave `model.js` authoritative** | Rejected — ADR-026 did **not** reverse prose-first-for-judgment or the seed-holds-the-contract boundary; the prose keeps the contract and names the verbs that execute it. |
| **One skill, `planning/altitude-handoff`, carrying the contract and naming the verbs** | **Chosen.** |

## Consequences

- `wayfinder` loses 63 lines and one of its two interfaces; its `description` and three inline notes
  change. It becomes a skill with one job.
- A new skill exists where ADR-018 said none would. ADR-018 gains a reciprocal amendment note in the
  form ADR-019's uses.
- **16 of the 19** inbound anchors are repointed. Three are unaffected: the nesting and coverage
  anchors stay in wayfinder, and promoting those headings from `###` to `##` does not change their
  slugs.
- `scripts/loom/board/model.js` and `scripts/loom/board/fixtures/board.json` cite the new home.
  Neither is link-checked, so both need a deliberate sweep.
- The glossary entries for [Altitude](../glossary/index.md#altitude),
  [Altitude seam](../glossary/index.md#altitude-seam),
  [Resident agent](../glossary/index.md#resident-agent) and
  [`qa:regression-failed`](../glossary/index.md#qaregression-failed-regression-origin) name
  wayfinder as the home of dispatch and are corrected.
- No adapter changes, no new port, no new `scripts/loom/` code.

## Related

- [ADR-018](adr-018-macro-project-management.md) — the ADR this amends; its model stands.
- [ADR-019](adr-019-loom-hermes-setup.md) — the earlier, different amendment to ADR-018.
- [ADR-020](adr-020-system-scoped-qa.md) — the `qa:regression-failed` third origin that splits across the seam.
- [ADR-025](adr-025-deterministic-board-api.md) — "the seed holds the contract, the distributable holds the code."
- [ADR-026](adr-026-gate-mechanism-layer-model.md) — the layer model; what it did and did not reverse.
- [ADR-013](adr-013-shared-adapter-contract-core.md) — reference, never restate: the discipline the rewiring obeys.
- [deep-modules](../patterns/deep-modules.md) — the governing pattern.
- [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) — the skill this narrows.
- [workflows/macro-pm](../../workflows/macro-pm/index.md) — the seed that orchestrates both.
