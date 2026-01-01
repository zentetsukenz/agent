# 📍 CHECKPOINT: Agent Collaboration Framework

**Date**: December 30, 2025  
**Phase**: Research ✅ → Plan ✅ → Implement (ready to start)

---

## Summary

We're building an **agent collaboration framework** centered on **Context Engineering** as the primary discipline. The framework uses **RPI (Research → Plan → Implement)** with **TheEngineer as Context Orchestrator** who dispatches context-heavy work to subagents.

**Core Insight**: Context Engineering is the #1 job. Everything flows from managing context deliberately via WRITE/SELECT/COMPRESS/ISOLATE.

---

## This Session (Dec 30)

- **Refined framework design** based on discussion:
  1. **Checkpoint at 40%** (proactive) instead of 80% (emergency)
  2. **TheEngineer as Orchestrator** — dispatches large tasks, only does small tasks directly
  3. **Library-based documents** — focused context modules, not monolithic files
- Added new skills: `dispatch-context.md`, `task-sizing.md`
- Updated [FRAMEWORK-DESIGN.md](FRAMEWORK-DESIGN.md) to v0.4.0

---

## Documents

| Document | Purpose |
|----------|---------|
| [FRAMEWORK-DESIGN.md](FRAMEWORK-DESIGN.md) | **Unified framework spec** — v0.4.0 with all refinements |
| [RESEARCH-FINDINGS.md](RESEARCH-FINDINGS.md) | All research: Spec-Kit, Fabric, system prompts, context engineering |
| [PLAN.md](PLAN.md) | TheEngineer redesign plan |

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **40% Checkpoint** | Context rot happens even within limits; stay fresh |
| **TheEngineer = Orchestrator** | Don't hoard context; dispatch heavy work |
| **Library Documents** | Each doc is a context module; SELECT on demand |
| **Goldilocks Prompt** | Not too vague, not too strict; identity + dispatch criteria |
| **Task Sizing** | Small (do), Medium (consider), Large (must dispatch) |

---

## Framework Structure (v0.4.0)

```
project/
├── docs/                     # Context library (SELECT from here)
│   ├── index.md              # Document manifest
│   ├── architecture.md       # System design
│   ├── tech-stack.md         # Technologies
│   ├── patterns/             # Code patterns
│   └── gotchas.md            # Pitfalls
├── SKILLS/                   # Procedural knowledge
│   ├── dispatch-context.md   # How to engineer context for dispatch
│   ├── task-sizing.md        # When to dispatch vs do directly
│   └── verification.md       # How to verify work
├── NOTES.md                  # Session learnings (WRITE here)
└── [source code]
```

---

## Next Steps

1. Create SKILLS/ files with actual content
2. Draft TheEngineer.agent.md with Goldilocks prompt
3. Test dispatch protocol with real tasks
4. Refine based on experience

---

## Files to Re-Read in New Chat

| File | Why |
|------|-----|
| [SUMMARY.md](SUMMARY.md) | This checkpoint |
| [FRAMEWORK-DESIGN.md](FRAMEWORK-DESIGN.md) | v0.4.0 specification |

---

## Key Context

- **Checkpoint Thresholds**: 40% proactive, 80% emergency
- **TheEngineer**: Orchestrates, dispatches, doesn't hoard context
- **Task Sizing**: Small (<5%), Medium (5-20%), Large (>20% context)
- **Documents**: Library of focused modules, not monoliths
- **Trigger phrases**: `checkpoint`, `compress`, `save notes`
