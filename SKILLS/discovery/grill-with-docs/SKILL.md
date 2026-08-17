---
name: grill-with-docs
description: Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (glossary, ADRs) inline as decisions crystallise. Use when user wants to stress-test a plan against their project's language and documented decisions, get grilled on their design, or mentions "grill me".
---

> **Path flexibility:** This skill reads and writes the project glossary and ADRs. Resolve
> their locations per the [Domain Docs](../../../wiki/environments/domain-docs.md) environment
> doc (`loom.toml#paths.*` → `wiki/glossary/index.md` + `wiki/adr/` → `CONTEXT.md` +
> `docs/adr/`).

# Grill with Docs

A relentless interview that sharpens a plan or design **and** keeps the domain model current
as decisions land. Two disciplines run together:

1. **The interview** — the round/frontier decision-tree walk described below.
2. **The capture** — folding resolved terms and load-bearing decisions into the glossary and
   ADRs _inline_, following the [domain-model](../../design/domain-model/SKILL.md) discipline.
   Don't re-derive that discipline here — apply it as decisions crystallise during the walk.

## The walk — rounds over a frontier

Interview the user relentlessly until you reach a shared understanding. Map the plan as a
**design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are
already settled — the questions you can ask _now_ without guessing at answers you haven't
heard yet. Ask the whole frontier in one round: number each question and give your recommended
answer. Then wait for the user's answers before the next round.

Format each question like so:

```
❓ **Q1** — **<question title>**: <question body, may be multiple paragraphs, including any choices>

➡️ <your recommended answer>
```

Each round of answers reshapes the tree: settled decisions push the frontier outward and
unblock questions that depended on them. Recompute the frontier and ask the next round. A
question whose answer depends on another question still open in this round belongs to a
_later_ round, not this one.

**Finding facts is your job, never the user's.** When a frontier question needs a fact from
the environment (filesystem, code, tools, docs), dispatch a sub-agent to find it — don't ask
the user for anything you could look up yourself. Don't block on it: a running exploration is
an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to
report; ask the rest of the frontier now.

The session is done when the **frontier is empty** — every branch of the design tree visited,
nothing left silently assumed. Don't act on the plan until the user confirms you have reached
a shared understanding.

> This is the same **frontier** notion [wayfinder](../../planning/wayfinder/SKILL.md) charts
> over decision tickets — here it's the edge of the _interview_, there it's the edge of a
> multi-session map.

## Capture as you go

The interview's side effects are documentation. Apply the
[domain-model](../../design/domain-model/SKILL.md) discipline inline — don't batch it:

- **Challenge against the glossary** — when a term conflicts with the existing language, call
  it out immediately.
- **Sharpen fuzzy language** — when a term is vague or overloaded, propose a precise canonical
  term.
- **Cross-reference with code** — when the user states how something works, check whether the
  code agrees, and surface any contradiction.
- **Update the glossary inline** — when a term resolves, write it right there
  ([CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md)). The glossary is a glossary, not a spec or
  scratch pad — keep it free of implementation detail.
- **Offer ADRs sparingly** — only when the decision is hard to reverse, surprising without
  context, _and_ the result of a real trade-off ([ADR-FORMAT.md](./ADR-FORMAT.md)).

See [domain-model](../../design/domain-model/SKILL.md) for the full capture discipline and
[Domain Docs](../../../wiki/environments/domain-docs.md) for single- vs. multi-context file
layout.
