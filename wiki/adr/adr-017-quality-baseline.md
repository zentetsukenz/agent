---
type: ADR
title: A per-project quality baseline (lint, code-quality, security, coverage) chosen at setup and enforced at every quality gate
status: Accepted
timestamp: 2026-08-03T00:00:00Z
tags: [quality, quality-gate, quality-baseline, lint, security, coverage, code-quality, ratchet, keyless, setup, sdlc, loom]
---

# ADR-017: Quality baseline embedded in setup and every gate

## Context

[ADR-016](adr-016-embedded-review-gate.md) made a **quality gate** (Verify → Review → Commit)
a first-class checkpoint, fired at every slice boundary and enforced by the Orchestrator. But
its **Verify** step only ran whatever commands a given task happened to name. Nothing declared,
once, *what "quality" means for this project* — and so nothing held every gate to the same bar.

The result is the exact failure the SDLC is meant to prevent, and the one the request names:
quality is enforced as a **ritual at the end** rather than a **standing floor**. Coverage erodes
one un-tested slice at a time; a linter green in slice 1 is never re-run; a new dependency ships
a known CVE no gate looked for. Each gap is invisible until a late audit — by which point the
drop spans many commits and is expensive to trace. The team *checks* quality but hasn't yet made
it non-negotiable.

Meanwhile the [setup contract](../../contract/index.md) already does the one thing needed to fix
this: it **explores the project's stack** and **interviews** the human to tailor config. That is
exactly the moment to pick this project's quality tools — the choice is stack-dependent, and the
Explore step already knows the stack.

## Decision

**Introduce a per-project *quality baseline* across four aspects — lint, code-quality, security,
coverage — selected during setup from keyless-first tools, recorded as a single source of truth,
and run at every existing quality gate's Verify step. A gate that drops below the baseline fails,
exactly like a red test.** See the [Quality Baseline pattern](../patterns/quality-baseline.md).

1. **Four distinct aspects, not merged.** `lint` (style/mechanical correctness), `code-quality`
   (complexity/duplication/maintainability), `security` (SAST + vulnerable deps), and `coverage`
   (test %). Each names **one tool** for this project.

2. **Keyless-first selection** ([keyless-by-default](../principles/keyless-by-default.md)). The
   recommended tool per aspect runs locally with no API key/account (`eslint`/`ruff`/`clippy`,
   `npm audit`/`osv-scanner`/`govulncheck`/`cargo audit`, `vitest --coverage`/`pytest --cov`,
   …). Hosted platforms (Sonar, Snyk, Codecov) are opt-in examples only. An aspect with no
   keyless tool for the stack is recorded as `none` **with a reason**, never forced onto a key.

3. **Ratchet (no-regression) floor by default, optional absolute target.** The baseline captures
   the project's *current* measured level; a gate fails only if a metric drops below it (finding
   count for lint/code-quality/security; percentage for coverage). Any gate that improves a
   metric re-baselines it upward — the floor only climbs. A team may additionally set an absolute
   target per aspect (e.g. coverage ≥ 80%); when set, the gate enforces `max(ratchet, target)`.

4. **Single source of truth with deliberate precedence.** Prefer the project's **own committed
   tool config / scripts** (CI- and human-consumable) — loom records only a pointer to the
   command. **Fall back** to a loom-owned, provenance-marked *Quality baseline* section in the
   always-on project-context file when no committed config exists. Never a second, forkable copy.

