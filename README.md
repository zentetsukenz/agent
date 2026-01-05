# Agent Collaboration Framework

> *"Context engineering is effectively the #1 job of engineers building AI agents."*  
> — Cognition/Devin

A context-first framework for building reliable AI coding agents that actually finish what they start.

---

## The Problem: The 60% Barrier

AI coding assistants hit a predictable wall—they produce work that's **convenient but not complete**:

- ❌ Claim "done" prematurely
- ❌ Skip error handling and edge cases
- ❌ Reduce test coverage to make tests pass
- ❌ Suffer from context drift and forget instructions
- ❌ Partially implement features

**Root cause:** Context is treated as incidental, not engineered.

As agents run longer, context accumulates and causes **context rot**—performance degrades even within token limits. By the time you notice problems, the damage is done.

---

## The Solution: Context-First Design

This framework treats context as a **first-class system** with its own architecture, lifecycle, and constraints.

### The Four Strategies

| Strategy | Purpose | Example |
|----------|---------|---------|
| **WRITE** | Save context outside the window | Checkpoint to `CHECKPOINT.md` |
| **SELECT** | Pull relevant context in | Read `KNOWLEDGE.md` at session start |
| **COMPRESS** | Retain only required tokens | Replace file contents with path references |
| **ISOLATE** | Split context across boundaries | Delegate screenshots to visual-qa subagent |

### The RPI Workflow

Three phases. Three questions. That's it.

```text
┌─────────────────────────────────────────────────────────────────┐
│                         RPI WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   RESEARCH ─────────────────────────────────────────────────    │
│   "What do we need to understand?"                              │
│                                                                 │
│   • Explore codebase, gather requirements                       │
│   • Research unknowns, identify constraints                     │
│   • Exit: "I understand what we're building and why"            │
│                               │                                 │
│                               ↓                                 │
│   PLAN ─────────────────────────────────────────────────────    │
│   "How will we build this?"                                     │
│                                                                 │
│   • Break work into concrete tasks                              │
│   • Define verification for each task                           │
│   • Exit: "I have a clear plan. Ready to implement."            │
│                               │                                 │
│                               ↓                                 │
│   IMPLEMENT ────────────────────────────────────────────────    │
│   "Does this work correctly?"                                   │
│                                                                 │
│   • Execute plan, verify as you go                              │
│   • Exit: "All tasks complete and verified."                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Proactive Checkpointing

**Don't wait until 80% context—checkpoint at 40%.**

| Threshold | State | Action |
|-----------|-------|--------|
| **< 40%** | Fresh | Continue normally |
| **~ 40%** | Proactive | Checkpoint now (context still optimal) |
| **60-80%** | Heavy | Checkpoint, recommend fresh start |
| **~ 80%** | Emergency | Must checkpoint immediately |

---

## Architecture

```text
Human (Product Owner)
    │
    ↓
TheEngineer (Orchestrator)
    │
    ├── Uses SKILLS/ for reusable procedures
    │   ├── verification.md
    │   ├── checkpoint.md
    │   └── ...
    │
    ├── References docs/ for knowledge
    │   ├── wisdom.md
    │   ├── context-engineering.md
    │   └── ...
    │
    └── Delegates to Subagents (isolated context)
        ├── researcher      → returns ~500 token summary
        ├── visual-qa       → returns text description
        ├── backend-api     → handles API implementation
        └── frontend-dev    → handles UI implementation
```

**Key insight:** Subagents operate in their own context windows. Heavy artifacts (screenshots, research data) stay isolated. Only synthesized results return to the orchestrator.

---

## Repository Structure

```text
agent/
├── README.md                 # You are here
├── docs/                     # Knowledge (reference material)
│   ├── framework-design.md   # Full framework specification
│   ├── agent-spec.md         # How to create agents
│   ├── skill-spec.md         # How to create skills
│   ├── context-engineering.md# Deep dive on context strategies
│   ├── wisdom.md             # Core principles
│   └── ...
└── SKILLS/                   # Procedures (reusable workflows)
    ├── verification.md       # Verify before claiming done
    ├── checkpoint.md         # Save context for continuation
    ├── session-bootstrap.md  # Start fresh with optimal context
    └── ...
