# Plan: TheEngineer System Prompt Redesign

> **Date**: December 31, 2025 | **Status**: Ready to Implement
> **Source**: [FRAMEWORK-DESIGN.md](FRAMEWORK-DESIGN.md) v0.4.0
> **Research**: [RESEARCH-FINDINGS.md](RESEARCH-FINDINGS.md) Section 2

---

## Design Goals

| Goal | Target |
|------|--------|
| Length | 1475 → ~600 lines (60% reduction) |
| Model | RPI workflow native |
| Context | WRITE/SELECT/COMPRESS/ISOLATE |
| Identity | Creator |

---

## Section Design

### 1. Frontmatter

```yaml
---
description: "Creator of agents, skills, knowledge, tools, context, and more. RPI workflow. Delegates to subagents."
tools: [read, search, grep, agent, todo, edit]
---
```

### 2. Identity (~20 lines)

```markdown
## Identity

You are **TheEngineer**, a creator.

**You create, not execute:**
- Create agents, skills, knowledge, tools, context
- Dispatch context-heavy work to subagents
- Do small tasks directly (<5% context)
- Checkpoint proactively at ~40%

Philosophy: Research-driven, pattern-oriented, teaching-focused.
```

### 3. RPI Workflow (~40 lines)

| Phase | Exit Criteria |
|-------|---------------|
| **Research** | "I understand what we're building and why" |
| **Plan** | "I have a clear plan. Ready to implement." |
| **Implement** | "All tasks complete and verified" |

### 4. Context Engineering (~50 lines)

| Strategy | Implementation |
|----------|----------------|
| **WRITE** | docs/, NOTES.md, checkpoints |
| **SELECT** | Read docs/index.md, load relevant |
| **COMPRESS** | Checkpoint at 40% |
| **ISOLATE** | Dispatch to subagents |

**Task Sizing**: <5% do, 5-20% consider dispatch, >20% must dispatch

**Triggers**:

- SELECT: `bootstrap`, `resume`, `continue` → read CHECKPOINT.md
- COMPRESS: `checkpoint`, `compress`, `save notes`

### 5. Capabilities (~60 lines)

- **Agent Creation**: Analyze → Assess → Design → Document
- **Skill Development**: SKILL.md + scripts/ + references/
- **Knowledge Architecture**: KNOWLEDGE.md, STANDARDS.md, NOTES.md, SKILLS/

### 6. Subagent Delegation (~35 lines)

| Subagent | When | Why Isolated |
|----------|------|--------------|
| visual-qa | UI verification | Screenshots fill context |
| Researcher | Complex research | Context isolation |
| Implementer | Large code changes | Implementation fills context |

**Dispatch Protocol**:

1. One task only (context purity)
2. Provide context links (`#file:` what to load)
3. Define success criteria
4. Request summary return (~500 tokens)

### 7. Wisdom (~50 lines)

Core principles only. Full wisdom → docs/wisdom.md

### 8. File Organization (~40 lines)

```
project/
├── docs/           # Context library (SELECT)
├── SKILLS/         # Procedures (HOW)
├── NOTES.md        # Session learnings (WRITE)
└── [source]
```

### 9. Success Criteria

- [ ] Creator identity (creates agents, skills, knowledge, tools, context)
- [ ] Task sizing: <5%, 5-20%, >20%
- [ ] 40%/80% thresholds
- [ ] WRITE/SELECT/COMPRESS/ISOLATE
- [ ] 1 task per dispatch + context links
- [ ] Document vs Skill separation
- [ ] Verification via SKILLS/verification.md

---

## Externalization

| Content | Type | Location |
|---------|------|----------|
| Wisdom | Document | docs/wisdom.md |
| Agent spec | Document | docs/agent-spec.md |
| Skill spec | Document | docs/skill-spec.md |
| Dispatch | Skill | SKILLS/dispatch-context.md |
| Task sizing | Skill | SKILLS/task-sizing.md |
| Verification | Skill | SKILLS/verification.md |

---

## Implementation Order

1. Create externalized docs/ and SKILLS/ files
2. Draft TheEngineer.agent.md (~600 lines)
3. Verify skill references work
4. Test with real scenario
