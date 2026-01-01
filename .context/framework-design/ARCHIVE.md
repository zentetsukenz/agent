# Agentic Context Engineering Framework — MVP Complete

> **Version**: 0.4.3 (MVP)  
> **Completed**: January 1, 2026  
> **Duration**: December 25-31, 2025 (research) + January 1, 2026 (externalization)

---

## What We Built

An **agent collaboration framework** centered on **Context Engineering** as the primary discipline.

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **TheEngineer** | `.github/agents/TheEngineer.agent.md` | Primary orchestrator, Creator identity |
| **Framework Design** | `FRAMEWORK-DESIGN.md` | Source of truth specification |
| **Knowledge Docs** | `docs/` | Conceptual understanding (5 docs) |
| **Skills** | `SKILLS/` | Procedural knowledge (5 skills) |

### Deliverables

**Agent (1)**:

- TheEngineer.agent.md — 514 lines, 67% reduction from original 1474

**Knowledge Documents (5)**:

- context-engineering.md — WRITE/SELECT/COMPRESS/ISOLATE strategies
- researcher-agent-design.md — Subagent isolation patterns
- wisdom.md — Core principles
- agent-spec.md — Agent file specification
- skill-spec.md — Skill file specification

**Skills (5)**:

- checkpoint.md — Session state persistence
- dispatch-context.md — Context engineering for subagent calls
- session-bootstrap.md — SELECT on resume
- task-sizing.md — When to dispatch vs do directly
- verification.md — Trust but verify

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| TheEngineer = Creator | Creates agents, skills, knowledge, tools, context |
| 1 task per dispatch | Context purity: each dispatch = one task + context links |
| Researcher subagent | For deep research (not "Plan") |
| 40% checkpoint threshold | Proactive > emergency (context rot within limits) |
| Document vs Skill separation | Documents = what, Skills = how |
| Heuristic context measurement | No VS Code token API; use task-based heuristics |

---

## Research Synthesis

### Sources Studied

- Spec-Kit, Fabric, Retrospectives, Anthropic, LangChain, JetBrains, Google ADK, HumanLayer

### What We Adopted

| From | Adopted |
|------|---------|
| **Spec-Kit** | User stories, checkpoints, `[P]` parallel markers |
| **Fabric** | Identity/Steps/Output structure |
| **Retrospectives** | Start/Stop/Continue |
| **Context Engineering** | WRITE/SELECT/COMPRESS/ISOLATE |

### What We Skipped

- 7 slash commands (Spec-Kit) — too complex
- No workflow phases (Fabric) — we added RPI

### Gap We Fill

Verification loops + context engineering + subagent isolation

---

## Architecture

```
project/
├── .github/agents/     # Agent definitions
├── docs/               # Knowledge (what) — SELECT from here
├── SKILLS/             # Procedures (how)
├── NOTES.md            # Session learnings (WRITE here)
└── [source code]
```

### RPI Workflow

| Phase | Exit Criteria |
|-------|---------------|
| **Research** | "I understand what we're building and why" |
| **Plan** | "I have a clear plan. Ready to implement." |
| **Implement** | "All tasks complete and verified" |

### Context Strategies

| Strategy | Implementation |
|----------|----------------|
| **WRITE** | docs/, NOTES.md, checkpoints |
| **SELECT** | Read CHECKPOINT.md on `bootstrap`/`resume` |
| **COMPRESS** | Checkpoint at 40%, compaction > summarization |
| **ISOLATE** | Dispatch to subagents (visual-qa, Researcher) |

### Task Sizing

| Size | Context | Action |
|------|---------|--------|
| Small | <5% | Do directly |
| Medium | 5-20% | Consider dispatch |
| Large | >20% | Must dispatch |

---

## Lessons Learned

1. **Identity shapes behavior** — Well-defined identity beats a thousand instructions
2. **Context is fuel** — Manage deliberately, not accidentally
3. **40% proactive > 80% emergency** — Context rot happens within limits
4. **1 task per dispatch** — Context purity enables quality
5. **Compaction > summarization** — Keep structure, remove redundancy
6. **Fresh context = better performance** — Don't fight degradation, restart

---

## Next Steps

1. **Test with real scenario** — Use TheEngineer to create an agent for load-tester project
2. **Create docs/index.md** — Document manifest for discovery
3. **Refine based on usage** — Iterate on pain points

---

## File Manifest

### Active Files (load these)

```
#file:.github/agents/TheEngineer.agent.md
#file:FRAMEWORK-DESIGN.md
#file:docs/wisdom.md
#file:docs/agent-spec.md
#file:docs/skill-spec.md
```

### Archived (this folder)

- CHECKPOINT.md — Final session state
- PLAN.md — TheEngineer redesign plan
- RESEARCH-FINDINGS.md — Research synthesis
- NOTES.md — Session discoveries
- SUMMARY.md — Earlier checkpoint
- *-original.md — Pre-compression backups
