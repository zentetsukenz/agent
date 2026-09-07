---
type: ADR
title: The Verifier is dispatchable from any Dispatcher, including Shaping — the 11 Shaping-side judgment criteria that name `verifier` as producer resolve to an already-reachable non-doer, so no new actor is created and no GATE.md producer changes; widening a reuse enumeration, not adding machinery
status: Accepted
timestamp: 2026-09-06T00:00:00Z
tags: [agent, role, verifier, shaping, dispatch, judgment, gate, layer-model, capability, producer-not-judge, loom]
---

# ADR-028: The Verifier Is Reachable From Shaping

> Resolves open decision (c) of the Core/Gate/Mechanism milestone
> (`design-decisions.md`). Builds on the Verifier's reusable-utility framing
> ([ADR-008](adr-008-delivery-dispatchers.md)), the capability discipline that shapes it
> ([ADR-006](adr-006-capability-based-roles.md)), and the Core layer's producer ≠ judge
> answer to judgment slop ([ADR-026](adr-026-gate-mechanism-layer-model.md)). It **widens a
> reuse enumeration**; it does not add a capability, an actor, or a GATE.md row.

## Context

`GATE.md` now types every exit criterion. Re-derived from the live rows (the milestone's
stale "5 of 9" was corrected in Decision 2 and is superseded here):

- **Shaping-side (Discovery + Design + Planning): 12 judgment rows.** 11 name `verifier` as
  producer; exactly one — `discovery.problem-constraints-success` — names `human`.
- Delivery-side: 6 judgment rows, all `verifier`.

The `judgment` producer vocabulary is the closed set {`verifier`, `human`}
([ADR-026](adr-026-gate-mechanism-layer-model.md)). So **11 Shaping-side criteria name
`verifier` as their evidence producer.** Yet the Verifier's role definition enumerates only
Delivery-side consumers — "Orchestrator → verify a change; future plan-reviewer → verify a
plan" ([contract/primitives.md](../../contract/primitives.md)). Read literally, 11 committed
Gate rows name a producer the schema cannot reach, which is what made open decision (c) block
the Gate file.

The gap is narrower than "the Verifier only serves Delivery" implies. Two facts already hold:

1. **Shaping is a Dispatcher.** It holds `delegate` and is a read-only research orchestrator
   that routes work out ([ADR-021](adr-021-shaping-research-orchestrator.md); it is named as a
   Dispatcher in the [glossary](../glossary/index.md#dispatcher)). It withholds only `edit`.
2. **The Verifier is a cross-stage `dispatched` utility**, deliberately *not* a Delivery
   stage agent, precisely so more than one Dispatcher can hand it work — "two consumers = a
   real seam" ([ADR-008](adr-008-delivery-dispatchers.md)).

A Dispatcher-with-`delegate` and a cross-stage dispatched utility are already wired to meet.
The only thing missing is that the utility's consumer list stops at Delivery.

## Decision

**The Verifier is dispatchable from any Dispatcher, including the Shaping agent.** Shaping is
added as a third named consumer of the existing Verifier utility — alongside the Orchestrator
and the future plan-reviewer. No new capability, no new actor, no GATE.md change.

The Verifier's remit already fits: it checks an *artifact against its acceptance criteria* and
returns *structured evidence* for the dispatcher to route on — it does not decide. A Shaping
design artifact (glossary entry, domain model, ADR set, interface sketch) checked against its
GATE.md `verified-failing` condition is the same shape of task as a diff checked against a
ticket. The producer ≠ judge separation is preserved untouched: the Verifier still holds no
`edit`, still only returns evidence, and the **Shaping dispatcher makes the judgment call** —
exactly as the Orchestrator does in Delivery.

The one Shaping-side row that names `human` (`discovery.problem-constraints-success`) is
correctly *not* the Verifier's job: whether the real problem, constraints, and success
criteria are right is irreducible product judgment. GATE.md already encodes the boundary — 11
verifier-checkable, 1 human-only — so no producer typing changes.

## Considered options

| Option | Verdict |
|---|---|
| **(i) Verifier dispatchable from Shaping** (add Shaping as a consumer of the existing cross-stage utility) | **Chosen** — Shaping already holds `delegate` and is a Dispatcher; the Verifier is already a reusable cross-stage utility. This is widening a reuse enumeration, not building machinery. Preserves producer ≠ judge (Verifier keeps no `edit`; Shaping judges). |
| **(ii) Shaping escalates every judgment criterion to a human** | Rejected — contradicts GATE.md's deliberate typing (11 rows name `verifier`, not `human`) and throws away a competent non-doer for work that is evidence-gatherable. Would leave 11 committed rows naming a producer that is never dispatched. Reserved, correctly, for the single genuinely-irreducible row. |
| **(iii) A new Discovery/Design judgment-check actor distinct from the Verifier** | Rejected — a third verifier-shaped actor when the existing one already spans stages by design duplicates the seam ADR-008 drew, and violates the graduation ladder's end state of *fewer* actors ([ADR-026](adr-026-gate-mechanism-layer-model.md)). One real need (Shaping judgment checks) that an existing reusable utility already covers does not warrant a parallel role. |

## Does the Delivery remit genuinely transfer?

Yes — because the Verifier gathers evidence, it does not decide. "Is this glossary term
sharpened?" and "does this diff satisfy its ticket?" are different *questions*, but both
reduce to the same *task shape*: read the artifact, test it against a stated criterion, return
structured evidence, hand the routing decision to the dispatcher. The Verifier's capabilities
(`read`, `search`, `shell`, `persist` — no `edit`) operate identically on a design doc and a
code diff, and its extended-thinking model is at least as suited to design-judgment evidence
as to mechanical diff-checking. What does *not* transfer — deciding whether the evidence is
good enough — was never the Verifier's job in Delivery either; the dispatcher owns it. That is
why widening the remit is safe: it adds artifact *kinds*, not decision authority.

## Consequences

- The Verifier's consumer enumeration in [contract/primitives.md](../../contract/primitives.md)
  now names three Dispatchers (Orchestrator, Shaping, future plan-reviewer); the "verify a
  plan / a change / a design artifact" spread is explicit.
- All 11 Shaping-side `verifier`-typed GATE.md rows now name a reachable producer; open
  decision (c) closes and the Gate schema no longer blocks on it.
- No GATE.md row changes. No new capability is granted. The Verifier remains `edit`-free.
- The Shaping dispatcher gains a self-check discipline: dispatch design-artifact judgment
  criteria to the Verifier before producing the Shaping → Delivery seam, rather than
  self-certifying them — the same anti-self-certification guard ADR-008 built for Delivery.

## Related

- [ADR-008](adr-008-delivery-dispatchers.md) — established the Verifier as a reusable cross-stage utility; this ADR adds its third consumer.
- [ADR-006](adr-006-capability-based-roles.md) — the capability discipline; the Verifier keeps no `edit` under it.
- [ADR-021](adr-021-shaping-research-orchestrator.md) — Shaping is a read-only Dispatcher holding `delegate`; that is what makes it able to dispatch the Verifier.
- [ADR-026](adr-026-gate-mechanism-layer-model.md) — judgment slop is answered by producer ≠ judge; this ADR routes Shaping judgment to that non-doer.
- [contract/primitives.md](../../contract/primitives.md) — where the Verifier's consumers are enumerated and this decision is reflected.
