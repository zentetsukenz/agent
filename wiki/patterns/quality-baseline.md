---
type: Pattern
title: Quality Baseline
description: A per-project, four-aspect quality floor (lint, code-quality, security, coverage) chosen at setup from keyless-first tools, recorded as a single source of truth, and run at every SDLC quality gate's Verify step so quality can never silently drop between gates.
tags: [quality, quality-gate, lint, security, coverage, code-quality, ratchet, keyless, sdlc, setup, loom]
timestamp: 2026-08-03T00:00:00Z
---

# Quality Baseline

> **Applied vocabulary:** see the glossary for [Quality baseline](../glossary/index.md#quality-baseline),
> [Quality aspect](../glossary/index.md#quality-aspect), and [Capability](../glossary/index.md#capability).
> This page is the conceptual reference; [ADR-017](../adr/adr-017-quality-baseline.md) records the
> decision to adopt it. It gives a *standing floor* to the [quality gate](../../workflows/sdlc/implementation.md#quality-gates)
> that [ADR-016](../adr/adr-016-embedded-review-gate.md) introduced.

## The problem

The [quality gate](../../workflows/sdlc/implementation.md#quality-gates) (Verify → Review →
Commit) already fires at every slice boundary. But its **Verify** step historically ran
whatever the task happened to name — an ad-hoc set of commands per task. Nothing declared,
once and for all, *what "quality" means for this project* and held every gate to it.

The consequence is the failure the SDLC is supposed to prevent: quality is enforced as a
**ritual at the end** rather than a **standing floor**. Coverage erodes one un-tested slice at
a time; a linter that was green in slice 1 is never run again; a new dependency ships a known
CVE that no gate looked for. Each gap is invisible until a late audit — by which point the
drop is spread across many commits and expensive to trace. Quality is *checked* but not yet
*in the team's blood*.

## Core idea

**Make "quality" an explicit, project-wide contract that every gate re-checks — not a
per-task afterthought.** At [setup](../../contract/index.md) the agent picks, for this
project's actual stack, one tool per **quality aspect**, records the run command and a
**floor**, and every [quality gate](../../workflows/sdlc/implementation.md#quality-gates) runs
the whole baseline as part of its Verify step. A gate that drops below the floor **fails** —
it is never committed past, exactly like a red test.

```text
        setup (explore stack → recommend keyless-first tools → record baseline)
                                     │
                                     ▼
   ┌──────────────── the quality baseline (single source of truth) ────────────────┐
   │  lint          code-quality      security          coverage                   │
   │  <cmd + floor> <cmd + floor>     <cmd + floor>     <cmd + floor / ratchet>     │
   └────────────────────────────────────────────────────────────────────────────────┘
                                     │  read + run at
        ┌────────────┬───────────────┼───────────────┬────────────┐
        ▼            ▼               ▼               ▼            ▼
   gate @ slice1  gate @ slice2  gate @ slice3   …          Verification
   (Verify runs   (Verify runs   (Verify runs               (whole-delivery
    the baseline)  the baseline)  the baseline)               final gate)
```

## The four aspects

A baseline names **one tool per aspect** — four distinct concerns, deliberately not merged:

| Aspect | What it checks | Keyless-first examples by stack |
|---|---|---|
| **lint** | Style + mechanical correctness (unused vars, obvious bugs, format) | JS/TS `eslint`, Python `ruff`, Go `go vet`+`gofmt`, Rust `clippy`+`fmt` |
| **code-quality** | Complexity, duplication, maintainability (deeper than lint) | `eslint` complexity rules / `jscpd`, Python `radon`/`ruff` complexity, Go `gocyclo`, Rust `clippy` pedantic |
| **security** | SAST + known-vulnerable dependencies | `npm audit`/`osv-scanner`/`semgrep`, `pip-audit`/`bandit`, `govulncheck`, `cargo audit` |
| **coverage** | Test coverage of the change / suite | `vitest --coverage`/`jest --coverage`/`c8`, `pytest --cov`, `go test -cover`, `cargo tarpaulin` |

Selection is **keyless-first** ([keyless-by-default](../principles/keyless-by-default.md)): the
recommended tool for each aspect runs locally with **no API key or account**. Hosted platforms
(SonarCloud, Snyk, Codecov, …) appear only as *opt-in examples if the team already uses one* —
never as the default. If a stack has no keyless tool for an aspect, the baseline records the
aspect as **`none` with a stated reason** rather than forcing a key-bearing dependency.

## The floor: ratchet by default

The default floor for every aspect is **no-regression (a ratchet)**: the baseline captures the
project's *current* measured level, and a gate fails only if the metric drops **below** it.

- **Lint / code-quality / security** ratchet on **finding count** — zero new findings past the
  recorded count (ideally zero outright). A gate that introduces a new lint error, a new
  complexity violation, or a new vulnerable dependency fails.
- **Coverage** ratchets on **percentage** — the change must not lower the recorded coverage
  figure.

The ratchet is what fits real, legacy codebases: it forbids *erosion* without demanding an
unrealistic absolute number on day one, and it lets the floor **climb** — any gate that
improves a metric re-baselines it upward, so quality only ever moves one direction.

A team may additionally set an **absolute target** per aspect (e.g. coverage ≥ 80%) at setup;
when set, the gate enforces `max(ratchet, target)`. Absolute targets are opt-in because an
over-ambitious one stalls every gate on an existing repo.

## Where the baseline lives — single source of truth

The baseline is recorded **once**, and precedence is deliberate so it never forks:

1. **Prefer the project's own committed tool config / scripts.** If the project already has
   (or can add without touching runtime code) an `eslint` config, a coverage threshold in
   `vitest.config`, a `.semgrep.yml`, an `npm`/`make`/`just` script, etc., that config **is**
   the baseline — loom records only a *pointer* to the command that runs it. This keeps the
   floor consumable by the project's own CI and by humans, with no second copy to drift.
2. **Fall back to a loom-owned section in the project-context file** (the always-on
   `AGENTS.md` / `mirai-instructions.md` / `AGENTS`-equivalent). When no committed config
   exists, loom writes a provenance-marked **Quality baseline** section there — the aspect
   tool, run command, and floor per aspect — sitting next to the build/test commands already
   documented. This is context every agent already loads, so the gate always sees it.

The setup safety rules still hold: loom **adds** a committed config file only with explicit
confirmation and **changes no application code, CI, or runtime config** on its own — the
fallback exists precisely so the baseline can be recorded without touching project tooling.

## How it plugs into the quality gate

The baseline does **not** add a new gate. It gives the existing gate's first step a fixed
contract:

- **[Implementation](../../workflows/sdlc/implementation.md#quality-gates) — every slice gate.**
  Step 1 (Verify) runs the task's own checks **plus the quality baseline** for the aspects the
  slice's diff touches. The [Orchestrator holds the gate](../../workflows/sdlc/implementation.md#the-orchestrator):
  a baseline breach is a failed gate — fix and re-run, never advance or commit past it. A
  breach that reveals a deeper design problem escalates just like a Review finding.
- **[Verification](../../workflows/sdlc/verification.md) — the final gate.** The whole-delivery
  gate runs the **full** baseline across the entire change (not just per-slice deltas) as part
  of its evidence, so the shipped delivery is proven top-to-bottom, not just slice-by-slice.
- **[Planning](../../workflows/sdlc/planning.md#review-gate-cadence)** states, per gate, which
  aspects that gate's Verify step must run — the same way it already states each gate's Review
  focus — so baseline enforcement is designed into the cadence, not improvised.

Enforcement is **prose-driven and harness-agnostic**: the gate runs the recorded commands and
the Orchestrator judges the result. Deterministic harness hooks (block-on-breach) are a
possible *future* hardening, not a requirement — the workflow-layer floor works on every
harness with no key or hook dependency.

## Why

- **Quality can't silently drop.** A ratcheted floor re-checked at every gate turns "found too
  late" into "caught at the next commit," while the diff is still one reviewable slice.
- **Locality.** The floor lives where the gate already looks (the Verify step + the
  project-context file), not in a separate audit run someone must remember to trigger.
- **One source of truth.** Preferring the project's committed config means the loom floor, the
  team's CI, and a human all read the same numbers — no fork to drift.
- **Keyless, so it actually runs.** A baseline built from local tools needs no account setup,
  so it survives contact with a fresh clone and a new contributor.
- **Portable.** Naming aspects + capabilities (not tools) keeps the pattern harness- and
  stack-agnostic; swapping `eslint` for `biome`, or a keyless scanner for a hosted one, is a
  baseline edit, not a workflow change.

## Related

- [ADR-017](../adr/adr-017-quality-baseline.md) — the decision that adopts this pattern.
- [ADR-016](../adr/adr-016-embedded-review-gate.md) — the embedded quality gate this baseline gives a standing floor to.
- [commit-often](../principles/commit-often.md) — a green gate (now including the baseline) is a commit point.
- [verification-culture](../principles/verification-culture.md) — evidence over assertion; the baseline is the evidence the Verify step gathers.
- [keyless-by-default](../principles/keyless-by-default.md) — why every recommended baseline tool runs without a key.
- [Implementation](../../workflows/sdlc/implementation.md), [Planning](../../workflows/sdlc/planning.md), [Verification](../../workflows/sdlc/verification.md) — the phases that plan and enforce the baseline.
- [contract/interview.md](../../contract/interview.md) — the setup interview section that selects the baseline.
