---
type: Pattern
title: SDLC — Verification Phase
description: Policy governing how the Verification phase performs — confirm the whole delivered change satisfies the success criteria via evidence, not assertion
---

# Verification Phase

> **Bucket:** `verification/` · **Position:** 5 of 6 · **Stage:** Delivery · **Follows:** [Implementation](implementation.md) · **Precedes:** [Preservation](preservation.md)

## 1. Intent

Confirm that the **whole** delivered change satisfies the success criteria defined back in
[Discovery](discovery.md) — trust, but verify.

## 2. Gates

**Entry gate**

- Implementation reports its tasks complete with unit tests green.

**Exit gate**

- Success criteria are demonstrably met via **evidence, not assertion**.
- [verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md) is satisfied.
- The project's [quality baseline](../../wiki/patterns/quality-baseline.md) — the full
  lint/code-quality/security/coverage floor — passes across the **whole** delivered change
  (not just per-slice deltas), so the shipped result is proven top-to-bottom
  ([ADR-017](../../wiki/adr/adr-017-quality-baseline.md)).
- No "done" claim exists without proof.
- **The Delivery seam artifact is produced and registered** — this is the
  Delivery → Closing handoff (see below).

## Stage seam — PRODUCE (Delivery → Closing)

Verification is the **last phase of the Delivery stage**, so its exit hands the baton to
Closing. Per the [Seam Artifact Protocol](../../wiki/patterns/seam-artifact-protocol.md), the
exit gate is not satisfied until the **seam artifact** is written and registered (mandatory at
the stage seam):

- Write `delivery/<milestone>/verified-change.md` to the ledger: what shipped, the acceptance
  **evidence**, and links to PRs/commits/issues — referenced by path, not re-embedded.
- Register a row in the ledger manifest with status `shipped`.
- Use [stage-handoff](../../SKILLS/preservation/stage-handoff/SKILL.md) (the PRODUCE adapter) and the
  project's [communication protocol document](../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document).

## 3. Recommended skills

1. [verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md) — the completion procedure: fresh evidence before any success claim (operationalizes the [verification-culture](../../wiki/principles/verification-culture.md) iron law).
2. [visual-verification](../../SKILLS/verification/visual-verification/SKILL.md) — for UI surfaces.
3. [frontend-runtime-debugging](../../SKILLS/implementation/frontend-runtime-debugging/SKILL.md) — for runtime/frontend surfaces.

For a **user-facing** delivery, coverage is not confirmed *once* here and discarded — it is
crystallized into durable guards: [derive-e2e-coverage](../../SKILLS/verification/derive-e2e-coverage/SKILL.md)
turns this delivery's user-perspective success criteria into e2e scenarios that accrete into the
project's standing regression suite (a system-scoped concern operated at the
[macro-PM](../macro-pm/index.md) altitude, distinct from this phase's per-change confirmation).

## 4. Agent-effort policy

- **Delegable → small agent:** gathering evidence, running checks and suites.
- **High-judgment → higher-intelligence agent:** judging whether the evidence is
  *sufficient* against the success criteria.

## 5. Shift-left obligation

This phase **closes the loop** opened in Discovery. It verifies against:

- the success criteria authored in [Discovery](discovery.md),
- each task's per-task acceptance criteria from [Planning](planning.md), and
- the acceptance criteria of any **ticket the delivered change closes** (a PR that "closes
  #N") — a **spec-fidelity** check that reports each criterion as matches / deviates /
  not-addressed ([ADR-024](../../wiki/adr/adr-024-spec-fidelity-verification.md)).

It does **not** invent new criteria — a closing ticket's acceptance criteria are an existing
criteria source, not a new one, so spec-fidelity stays inside the shift-left contract. A spec
**deviation** is reported as evidence for the routing dispatcher/human to judge, **not** an
automatic failure (a change can be pragmatically correct while departing from the literal
spec). This is a whole-system confirmation, distinct from the per-unit TDD that already
happened during Implementation.

This phase's exit is the **final quality gate** in the plan's
[review-gate cadence](planning.md#review-gate-cadence): where the per-slice gates during
[Implementation](implementation.md#quality-gates) each reviewed and committed one slice — running
the [quality baseline](../../wiki/patterns/quality-baseline.md) for the aspects that slice touched
— this gate confirms the *whole* against the success criteria, runs the **full** baseline across
the entire change, and produces the commit the Delivery seam artifact references. Per [commit-often](../../wiki/principles/commit-often.md), the change
is already a series of reviewed slice commits by the time it arrives here — this gate does not
face one large unreviewed drop.

## 6. Artifacts

- A verification report: evidence plus pass/fail against each criterion, including a
  **spec-fidelity** section (matches / deviates / not-addressed) when the change closes a ticket.
- Defects routed back to [Implementation](implementation.md); flagged spec deviations routed to
  the dispatcher/human to judge intent, not auto-failed.

## Related

- [Discovery](discovery.md) — authored the success criteria this phase confirms.
- [Implementation](implementation.md) — receives any defects found here; ran the per-slice quality gates this phase's final gate builds on.
- [Preservation](preservation.md) — begins once verification passes.
- [commit-often](../../wiki/principles/commit-often.md) — the principle that makes this a final gate over pre-reviewed commits, not one big drop.
- [quality-baseline](../../wiki/patterns/quality-baseline.md) — the four-aspect floor this final gate runs across the whole delivery.
- [ADR-024](../../wiki/adr/adr-024-spec-fidelity-verification.md) — the spec-fidelity evidence category (surface-the-delta, not auto-fail) this phase reports.
</content>
