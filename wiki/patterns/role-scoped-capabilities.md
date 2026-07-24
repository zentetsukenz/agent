---
type: Pattern
title: Role-Scoped Capabilities
description: An agent's role is the scoped set of capabilities it is granted; enforcement comes from withholding capabilities, not from prose
tags: [agent, role, capability, harness, adapter, enforcement, loom]
timestamp: 2026-07-24T00:00:00Z
---

# Role-Scoped Capabilities

> **Applied vocabulary:** see the glossary for [Capability](../glossary/index.md#capability),
> [Role](../glossary/index.md#role), [Dispatcher](../glossary/index.md#dispatcher), and
> [Utility (dispatched) agent](../glossary/index.md#utility-dispatched-agent). This page is
> the conceptual reference; [ADR-006](../adr/adr-006-capability-based-roles.md) records the
> decision to adopt it.

## Core idea

**A role is a scoped set of capabilities — and you enforce a role by withholding
capabilities, not by asking the agent to behave.**

An agent given `edit` will, under pressure, edit — no matter how firmly its prose says
"design first, don't jump to code." Prose is guidance; the model may ignore it. A *missing*
capability is a wall: an agent that has no `edit` tool physically cannot write code, so it
must reach the goal another way — design it, plan it, dispatch it, or verify it.

This turns behavioural intent into a structural guarantee. The role's shape lives in what
it *can't* do as much as what it can.

## Capabilities are generic; harnesses are specific

Capabilities are named independently of any tool:

| Capability | Meaning |
|---|---|
| `read` | Read file/artifact contents |
| `edit` | Modify files |
| `shell` | Run shell commands |
| `delegate` | Dispatch work to other agents (subagents) |
| `persist` | Durable memory across turns/sessions |
| `interview` | Ask the human clarifying questions |
| `web` | Fetch URLs / web search |
| `docs-lookup` | Query up-to-date external documentation (optional) |
| `tasks` | Manage a task/todo list |

Each [Adapter](../glossary/index.md#adapter) maps these generic names onto its
[Harness](../glossary/index.md#harness)'s concrete tool names, and **tolerates deviation** —
the mapped name is discovered or confirmed against the harness's actual tool list, never
assumed. Some map to stable aliases (`delegate` → Mirai's `agent`); others map to
harness-/version-specific tool names (`persist` → a specific tool like `vscode/memory`)
that must be verified rather than hardcoded — the same discipline loom already applies to
model-name strings.

## Withholding as a forcing function

The lever that makes roles real is **removing** a capability:

- **Withhold `edit` from a designer** → it produces understanding and design artifacts
  instead of code.
- **Withhold `edit` from a planner** → it produces a task breakdown, not an implementation.
- **Withhold `edit` from a dispatcher** → it must route work to executors rather than doing
  it in-place (fixes the "why won't it delegate?" failure — it delegates because it *can't*
  edit).
- **Withhold `edit` from a verifier** → it reports evidence and routes defects back instead
  of silently "fixing" what it was meant to check.

Where a harness offers a built-in restricted mode (e.g. a read-only *plan* agent), a quick
path can *inherit* the no-edit guarantee from the harness rather than re-deriving it — with
a short in-body **stance line** as the portable backstop for harnesses that lack one.

## Two role kinds

Roles divide by whether they hold `delegate`:

```text
DISPATCHER (holds delegate, usually withholds edit)
   │  routes work, gauges size, enforces gates
   ▼
UTILITY (dispatched) AGENT (holds edit/shell, not delegate-as-purpose)
      explore · quick · deep · verifier
      receives a scoped task, executes or verifies it, returns a result
```

A [Dispatcher](../glossary/index.md#dispatcher) that could also edit tends to collapse into
a do-everything agent that never delegates. Keeping the two kinds distinct is what lets a
plan get *dispatched* rather than quietly hand-implemented by the planner/orchestrator.

## Utilities sit at real seams

A [Utility (dispatched) agent](../glossary/index.md#utility-dispatched-agent) earns its own
identity when **more than one dispatcher** hands it work — the
[deep-modules](deep-modules.md) test: *one consumer is a hypothetical seam; two consumers is
a real one.* A Verifier dispatched by both an Orchestrator (verify a change) and a
plan-reviewer (verify a plan) is a real seam: a small interface (*artifact + acceptance
criteria → evidence*) hiding substantial checking behavior, reused across callers.

## When to apply

- Designing or generating a roster of agents that must divide labour (design vs. plan vs.
  build vs. verify).
- An agent keeps doing work it should delegate or defer → check whether it *has* the
  capability that lets it shortcut. Remove it.
- Porting a role set across harnesses → keep the capability names generic; let the adapter
  own the tool-name mapping.

## Anti-patterns

- **Swiss-army agent** — one role with every capability; it never delegates and blurs every
  boundary.
- **Prose-only discipline** — relying on "please don't edit" while leaving `edit` granted.
- **Hardcoded tool names** — baking a harness's specific tool string into a generic role,
  so the role breaks when the harness's names differ.

## Related

- [ADR-006 — Capability-based role discipline](../adr/adr-006-capability-based-roles.md)
- [ADR-008 — Delivery dispatchers delegate execution and verification](../adr/adr-008-delivery-dispatchers.md)
- [Deep Modules](deep-modules.md) — the "two consumers = a real seam" test for factoring utilities
- [SDLC Implementation phase](../../workflows/sdlc/implementation.md) — the pre-existing Orchestrator role this pattern generalises
- [codebase-design](../../SKILLS/design/codebase-design/SKILL.md) — the deep-module vocabulary
