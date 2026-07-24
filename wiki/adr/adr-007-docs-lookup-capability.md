---
type: ADR
title: Optional up-to-date documentation-lookup capability
status: Accepted
timestamp: 2026-07-24T00:00:00Z
tags: [capability, docs-lookup, mcp, adapter, mirai, loom]
---

# ADR-007: Optional Documentation-Lookup Capability

## Context

Agents shaping and building against fast-moving libraries benefit from querying *current*
documentation rather than relying on the model's training cutoff. In the Mirai harness this
is naturally provided by an MCP server such as Context7, wired into an agent as a
`<server>/*` tool. But naming a specific server in loom's generic roles would (a) bake a
transient tool choice into the framework and (b) force the dependency on every project.

## Decision

Add **`docs-lookup`** to loom's generic [capability](../patterns/role-scoped-capabilities.md)
vocabulary: "query up-to-date external documentation." It is:

- **Tool-agnostic.** `docs-lookup` names the *capability*; Context7 (via MCP `<server>/*`)
  is the current Mirai implementation, not the definition. A different/better provider later
  is a mapping change, not a role change.
- **Off by default, interview-gated.** The setup interview asks whether the project wants
  up-to-date documentation lookup; only then is the capability wired into the relevant
  roles (Shaping and the Planner benefit most). No project gets an external dependency it
  didn't opt into.
- **Governed by [ADR-006](adr-006-capability-based-roles.md).** Like every capability, the
  adapter maps `docs-lookup` to the harness's concrete tool and tolerates deviation. The
  MCP *server config* lives outside the agent file (per the official MCP docs) and is
  treated as a verify-later detail, not guessed.

## Considered options

| Option | Verdict |
|---|---|
| **No docs-lookup capability** | Rejected — loses a real benefit for library-heavy work. |
| **Always-on, wired into every role** | Rejected — forces an external dependency and network reliance on every project. |
| **Bake in Context7 specifically** | Rejected — couples loom to a transient tool choice. |
| **Generic `docs-lookup`, off by default, interview-gated** | **Chosen.** |

## Consequences

- Projects opt in; the capability is absent unless requested.
- Swapping the underlying provider (Context7 → something else) is an adapter mapping edit,
  not a change to any role definition.
- The adapter's capability reference documents how to wire it and where server config lives,
  marking the exact config path/format as verify-later.

## Related

- [ADR-006](adr-006-capability-based-roles.md) — the capability discipline this extends.
- [wiki/patterns/role-scoped-capabilities.md](../patterns/role-scoped-capabilities.md) — capability vocabulary.
- [adapters/mirai/references/capabilities.md](../../adapters/mirai/references/capabilities.md) — how the Mirai adapter wires `docs-lookup`.
