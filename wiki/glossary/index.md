---
type: Index
title: Glossary
description: Key terms and concepts in the agent framework
tags: [glossary, terminology, reference]
timestamp: 2026-01-07T00:00:00Z
---

# Glossary

Key terms and concepts in the agent framework.

---

## Core Concepts

### Skill

A reusable judgment pattern. Not just "how" but "when" and "why". A skill encodes decision-making logic that can be applied across multiple contexts.

**Example**: The `tdd` skill teaches test-driven development workflow (red-green-refactor), not just "how to write tests."

**See**: `mem:principles/wisdom` — "Skills are reusable judgment patterns"

---

### Agent

An autonomous entity with a clear identity and bounded responsibility. Agents specialize by problem domain, not technology.

**Example**: An "Authentication Agent" handles all auth concerns (login, tokens, permissions), not a "Node.js Agent" that does everything in Node.

**See**: `mem:principles/wisdom` — "Identity shapes behavior"

---

### Wiki

Centralized knowledge repository. Contains principles, patterns, environments, and glossary. Reference material, not procedures.

**Structure**:

- `principles/` — Core philosophy and decision-making frameworks
- `patterns/` — Reusable design patterns and best practices
- `environments/` — Development environment setup and tools
- `glossary/` — Terminology and concepts

---

### Adapter

A thin wrapper that translates between two interfaces. Adapters compose systems without modifying core logic.

**Example**: An HTTP adapter translates REST requests to internal service calls.

---

### Plugin

An extension point that allows external code to hook into a system. Plugins extend behavior without modifying core.

**Example**: A validation plugin that adds custom validators to a form library.

---

### ADR (Architecture Decision Record)

A document that records a significant architectural decision, its context, and consequences. ADRs live in `agent/wiki/adr/`.

**Format**:

- Status (Proposed/Accepted/Deprecated)
- Context (Why this decision?)
- Decision (What did we decide?)
- Consequences (What changes as a result?)

---

### Lifecycle Bucket

A grouping of related tasks or concerns that share a lifecycle. Helps organize work by phase.

**Example**: "Onboarding" bucket contains all tasks related to new developer setup.

---

### Wrapper

A function or class that adds behavior around an existing function or class. Wrappers are composable.

**Example**: A logging wrapper that logs before/after a database call.

---

### Core

The essential, minimal implementation. Everything else is built on top of core.

**Example**: The core of a validation library is type checking; everything else (sanitization, formatting) is optional.

---

### Dogfood

To use your own tools and systems. "Eating your own dogfood" means the framework uses its own principles and patterns.

**Example**: This wiki is dogfooded — it uses the same structure and principles it teaches.

---

## Workflow Concepts

### Workflow

An ordered orchestration document for a specific lifecycle. A workflow is **prose-first**:
it describes phases, gates, recommended skills, and policies as guidance for an interpreting
agent — not as a machine-parseable contract. It is a **seed** an [Adapter](#adapter) compiles
into a concrete harness (agent configs, skill wiring, commands) for a target tool. Distinct
from a [Skill](#skill) (single judgment pattern) and an [Agent](#agent) (identity wiring
skills).

**Example**: The SDLC workflow defines six ordered phases (Discovery → Design → Planning →
Implementation → Verification → Preservation), grouped into three ownership stages
(Shaping → Delivery → Closing).

**See**: [workflows](../../workflows/index.md), `mem:adr/adr-002-workflow-as-adapter-seed`

---

### Orchestrator

An agent role that runs the Implementation loop: it gauges each task's size and **dispatches
it to the correct implementation-agent class** (high / mid / low intelligence) to maximize
the chance of a successful implementation. It does not rely on a small agent self-assessing
its own capability. The Orchestrator also enforces the architecture-prerequisite gate.

**See**: [SDLC Implementation phase](../../workflows/sdlc/implementation.md)

---

### RPI (Research → Plan → Implement)

Disciplined workflow for complex tasks.

1. **Research**: Understand the problem space
2. **Plan**: Design the solution
3. **Implement**: Execute the plan

**See**: `mem:principles/rpi`

---

### Context-First

Design philosophy that treats context as a first-class resource. Minimize what enters context, maximize signal-to-noise.

**See**: `mem:principles/context-first`

---

### Verification Culture

Principle that work is not done until verified. "I added the code" is not done; "I ran it and saw expected output" is done.

**See**: `mem:principles/verification-culture`

---

### Deep Module

A module with a small interface and deep implementation. Hides complexity from callers.

**See**: `mem:patterns/deep-modules`

---

## See Also

- `mem:principles/wisdom` — Core principles
- `mem:principles/rpi` — Research → Plan → Implement workflow
- `mem:principles/context-first` — Context management philosophy
- `mem:principles/verification-culture` — Verification discipline
