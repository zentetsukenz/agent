---
type: Index
title: Workflows
description: Prose-first, ordered orchestration documents that serve as seeds for building tool-specific harnesses via adapters
---

# Workflows

A **workflow** is an ordered orchestration document for a specific **lifecycle**. It is
a *prose seed* that an adapter's agent interprets at build time to produce a concrete
harness (agent configurations, skill wiring, command definitions) for a target tool such
as Mirai, OpenCode, Claude, Cursor, Aider, or a resident agent like Hermes.

## Two lifecycle kinds

A lifecycle is a state machine. loom's workflows come in **two kinds**, distinguished by
whether that machine **terminates**:

| Kind | Shape | Terminates? | Rendered by | Example |
|---|---|---|---|---|
| **Terminating** | an ordered pipeline of phases | yes — reaches a final state, runs once per effort | a **per-invocation** [harness archetype](../wiki/patterns/harness-archetypes.md) (Mirai, OpenCode) | [sdlc](sdlc/index.md) |
| **Reactive** | a continuous tick loop over a source of truth | no — loops until the human closes the effort | a **resident** harness archetype (Hermes) | [macro-pm](macro-pm/index.md) |

Both are lifecycles with an internal state machine; they differ in *shape*, not in kind. A
reactive workflow's state machine *adapts over time* (the map mutating as fog clears), but it is
still a single-lifecycle prose seed — not a runtime, and not a machine-parseable schema.

## What a workflow is (and is not)

| A workflow **is** | A workflow **is not** |
|---|---|
| A single lifecycle's ordered orchestration (terminating **or** reactive) | A single skill (that is a judgment pattern) |
| Prose policy describing *how* each phase/tick performs | An agent identity (that wires skills) |
| A governance seed adapters compile into a harness | A hardcoded contract binding specific skills/agents |
| Interpreted at runtime by an agent | A machine-parseable schema |

## Prose-first principle

Everything in loom — including workflows — is **prose for a machine to interpret**.
Structured output (YAML, JSON, tool configs) lives **solely in the adapter layer**, never
in the workflow itself. This is a deliberate choice: it keeps the framework maximally
adaptive to *any* target environment. A workflow can express a policy such as *"~80% of
tasks should be small-agent-executable, ~20% need a higher-intelligence agent"* without
hardcoding which agent or skill fulfils it. The adapter's interpreting agent maps that
policy onto the target environment's actual capabilities at build time.

See [adr-001-adapter-pattern](../wiki/adr/adr-001-adapter-pattern.md) for the adapter
contract this seeds into.

## Catalog

| Workflow | Kind | Description |
|---|---|---|
| [sdlc](sdlc/index.md) | terminating | Software Development Life Cycle — six ordered phases (Discovery → Design → Planning → Implementation → Verification → Preservation) grouped into three ownership stages (Shaping → Delivery → Closing), with shift-left verification, documentation, and architecture-first discipline baked into every phase. |
| [macro-pm](macro-pm/index.md) | reactive | Macro-scale project management *above* SDLC — a resident agent charts many efforts as nested [wayfinder](../SKILLS/planning/wayfinder/SKILL.md) maps on a single source of truth and dispatches their buildable leaves down into SDLC runs, looping forever rather than terminating. Rendered by a resident harness (Hermes). |

## Related

- [log](log.md) — chronological change log for workflows
- [SKILLS/](../SKILLS/) — the lifecycle-bucketed skills a workflow draws upon
- [architecture-first](../wiki/principles/architecture-first.md) — a cross-cutting principle enforced by the SDLC workflow
- [harness-archetypes](../wiki/patterns/harness-archetypes.md) — which harness archetype renders which lifecycle kind
- [adr-018-macro-project-management](../wiki/adr/adr-018-macro-project-management.md) — the reactive-lifecycle seed decision
