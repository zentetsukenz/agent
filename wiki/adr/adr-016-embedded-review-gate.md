---
type: ADR
title: Code review is an embedded SDLC quality gate, not a standalone skill — with a commit-often principle
status: Accepted
timestamp: 2026-08-03T00:00:00Z
tags: [code-review, quality-gate, commit-often, sdlc, planning, implementation, verification, skill, loom]
---

# ADR-016: Embedded review gate + commit-often

## Context

Upstream (mattpocock engineering skills) ships a standalone `code-review` skill: a two-axis
review of a diff — **Standards** (does it follow the repo's documented conventions + a code-smell
baseline?) and **Spec** (does it match the originating issue/PRD?) — run as parallel sub-agents.
It also ships `implement`, a thin orchestrator that drives `/tdd` then calls `/code-review` before
committing.

loom already models the *work* those two skills describe, but as **workflow**, not skills:

- The [Implementation phase](../../workflows/sdlc/implementation.md) is the orchestrated build
  loop (`implement`'s job), owned by the Orchestrator role and the per-task TDD operational DNA.
- Per-task **VERIFY** (Phase 4) and [verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md)
  already gate "is it green?" — but nothing gated "is it a *good change*?" (Standards) or
  "does it match what was asked?" (Spec) as an explicit, planned checkpoint.

Two gaps followed: (1) review discipline existed only as informal "per-task self-review" prose,
easy to skip; and (2) there was no stated discipline about **when to commit** — leaving the door
open to one large, unreviewable end-of-session drop.

## Decision

**Do not add `code-review` (or `implement`) as standalone loom skills. Embed review as a
first-class SDLC quality gate, and add a `commit-often` principle that binds a commit to every
green gate.**

1. **A "quality gate" is a first-class checkpoint** in the same family as the Planning
   [Architecture Gate](../../workflows/sdlc/planning.md#architecture-gate-mandatory-for-complex-work)
   and the [Verification](../../workflows/sdlc/verification.md) exit gate. Each gate is three
   ordered steps: **Verify → Review (two axes) → Commit.**

2. **Planning designs the cadence.** The [review-gate cadence](../../workflows/sdlc/planning.md#review-gate-cadence)
   marks which task/slice boundaries are gates — one per tracer-bullet slice for multi-slice work,
   one at the end for trivial work. Review is a *planned* checkpoint, not an optional invocation.

3. **Implementation executes each gate.** The two-axis review (Standards + Spec) runs over the
   slice diff at Phase 5; the Orchestrator will not advance to the next slice until the current
   one is verified, reviewed, and committed.

4. **`commit-often` is a new cross-cutting principle** (peer to `verification-culture` and
   `architecture-first`): every green gate is a commit point; Delivery lands as small, reversible,
   individually-reviewed commits.

5. **The Standards axis carries a code-smell baseline** (mysterious names, duplicated logic,
   feature envy, primitive obsession, speculative generality, shotgun surgery), with the repo's
   documented standards always overriding it — preserving the substance of upstream `code-review`
   without a separate skill file.

## Considered options

| Option | Verdict |
|---|---|
| **Port `code-review` as a standalone loom skill** (upstream shape) | Rejected — a shallow module: its body mostly restates review work the workflow already implies. It floats free of the loop where diffs actually land, and the Orchestrator must *remember* to invoke it. Fails the deletion test — folding it into the gate **concentrates** review discipline at the commit boundary. |
| **Port `implement` as a skill** | Rejected — loom already models the build loop as the Implementation phase + Orchestrator role. A skill would duplicate the workflow layer. |
| **Embed review as a planned quality gate + `commit-often` principle** | **Chosen** — locality (review lives in the loop next to VERIFY), leverage (a principle reaches across Planning/Implementation/Verification), and traceability (the gate is designed in, not improvised). |
| **Add review but leave commit timing unspecified** | Rejected — without `commit-often`, review can still run against one giant end-of-session diff, defeating reversibility and bisectability. |

## Consequences

- New principle [commit-often](../../wiki/principles/commit-often.md), registered in the
  principles index + log.
- [Implementation phase](../../workflows/sdlc/implementation.md) gains a **Quality gates** section
  (Verify → Review → Commit); Phase 5 is renamed **REVIEW, COMMIT, MARK DONE**; the Orchestrator
  holds the gate before advancing.
- [Planning phase](../../workflows/sdlc/planning.md) gains a **Review-gate cadence** section; the
  exit gate and artifacts require gates to be marked on the dependency graph.
- [Verification phase](../../workflows/sdlc/verification.md) is framed as the **final** gate over
  already-reviewed slice commits.
- The [resolving-merge-conflicts](../../SKILLS/implementation/resolving-merge-conflicts/SKILL.md)
  skill *is* adopted standalone (small, self-contained, a real gap), because a commit at a gate can
  hit an in-progress merge/rebase — it is genuinely reusable, unlike review.
- `ask-matt` (a skill router) is **not** adopted — loom's index/bucket progressive-disclosure
  covers routing.
- No change to the seam-artifact protocol or adapters; this is a workflow + principle refinement.

## Related

- [commit-often](../../wiki/principles/commit-often.md) — the principle this ADR introduces.
- [verification-culture](../../wiki/principles/verification-culture.md) — the sibling gate the review step builds on.
- [architecture-first](../../wiki/principles/architecture-first.md) — the sibling planned-gate principle.
- [Implementation](../../workflows/sdlc/implementation.md), [Planning](../../workflows/sdlc/planning.md), [Verification](../../workflows/sdlc/verification.md) — the phases that carry the gate.
- [resolving-merge-conflicts](../../SKILLS/implementation/resolving-merge-conflicts/SKILL.md) — the one upstream skill adopted standalone alongside this decision.
- [wiki/patterns/deep-modules.md](../patterns/deep-modules.md) — the deletion test behind rejecting a standalone review skill.
