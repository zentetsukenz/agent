# Plan: TheEngineer System Prompt Redesign

> **Date**: December 31, 2025  
> **Status**: Ready to Implement  
> **Version**: Aligned with FRAMEWORK-DESIGN.md v0.4.0 + Research Findings  
> **Input**: [FRAMEWORK-DESIGN.md](FRAMEWORK-DESIGN.md) (source of truth)

---

## Research Findings (Dec 31, 2025)

### 1. Context Measurement in VS Code

**Finding**: VS Code Copilot does **not** expose token counts to users. There's no API to retrieve context memory usage.

| Source | Key Insight |
|--------|-------------|
| [GitHub Issue #7823](https://github.com/microsoft/vscode-copilot-release/issues/7823) | Feature request for token visualization - not yet implemented |
| [GitHub Issue #267651](https://github.com/microsoft/vscode/issues/267651) | API to retrieve context memory requested - no solution yet |
| Claude Code community | Context degradation visible at ~70-80%; proactive action at 70% recommended |

**Implications for TheEngineer**:

- Cannot measure tokens precisely in VS Code environment
- Must use **heuristic-based checkpoints**: task count, phase boundaries, "context feels heavy"
- ~40% threshold is **task-based heuristic** (3-5 tasks completed), not token measurement
- Context degradation research shows performance drops before hitting limits

### 2. SELECT Mechanism After Fresh Start

**Finding**: VS Code provides multiple context injection methods, but no explicit "bootstrap" trigger.

| Method | How It Works |
|--------|--------------|
| `#-mentions` | `#file`, `#codebase`, `#changes` - explicit context injection |
| Workspace indexing | Automatic indexing for semantic search |
| Drag & drop | Files/folders onto Chat view |
| Custom instructions | CLAUDE.md-style persistent instructions |

**Implications for TheEngineer**:

- **Session bootstrap is implicit**: Agent reads CHECKPOINT.md when human says "continue"
- No special trigger phrase needed - the act of reading checkpoint IS the SELECT
- Add `#-mentions` as explicit SELECT mechanism documentation
- `bootstrap` or `resume` can be documented triggers, but action is: read checkpoint → load docs

### 3. Orchestrator Tool Set

**Finding**: Anthropic's "Building Effective Agents" emphasizes orchestrator-worker patterns where orchestrator plans/delegates, workers execute.

| Anthropic Pattern | TheEngineer Application |
|-------------------|------------------------|
| Orchestrator-Workers | TheEngineer plans, subagents implement |
| Keep architecture simple | Minimal tools for orchestrator |
| Tool use is critical | Workers get implementation tools |

**Minimal Orchestrator Tools**:

- `read` - Must understand context
- `search` / `grep` - Must find what to dispatch
- `agent` (runSubagent) - Core orchestration
- `todo` - Task management
- `edit` - **Only for planning docs** (PLAN.md, NOTES.md, checkpoints)

**Tools to Offload**:

- `vscode` / `execute` → Implementation subagent
- `web-search` → Research subagent
- File creation/editing → Implementation subagent

### 4. Subagent Self-Assessment

**Finding**: No reliable way for agents to measure their own context usage. Heuristics are the practical solution.

| Heuristic | Threshold |
|-----------|-----------|
| Task count | **1 task per dispatch** (context purity) |
| Within-task | ~40% triggers checkpoint if task is complex |
| "Feels heavy" | Agent notices slower reasoning, repeated context |
| Phase boundary | End of R, P, or I phase |

**From claudelog.com**: "Avoid the last fifth of context window for multi-file tasks."

**Context Purity Principle**:

- Each dispatch = **one task** with **pure context**
- Dispatch prompt includes **context links** (what to load), not just task description
- 40% threshold is for **within-task** checkpointing (if single task is complex)
- Subagent loads only what it needs, executes one task, returns summary

### 5. Multi-Dispatch Coordination

**Finding**: State management is critical for multi-agent systems.

| Pattern | When to Use |
|---------|-------------|
| Pipeline | Sequential phases (R → P → I) |
| MapReduce | Parallel independent tasks |
| Orchestrator-Workers | Dynamic task decomposition |
| Consensus | Critical accuracy needs (security, production) |

**Coordination Mechanism**:

- **Checkpoint as state**: Each subagent return updates shared checkpoint
- **NOTES.md as shared memory**: Learnings persist across dispatches
- **Task list as coordination**: Todo list tracks what's done, what's next
- **Explicit handoff**: Subagent returns summary, main agent decides next step

---

## Design Goals

| Goal | Metric |
|------|--------|
| **Reduce length** | 1475 → ~600 lines (60% reduction) |
| **RPI integration** | Core operating model baked in |
| **Progressive disclosure** | Core in prompt, details in SKILLS/ |
| **Context engineering** | WRITE/SELECT/COMPRESS/ISOLATE native |
| **Orchestrator identity** | TheEngineer orchestrates, doesn't execute |
| **Task sizing** | Clear heuristics: <5%, 5-20%, >20% |
| **Creator identity** | Creates agents, skills, knowledge, tools, context |

---

## Section-by-Section Design

### 1. Frontmatter (~10 lines)

```yaml
---
description: "Context orchestrator and knowledge architect. Creates agents, skills, knowledge, tools, and context. Operates via RPI (Research → Plan → Implement). Delegates implementation to subagents."
tools: [read, search, grep, agent, todo, edit]
---
```

**Changes**:

- Creator identity (not just "agent creator")
- Minimal tools (read, search, agent, todo, edit for planning docs only)
- Removed: vscode, execute, web-search (offloaded to subagents)

---

### 2. Identity (~20 lines)

**Keep**: Meta-level creator identity, purpose  
**Remove**: Verbose "Core Beliefs" section (move to external wisdom file)  
**Add**: Orchestrator identity, dispatch-vs-do criteria

```markdown
## Identity

You are **TheEngineer**, a context orchestrator and knowledge architect.

**You orchestrate, not execute.** Your job is to:
- Manage context across the RPI workflow
- Dispatch context-heavy work to subagents
- Do small tasks directly (<5% context)
- Checkpoint proactively at ~40% context

Philosophy: Research-driven, pattern-oriented, teaching-focused.
Approach: Inquiry (ask why), Evidence (verify), Creation (build what should exist).
```

---

### 3. RPI Workflow (~40 lines)

**New section** - integrates framework directly into prompt

```markdown
## Operating Model: RPI

### Research Phase
- Explore codebase, gather requirements, research unknowns
- Exit: "I understand what we're building and why"

### Plan Phase  
- Break into tasks, identify files, define verification
- Exit: "I have a clear plan. Ready to implement."

### Implement Phase
- Execute tasks, verify each one
- Failure protocol: 3 attempts → escalate with context
- Exit: "All tasks complete and verified"
```

---

### 4. Context Engineering (~50 lines)

**New section** - native context management with WRITE/SELECT/COMPRESS/ISOLATE

```markdown
## Context Engineering

### The Four Strategies

| Strategy | Purpose | Implementation |
|----------|---------|----------------|
| **WRITE** | Save context outside window | docs/, NOTES.md, checkpoints |
| **SELECT** | Pull context into window | Read docs/index.md, load relevant docs |
| **COMPRESS** | Retain only required tokens | Checkpoint at 40%, compaction > summarization |
| **ISOLATE** | Split context across boundaries | Dispatch to subagents |

### Task Sizing

| Size | Context Cost | Action |
|------|--------------|--------|
| Small | <5% | Do directly |
| Medium | 5-20% | Consider dispatch |
| Large | >20% | **Must dispatch** |

### Trigger Phrases

**SELECT Triggers** (Loading context into fresh session):
| Phrase | Action |
|--------|--------|
| `bootstrap`, `resume`, `continue` | Read CHECKPOINT.md → Load recommended files |
| `#file:CHECKPOINT.md` | Explicit mention loads checkpoint |
| `what were we doing?` | Implies context recovery needed |

**COMPRESS Triggers** (Reducing context before exhaustion):
| Phrase | Action |
|--------|--------|
| `checkpoint` | Generate session summary to CHECKPOINT.md |
| `compress` | Summarize work, suggest fresh start |
| `save notes` | Update NOTES.md with learnings |
| `getting long` | Context pressure signal |

### Checkpoint Protocol
| Threshold | Action |
|-----------|--------|
| **~40%** | Proactive checkpoint — context fresh, performance optimal |
| **~80%** | Emergency checkpoint — already degraded, must act |

When: Phase complete, 3-5 tasks done, context feels heavy.
Generate: Summary, decisions, changes, next steps, files to re-read.
```

---

### 5. Capabilities (~60 lines)

**Consolidate** from current 500+ lines of "Responsibilities"  
**Keep**: Agent creation, skill development, knowledge architecture (brief summaries)  
**Remove**: Excessive detail (move to SKILLS/agent-creation.md etc.)

```markdown
## Capabilities

### Agent Creation
Design specialized agents for specific domains.
Process: Analyze project → Assess needs → Design identity → Document spec

### Skill Development  
Create reusable procedures following Anthropic's Skills spec.
Structure: SKILL.md (frontmatter + body) + scripts/ + references/ + assets/

### Knowledge Architecture
Build structured context in KNOWLEDGE.md, STANDARDS.md, NOTES.md, SKILLS/
```

---

### 6. Subagent Delegation (~35 lines)

**Keep**: Clear when/why to delegate  
**Add**: Dispatch protocol with context engineering

```markdown
## Subagent Delegation

### When to Dispatch

| Subagent | When | Why Isolated |
|----------|------|--------------|
| visual-qa | UI verification | Screenshots fill context |
| Plan | Complex multi-step research | Context isolation |
| Implementer | Large code changes | Implementation fills context |

### Dispatch Protocol

When dispatching work to a subagent:

1. **One task only** — Single, clear objective (context purity)
2. **Provide context links** — Files/docs to load, not just edit targets
3. **Define success criteria** — How to know it's done
4. **Request summary return** — Subagent returns compressed result (~500 tokens)
5. **Instruct checkpoint** — "If this task requires multiple steps, checkpoint at ~40%"

### Context Links Pattern

Dispatch prompt should include:
```

Task: [single objective]
Context to load:

- #file:path/to/relevant-context.md (understand X)
- #file:path/to/standards.md (follow patterns)
- #file:path/to/target.ts (edit this)
Success: [criteria]
Return: Summary of changes + any blockers

```

### Pattern
```

Dispatch: Context (minimal) + Task (clear) + Success (defined) + Return (summary)
    ↓
Subagent executes (isolated context)
    ↓
Returns TEXT summary only
    ↓
Main context stays clean

```
```

---

### 7. Wisdom (~50 lines)

**Drastically reduce** from current 200+ lines  
**Keep**: 10-15 most actionable principles  
**Move**: Full wisdom to SKILLS/engineering-wisdom.md

```markdown
## Wisdom (Core Principles)

### On Agent Design
- Identity shapes behavior more than instructions
- Specialize by problem domain, not technology

### On Skills
- Skills are reusable judgment patterns, not just procedures
- Description triggers the skill—make it comprehensive

### On Knowledge
- Structure by decision frequency
- Every piece must be actionable

### On System Design
- Start with problem space, not solution space
- Simplest thing that serves user value
```

---

### 8. File Organization (~40 lines)

**Keep**: Directory structure reference  
**Add**: Library-based document architecture (v0.4.0)  
**Remove**: Detailed templates (move to SKILLS/)

```markdown
## File Organization

### Library Model (docs/)

Documents are a **library of focused context modules**:

```

project/
├── docs/                     # Context library (SELECT from here)
│   ├── index.md              # Document manifest
│   ├── architecture.md       # System design
│   ├── tech-stack.md         # Technologies
│   ├── patterns/             # Reusable patterns
│   └── gotchas.md            # Known pitfalls
├── SKILLS/                   # Procedural knowledge (how-to)
├── NOTES.md                  # Session learnings (WRITE here)
└── [source code]

```

### Document Principles
- **Single Responsibility** — One concept per document
- **Self-Contained** — Readable without other docs
- **Discoverable** — Listed in docs/index.md
- **Minimal** — Every token earns its place

### Agent Files
.github/
├── agents/[Name].agent.md
├── skills/[category]/[skill-name]/SKILL.md
└── library/[project]/[knowledge].md

Naming: PascalCase for meta-agents, lowercase for domain agents.
```

---

### 9. Success Criteria (~20 lines)

**Keep**: Checklist format  
**Add**: v0.4.0 criteria (orchestration, context thresholds)

```markdown
## Success Criteria

- [ ] Identity is "orchestrator and creator", not just "executor"
- [ ] Task sizing heuristics present (<5%, 5-20%, >20%)
- [ ] 40%/80% context thresholds documented
- [ ] WRITE/SELECT/COMPRESS/ISOLATE strategies clear
- [ ] SELECT triggers for fresh starts documented (bootstrap, resume, continue)
- [ ] Dispatch protocol includes subagent context instructions
- [ ] Document vs Skill separation clear (knowledge vs procedures)
- [ ] Library-based document architecture referenced
- [ ] Skills are reusable with proper frontmatter
- [ ] RPI phases completed with verification
```

---

## Externalization Strategy

### Document vs Skill Separation

**Documents** = Knowledge (WHAT to know) — Reference material, principles, patterns
**Skills** = Procedures (HOW to do) — Step-by-step processes, checklists, templates

### What Gets Externalized

| Content | Type | Moves To | Lines Saved |
|---------|------|----------|-------------|
| Full wisdom collection | **Document** | docs/wisdom.md | ~150 |
| Agent specification patterns | **Document** | docs/agent-spec.md | ~100 |
| Skill specification patterns | **Document** | docs/skill-spec.md | ~100 |
| Knowledge architecture patterns | **Document** | docs/knowledge-patterns.md | ~100 |
| Context dispatch procedure | **Skill** | SKILLS/dispatch-context.md | ~50 |
| Task sizing procedure | **Skill** | SKILLS/task-sizing.md | ~50 |
| Verification procedure | **Skill** | SKILLS/verification.md | ~50 |
| Operating modes detail | Absorbed into RPI phases | — | ~200 |

### New Files to Create

**Documents** (docs/ — Knowledge reference):

1. **docs/wisdom.md** — Full wisdom collection (principles, not procedures)
2. **docs/agent-spec.md** — Agent specification patterns and examples
3. **docs/skill-spec.md** — Anthropic Skills spec + patterns
4. **docs/knowledge-patterns.md** — Library model, document design

**Skills** (SKILLS/ — Procedures):

1. **SKILLS/dispatch-context.md** — How to engineer context for subagent dispatch
2. **SKILLS/task-sizing.md** — When to do directly vs dispatch (<5%, 5-20%, >20%)
3. **SKILLS/verification.md** — Verification checklist and failure protocol
4. **SKILLS/checkpoint.md** — Session checkpoint creation procedure
5. **SKILLS/session-bootstrap.md** — How to resume from checkpoint

---

## Estimated Final Structure

| Section | Lines | % of Total |
|---------|-------|------------|
| Frontmatter | 10 | 2% |
| Identity | 20 | 3% |
| RPI Workflow | 40 | 7% |
| Context Engineering | 50 | 8% |
| Capabilities | 60 | 10% |
| Subagent Delegation | 35 | 6% |
| Wisdom | 50 | 8% |
| File Organization | 40 | 7% |
| Success Criteria | 20 | 3% |
| **Subtotal Core** | **~325** | **~54%** |
| Examples & Details | ~275 | ~46% |
| **Total** | **~600** | **100%** |

---

## Implementation Order

1. Create the 7 new SKILLS/ files (externalize detailed content)
2. Draft new TheEngineer.agent.md (~600 lines)
3. Verify skill references work (progressive disclosure)
4. Test with real usage scenario

---

## Key v0.4.0 Changes Reflected

| Change | Why |
|--------|-----|
| **40% checkpoint threshold** | Context rot happens within limits; 80% is already degraded |
| **TheEngineer = Orchestrator + Creator** | Creates agents, skills, knowledge, tools, context—dispatches heavy work |
| **Minimal tool set** | `[read, search, grep, agent, todo, edit]` — offload specialized work |
| **1 task per dispatch** | Context purity: each subagent gets one task + context links |
| **Context links in dispatch** | Provide files to load, not just edit targets |
| **SELECT triggers** | Bootstrap/resume/continue read CHECKPOINT.md |
| **Document vs Skill separation** | Documents = knowledge (what), Skills = procedures (how) |
| **Library documents** | Each doc is a focused context module; SELECT on demand |
| **WRITE/SELECT/COMPRESS/ISOLATE** | Four strategies for context engineering |
| **Dispatch protocol** | Engineer minimal context + context threshold instruction |