```

---

## Documentation Guide

### Core Concepts

| Document | Purpose | Read When... |
|----------|---------|--------------|
| [framework-design.md](docs/framework-design.md) | Complete framework specification | You want the full picture |
| [context-engineering.md](docs/context-engineering.md) | The four strategies deep dive | You're managing context issues |
| [wisdom.md](docs/wisdom.md) | Core principles that guide decisions | You need decision-making guidance |

### Creating Components

| Document | Purpose | Read When... |
|----------|---------|--------------|
| [agent-spec.md](docs/agent-spec.md) | How to structure agent files | You're creating a new agent |
| [skill-spec.md](docs/skill-spec.md) | How to structure skill files | You're creating a new skill |
| [researcher-agent-design.md](docs/researcher-agent-design.md) | Subagent isolation patterns | You're designing research workflows |

### Practical Patterns

| Document | Purpose | Read When... |
|----------|---------|--------------|
| [backend-api-patterns.md](docs/backend-api-patterns.md) | API development patterns | You're building backend features |
| [backend-api-gotchas.md](docs/backend-api-gotchas.md) | Common pitfalls to avoid | You're debugging API issues |
| [prisma-patterns.md](docs/prisma-patterns.md) | Database patterns with Prisma | You're working with the database |

---

## Skills Catalog

Skills are reusable procedures that capture **when**, **how**, and **why**.

| Skill | Trigger | Purpose |
|-------|---------|---------|
| [verification.md](SKILLS/verification.md) | After ANY change, before claiming done | Confirm work actually works |
| [checkpoint.md](SKILLS/checkpoint.md) | ~40% context, phase boundaries | Preserve context for continuation |
| [session-bootstrap.md](SKILLS/session-bootstrap.md) | Starting new session | Load optimal context |
| [dispatch-context.md](SKILLS/dispatch-context.md) | Delegating to subagent | Minimize context transfer |
| [task-sizing.md](SKILLS/task-sizing.md) | Planning implementation | Right-size tasks for context |
| [visual-verification.md](SKILLS/visual-verification.md) | UI changes | Verify visual correctness |
| [server-operations.md](SKILLS/server-operations.md) | Starting/stopping servers | Manage dev environment |
| [browser-console-debugging.md](SKILLS/browser-console-debugging.md) | Frontend debugging | Capture browser errors |
| [fish-shell.md](SKILLS/fish-shell.md) | Running terminal commands | Fish shell syntax reference |

---

## Key Principles

From [wisdom.md](docs/wisdom.md):

### On Verification
>
> **Nothing is done until verified.**  
> Not "I added the code" — but "Tests pass."  
> Not "It should work" — but "I ran it and saw expected output."

### On Context
>
> **Context is fuel — manage it deliberately.**  
> Small focused context wins. Even with large windows, focused context outperforms.  
> Checkpoint at 40% proactive, not 80% emergency.

### On Agents
>
> **Identity shapes behavior.**  
> A well-defined identity beats a thousand instructions.  
> Specialize by problem domain, not technology stack.

### On Skills
>
> **Description triggers, body instructs.**  
> The skill's description determines when it's used; the body determines how.  
> Examples teach better than instructions.

### On Work
>
> **Progress over perfection.**  
> Good enough now > perfect never. Ship, learn, iterate.

---

## Getting Started

### Using These Agents

These agent definitions work with AI coding assistants that support custom instructions or agent files:

1. **GitHub Copilot** — Place agent files in `.github/agents/`
2. **Claude** — Use as custom instructions or system prompts
3. **Other tools** — Adapt the specifications to your platform

### Creating Your First Agent

1. Read [agent-spec.md](docs/agent-spec.md) for the specification
2. Start with the minimal template:

```markdown
---
description: "Brief description (triggers agent selection)"
tools: [list, of, tools]
---

# Agent Name

## Identity
Who the agent is. Core beliefs.

## Workflow
How the agent works. Decision points.

## Success Criteria

How to know the agent succeeded.
```

<!-- markdownlint-disable MD029 -->

3. Keep it under 500 lines — externalize to `docs/` and `SKILLS/`

<!-- markdownlint-enable MD029 -->

### Creating Your First Skill

1. Read [skill-spec.md](docs/skill-spec.md) for the specification
2. Start with the structure:

```markdown
# Skill Name

> Brief purpose

## Trigger
When to use this skill.

## Procedure
Step-by-step with embedded judgment.

## Output
What the skill produces.
```

---

## Design Influences

This framework synthesizes insights from:

- **Anthropic** — [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- **Google ADK** — Tiered context architecture, context as compiled view
- **Cognition/Devin** — "Context engineering is the #1 job"
- **JetBrains Research** — Observation masking vs. LLM summarization
- **Manus** — "Share memory by communicating, don't communicate by sharing memory"

---

## Project Status

**Status:** Design Phase (v0.4.0)

This framework is actively evolving. The core concepts are stable, but implementations may change.

---

## Contributing

Contributions welcome! Areas of interest:

- [ ] Additional agent specializations
- [ ] New skill procedures
- [ ] Platform-specific adaptations
- [ ] Real-world case studies

Please read [agent-spec.md](docs/agent-spec.md) and [skill-spec.md](docs/skill-spec.md) before contributing.

---

## License

TBD, still in private development.
