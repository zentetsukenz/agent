---
type: ADR
title: Verification checks spec fidelity as a surfaced-delta evidence category, not just correctness — deviations route to the dispatcher, never auto-fail
status: Accepted
timestamp: 2026-08-19T00:00:00Z
tags: [verification, verifier, spec-fidelity, acceptance-criteria, evidence, dispatch, tracker, sdlc, loom]
---

# ADR-024: Spec-Fidelity Is a Surfaced-Delta Verification Evidence Category

> Extends [ADR-008](adr-008-delivery-dispatchers.md) (the Verifier returns evidence; the
> dispatcher decides) and the [verification-culture](../principles/verification-culture.md)
> iron law (no completion claim without fresh evidence). It adds **no new primitive, no new
> port, and no new agent** — it names one more evidence category the existing Verifier
> produces and the existing dispatcher routes on.

## Context

When a PR claims "closes #X", verification checks **correctness** — does the code work, is it
well-written, are there security gaps — but not **spec fidelity**: does the implementation
match #X's acceptance criteria. Spec-vs-implementation deltas slip past the gate and surface
only as manual follow-ups.

Observed in practice ([issue #14](https://github.com/zentetsukenz/agent/issues/14), on
`zentetsukenz/affiliate-project`): issue #34's spec required token-validation regex
`^[a-z0-9_-]{1,64}$`. PR #59 shipped `^[A-Za-z0-9_-]+$` — two deviations:

1. The missing `{1,64}` length cap — a genuine gap, caught only by a human review after the
   fact (#60 → PR #66).
2. The uppercase class `[A-Za-z0-9_-]` vs the spec's `[a-z0-9_-]` — **pragmatically correct**
   for UUID `tenant_id`s, but an un-reconciled spec deviation that sat unresolved for a week
   (until PR #69).

The Verifier passed PR #59. Both were spec-vs-implementation deltas it should have surfaced.
The [verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md)
phase 4 ("Success criteria — adversarial") was generic ("re-read the plan/criteria, check
each line-by-line") and did not reach into the closing ticket's criteria at all.

The second deviation is the load-bearing case: auto-failing on any departure from the literal
spec would have **rejected pragmatically-correct code for literalism**. The right primitive is
to *surface the delta* and let the orchestrator/human decide whether it was intended.

## Decision

Add **spec fidelity** as an evidence category to the verification procedure. When the artifact
under review closes a ticket:

1. Resolve the closing ticket's acceptance criteria through the
   [Issue Tracker](../environments/issue-tracker.md) environment doc — which supplies the fetch
   mechanism (`gh issue view <N>`, a `.scratch/` file read, etc.) so the shared skill stays
   **tracker-agnostic**.
2. For each criterion, report **matches / deviates / not-addressed**.
3. A **deviation is evidence to hand back, not an automatic failure.** The Verifier has no
   `edit` — it verifies, the **dispatcher (or human) judges** whether the deviation was
   intended. This is the same structured-evidence-then-route pattern ADR-008 established.

**Placement is split along loom's existing seam** — the shared skill names the generic *what*;
tracker-awareness resolves through the environment doc:

- **[verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md)
  phase 4** gains the spec-fidelity dimension, tracker-agnostic (it resolves the fetch
  mechanism via the Issue Tracker env doc rather than hardcoding `gh`), the same way
  [triage](../../SKILLS/planning/triage/SKILL.md) and
  [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) stay tracker-neutral.
- **[contract/primitives.md](../../contract/primitives.md#utility-agents-cross-stage)** — the
  Verifier utility's purpose names spec fidelity as one more structured-evidence category; the
  per-adapter render (`adapters/*/STAGES.md`) inherits it from the generic contract, so no
  adapter-specific agent prompt is edited.
- **[workflows/sdlc/verification.md](../../workflows/sdlc/verification.md)** — §5 records a
  closing ticket's acceptance criteria as an existing criteria source (so spec-fidelity does
  **not** violate "does not invent new criteria"), and §6 adds a spec-fidelity section to the
  verification report with deviations routed, not auto-failed.

## Consequences

- Spec-vs-implementation deltas are caught at the gate as evidence instead of leaking into
  manual follow-ups.
- Pragmatically-correct-but-deviating code is **surfaced, not rejected** — the orchestrator/
  human keeps the judgment call; the gate does not enforce literalism.
- The shared skill stays harness- and tracker-agnostic; `gh`-specifics live behind the Issue
  Tracker env doc, so the same skill works on the local-markdown tracker and on GitHub/GitLab.
- No new agent, primitive, or port — the Verifier's evidence set widens by one category and the
  existing dispatch/route contract carries it.

## Alternatives considered

| Option | Verdict |
|---|---|
| **Auto-fail on any spec deviation** | Rejected — rejects pragmatically-correct code (the uppercase-UUID case) for literalism; contradicts the ADR-008 "Verifier reports, dispatcher decides" split. |
| **Put the whole check in the Verifier agent prompt only** | Rejected — loom has no source `agents/verifier.md`; the utility is defined generically in `contract/primitives.md` and rendered per-adapter, so an agent-only fix would fragment the same logic across three adapters. |
| **Put it in the shared skill only, hardcoding `gh issue view`** | Rejected — bakes a tracker into a harness-agnostic skill; the Issue Tracker env doc already abstracts the fetch mechanism. |
| **Shared skill (generic *what*) + env-doc-resolved tracker + contract note** | **Chosen** — matches the existing skill-vs-tracker seam; one evidence category, no new plumbing. |

## Related

- [ADR-008](adr-008-delivery-dispatchers.md) — the Verifier-returns-evidence / dispatcher-decides split this evidence category rides on.
- [verification-culture](../principles/verification-culture.md) — the iron law the verification procedure operationalizes.
- [verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md) — phase 4 gains the spec-fidelity dimension.
- [Issue Tracker](../environments/issue-tracker.md) — resolves the tracker + fetch mechanism, keeping the skill tracker-agnostic.
- [workflows/sdlc/verification.md](../../workflows/sdlc/verification.md) — §5/§6 record the closing-ticket criteria source and the spec-fidelity report section.
- [contract/primitives.md](../../contract/primitives.md#utility-agents-cross-stage) — the Verifier utility purpose naming spec fidelity as an evidence category.
