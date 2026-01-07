# Task Contexts Index

> **Purpose**: Atomic implementation tasks for VS Code Context Engineering PoC
> **Total Tasks**: 10
> **Estimated Duration**: 7 days

---

## Task Overview

| Task | Phase | Agent | Description |
|------|-------|-------|-------------|
| [T01](T01-project-scaffold.md) | 1 | backend-api | Initialize extension with yo code |
| [T02](T02-package-manifest.md) | 1 | backend-api | Configure package.json contributions |
| [T03](T03-chat-participant.md) | 1 | backend-api | Register @engineer participant |
| [T04](T04-checkpoint-tool.md) | 2 | backend-api | Implement #checkpoint tool |
| [T05](T05-dispatch-tool.md) | 2 | backend-api | Implement #dispatch tool |
| [T06](T06-compress-tool.md) | 2 | backend-api | Implement #compress tool |
| [T07](T07-slash-commands.md) | 3 | backend-api | Implement /plan, /implement, /checkpoint |
| [T08](T08-context-manager.md) | 3 | backend-api | Session state management |
| [T09](T09-integration.md) | 3 | team-lead | Wire tools + commands + manager |
| [T10](T10-validation.md) | 4 | team-lead | Test and validate hypotheses |

---

## Execution Order

```
Phase 1: Foundation (Day 1-2)
├── T01 → T02 → T03 (sequential, each builds on previous)

Phase 2: Core Tools (Day 3-4)
├── T04, T05, T06 (can be parallel after T03)

Phase 3: Integration (Day 5-6)
├── T07 → T08 → T09 (sequential)

Phase 4: Validation (Day 7)
└── T10
```

---

## Skills to Load Per Task

| Task | Required Skills |
|------|-----------------|
| T01-T03 | verification |
| T04-T06 | verification, checkpoint (reference for format) |
| T07-T08 | verification |
| T09 | verification, dispatch-context |
| T10 | verification |

---

## Success Criteria (PoC)

**Minimum Viable**:
- [ ] Extension loads without errors
- [ ] @engineer responds to prompts
- [ ] #checkpoint creates .context/CHECKPOINT.md

**Target**:
- [ ] All 3 tools functional
- [ ] All 3 slash commands working
- [ ] <2s tool response latency
