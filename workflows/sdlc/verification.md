---
type: Pattern
title: SDLC — Verification Phase
description: Policy governing how the Verification phase performs — confirm the whole delivered change satisfies the success criteria via evidence, not assertion
---

# Verification Phase

> **Bucket:** `verification/` · **Position:** 4 of 5 · **Follows:** [Implementation](implementation.md) · **Precedes:** [Preservation](preservation.md)

## 1. Intent

Confirm that the **whole** delivered change satisfies the success criteria defined back in
[Discovery](discovery.md) — trust, but verify.

## 2. Gates

**Entry gate**
- Implementation reports its tasks complete with unit tests green.

**Exit gate**
- Success criteria are demonstrably met via **evidence, not assertion**.
- [verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md) is satisfied.
- No "done" claim exists without proof.

## 3. Recommended skills

1. [verification-before-completion](../../SKILLS/verification/verification-before-completion/SKILL.md) — the completion gate: fresh evidence before any success claim.
2. [qa-witness-protocol](../../SKILLS/verification/qa-witness-protocol/SKILL.md) — evidence-based behavioral confirmation.
3. [visual-verification](../../SKILLS/verification/visual-verification/SKILL.md) — for UI surfaces.
4. [browser-console-debugging](../../SKILLS/verification/browser-console-debugging/SKILL.md) — for runtime/frontend surfaces.

## 4. Agent-effort policy

- **Delegable → small agent:** gathering evidence, running checks and suites.
- **High-judgment → higher-intelligence agent:** judging whether the evidence is
  *sufficient* against the success criteria.

## 5. Shift-left obligation

This phase **closes the loop** opened in Discovery. It verifies against:

- the success criteria authored in [Discovery](discovery.md), and
- each task's per-task acceptance criteria from [Planning](planning.md).

It does **not** invent new criteria. This is a whole-system confirmation, distinct from
the per-unit TDD that already happened during Implementation.

## 6. Artifacts

- A verification report: evidence plus pass/fail against each criterion.
- Defects routed back to [Implementation](implementation.md).

## Related

- [Discovery](discovery.md) — authored the success criteria this phase confirms.
- [Implementation](implementation.md) — receives any defects found here.
- [Preservation](preservation.md) — begins once verification passes.
</content>
