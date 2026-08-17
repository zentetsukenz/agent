---
type: ADR
title: System-scoped QA is a coverage judgment feeding wayfinder effort-map destinations, not a new workflow — the iron law becomes a principle, e2e execution stays in CI, and regressions seed fresh terminating maps
status: Accepted
timestamp: 2026-08-17T00:00:00Z
tags: [qa, verification, e2e, coverage, regression, macro-pm, wayfinder, sdlc, principle, skill, altitude, loom]
---

# ADR-020: System-Scoped QA as a Coverage Judgment over Macro-PM

## Context

loom's verification machinery was **change-scoped**: the SDLC
[Verification phase](../../workflows/sdlc/verification.md) confirms *one* delivered change against
*its* success criteria, once, via evidence. There was no home for **system-scoped QA** — the
standing, cross-effort assurance of a whole product over time (regression, performance,
accessibility) that a growing e2e suite provides.

The `verification/` bucket also carried debt that predated the loom rework:

- `qa-witness-protocol` — a **pre-loom artifact**. Its body orchestrated a team via
  `team_create`/`team_send_message`, driven by agents named *Prometheus*/*Sisyphus* writing to
  `.sisyphus/`. None of that vocabulary exists in loom; it was never migrated.
- `verification-before-completion` — a ~400-line **kitchen-sink** skill merging four concerns (an
  iron-law completion gate, a manual-test checklist, a "gap analysis" step, and failure forensics),
  stuffed with hardcoded `npm`/`pnpm`/`fish` commands and `.omo/` paths — a prose-first and
  [deep-modules](../patterns/deep-modules.md) violation.

Meanwhile the [macro-PM](../../workflows/macro-pm/index.md) upgrade ([ADR-018](adr-018-macro-project-management.md),
[ADR-019](adr-019-loom-hermes-setup.md)) introduced the **macro altitude** — a resident agent
walking a forest of terminating [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) maps and
dispatching buildable leaves into SDLC runs. This is the altitude where a *standing* quality concern
belongs. The design question: **what, if anything, is genuinely new for system-scoped QA — versus
reuse of wayfinder, SDLC, the seam protocol, and the resident loop already in place?**

The tempting framings — "embed QA into SDLC" or "add a QA workflow beside SDLC" — were both
rejected during design (the same category the macro-PM ADR rejected): QA *construction* is ordinary
SDLC work, QA *charting* is ordinary wayfinding, and QA *operation over time* is the ordinary
resident loop. Only one thing had no home.

## Decision

### 1. The one genuinely-new thing is a coverage *judgment*, not a workflow or a charting engine

Add a single skill, [`derive-e2e-coverage`](../../SKILLS/verification/derive-e2e-coverage/SKILL.md):
given a shipped feature's **user-perspective success criteria**, decide **which end-to-end scenarios
must guard it**. It emits **scenario specs** (schema harvested from the retired qa-witness protocol —
`surface`/`name`/`steps`/`expected`/`dimension`) that become **buildable leaves** on an effort map.
It does **not** chart (wayfinder does), does **not** build scripts (an SDLC run does), and does
**not** run them (CI does). It reads the shipped surface's criteria — carried on closed (`sdlc:done`)
leaves — **not** the planning map (which would test intention) and **not** the code (which would
test implementation).

### 2. Coverage is folded into the effort map's *destination* — no new gate primitive

A **user-facing** effort's wayfinder destination becomes *"feature X built **and its user journeys
guarded by passing e2e checks in the standing suite**."* wayfinder's existing "no tickets remain /
the way is clear" completion then enforces coverage for free — the map cannot complete until the
e2e-authoring leaves are charted, dispatched, and closed. This reuses the map-completion mechanic
rather than inventing a "QA gate," honoring reference-not-restate ([ADR-013](adr-013-shared-adapter-contract-core.md)).

### 3. The obligation is *conditional*, gated by the behavioral-artifact test

Coverage is owed **only** by efforts that ship a user-perceivable surface (rendered UI, HTTP/API
endpoint, CLI, consumed artifact) — reusing the exact YES/NO *behavioral-artifact* test the retired
qa-witness protocol used. A pure internal refactor, config change, or doc edit owes nothing; a
universal obligation would force meaningless e2e busywork onto surfaceless efforts.

### 4. Authoring is 1:1 per feature; the *suite* is the system-scoped asset

The skill fires **1:1** per user-facing effort, but the e2e checks it authors accrete into **one
standing regression suite** re-run against the whole product. "1:1 authoring" and "system-scoped
asset" are the two ends of the same pipe (authoring vs. asset), not a contradiction. This is what
stops user-perspective success criteria — authored in [Discovery](../../workflows/sdlc/discovery.md),
confirmed once in Verification — from **evaporating**: they crystallize into durable guards.

### 5. E2E execution stays in CI at deterministic points; the resident agent triggers and reacts

The standing suite runs in **CI** at deterministic gates (e.g. staging deploy, pre-production), not
in the resident agent. This preserves the altitude boundary — macro *routes*, micro/CI *executes*
(the resident agent "does not follow the run into its inner loop", per [ADR-018](adr-018-macro-project-management.md)),
and matches [quality-baseline](../patterns/quality-baseline.md)'s "CI/CD assumed in place" stance.
The resident agent may *trigger* an on-demand run, but never executes tests itself.

### 6. A regression seeds a fresh *terminating* map — it is not a standing map and not an `sdlc:*` return

A red regression is **not** modelled as a non-terminating "standing QA map" (maps terminate by
definition — the perpetual quality is the resident *loop* over a forest, per ADR-018). Instead, a
regression is a **new effort**: a monitor (CI on red) mints a board ticket, and the resident agent
**AFK-seeds a fresh terminating root map** — destination *"restore failing check X to green"*, all
CI evidence linked, first frontier ticket = triage. The loop then walks it like any other effort.

Two precision points this pins down:

- **Seed, not chart.** Charting exercises judgment (a HITL act forbidden in the tick loop). Seeding
  a map whose *destination is mechanically determined* ("restore green") and whose *judgment is
  deferred into its first triage ticket* is the same AFK map-creation macro-PM already sanctions for
  `sdlc:needs-recharter` — applied to a **net-new root** (a new origin) rather than an existing leaf.
- **Not the `sdlc:*` fold-back.** `sdlc:*` is a status a run writes back **on the leaf it was
  dispatched from**. A standing-suite failure was dispatched from no leaf, so it does **not** ride
  the up-vocabulary; it is a distinct **monitor→board event** source. The tick loop absorbs it with
  no new mechanism, but it must be named as its own origin.

### 7. The iron law is promoted from a skill to a principle

"No completion claim without fresh verification evidence" is not a reusable *judgment pattern* (a
skill) — it is a **standing law woven into every phase**, i.e. a [principle](../principles/index.md),
peer to [commit-often](../principles/commit-often.md) and [architecture-first](../principles/architecture-first.md).
It lands in the (pre-existing but decayed) [verification-culture](../principles/verification-culture.md)
principle, rewritten harness-agnostic (names *evidence*, never `npm`). The
[verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md)
skill is slimmed to the **procedure** that operationalizes the law (phased checklist, confidence
rating, failure forensics, handoff shape); its former "gap analysis" step graduates into
`derive-e2e-coverage`, its iron-law prose into the principle. This is why an autonomous model cannot
silently claim unverified success: the constraint is now a law every agent references, not one skill
one agent might skip.

## Considered options

| Option | Verdict |
|---|---|
| **Embed system-QA into SDLC Verification** | Rejected — SDLC Verification is change-scoped and terminates with the milestone; a standing suite spans many efforts over time. |
| **A new QA workflow beside SDLC / macro-PM** | Rejected — QA construction is SDLC, QA charting is wayfinder, QA operation is the resident loop; a workflow would duplicate all three (same trap ADR-018 rejected). |
| **A new skill that charts a QA map from a map** | Rejected — that re-implements wayfinding; ADR-018 already rejected a second charting engine ("extend wayfinder, don't duplicate"). |
| **Read criteria from the planning map / from code** | Rejected — the map tests *intention*, code tests *implementation*; only the shipped surface's success criteria test the *user's definition of done*. |
| **Universal coverage obligation on every effort** | Rejected — forces meaningless e2e on surfaceless efforts; reuse the behavioral-artifact YES/NO test instead. |
| **A standing, non-terminating QA map** | Rejected — maps terminate by definition; perpetuity is the resident loop's, not a map's. A regression seeds a fresh terminating map. |
| **Resident agent runs the suite each tick** | Rejected — makes the router a test-executor and crosses the altitude boundary; CI executes, the resident triggers/reacts. |
| **Keep the iron law as a skill** | Rejected — a standing law woven into every phase is a principle, not a reusable judgment; leaving it a skill lets an agent skip it. |
| **Keep qa-witness-protocol** | Rejected — pre-loom debris (team/Prometheus/Sisyphus vocabulary); execution is now CI. Harvest its scenario schema, then delete. |
| **Coverage judgment skill + destination-folded coverage + CI execution + regression-as-seeded-map + iron-law-as-principle** | **Chosen.** |

## Consequences

**Implemented in this change (skill/principle layer):**

- **New:** `SKILLS/verification/derive-e2e-coverage/SKILL.md` (the coverage judgment; inherits the
  qa-witness scenario schema and the former "gap analysis" lens).
- **Rewritten:** `wiki/principles/verification-culture.md` now carries the iron law, gate function,
  evidence-over-assertion, and rationalization table — harness-agnostic.
- **Slimmed:** `SKILLS/verification/verification-before-completion/SKILL.md` → the evidence-gathering
  *procedure* only; delegates the law to the principle, gap-analysis to the new skill.
- **Deleted:** `SKILLS/verification/qa-witness-protocol/` (schema harvested first).
- **Kept + cross-linked:** `visual-verification` is now the executor for `visual`-dimension scenarios.
- **Re-wired:** `SKILLS/verification/index.md`, `workflows/sdlc/verification.md`,
  `contract/primitives.md`. Skill count holds at 37; `scripts/validate.sh` passes.

**Protocol wiring (landed in the follow-up):**

- The **coverage-in-destination discipline** (§2) is written into
  [wayfinder macro-mode](../../SKILLS/planning/wayfinder/SKILL.md#coverage-in-the-destination-user-facing-efforts)
  and the [macro-PM workflow](../../workflows/macro-pm/index.md#system-scoped-qa--a-third-origin-closing-the-quality-loop).
- The **regression-seed reaction rule** (§6) is written into
  [wayfinder macro-mode](../../SKILLS/planning/wayfinder/SKILL.md#a-third-origin-a-regression-seeds-a-fresh-map-not-down-not-up)
  as a **third origin** beside the two-vocabulary seam.
- **Label decision:** the monitor→board regression event uses a **dedicated `qa:regression-failed`
  label**, *not* a reused `wayfinder:grilling`. Rationale: the event is a genuinely distinct *origin*
  (neither a `wayfinder:*` down-dispatch nor an `sdlc:*` leaf-return), and its sole job is to
  **authorize the mechanical AFK-seed** of a fresh root map. Filing it as an ordinary `grilling`
  decision ticket would lose that seed authorization and misplace a root-map-seed event as a leaf
  decision. *After* seeding, everything reuses existing vocabulary — the seeded map's first ticket is
  a normal `wayfinder:grilling` triage.

## Related

- [ADR-018](adr-018-macro-project-management.md) — the macro altitude, terminating maps, AFK map-creation, and the "resident routes / micro executes" boundary this ADR builds on.
- [ADR-019](adr-019-loom-hermes-setup.md) — the resident harness that runs the loop the standing suite reacts within.
- [ADR-016](adr-016-embedded-review-gate.md) — the precedent for promoting a cross-cutting discipline (commit-often) to a principle rather than a skill.
- [verification-culture](../principles/verification-culture.md) — the principle this ADR strengthens with the iron law.
- [derive-e2e-coverage](../../SKILLS/verification/derive-e2e-coverage/SKILL.md) — the new coverage judgment.
- [quality-baseline](../patterns/quality-baseline.md) — the per-project floor whose CI checks supply verification evidence and run the standing suite.
- [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) — the charting skill whose destinations coverage folds into.
