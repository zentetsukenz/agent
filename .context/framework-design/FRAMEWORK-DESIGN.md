# Agent Collaboration Framework

> **Status**: Design Phase  
> **Version**: 0.4.0  
> **Last Updated**: December 30, 2025  
> **Philosophy**: Context Engineering is the #1 job

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Context Engineering](#2-context-engineering)
3. [The RPI Workflow](#3-the-rpi-workflow)
4. [Agent Model](#4-agent-model)
5. [Document Architecture](#5-document-architecture)
6. [Skills System](#6-skills-system)
7. [Verification](#7-verification)
8. [Getting Started](#8-getting-started)

---

## 1. Philosophy

### The Problem We Solve

AI coding assistants hit a "60% barrier"—they produce work that's convenient but not complete:

- Claim "done" prematurely
- Skip error handling and edge cases
- Reduce test coverage to make tests pass
- Partially implement features
- Suffer from context drift and forget instructions

**Root Cause**: Context is treated as incidental, not engineered.

### Our Approach: Context-First Design

> "Context engineering is effectively the #1 job of engineers building AI agents."  
> — Cognition/Devin

We treat context as a **first-class system** with its own architecture, lifecycle, and constraints. Everything flows from this:

| Traditional Approach | Context-Engineered Approach |
|---------------------|----------------------------|
| Add more instructions | Manage what fits in context |
| Hope AI remembers | Explicitly WRITE/SELECT/COMPRESS/ISOLATE |
| Single long conversation | Checkpoint at natural boundaries |
| All-in-one agent | Isolate expensive operations to subagents |

### Core Principles

1. **Context is Fuel** — Manage it deliberately, not accidentally
2. **Simplicity** — Three phases (RPI), one primary agent, subagents on-demand
3. **Verification** — Nothing is "done" until verified. Ever.
4. **Human Partnership** — Human is Product Owner; AI is Engineer. Collaborate, don't automate.
5. **Honest Reporting** — Never claim done when not done. Ask for help when stuck.

### The Golden Rule

> "If not sure, verify. If can't verify, ask. Never claim 'done' when it's not."

---

## 2. Context Engineering

### 2.1 What is Context Engineering?

**Definition** (Andrej Karpathy):
> "The delicate art and science of filling the context window with just the right information for the next step."

LLMs are like CPUs; the context window is like RAM. Just as an OS curates what fits into RAM, context engineering curates what fits into the context window.

### 2.2 Context Problems

As agents run longer, context accumulates and causes problems:

| Problem | Description |
|---------|-------------|
| **Context Poisoning** | Hallucination makes it into the context, propagates |
| **Context Distraction** | Too much context overwhelms the signal |
| **Context Confusion** | Superfluous context influences responses |
| **Context Clash** | Parts of the context contradict each other |
| **Context Rot** | Performance degrades as context fills (even within limits) |

**Key Insight**: Even with longer context windows, you **always** get better results with a small, focused context.

### 2.3 The Four Strategies: WRITE / SELECT / COMPRESS / ISOLATE

#### WRITE — Save Context Outside the Window

Persist information outside the context window for later retrieval.

| Technique | Description | Example |
|-----------|-------------|---------|
| **Scratchpads** | Note-taking during a task | Save plan to NOTES.md |
| **Checkpoints** | Session state for continuation | Checkpoint template |
| **Files** | Persistent documents | KNOWLEDGE.md, STANDARDS.md |

**Implementation**: Tool calls that write to files, or structured state objects.

#### SELECT — Pull Context Into the Window

Retrieve relevant information when needed.

| Technique | Description | Example |
|-----------|-------------|---------|
| **File Read** | Fetch saved notes/files | Read KNOWLEDGE.md at session start |
| **Semantic Search** | Find relevant code/docs | Search codebase for patterns |
| **Tool Selection** | Fetch relevant tools | Only load tools needed for current phase |

**Memory Types**:

- **Episodic** — Few-shot examples of desired behavior
- **Procedural** — Instructions to steer behavior (SKILLS/)
- **Semantic** — Facts for task-relevant context (KNOWLEDGE.md)

#### COMPRESS — Retain Only Required Tokens

Reduce context size while preserving essential information.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Compaction** | Replace file contents with path references | After editing a file |
| **Summarization** | LLM distills key points | At phase boundaries |
| **Observation Masking** | Hide older tool outputs with placeholders | During long implementation |

**Priority Order**: Raw > Compaction > Summarization

| Priority | What to Keep | Strategy |
|----------|--------------|----------|
| **1. Keep Raw** | Current task, active errors, recent conversation | Never compress |
| **2. Compact** | File contents already edited | Replace with path reference |
| **3. Summarize** | Old decisions, completed work | Compress to structured notes |

**Key Finding** (JetBrains Research):
> "Observation masking outperforms LLM summarization in overall efficiency and reliability."

Both approaches cut costs by 50%+ vs unmanaged context.

#### ISOLATE — Split Context Across Boundaries

Prevent context explosion by separating concerns.

| Technique | Description | Example |
|-----------|-------------|---------|
| **Subagents** | Each subagent has own context window | Visual QA for screenshots |
| **Phase Boundaries** | Checkpoint between phases | R → P → I transitions |
| **Task Isolation** | Fresh context per major task | New chat for new feature |

**Subagent Pattern**:

```
TheEngineer (Primary)
    │
    │ "Verify the login page looks correct"
    │
    ↓
visual-qa Subagent (isolated context)
    │
    │ Takes screenshots (~100KB each, stays here)
    │ Analyzes UI
    │
    ↓
Returns TEXT description only (~500 tokens)
    │
    ↓
TheEngineer continues with clean context
```

**Trade-off**: Multi-agent can use up to 15× more tokens than single-agent chat, but prevents context overflow.

### 2.4 Trigger Phrases

| Phrase | Action |
|--------|--------|
| `checkpoint` | Generate portable session summary for new chat |
| `compress` | Summarize recent work, suggest fresh start |
| `save notes` | Update NOTES.md with key discoveries |

### 2.5 Checkpoint Protocol

**Context Thresholds**:

| Threshold | Action | Rationale |
|-----------|--------|----------|
| **~40%** | Proactive checkpoint | Context still fresh, performance optimal |
| **~80%** | Emergency checkpoint | Already in degradation territory |

**Key Insight**: Context rot happens even within limits. Waiting until 80% means performance has already degraded. Checkpoint at 40% to keep context fresh.

**When to checkpoint**:

- **Proactive (~40%)**: End of phase, significant discoveries, before large task
- **Emergency (~80%)**: Approaching limits, must checkpoint now
- **Natural**: Context feels "heavy", lots of back-and-forth

**Checkpoint Template**:

```markdown
📍 CHECKPOINT: [Brief Title]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Summary
[2-3 sentences: what was accomplished]

## Decisions Made
- [Decision]: [rationale]

## Code Changes
- [file](path): [what changed]

## Current State
- Phase: [Research | Plan | Implement]
- Tasks: [X/Y complete]
- Blockers: [none | list]

## Next Steps
1. [What to do next]

## Files to Re-Read
- [path] — [why needed]

## Key Context
[Critical domain knowledge that must survive]
```

### 2.6 NOTES.md — Persistent Memory

Learnings that survive context resets:

```markdown
# Session Notes

## Active Decisions
| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-30 | Use RPI workflow | Simpler than multi-agent |

## Patterns Discovered
- [Pattern]: [where it applies]

## Gotchas
- [Issue]: [how to avoid]
```

---

## 3. The RPI Workflow

### Overview

**Three phases. Three questions. That's it.**

| Phase | Question | Output |
|-------|----------|--------|
| **Research** | What do we need to understand? | Clear problem understanding |
| **Plan** | How will we build this? | Task list with verification |
| **Implement** | Does it work correctly? | Working, verified code |

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RPI WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   RESEARCH ──────────────────────────────────────────────────────   │
│   Question: "What do we need to understand?"                        │
│                                                                     │
│   • Explore the codebase                                            │
│   • Gather requirements from human                                  │
│   • Research unknowns (web, docs, examples)                         │
│   • Identify constraints and dependencies                           │
│   • Ask clarifying questions                                        │
│                                                                     │
│   Exit: "I understand what we're building and why"                  │
│   Context: CHECKPOINT if discoveries are significant                │
│                               │                                     │
│                               ↓                                     │
│   PLAN ──────────────────────────────────────────────────────────   │
│   Question: "How will we build this?"                               │
│                                                                     │
│   • Break work into concrete tasks                                  │
│   • Identify files to create/modify                                 │
│   • Sequence tasks (dependencies)                                   │
│   • Define verification for each task                               │
│   • Flag risks and unknowns                                         │
│                                                                     │
│   Exit: "I have a clear plan. Ready to implement."                  │
│   Context: CHECKPOINT the approved plan                             │
│                               │                                     │
│                               ↓                                     │
│   IMPLEMENT ─────────────────────────────────────────────────────   │
│   Question: "Does this work correctly?"                             │
│                                                                     │
│   For each task:                                                    │
│     1. Mark task in-progress                                        │
│     2. Do the work                                                  │
│     3. Verify against acceptance criteria                           │
│     4. If fail → retry (max 3) or escalate to human                 │
│     5. Mark task complete                                           │
│                                                                     │
│   Exit: "All tasks complete and verified."                          │
│   Context: 1 task per dispatch (context purity)                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Phase Details

#### Research Phase

**Purpose**: Understand before acting. No coding yet.

**When to do it**:

- Starting any non-trivial work
- Entering unfamiliar codebase area
- Requirements are unclear

**Activities**:

1. Read existing code related to the task
2. Identify patterns already in use
3. Research external APIs, libraries, or concepts
4. Ask human clarifying questions
5. Document constraints and assumptions

**Exit Criteria**:

- Can articulate what we're building in one sentence
- Know where the changes will go
- Understand the acceptance criteria
- No major unknowns remaining

#### Plan Phase

**Purpose**: Design the solution. Sequence the work.

**Activities**:

1. List all tasks needed
2. Identify files to create or modify
3. Determine task dependencies
4. Define how to verify each task
5. Estimate complexity (simple/medium/complex)
6. Flag risks or potential blockers

**Output Format**:

```markdown
## Tasks

1. [ ] Create migration for new table
   - Files: prisma/schema.prisma, migrations/
   - Verify: `prisma migrate dev` succeeds
   
2. [ ] Implement service layer
   - Files: src/features/X/X.service.js
   - Depends: Task 1
   - Verify: Unit tests pass
   
3. [ ] Add API endpoint
   - Files: src/features/X/X.controller.js
   - Depends: Task 2
   - Verify: Integration tests pass
```

**Exit Criteria**:

- All tasks identified
- Dependencies clear
- Verification defined for each task
- Human approves plan

#### Implement Phase

**Purpose**: Execute the plan. Verify as you go.

**Per-Task Loop**:

1. Mark task "in-progress"
2. Implement the change
3. Run verification (tests, lint, visual check)
4. If PASS → mark complete, continue
5. If FAIL → retry with different approach (max 3)
6. If still failing → escalate to human

**Escalation Format**:

```markdown
🚨 BLOCKED: [Task description]

**What was tried**:
1. [Approach 1]: [Why it failed]
2. [Approach 2]: [Why it failed]
3. [Approach 3]: [Why it failed]

**What help is needed**:
[Specific question or guidance needed]

**Suggested next steps**:
[What human might do to unblock]
```

---

## 4. Agent Model

### TheEngineer — Creator

**TheEngineer** is the **creator**, not the executor:

- **Creates** agents, skills, knowledge, tools, context, and more
- **Dispatches** context-heavy work to subagents
- **Manages** context through checkpoints
- **Performs** only small, low-context tasks directly

**Critical Distinction**:

| Task Type | Context Cost | Action |
|-----------|--------------|--------|
| Small task | Low (~1-5% context) | Do directly |
| Medium task | Medium (~5-20% context) | Consider dispatch |
| Large task | High (>20% context) | **Must dispatch** |

```
┌─────────────────────────────────────────────────────────────────┐
│                      TheEngineer                                │
│                        (Creator)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Identity:                                                      │
│    • Creator of agents, skills, knowledge, tools, context       │
│    • Research-driven, pattern-oriented, teaching-focused        │
│    • Dispatches work, doesn't hoard context                     │
│                                                                 │
│  Creates:                                                       │
│    • Agents — Specialized for domains                           │
│    • Skills — Reusable procedures                               │
│    • Knowledge — Structured context (docs/, NOTES.md)           │
│    • Tools — New capabilities as needed                         │
│    • Context — Pure, focused context for each task              │
│                                                                 │
│  Dispatches to:                                                 │
│    • Implementer — Code implementation (context isolation)      │
│    • Researcher — Deep research tasks (context isolation)       │
│    • visual-qa — UI verification (screenshot isolation)         │
│    • [project-specific subagents as needed]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Goldilocks Zone — TheEngineer's Prompt

TheEngineer's system prompt must be **not too vague, not too strict**:

| Too Vague | Goldilocks Zone | Too Strict |
|-----------|-----------------|------------|
| "Help with coding" | Clear identity | Every scenario scripted |
| No guidance | Dispatch criteria | Rigid rules |
| Agent confused | Context triggers | Agent brittle |

**What TheEngineer's prompt SHOULD contain**:

- **Identity**: Who it is, philosophy, approach
- **Dispatch criteria**: When to do vs delegate
- **Context triggers**: When to checkpoint, compress
- **Skill references**: Where to find procedures

**What TheEngineer's prompt should NOT contain**:

- Detailed implementation procedures (→ SKILLS/)
- Full project knowledge (→ docs/)
- Exact code patterns (→ standards.md)
- Long examples (→ reference docs)

### Specialist Subagents (On-Demand)

TheEngineer dispatches to subagents for context isolation:

| Subagent | When to Dispatch | Why Isolated |
|----------|------------------|--------------|
| **Implementer** | Code changes, file edits | Implementation fills context fast |
| **Researcher** | Deep research, exploration | Research accumulates context |
| **visual-qa** | UI verification | Screenshots ~100KB each |
| **[project-specific]** | Domain expertise | Specialized knowledge |

### Dispatch Protocol

When dispatching work to a subagent:

1. **One task only** — Context purity: each dispatch = one task
2. **Provide context links** — Files to load (`#file:`), not just edit targets
3. **Define success criteria** — How to know it's done
4. **Request summary return** — Subagent returns compressed result (~500 tokens)

```
TheEngineer dispatches:
┌─────────────────────────────────────┐
│ Task: [single objective]            │
│ Context to load:                    │
│   #file:path/to/context.md          │
│   #file:path/to/standards.md        │
│   #file:path/to/target.ts           │
│ Success: [criteria]                 │
│ Return: Summary + blockers          │
└─────────────────────────────────────┘
         │
         ↓
    Subagent executes
    (isolated context)
         │
         ↓
    Returns summary
    (~500 tokens, not full context)
         │
         ↓
TheEngineer integrates result
(main context stays clean)
```

---

## 5. Document Architecture

### Library Model

Documents are a **library of focused context modules**, not monolithic files:

```
project/
├── docs/                     # Context library (SELECT from here)
│   ├── index.md              # Document manifest with descriptions
│   ├── architecture.md       # System design, components
│   ├── tech-stack.md         # Technologies, versions, rationale
│   ├── patterns/             # Reusable patterns
│   │   ├── api-design.md     # REST conventions, error handling
│   │   ├── database.md       # Prisma patterns, migrations
│   │   └── testing.md        # Test organization, fixtures
│   ├── gotchas.md            # Things that trip you up
│   └── onboarding.md         # Quick start for new sessions
├── SKILLS/                   # Procedural knowledge (how-to)
│   ├── verification.md
│   ├── dispatch-context.md
│   └── [project-specific].md
├── NOTES.md                  # Session learnings (WRITE here)
└── [source code]
```

### Document Principles

Each document is a **context module** that must be:

| Principle | Description |
|-----------|-------------|
| **Single Responsibility** | One concept per document |
| **Self-Contained** | Readable without other docs |
| **Discoverable** | Clear naming, listed in index.md |
| **Minimal** | No filler — every token earns its place |

### Core Documents

Most projects need these (adapt as needed):

| Document | Purpose | Load When |
|----------|---------|----------|
| **index.md** | Manifest of available docs | Start of session |
| **architecture.md** | System design, components | Understanding structure |
| **tech-stack.md** | Technologies and rationale | Implementation decisions |
| **patterns/*.md** | Reusable code patterns | Implementing features |
| **gotchas.md** | Known pitfalls | Avoiding mistakes |
| **onboarding.md** | Quick start guide | New session bootstrap |

### Discovery Mechanism

The `docs/index.md` serves as the document manifest:

```markdown
# Document Index

## Architecture
- [architecture.md](architecture.md) — System design, component relationships
- [tech-stack.md](tech-stack.md) — Technologies, versions, why chosen

## Patterns
- [patterns/api-design.md](patterns/api-design.md) — REST conventions, error responses
- [patterns/database.md](patterns/database.md) — Prisma patterns, migrations
- [patterns/testing.md](patterns/testing.md) — Test organization, fixtures

## Reference
- [gotchas.md](gotchas.md) — Known pitfalls and workarounds
- [onboarding.md](onboarding.md) — Quick start for new sessions
```

**Usage**: Agent reads `index.md` first, then SELECTs relevant docs based on current task.

### Document Templates

#### architecture.md

```markdown
# Architecture

## Overview
[What this system does in 2-3 sentences]

## Components
[Diagram or description of main components]

## Data Flow
[How data moves through the system]

## Key Decisions
- [Decision]: [rationale]
```

#### tech-stack.md

```markdown
# Tech Stack

## Core
- **Language**: [e.g., TypeScript] — [why]
- **Runtime**: [e.g., Node.js 20] — [why]

## Backend
- **Framework**: [e.g., Express.js] — [why]
- **Database**: [e.g., PostgreSQL + Prisma] — [why]

## Frontend
- **Framework**: [e.g., React + Vite] — [why]
- **Styling**: [e.g., Tailwind] — [why]

## Testing
- **Unit**: [e.g., Jest]
- **Integration**: [e.g., Supertest]
- **E2E**: [e.g., Playwright]

## Commands
```bash
npm run dev      # Start development
npm run test     # Run tests
npm run lint     # Check code style
```

```

#### gotchas.md

```markdown
# Gotchas

Things that will trip you up if you don't know about them.

## [Category]

### [Gotcha Title]
**Problem**: [What goes wrong]
**Solution**: [How to avoid/fix]
```

### Organic Growth

Documents grow organically as the project evolves:

1. **Start minimal** — Only create docs you need now
2. **Extract when repeated** — If you explain something twice, make a doc
3. **Split when large** — If a doc exceeds ~500 lines, split it
4. **Update index.md** — Keep the manifest current

---

## 6. Skills System

### What is a Skill?

A skill is a **reusable procedure** with:

- Clear trigger (when to use)
- Defined input (what's needed)
- Step-by-step instructions
- Expected output

### Skill vs Knowledge

| Skill | Knowledge |
|-------|-----------|
| "How to do X" | "What we know about Y" |
| Procedure, steps | Context, facts |
| Recipe | Compass |
| One task, done well | Whole journey guidance |

### Skill Template

```markdown
# [skill-name].skill.md

## Trigger
When to use this skill (clear condition)

## Input
What information/context is needed

## Procedure
Step-by-step instructions (numbered)

## Output
What the skill produces

## Notes (optional)
Edge cases, gotchas, related skills
```

### Core Skills

#### dispatch-context.md

```markdown
# Dispatch Context

## Trigger
When delegating work to a subagent.

## Procedure
1. Identify minimum context subagent needs
2. Extract only relevant portions (not full files)
3. State task as single clear objective
4. Define success criteria explicitly
5. Request compressed return format

## Output
Dispatch payload with: context, task, success criteria, return format

## Anti-patterns
- Sending full file contents when snippet suffices
- Vague task descriptions ("fix the bug")
- No success criteria defined
- Expecting full context return (ask for summary)
```

#### task-sizing.md

```markdown
# Task Sizing

## Trigger
Before starting any task, assess context cost.

## Heuristics
| Size | Context Cost | Indicators | Action |
|------|--------------|------------|--------|
| Small | ~1-5% | Single file, quick fix, clarification | Do directly |
| Medium | ~5-20% | Few files, moderate logic, some research | Consider dispatch |
| Large | >20% | Many files, complex logic, deep research | Must dispatch |

## Questions to Ask
1. How many files will I need to read?
2. How much code will I generate?
3. Will I need to run many commands?
4. Is this exploratory or well-defined?

## Output
Decision: Do directly OR Dispatch to [subagent]
```

#### verification.md

```markdown
# Verification Checklist

## Trigger
After implementing any change, before marking complete.

## Checklist

### Code Quality
- [ ] Linting passes (`npm run lint`)
- [ ] Types check (if TypeScript)
- [ ] No console.log left behind

### Functionality
- [ ] Feature works as specified
- [ ] Edge cases handled
- [ ] Error states handled

### Tests
- [ ] Existing tests still pass
- [ ] New tests added for new code
- [ ] Test coverage maintained

### Visual (if UI)
- [ ] Delegate to visual-qa subagent
- [ ] Matches design/expectation

### Integration
- [ ] Works with rest of system
- [ ] No regressions introduced
```

### Adding Project-Specific Skills

When you discover a repeated procedure:

1. Extract the steps into `SKILLS/[name].md`
2. Document trigger, input, procedure, output
3. Reference it in future similar work

---

## 7. Verification

### The Verification Mindset

**Nothing is done until verified.**

Not:

- "I added the code"
- "It should work"
- "Tests are written"

But:

- "Tests pass"
- "I ran it and saw the expected output"
- "Visual QA confirmed the UI matches"

### Verification Dimensions

| Dimension | How to Verify | When Required |
|-----------|---------------|---------------|
| **Functional** | Run it, see it work | Always |
| **Structural** | Lint, type check | Always |
| **Test** | Tests pass | When tests exist/required |
| **Visual** | Screenshot + analysis | UI changes |
| **Performance** | Load test, profiling | When relevant |

### Failure Protocol

```
Attempt 1: Try the obvious fix
Attempt 2: Step back, try different approach
Attempt 3: Escalate to human with:
  - What was tried
  - Why it failed
  - What help is needed
  - Suggested next steps

Never: Infinite retry
Never: Skip verification
Never: Claim "done" without verification
```

---

## 8. Getting Started

### For New Projects

1. **Create docs/index.md** — Start the document manifest
2. **Create docs/architecture.md** — Document system design
3. **Create docs/tech-stack.md** — Document technology choices
4. **Create SKILLS/** — Add procedures as discovered
5. **Create NOTES.md** — Start empty, fill as you learn

### For Existing Projects

1. **Read the codebase** — Understand patterns in use
2. **Create docs/index.md** — Start documenting what you find
3. **Extract to focused docs** — One concept per document
4. **Start working** — RPI on your first task

### Starting Work

1. **Human**: Describe what you want to build
2. **TheEngineer**: Read `docs/index.md`, SELECT relevant docs
3. **TheEngineer (Research)**: Explore, ask questions, understand
4. **Human**: Answer questions, clarify requirements
5. **TheEngineer (Plan)**: Propose task breakdown, assess sizing
6. **TheEngineer**: Dispatch large tasks to subagents
7. **Human**: Accept work or request changes

### Checkpoint Rhythm

| Trigger | Action |
|---------|--------|
| ~40% context | Proactive checkpoint — stay fresh |
| Phase complete | Checkpoint before next phase |
| Task complete | Each dispatch = 1 task (context purity) |
| ~80% context | Emergency checkpoint — must act now |
| Session end | Final checkpoint with summary |

---

## Appendix: Key Insights

### From Research

> "Context engineering is effectively the #1 job of engineers building AI agents." — Cognition/Devin

> "Observation masking outperforms LLM summarization in overall efficiency and reliability." — JetBrains Research

> "Even with longer context windows, you always get better results with a small, focused prompt and context." — Industry consensus

> "If you're regularly hitting 80%+ of your context window, you're one edge case away from failures." — Comet

### From Design Dialogue

> "AI claims 'done' at convenient, not complete. The problem is that an agent doesn't have a means to verify what's done, so it stopped midway."

> "We're in the same team. Human is a product owner, AI agent is co-analyzer, co-planner, and full-time software engineer."

> "TheEngineer should be the orchestrator, not the executor. Small tasks OK, but large tasks must be dispatched."

> "Documents should be a library. Each document should be context engineered so there is no waste tokens."

### The Four Strategies Summary

| Strategy | Purpose | Implementation |
|----------|---------|----------------|
| **WRITE** | Save context outside window | docs/, NOTES.md, checkpoints |
| **SELECT** | Pull context into window | Read index.md, load relevant docs |
| **COMPRESS** | Retain only required tokens | Checkpoint at 40%, compaction > summarization |
| **ISOLATE** | Split context across boundaries | Dispatch to subagents, phase checkpoints |

### Context Thresholds

| Threshold | Action |
|-----------|---------|
| ~40% | Proactive checkpoint — context fresh, performance optimal |
| ~80% | Emergency checkpoint — already degraded, must act |

---

*Version 0.4.0 — Updated with: 40% checkpoint threshold, TheEngineer as orchestrator, library-based document architecture.*
