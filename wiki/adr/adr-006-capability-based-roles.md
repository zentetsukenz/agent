---
type: ADR
title: Capability-based role discipline
status: Accepted
timestamp: 2026-07-24T00:00:00Z
tags: [agent, role, capability, enforcement, mirai, adapter, loom]
---

# ADR-006: Capability-Based Role Discipline

## Context

The Mirai adapter (see [ADR-004](adr-004-loom-mirai-setup.md)) generates per-stage agents
and quick-path prompts from a single shared template. In real-project testing, two failure
modes surfaced:

- The `shaping-quick` prompt was generated with `agent: "agent"` (the generic base agent)
  and only prose telling it not to jump to code. It jumped to code anyway — editing files
  during a stage meant for understanding and design.
- The deep `shaping` agent was granted the `edit` capability, so despite a body that says
  "design first," it edited application code.

The root cause is the same in both: **the template hardcoded one capability set for every
role, and relied on prose to restrain behaviour.** Prose is guidance an interpreting model
can ignore under pressure; a granted `edit` tool is a standing invitation to edit.

A related problem: capabilities like memory and clarifying-questions aren't uniform tool
*aliases* across harnesses — they are specific, harness-/version-dependent tool names.
Hardcoding a guessed name into a generic role breaks portability.

## Decision

Adopt **role-scoped capabilities** (see
[wiki/patterns/role-scoped-capabilities.md](../patterns/role-scoped-capabilities.md)) as the
way loom defines and enforces agent roles:

1. **A role is a scoped capability set.** Each role is defined by the generic capabilities
   it is granted (`read`, `edit`, `shell`, `delegate`, `persist`, `interview`, `web`,
   `docs-lookup`, `tasks`) — not by prose alone.

2. **Enforcement is by withholding, not asking.** Removing a capability is a *forcing
   function*: a role with no `edit` cannot write code and must reach its goal another way
   (design / plan / dispatch / verify). Prose stance lines remain, but only as a portable
   backstop — the guarantee is structural.

3. **Capabilities are generic; the adapter maps them.** loom names capabilities
   harness-agnostically; each adapter maps each name to its harness's concrete tool name
   and **tolerates deviation** — discovering or confirming the mapped name against the
   harness's actual tool list rather than hardcoding it (same discipline loom already
   applies to model-name strings).

4. **Quick paths inherit harness restrictions where they exist.** Where a harness offers a
   built-in restricted mode (Mirai's read-only `plan` agent), a quick prompt sets its base
   agent to that mode to inherit the no-edit guarantee, plus a short in-body stance line as
   the backstop. Per-stage base agent: read-only stages (Shaping) → `plan`; edit-bearing
   stages (Delivery, Closing) → `agent`.

## Considered options

| Option | Verdict |
|---|---|
| **A. In-body stance prose only** (keep `edit`, ask nicely) | Rejected — this is the failing status quo; prose doesn't bind. |
| **B. Harness built-in restricted mode only** (e.g. `plan`) | Partial — good for quick paths, but custom deep agents still need explicit grants; not every capability has a built-in mode. |
| **C. Bind each quick prompt to its custom stage agent** | Rejected — couples prompt to agent and makes the "quick" path inherit the heavy deep workflow. |
| **D. Capability-based roles + stance backstop + per-stage base agent** | **Chosen** — structural enforcement (withhold `edit`), portable (generic names, adapter-mapped), with prose only as a backstop. |

## Consequences

- Roles differ by capability, so the generator must emit per-role tool sets — the shared
  template becomes role-parameterised rather than one-size-fits-all.
- "Won't delegate / jumps to code" failures are fixed at the capability layer, not by
  re-wording prompts.
- The adapter carries a generic-capability → harness-tool mapping table and a setup step to
  discover/confirm harness-specific tool names; memory/interview tool names are verified at
  setup, not hardcoded.
- This decision governs the Delivery role split ([ADR-008](adr-008-delivery-dispatchers.md))
  and the optional docs-lookup capability ([ADR-007](adr-007-docs-lookup-capability.md)).

## Related

- [wiki/patterns/role-scoped-capabilities.md](../patterns/role-scoped-capabilities.md) — the pattern this ADR adopts.
- [ADR-004](adr-004-loom-mirai-setup.md) — the Mirai setup approach this refines (its shared template was the source of the hardcoded capability set).
- [ADR-008](adr-008-delivery-dispatchers.md) — applies this to split Delivery into dispatchers + utilities.
- [ADR-007](adr-007-docs-lookup-capability.md) — the optional `docs-lookup` capability governed by this discipline.
- [adapters/mirai/MAPPING.md](../../adapters/mirai/MAPPING.md) — the concrete capability→tool mapping table.