5. **Prose-driven, harness-agnostic enforcement — no new gate, no new port.** The baseline is a
   fixed contract for the *existing* gate's Verify step: [Planning](../../workflows/sdlc/planning.md#review-gate-cadence)
   states which aspects each gate runs, [Implementation](../../workflows/sdlc/implementation.md#quality-gates)
   runs them per slice with the Orchestrator holding the gate, and
   [Verification](../../workflows/sdlc/verification.md) runs the full baseline across the whole
   delivery as final evidence. It lives in the setup **interview** as generic content — it does
   **not** add a fifth [port](../../contract/PORTS.md), because tool selection reuses the existing
   `capability→tool` discipline and the recorded baseline is ordinary project-context, not a new
   render primitive.

## Considered options

| Option | Verdict |
|---|---|
| **A new dedicated quality-baseline primitive + a fifth adapter port** | Rejected — over-built. The baseline is project context (commands + floors), not a new file kind that needs harness-specific rendering. Adding a port to render four commands fails the deletion test: folding it into the existing interview + project-context file **concentrates**, not scatters. |
| **A standalone `quality-audit` skill run at the end** | Rejected — reinstates the exact "found too late" failure. An end-of-delivery audit spreads a quality drop across many commits; the point is to catch it at the *next* gate while the diff is one slice. |
| **Absolute thresholds only (e.g. coverage ≥ 80%)** | Rejected as the default — an over-ambitious absolute number stalls every gate on a real legacy repo, so teams disable it and get nothing. Kept as an *opt-in* on top of the ratchet. |
| **Deterministic harness hooks that block on a failing baseline** | Deferred — stronger but harness-specific and heavier (keys/config, per-harness hook wiring). The prose-driven workflow floor works everywhere today; hooks are a possible future hardening. |
| **Loom writes/edits the project's CI + tool configs directly** | Rejected — violates the setup safety rule (change no application code, CI, or runtime config). Loom *prefers* an existing committed config and only *adds* one with explicit confirmation; otherwise it records the fallback section. |
| **Merge lint + code-quality into one "static analysis" aspect** | Rejected — loses a real distinction the request named: a linter passing says nothing about complexity/duplication. Four aspects, four floors. |

## Consequences

- New pattern [quality-baseline](../patterns/quality-baseline.md) and glossary terms
  **Quality baseline** / **Quality aspect**.
- [contract/interview.md](../../contract/interview.md) gains a **Quality baseline** interview
  section (stack-driven aspect/tool/floor selection, keyless-first, ratchet default); the
  section is enumerated wherever the adapters list the interview questions
  ([adapters/mirai/setup.md](../../adapters/mirai/setup.md), [adapters/opencode/setup.md](../../adapters/opencode/setup.md),
  and both `references/interview.md`).
- [contract/primitives.md](../../contract/primitives.md) records where the baseline lives
  (committed config preferred; project-context fallback) alongside the project-context file
  description; [contract/discipline.md](../../contract/discipline.md) adds a generic
  invariant-check that the baseline was recorded and that its aspects are keyless-or-`none`.
- SDLC phases updated: [Planning](../../workflows/sdlc/planning.md) (cadence states each gate's
  baseline aspects), [Implementation](../../workflows/sdlc/implementation.md) (Verify step runs
  the baseline; Orchestrator holds on breach), [Verification](../../workflows/sdlc/verification.md)
  (final gate runs the full baseline). No change to the phase *count* or the gate *shape*.
- **No new adapter port and no protocol change.** Tool-name resolution reuses `capability→tool`;
  the baseline record is project-context, so no `primitive→file` addition. Adapters only gain the
  new interview-section reference in their enumerations.
- [scripts/validate.sh](../../scripts/validate.sh) is unaffected structurally (link-checks catch
  the new cross-links); no new frontmatter rule is required.

## Related

- [quality-baseline](../patterns/quality-baseline.md) — the pattern this ADR adopts.
- [ADR-016](adr-016-embedded-review-gate.md) — the embedded quality gate this baseline gives a standing floor to.
- [keyless-by-default](../principles/keyless-by-default.md) / [ADR-010](adr-010-keyless-by-default-recommendations.md) — why every recommended baseline tool runs without a key.
- [commit-often](../principles/commit-often.md), [verification-culture](../principles/verification-culture.md) — the gate principles the baseline strengthens.
- [Planning](../../workflows/sdlc/planning.md), [Implementation](../../workflows/sdlc/implementation.md), [Verification](../../workflows/sdlc/verification.md) — the phases that plan and enforce the baseline.
- [contract/interview.md](../../contract/interview.md), [contract/primitives.md](../../contract/primitives.md), [contract/discipline.md](../../contract/discipline.md) — the setup-core docs this decision touches.
