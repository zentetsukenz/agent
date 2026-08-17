---
name: derive-e2e-coverage
description: Given a shipped feature's user-perspective success criteria, decide WHICH end-to-end scenarios must guard it — the judgment that turns "definition of done" into durable, re-runnable e2e checks that accrete into the project's standing regression suite. Use when charting or completing a user-facing effort map, to fold e2e coverage into its destination; skip for efforts that ship no user-perceivable surface.
---

# Derive E2E Coverage

> **Strategy**: CRYSTALLIZE — turn a feature's _user-perspective_ success criteria into durable
> end-to-end scenarios, so the definition of "done" does not evaporate after a one-time check but
> becomes a permanent guard in the standing regression suite.

This skill is a **judgment**, not a charting engine and not a test runner. It decides _what user
journeys must be guarded_; [wayfinder](../../planning/wayfinder/SKILL.md) charts the work, an
[SDLC](../../../workflows/sdlc/index.md) run _builds_ the scripts, and CI _runs_ them. Its output
is a set of **scenario specs** that become buildable leaves on an effort map and, once built, live
forever in the suite.

## When to use this skill

Apply the **behavioral-artifact test** (borrowed from the retired qa-witness protocol): _does this
effort produce or modify a user-perceivable surface — a rendered UI, an HTTP/API endpoint, a CLI,
or a generated artifact a user consumes?_

- **YES → derive coverage.** The effort's destination owes e2e guards for its user journeys.
- **NO → skip entirely.** A pure internal refactor, a config change, or a doc edit that changes no
  user-perceivable behavior owes nothing. Do not manufacture e2e busywork for a surfaceless effort.

This mirrors the conditional coverage obligation: coverage is folded into an effort map's
**destination** only for user-facing efforts (see [Where the output goes](#where-the-output-goes)).

## What it reads — the shipped surface, in user terms

Read the feature's **user-perspective success criteria** — the _testable success criteria_
[Discovery](../../../workflows/sdlc/discovery.md) authored, carried on the effort's closed
(`sdlc:done`) leaves and their `delivery/<milestone>/verified-change` artifacts. These describe
what the _user_ can now do, in the user's language.

- Read criteria, **not** the planning map body (that tests intention, not what shipped).
- Read criteria, **not** the implementation code (that tests how it was built, not the user's
  definition of done).
- If a criterion is not phrased in user-observable terms, that is a signal to sharpen it before
  deriving a scenario — an e2e guard can only assert what a user can observe.

## What it produces — scenario specs

For each user journey the criteria imply, emit one **scenario spec** (schema inherited from the
retired qa-witness protocol, the durable part worth keeping):

```yaml
surface: ui | api | cli | artifact # which user-perceivable surface
name: <kebab-slug> # e.g. login-happy-path
steps: # user-observable actions, in user terms
  - navigate /login
  - fill email, password
  - click "Sign in"
expected: <observable outcome> # e.g. "dashboard renders, greeting shows the user's name"
dimension: functional | visual | performance | accessibility # what this scenario guards
```

- **One scenario per user journey**, not per code path. Cover the happy path first, then the error
  and boundary paths the criteria call out.
- **`dimension`** names what the scenario guards. `visual` scenarios delegate their pixel-level
  assertion to [visual-verification](../visual-verification/SKILL.md); `functional`/`performance`/
  `accessibility` assert against the running surface.
- **Assert what the user observes**, never internal state. "The greeting shows the user's name" is
  a guard; "the `session` row was written" is not a user-perspective guard.

## Where the output goes

The scenario specs are **buildable-leaf material for an effort map**, not tests you write here:

1. **Fold coverage into the effort map's destination.** A user-facing effort's destination is not
   _"feature X built"_ but _"feature X built **and its user journeys guarded by passing e2e checks
   in the standing suite**."_ wayfinder's existing "no tickets remain / the way is clear" completion
   then enforces coverage with **no new gate primitive** — the map cannot complete until the
   e2e-authoring leaves are charted, dispatched to SDLC, and closed.
2. **Each scenario spec becomes a buildable leaf** — dispatched down into an SDLC run that builds it
   as a real e2e script (Playwright or the project's chosen tool) and adds it to the standing suite.
3. **The suite is the system-scoped asset.** Authoring is 1:1 with a feature; the _suite_ accretes
   across every feature and is re-run against the whole product — its long-term operation
   (scheduled runs at staging/pre-production, reacting to regressions) is a **macro-PM** concern,
   not this skill's. A red regression later is a _new_ effort seeded onto the board, never a
   reopening of this closed effort map.

## What this skill is not

- ❌ **Not a charting skill.** It does not name destinations or work tickets — it _feeds_
  [wayfinder](../../planning/wayfinder/SKILL.md), which charts.
- ❌ **Not a test runner.** It does not execute scenarios — CI does, at deterministic points
  (staging deploy, pre-production). It does not follow a run into its inner loop.
- ❌ **Not a completion gate of its own.** Coverage is enforced by the effort map's destination
  definition, reusing wayfinder's existing completion — no new mechanism.
- ❌ **Not change-scoped verification.** Confirming _this_ shipment meets its criteria once is the
  SDLC [Verification](../../../workflows/sdlc/verification.md) phase's job; this skill leaves behind
  a _durable_ guard, which is the different, system-scoped concern.

## Related

- [wayfinder](../../planning/wayfinder/SKILL.md) — charts the effort map whose destination this skill's output extends.
- [visual-verification](../visual-verification/SKILL.md) — the executor for `visual`-dimension scenarios.
- [verification-before-completion](../verification-before-completion/SKILL.md) — the per-change evidence gate (its former "gap analysis" step is subsumed here).
- [verification-culture](../../../wiki/principles/verification-culture.md) — the iron law this coverage serves at system scale.
- [SDLC Verification phase](../../../workflows/sdlc/verification.md) — change-scoped confirmation, distinct from the durable guards this skill authors.
- [macro-pm workflow](../../../workflows/macro-pm/index.md) — where the standing suite's operation and regression-reaction live.
