---
name: domain-model
description: Build and sharpen a project's domain model — pin down the ubiquitous language, challenge fuzzy terms against concrete scenarios, and record architectural decisions. Use when the user wants to define or refine domain terminology, capture a decision as an ADR, or when another skill needs to maintain the domain model. NOT a grilling interview (use grill-with-docs for that) — this is the active discipline of changing the model, not stress-testing a plan.
---

> **Path flexibility:** Resolve the glossary and ADR locations per the
> [Domain Docs](../../../wiki/environments/domain-docs.md) environment doc
> (`loom.toml#paths.*` → `wiki/glossary/index.md` + `wiki/adr/` → `CONTEXT.md` + `docs/adr/`).

# Domain Model

Actively build and sharpen the project's domain model as you design. This is the _active_
discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and
decisions down the moment they crystallise.

Merely _reading_ the glossary for vocabulary is **not** this skill — that's a one-line habit
any skill can do. This skill is for when you're **changing** the model, not just consuming
it. When you need to stress-test a whole plan through a relentless one-question-at-a-time
interview, use [grill-with-docs](../../discovery/grill-with-docs/SKILL.md) instead — it drives
the interview and calls back into this discipline to capture terms and decisions as they land.

## File structure

Single- vs. multi-context layout (`CONTEXT.md` vs. `CONTEXT-MAP.md`) and lazy file creation
are described once in [Domain Docs](../../../wiki/environments/domain-docs.md#file-structure).
Create files lazily — only when you have something to write.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right there. Don't batch these up — capture them as they happen. Use the format in [CONTEXT-FORMAT.md](../../discovery/grill-with-docs/CONTEXT-FORMAT.md).

`CONTEXT.md` should be totally devoid of implementation details. Do not treat `CONTEXT.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](../../discovery/grill-with-docs/ADR-FORMAT.md).
