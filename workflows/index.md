---
type: Index
title: Workflows
description: Prose-first, ordered orchestration documents that serve as seeds for building tool-specific harnesses via adapters
---

# Workflows

A **workflow** is an ordered orchestration document for a specific lifecycle. It is
**not** a runtime and **not** a state machine — it is a *prose seed* that an adapter's
agent interprets at build time to produce a concrete harness (agent configurations,
skill wiring, command definitions) for a target tool such as OpenCode, Claude, Cursor,
or Aider.

## What a workflow is (and is not)

| A workflow **is** | A workflow **is not** |
|---|---|
| An ordered set of lifecycle phases | A single skill (that is a judgment pattern) |
| Prose policy describing *how* each phase performs | An agent identity (that wires skills) |
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

| Workflow | Description |
|---|---|
| [sdlc](sdlc/index.md) | Software Development Life Cycle — six ordered phases (Discovery → Design → Planning → Implementation → Verification → Preservation) grouped into three ownership stages (Shaping → Delivery → Closing), with shift-left verification, documentation, and architecture-first discipline baked into every phase. |

## Related

- [log](log.md) — chronological change log for workflows
- [SKILLS/](../SKILLS/) — the lifecycle-bucketed skills a workflow draws upon
- [architecture-first](../wiki/principles/architecture-first.md) — a cross-cutting principle enforced by the SDLC workflow
