# 📍 CHECKPOINT: Agent Redesign Project

**Date**: January 1, 2026  
**Phase**: Plan → **Implement agent redesigns**  
**For**: TheEngineer  
**Context**: Fresh start

---

## Summary

Framework MVP complete. SKILLS consolidated. Ready to analyze and redesign each agent.

### Session Accomplishments (Jan 1)

1. **Created externalized docs** (3 new knowledge documents):
   - docs/wisdom.md — Core principles
   - docs/agent-spec.md — Agent file specification
   - docs/skill-spec.md — Skill file specification

2. **Compressed framework-design** working documents:
   - Moved to `.context/framework-design/`
   - Created ARCHIVE.md summary

3. **Consolidated SKILLS** (11 files → 10 files in root):
   - Merged verification.md + verification-checklist.md
   - Generalized playwright-verification.md → visual-verification.md
   - Moved 4 skills from load-tester/SKILLS/ to root SKILLS/
   - Deleted load-tester/SKILLS/

4. **Updated agent skill references**:
   - fullstack-developer.agent.md — Fixed 6 skill paths to root SKILLS/
   - TheEngineer.agent.md — Added explicit skill list

---

## Current State

### Framework Assets

| Type | Count | Location |
|------|-------|----------|
| Agents | 8 | `.github/agents/` |
| Knowledge Docs | 5 | `docs/` |
| Skills | 10 | `SKILLS/` |
| Framework Spec | 1 | `FRAMEWORK-DESIGN.md` |

### Agents to Analyze

| Agent | Lines | Purpose | Needs Redesign? |
|-------|-------|---------|-----------------|
| TheEngineer | 514 | Creator, orchestrator | Recently redesigned ✓ |
| Synthesis | 402 | Philosopher-scientist | TBD |
| fullstack-developer | 517 | Load-tester fullstack | TBD |
| backend-api | 747 | Express/Prisma specialist | TBD — large, may need split |
| performance-testing | 459 | Load testing specialist | TBD |
| visual-qa | 182 | Screenshot subagent | Small, focused ✓ |
| browser-console-debugger | 179 | Console debugging subagent | Small, focused ✓ |
| researcher | 254 | Research subagent | TBD |

### Skills Available

```
SKILLS/
├── verification.md          # Full verification checklist
├── visual-verification.md   # UI verification via subagent
├── browser-console-debugging.md  # Debug frontend errors
├── server-operations.md     # Start/stop dev servers
├── fish-shell.md            # Fish shell syntax reference
├── prisma-patterns.md       # Prisma 7 patterns
├── checkpoint.md            # Session state persistence
├── dispatch-context.md      # Subagent context engineering
├── session-bootstrap.md     # SELECT on resume
└── task-sizing.md           # When to dispatch vs do directly
```

---

## Next Task: Agent Analysis & Redesign

### Objective

Analyze each agent against the framework standards (docs/agent-spec.md, docs/wisdom.md) and redesign as needed.

### Analysis Criteria

Per agent, evaluate:

1. **Identity** — Clear, non-overlapping? Specialize by problem, not technology?
2. **Size** — Under 500 lines? Externalize if larger?
3. **Skills** — References appropriate skills? Missing any?
4. **Workflow** — Clear phases and decision points?
5. **Wisdom** — Embedded domain knowledge? Or just instructions?
6. **Consistency** — Follows docs/agent-spec.md structure?

### Suggested Order

1. **backend-api** (747 lines) — Largest, likely needs compression or split
2. **fullstack-developer** (517 lines) — Just above target, review for externalization
3. **performance-testing** (459 lines) — Within range, review for consistency
4. **researcher** (254 lines) — Good size, verify subagent contract
5. **Synthesis** (402 lines) — Unique purpose, verify clarity

Skip (already good):

- TheEngineer — Recently redesigned
- visual-qa — Single-purpose, focused
- browser-console-debugger — Single-purpose, focused

---

## Files to Load

```
#file:docs/agent-spec.md (agent specification — use for evaluation)
#file:docs/skill-spec.md (skill specification — for reference)
#file:docs/wisdom.md (principles — inform redesign)
#file:FRAMEWORK-DESIGN.md (source of truth)
```

When analyzing specific agent:

```
#file:.github/agents/[agent-name].agent.md
```

---

## Key Context

| Concept | Value |
|---------|-------|
| Agent size target | **200-500 lines** |
| Identity principle | **Problem-based, not tech-based** |
| Externalization | **>600 lines → externalize to docs/SKILLS** |
| Skill references | **Root SKILLS/ folder** (not load-tester/SKILLS/) |
| Subagents | **Single-purpose, ~180-250 lines** |

---

## Decisions Made (This Session)

| Decision | Rationale |
|----------|-----------|
| Consolidate SKILLS to root | Single source of truth, agents reference root |
| Merge verification skills | Eliminate redundancy, create comprehensive checklist |
| Generalize visual-verification | Framework-agnostic, not Playwright-specific |
| Skip redesign for subagents | Already single-purpose and focused |

---

## To Continue

Load this checkpoint and say:

> "Continue from this checkpoint. Start with analyzing backend-api.agent.md — it's the largest at 747 lines and likely needs compression or splitting."

Or for overview first:

> "Continue from this checkpoint. Give me an overview of all agents before we start redesigning."
