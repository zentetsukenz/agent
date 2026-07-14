---
type: ADR
title: Workflows are prose-first adapter seeds
status: Accepted
timestamp: 2026-07-14T00:00:00Z
tags: [workflow, adapter, prose-first, sdlc, loom]
---

# ADR-002: Workflows Are Prose-First Adapter Seeds

## Context

loom needed a way to express an end-to-end lifecycle (the SDLC being the first instance)
that is more than a single skill and more than an agent identity. The open question was
*what a "workflow" is* and *how machine-readable it must be*, given that the
[adapter layer](adr-001-adapter-pattern.md) will eventually compile framework content into
tool-specific harnesses (agent configs, skill wiring, command definitions) for tools like
OpenCode, Cursor, Claude, and Aider.

Two forces pulled in opposite directions:

- Adapters want a **deterministic** contract to compile.
- The framework is otherwise **prose Markdown for a model to interpret**, and the author
  wants maximal adaptivity to *any* target environment.

## Decision

A **workflow is an ordered orchestration document** — a *prose seed* that an adapter's
interpreting agent reads at build time to produce a concrete harness. Workflows live under
the top-level `workflows/` directory (plural: many workflows are expected). The SDLC
workflow is the first instance at `workflows/sdlc/`.

**Workflows are prose-first.** No structured/machine-parseable contract lives in the
workflow (or in skills or agents). **Structured output lives solely in the adapter layer.**
The workflow expresses *policy and intent*; the adapter's agent interprets that policy
against the target environment's actual capabilities at runtime.

A workflow may therefore express a policy such as *"~80% of tasks should be
small-agent-executable, ~20% need a higher-intelligence agent"* **without** binding it to
any specific skill or agent. The adapter decides the concrete mapping.

## Alternatives considered

- **Schema-first (structured frontmatter/embedded data).** Deterministic for adapters, but
  introduces a schema loom does not have and hardcodes contracts, reducing adaptivity.
  Rejected.
- **Hybrid (structured contract + prose body).** Mirrors `SKILL.md`, but still bakes a
  machine contract into framework content. Rejected in favor of keeping all structure in
  the adapter.

## Consequences

- Workflows read like *guidance for an interpreting agent*, not a rigid state machine.
- The same workflow can seed harnesses for very different tools and agent-capability
  profiles without modification.
- Adapters carry the full burden of producing structured, tool-specific output — the
  framework never does.
- Determinism is traded for adaptivity; two adapters may compile the same workflow into
  different (but compliant) harnesses. This is intended.

## Related

- [ADR-001](adr-001-adapter-pattern.md) — the adapter layer this workflow seeds into.
- [workflows index](../../workflows/index.md) — the prose-first principle in practice.
- [SDLC workflow](../../workflows/sdlc/index.md) — the first workflow instance.
</content>
