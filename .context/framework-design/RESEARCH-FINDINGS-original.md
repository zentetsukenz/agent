# Research Findings: Templates and Patterns

> **Date**: December 25-31, 2025
> **Purpose**: Inform framework design with learnings from Spec-Kit, Fabric, retrospective best practices, system prompt patterns, and context engineering

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [VS Code Context Engineering](#2-vs-code-context-engineering)
3. [Spec-Kit Analysis](#3-spec-kit-analysis)
4. [Fabric Analysis](#4-fabric-analysis)
5. [Retrospective Formats](#5-retrospective-formats)
6. [System Prompt Patterns](#6-system-prompt-patterns)
7. [Context Engineering](#7-context-engineering)
8. [Synthesis: What We Should Adopt](#8-synthesis-what-we-should-adopt)
9. [Proposed Templates](#9-proposed-templates)

---

## 1. Executive Summary

### Key Insights

| Framework | Core Philosophy | What to Adopt | What to Avoid |
|-----------|-----------------|---------------|---------------|
| **Spec-Kit** | Specification-first | User story structure, checkpoints | Complexity (7+ commands) |
| **Fabric** | Pattern = focused prompt | Identity/Steps/Output structure | No workflow |
| **Retrospectives** | Action-oriented reflection | Start/Stop/Continue | Blame dynamics |
| **Context Engineering** | Context as first-class | WRITE/SELECT/COMPRESS/ISOLATE | Unbounded growth |

### The Gap We Fill

Neither Spec-Kit nor Fabric solves the "60% barrier". Our framework adds:

1. Verification loops (AI checks its own work)
2. Context engineering (WRITE/SELECT/COMPRESS/ISOLATE)
3. Subagent isolation (screenshots don't overflow context)
4. Checkpoint protocol (deliberate context management)

---

## 2. VS Code Context Engineering

> **Research Date**: December 31, 2025
> **Focus**: Context measurement, SELECT mechanisms, orchestrator patterns

### 2.1 Context Measurement

**Finding**: VS Code Copilot does **not** expose token counts. No API available.

| Source | Insight |
|--------|---------|
| GitHub Issue #7823 | Token visualization requested, not implemented |
| GitHub Issue #267651 | Context memory API requested, no solution |
| Claude Code community | Degradation visible ~70-80%; act at 70% |

**Implication**: Use heuristics (task count, phase boundaries), not token measurement.

### 2.2 SELECT Mechanism

**Finding**: No explicit "bootstrap" trigger. SELECT is implicit.

| Method | How It Works |
|--------|--------------|
| `#-mentions` | `#file`, `#codebase`, `#changes` |
| Workspace indexing | Automatic for semantic search |
| Custom instructions | CLAUDE.md-style persistent context |

**Implication**: Reading CHECKPOINT.md IS the SELECT action. Triggers: `bootstrap`, `resume`, `continue`.

### 2.3 Orchestrator Pattern

**Finding**: Anthropic emphasizes orchestrator-worker separation.

| Tool | Keep/Offload |
|------|--------------|
| read, search, grep | **Keep** — understanding |
| agent, todo | **Keep** — orchestration |
| edit | **Keep** — planning docs only |
| execute, web-search | **Offload** — to subagents |

### 2.4 Context Purity Principle

**Finding**: 1 task per dispatch, not 3-5 tasks.

- Each dispatch = one task + context links
- 40% threshold = within-task checkpoint (for complex single tasks)
- Dispatch includes: `#file:` links for context to load, not just edit targets

### 2.5 Multi-Dispatch Coordination

| Pattern | When |
|---------|------|
| Pipeline | Sequential R → P → I |
| MapReduce | Parallel independent |
| Orchestrator-Workers | Dynamic decomposition |

**State**: Checkpoint as state + NOTES.md as shared memory + todo for tracking.

---

## 3. Spec-Kit Analysis

### 2.1 Workflow Structure

Spec-Kit uses **sequential phases with slash commands**:

```
/speckit.constitution → Project principles (FIRST)
/speckit.specify → What to build (requirements)
/speckit.clarify → Resolve ambiguities (optional)
/speckit.plan → How to build (tech stack)
/speckit.tasks → Break into actionable tasks
/speckit.analyze → Consistency check (optional)
/speckit.implement → Execute tasks
```

**Key Insight**: They separate "what" (specify) from "how" (plan), ensuring requirements are captured before tech decisions.

### 2.2 Specification Template

From `spec-template.md`:

```markdown
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Brief Title] (Priority: P1)
[Describe this user journey in plain language]

**Why this priority**: [Explain the value]
**Independent Test**: [How to verify independently]

**Acceptance Scenarios**:
1. **Given** [state], **When** [action], **Then** [outcome]

## Requirements *(mandatory)*
- **FR-001**: System MUST [capability]
- **FR-002**: [NEEDS CLARIFICATION: detail not specified]

## Key Entities *(if applicable)*
- **[Entity]**: [What it represents, key attributes]

## Success Criteria *(mandatory)*
- **SC-001**: [Measurable metric]
```

**What Works Well**:

- Given/When/Then acceptance scenarios
- Priority labels (P1, P2, P3)
- "NEEDS CLARIFICATION" markers
- Independent test per user story
- Measurable success criteria

### 2.3 Tasks Template

From `tasks-template.md`:

```markdown
# Tasks: [FEATURE NAME]

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)
- [ ] T001 Create project structure
- [ ] T002 Initialize project with dependencies
- [ ] T003 [P] Configure linting

## Phase 2: Foundational (Blocking Prerequisites)
**⚠️ CRITICAL**: No user story work until complete
- [ ] T004 Setup database schema
- [ ] T005 [P] Implement auth framework

**Checkpoint**: Foundation ready

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP
**Goal**: [What this delivers]
**Independent Test**: [How to verify]

### Tests (if requested)
- [ ] T010 [P] [US1] Contract test for X

### Implementation
- [ ] T012 [P] [US1] Create Entity1 model
- [ ] T014 [US1] Implement Service (depends on T012)

**Checkpoint**: US1 independently testable
```

**What Works Well**:

- `[P]` parallel marker - clear what can run simultaneously
- `[USx]` story labels - trace tasks to requirements
- Checkpoints - validation gates between phases
- Phase structure - Setup → Foundational → Per-Story → Polish
- Dependency notation - "depends on T012"
- "Tests FIRST, ensure they FAIL"

### 2.4 Plan Template

From `plan-template.md`:

```markdown
# Implementation Plan: [FEATURE]

**Branch**: `###-feature-name` | **Date**: [DATE]

## Technical Context
**Language/Version**: [e.g., Python 3.11]
**Primary Dependencies**: [e.g., FastAPI]
**Storage**: [e.g., PostgreSQL]
**Testing**: [e.g., pytest]
**Performance Goals**: [e.g., 1000 req/s]
**Constraints**: [e.g., <200ms p95]

## Constitution Check
*GATE: Must pass before Phase 0 research*

## Project Structure
specs/[###-feature]/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

**What Works Well**:

- Technical context section (language, deps, storage)
- Constitution check as a gate
- Explicit file locations

---

## 3. Fabric Analysis

### 3.1 Pattern Philosophy

Fabric calls prompts "Patterns" and uses:

- **Markdown format** for readability
- **System prompt exclusively** (more efficacy observed)
- **Clear structure**: Identity → Steps → Output Instructions

### 3.2 Pattern Anatomy

From `extract_wisdom/system.md`:

```markdown
# IDENTITY and PURPOSE

You extract surprising, insightful, and interesting information from text content.
You are interested in insights related to [topics...].

Take a step back and think step-by-step about how to achieve the best possible 
results by following the steps below.

# STEPS

- Extract a summary of the content in 25 words into SUMMARY section
- Extract 20 to 50 of the most surprising ideas into IDEAS section
- Extract 10 to 20 refined insights into INSIGHTS section
- Extract 15 to 30 quotes into QUOTES section
- [more steps...]

# OUTPUT INSTRUCTIONS

- Only output Markdown
- Write bullets as exactly 16 words
- Extract at least 25 IDEAS
- Do not give warnings; only output requested sections
- Use bulleted lists, not numbered lists
- Do not repeat items
- Do not start items with same opening words

# INPUT

INPUT:
```

**What Works Well**:

- **Identity section** - Who the AI is, what it cares about
- **Step-by-step instructions** - Numbered or bulleted, very explicit
- **Output constraints** - Word counts, formats, minimums
- **"Think step-by-step"** - Chain-of-thought prompting
- **INPUT placeholder** - Clear where user content goes

### 3.3 Key Fabric Concepts

| Concept | Description | Our Equivalent |
|---------|-------------|----------------|
| Pattern | A focused prompt for one task | Skill or Prompt |
| Stitch | Chained patterns | Workflow phases |
| Mill | Server hosting patterns | N/A (we use local files) |
| Loom | Client calling patterns | Agent definition |

---

## 4. Retrospective Formats

### 4.1 Start/Stop/Continue

The most action-oriented format:

```
START: Things to begin doing
- Activities that would have positive impact
- Not currently implemented

STOP: Things to cease doing
- Activities not helping achieve goals
- Causing friction or waste

CONTINUE: Things to keep doing
- Already working well
- Delivering results
```

**Why It Works**:

- Action-oriented (not feeling-oriented)
- Forward-looking (Start) + Backward-looking (Stop, Continue)
- Simple to understand
- Natural to generate action items from

### 4.2 Alternative Formats Considered

| Format | Structure | Best For |
|--------|-----------|----------|
| Start/Stop/Continue | 3 buckets | Action-oriented teams |
| 4Ls | Liked, Learned, Lacked, Longed For | Learning-focused |
| Mad/Sad/Glad | Emotional categorization | Team dynamics |
| DAKI | Drop, Add, Keep, Improve | Similar to SSC |
| Starfish | More/Less/Keep/Start/Stop | Nuanced analysis |

### 4.3 Key Retrospective Principles

1. **Anonymous ideation** - Prevents groupthink
2. **Grouping similar items** - Identifies themes
3. **Dot voting** - Prioritizes discussion
4. **Action items** - Every discussion produces actions
5. **Not a blame game** - Focus on process, not people

---

## 5. System Prompt Patterns

> Added December 29, 2025 — Research into Anthropic, Fabric, OpenAI, and Claude Skills patterns for TheEngineer redesign.

### 5.1 Pattern Summary

| Pattern | Source | Key Insight |
|---------|--------|-------------|
| **Section Structure** | All | Use Markdown headers + XML tags for clear sections |
| **Identity-First** | Fabric, Anthropic | "Who" shapes behavior; keep concise |
| **Progressive Disclosure** | Claude Skills | Frontmatter minimal; load details on demand |
| **Context Strategies** | Anthropic | WRITE/SELECT/COMPRESS/ISOLATE for context management |
| **Tool Guidance** | Anthropic, OpenAI | Clear, non-overlapping, well-scoped tools |
| **Few-Shot Examples** | All | Examples teach better than instructions |

### 5.2 Five Major Patterns Analyzed

#### Pattern 1: Anthropic Context Engineering

- **WRITE**: Generate context that doesn't exist (summaries, plans)
- **SELECT**: Choose what to include (search, filter, fetch)
- **COMPRESS**: Reduce token footprint (summarize, compact)
- **ISOLATE**: Delegate expensive ops to subagents (screenshots)

**Key Insight**: Context is fuel, not just information. Manage it deliberately.

#### Pattern 2: Fabric Patterns

Structure: `IDENTITY → STEPS → OUTPUT`

```markdown
# IDENTITY and PURPOSE
You extract surprising insights from text content...

# STEPS
- Extract a summary in 25 words into SUMMARY section
- Extract 20 to 50 surprising ideas into IDEAS section
...

# OUTPUT INSTRUCTIONS
- Only output Markdown
- Do not give warnings; only output requested sections
```

**Key Insight**: Identity shapes behavior more than instructions.

#### Pattern 3: OpenAI Prompt Engineering

- Developer message > User message (hierarchy)
- System prompts set persistent context
- Few-shot examples in user messages
- Chain-of-thought for complex reasoning

**Key Insight**: Role hierarchy and examples beat verbose instructions.

#### Pattern 4: Claude Agent Skills

Frontmatter as trigger mechanism:

```yaml
---
name: skill-name
description: What it does AND when to use it (primary trigger)
---
```

- Body only loads AFTER skill triggers
- Progressive disclosure: core in SKILL.md, details in references/
- Keep SKILL.md under 500 lines

**Key Insight**: Description is the discovery mechanism—make it comprehensive.

#### Pattern 5: Current TheEngineer Analysis

**Strengths**:

- Strong identity section
- Embedded domain wisdom
- Comprehensive coverage

**Weaknesses**:

- Too long (1475 lines)
- No RPI workflow integration
- No context engineering built-in
- Verbose operating modes

### 5.3 Recommended Structure for TheEngineer

```markdown
---
description: [1-2 sentences]
tools: [list]
---

# TheEngineer

## Identity
[Concise: who, purpose, approach - 2-3 sentences]

## RPI Workflow
[Core operating model - Research → Plan → Implement]

## Context Management
[Trigger phrases, checkpoint protocol, when to compress]

## Capabilities
[What TheEngineer can do, organized by phase]

## Sub-Agent Delegation
[When and how to spawn sub-agents]

## Wisdom
[Reference external file or keep brief - progressive disclosure]
```

**Target length**: 500-800 lines (current is 1475—60% reduction needed)

---

## 6. Context Engineering

> Added December 30, 2025 — Deep research into context engineering patterns from Anthropic, LangChain, JetBrains, Google ADK, and HumanLayer's 12 Factor Agents.

### 6.1 What is Context Engineering?

**Definition** (Andrej Karpathy):
> "The delicate art and science of filling the context window with just the right information for the next step."

Context Engineering treats context as a **first-class system** with its own architecture, lifecycle, and constraints—not just prompt manipulation.

**Key Insight**: LLMs are like CPUs; the context window is like RAM. Just as an OS curates what fits into RAM, context engineering curates what fits into the context window.

### 6.2 Why Context Engineering Matters

#### The Problem

As agents run longer, context accumulates and causes problems:

| Problem | Description |
|---------|-------------|
| **Context Poisoning** | When a hallucination makes it into the context |
| **Context Distraction** | When context overwhelms the training |
| **Context Confusion** | When superfluous context influences the response |
| **Context Clash** | When parts of the context disagree |
| **Context Rot** | Performance degradation as context fills (even within limits) |

#### The Core Insight (Cognition/Devin)

> "Context engineering is effectively the #1 job of engineers building AI agents."

Even with longer context windows, you **always** get better results with a small, focused prompt and context.

### 6.3 The Four Strategies: WRITE / SELECT / COMPRESS / ISOLATE

#### WRITE — Save Context Outside the Window

**Purpose**: Persist information outside the context window so it's available later.

| Technique | Description | Example |
|-----------|-------------|---------|
| **Scratchpads** | Note-taking during a task | Anthropic's LeadResearcher saves plan to Memory |
| **Memories** | Long-term knowledge across sessions | ChatGPT, Cursor, Windsurf auto-generate memories |
| **Files** | Persistent documents | CLAUDE.md, Cursor rules files |

**Implementation**: Can be a tool call that writes to a file, or a field in a runtime state object.

#### SELECT — Pull Context Into the Window

**Purpose**: Retrieve relevant information when needed.

| Technique | Description | Example |
|-----------|-------------|---------|
| **Scratchpad Read** | Fetch saved notes | Tool call to read file, or expose state field |
| **Memory Retrieval** | Select relevant memories | Embeddings, knowledge graphs, semantic search |
| **Tool Selection** | Fetch relevant tools via RAG | BigTool library (3x improvement in tool selection) |
| **Knowledge RAG** | Retrieve relevant documents | Code indexing, AST parsing, re-ranking |

**Memory Types**:

- **Episodic** — Few-shot examples of desired behavior
- **Procedural** — Instructions to steer behavior  
- **Semantic** — Facts for task-relevant context

#### COMPRESS — Retain Only Required Tokens

**Purpose**: Reduce context size while preserving essential information.

| Technique | Description | Example |
|-----------|-------------|---------|
| **Summarization** | LLM distills key points | Claude Code auto-compact at 95% capacity |
| **Trimming/Pruning** | Hard-coded rules remove old messages | Remove older messages from list |
| **Hierarchical Summary** | Recursive summarization | Summarize summaries for very long sessions |
| **Agent Boundary Summary** | Compress at handoffs | Cognition uses fine-tuned model for this |

**Key Insight**: Summarization at agent-agent boundaries reduces tokens during knowledge handoff.

#### ISOLATE — Split Context Across Boundaries

**Purpose**: Prevent context explosion by separating concerns.

| Technique | Description | Example |
|-----------|-------------|---------|
| **Multi-Agent** | Each subagent has own context window | OpenAI Swarm, Anthropic multi-agent researcher |
| **Environment Sandbox** | Execute code in isolated sandbox | HuggingFace CodeAgent, E2B sandbox |
| **State Objects** | Store heavy data in state, not prompt | Expose only messages field to LLM |

**Subagent Pattern** (Anthropic):
> "Subagents operate in parallel with their own context windows, exploring different aspects of the question simultaneously."

**Trade-off**: Multi-agent can use up to 15× more tokens than single-agent chat.

### 6.4 Context Management Hierarchy

**Priority Order**: Raw > Compaction > Summarization

| Priority | What to Keep | Strategy |
|----------|--------------|----------|
| **1. Keep Raw** | Recent turns, active code, current errors | Never compress |
| **2. Compact** | File contents already edited | Replace with path reference |
| **3. Summarize** | Old decisions, completed work | Compress to structured notes |

### 6.5 The Tiered Model (Google ADK)

Google's Agent Development Kit separates storage from presentation:

| Tier | Purpose | Lifetime |
|------|---------|----------|
| **Working Context** | Immediate prompt for this model call | Ephemeral (per-call) |
| **Session** | Durable log of the interaction (events) | Per-conversation |
| **Memory** | Long-lived searchable knowledge | Cross-session |
| **Artifacts** | Large binary/text data (files, logs) | Addressed by name, not in prompt |

**Key Insight**: Working Context is a **compiled view** over richer stateful systems, not a mutable string buffer.

### 6.6 The 12 Factor Agents Framework

From HumanLayer's research with 100+ AI builders:

#### Core Factors for Context Engineering

| Factor | Principle | Implication |
|--------|-----------|-------------|
| **Factor 2** | Own Your Prompts | Don't outsource prompt engineering to frameworks |
| **Factor 3** | Own Your Context Window | Custom formats can outperform standard message-based |
| **Factor 4** | Tools Are Structured Outputs | LLM outputs JSON; deterministic code executes |
| **Factor 5** | Unify Execution & Business State | Infer all state from context window |
| **Factor 8** | Own Your Control Flow | Break/resume loop for human input or long-running tasks |
| **Factor 9** | Compact Errors into Context | Self-healing via error messages in context |
| **Factor 10** | Small, Focused Agents | <100 tools, <20 steps for best results |

#### The Agent Loop Pattern

```
initial_event = {"message": "..."}
context = [initial_event]

while True:
    next_step = await llm.determine_next_step(context)
    context.append(next_step)
    
    if next_step.intent == "done":
        return next_step.final_answer
    
    result = await execute_step(next_step)
    context.append(result)
```

**Key Insight**: You can do XML-style custom formats instead of standard OpenAI message format for better token efficiency.

### 6.7 JetBrains Research: Efficiency-Based Context Management

#### Two Main Approaches

| Approach | How It Works | Pros | Cons |
|----------|--------------|------|------|
| **Observation Masking** | Hide older observations with placeholders | Fast, cheap, preserves reasoning | Unbounded growth |
| **LLM Summarization** | Compress older interactions with LLM | Infinite scaling possible | Extra API calls, may smooth over stop signals |

#### Key Finding

> "Observation masking outperforms LLM summarization in overall efficiency and reliability."

- Both approaches cut costs by **50%+** vs unmanaged context
- Observation masking often matched or beat LLM summarization
- LLM summarization causes agents to run **15% longer** (smooths over stop signals)

#### Hybrid Approach (Best Results)

1. Use observation masking as first line of defense
2. Trigger LLM summarization only for very long contexts
3. Tune hyperparameters per agent scaffold

**Result**: 7% cheaper than pure masking, 11% cheaper than pure summarization.

### 6.8 Practical Trigger Phrases

| Phrase | Action |
|--------|--------|
| `checkpoint` | Generate portable session summary for new chat |
| `compress` | Summarize recent work, suggest fresh start |
| `summarize session` | Create session summary with decisions + next steps |
| `save notes` | Update NOTES.md with key discoveries |

### 6.9 Checkpoint Template

```markdown
📍 CHECKPOINT: [Session Title]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Session Summary
[2-3 sentence high-level summary]

## Decisions Made
- [Decision]: [rationale]

## Code Changes
- [file](path): [what changed]

## Patterns Established
- [Pattern]: [description]

## Open Questions
- [ ] [Question]

## Next Steps
1. [Priority task]

## Files to Re-Read
- [file](path) — [why]

## Key Context
[Critical domain knowledge discovered]
```

### 6.10 Key Takeaways

1. **Context is fuel, not just information** — Manage it deliberately
2. **Everything is context engineering** — Prompts, memory, RAG, history, tools
3. **Small focused context wins** — Even with longer windows, focused is better
4. **Separate storage from presentation** — Session vs Working Context
5. **WRITE/SELECT/COMPRESS/ISOLATE** — Four strategies to master
6. **Observation masking is underrated** — Simple, cheap, effective
7. **Checkpoint at natural breakpoints** — Phase complete, context heavy
8. **Agents are software** — Own your loop, prompts, and context

### 6.11 Sources

- [Lance Martin: Context Engineering for Agents](https://rlancemartin.github.io/2025/06/23/context_engineering/)
- [LangChain Blog: Context Engineering](https://blog.langchain.com/context-engineering-for-agents/)
- [JetBrains Research: Efficient Context Management](https://blog.jetbrains.com/research/2025/12/efficient-context-management/)
- [Google ADK: Architecting Context-Aware Multi-Agent Framework](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)
- [HumanLayer: 12 Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents)
- [Cognition: Building Effective Agents](https://www.cognition.ai/)

---

## 7. Synthesis: What We Should Adopt

### 7.1 From Spec-Kit

| Feature | Adopt? | How We'll Use It |
|---------|--------|------------------|
| User Story structure | ✅ Yes | Spec template |
| Given/When/Then scenarios | ✅ Yes | Acceptance criteria |
| Priority labels (P1/P2/P3) | ✅ Yes | Task ordering |
| `[P]` parallel markers | ✅ Yes | Task template |
| `[USx]` story labels | ✅ Yes | Traceability |
| Checkpoints | ✅ Yes | Verification gates |
| Phase structure | ✅ Yes | Task template |
| Constitution | ⚠️ Adapt | STANDARDS.md serves this role |
| 7 slash commands | ❌ No | Too complex, we have 7 prompts |
| No verification loop | ❌ No | We add verification |

### 7.2 From Fabric

| Feature | Adopt? | How We'll Use It |
|---------|--------|------------------|
| Markdown format | ✅ Yes | All templates |
| Identity section | ✅ Yes | Agent definitions |
| Step-by-step instructions | ✅ Yes | Skills |
| Output constraints | ✅ Yes | Skills and prompts |
| System prompt focus | ✅ Yes | Agent mode instructions |
| Pattern library concept | ✅ Yes | Skills directory |
| Stitch (chaining) | ⚠️ Adapt | Workflow phases |

### 7.3 From Retrospectives

| Feature | Adopt? | How We'll Use It |
|---------|--------|------------------|
| Start/Stop/Continue | ✅ Yes | Retrospective template |
| Action orientation | ✅ Yes | Every section produces actions |
| Anonymous ideation | ❌ N/A | AI doesn't need this |
| Grouping/voting | ❌ N/A | AI analyzes directly |

---

## 8. Proposed Templates

### 8.1 Specification Template (Informed by Spec-Kit)

```markdown
# Specification: [FEATURE NAME]

**Created**: [DATE]
**Status**: Draft | Ready | In Progress | Complete
**Location**: .ai/specs/active/[name].spec.md

---

## 1. Overview

### What We're Building
[1-2 sentences describing the feature]

### Why It Matters
[Business value, user benefit]

### Success Looks Like
[How we know this is done - measurable]

---

## 2. User Stories

### US1: [Story Title] (Priority: P1) 🎯 MVP
**As a** [user type]
**I want** [capability]
**So that** [benefit]

**Acceptance Criteria** (Given/When/Then):
1. **Given** [state], **When** [action], **Then** [outcome]
2. **Given** [state], **When** [action], **Then** [outcome]

**Verification Strategy**: [How to verify - visual, test, API, etc.]

---

### US2: [Story Title] (Priority: P2)
[Same structure as US1]

---

## 3. Technical Approach

### Key Entities
- **[Entity]**: [What it represents]

### Technical Decisions
- Framework: [choice and why]
- Database: [choice and why]

### Dependencies
- Requires: [what must exist first]
- Blocks: [what depends on this]

---

## 4. Verification Dimensions

| Dimension | Applies? | How to Verify |
|-----------|----------|---------------|
| Functional | ✅ | Unit tests pass |
| Visual | ✅/❌ | Screenshot comparison |
| API | ✅/❌ | Contract tests |
| Performance | ✅/❌ | Load tests |
| Security | ✅/❌ | Auth tests |

---

## 5. Task Breakdown

### Setup (Shared)
- [ ] T001 [P] Create directory structure
- [ ] T002 Install dependencies

**Checkpoint**: Project compiles/runs ✓

### US1 Implementation
- [ ] T010 [P] [US1] Create model
- [ ] T011 [US1] Implement service (→ T010)
- [ ] T012 [US1] Add endpoint

**Checkpoint**: US1 independently testable ✓

---

## 6. Confidence Assessment

### Human Confidence: ___%
[Areas of uncertainty]

### AI Confidence: ___%
[Remaining questions]

**Gate**: Both ≥95% to proceed to implementation
```

### 8.2 PROGRESS.md Template (Informed by Spec-Kit checkpoints)

```markdown
# Project Progress

**Last Updated**: [DATE]
**Updated By**: [Agent Name]

---

## Active Work

### Current Specification
**Name**: [spec name]
**Phase**: Design | Implementation | Verification | Complete
**Started**: [date]

### Current Task
**ID**: T012
**Description**: Implement user service
**Status**: In Progress
**Started**: [timestamp]

---

## Completed Specifications

| Spec | Completed | Tasks | Retro |
|------|-----------|-------|-------|
| user-auth | 2025-12-20 | 15/15 | ✅ |
| dashboard | 2025-12-22 | 12/12 | ✅ |

---

## Session History

### [DATE] - [Agent]
- Started: T012 (user service)
- Completed: T010, T011
- Blocked: None
- Notes: [any context for next session]

### [PREVIOUS DATE] - [Agent]
- Completed: T001-T009
- Notes: Setup phase complete
```

### 8.3 Retrospective Template (Informed by Start/Stop/Continue)

```markdown
# Retrospective: [SPEC NAME]

**Date**: [DATE]
**Spec**: [link to completed spec]
**Author**: Software Engineer

---

## Summary

### What Was Built
[1-2 sentences]

### Time & Tasks
- Started: [date]
- Completed: [date]
- Tasks: [X] completed, [Y] blocked, [Z] modified

---

## START (Actions to Begin)

Things we should start doing based on this experience:

- [ ] **[Action]**: [Why this would help]
- [ ] **[Action]**: [Why this would help]

---

## STOP (Actions to Cease)

Things that caused friction or didn't work:

- [ ] **[Problem]**: [What went wrong, what to do instead]
- [ ] **[Problem]**: [What went wrong, what to do instead]

---

## CONTINUE (Actions to Keep)

Things that worked well:

- ✅ **[Practice]**: [Why it worked]
- ✅ **[Practice]**: [Why it worked]

---

## Knowledge Gaps

Information that was missing or discovered during implementation:

| Gap | Discovery | Add to KNOWLEDGE.md? |
|-----|-----------|---------------------|
| [missing info] | [what we learned] | ✅ / ❌ |

---

## Skill Improvements

| Skill | Issue | Suggested Fix |
|-------|-------|---------------|
| [skill name] | [what was unclear] | [improvement] |

---

## Recommendations for TheEngineer

Priority actions for framework improvement:

1. **[Recommendation]**: [Impact: High/Medium/Low]
2. **[Recommendation]**: [Impact: High/Medium/Low]
```

### 8.4 Skill Template (Informed by Fabric)

```markdown
# [skill-name].skill.md

## IDENTITY

You are a specialist in [domain]. You execute [task type] with precision
and consistency.

## TRIGGER

Use this skill when:
- [condition 1]
- [condition 2]

## INPUT

Required:
- [input 1]: [description]
- [input 2]: [description]

Optional:
- [input 3]: [description, default]

## PROCEDURE

Follow these steps exactly:

1. [First action]
2. [Second action]
3. [Third action with decision point]
   - If [condition A]: [action]
   - If [condition B]: [action]
4. [Final action]

## OUTPUT

Produce:
- [output 1]: [format/location]
- [output 2]: [format/location]

## OUTPUT CONSTRAINTS

- [constraint 1]
- [constraint 2]

## NOTES

- Edge case: [situation] → [handling]
- Related skills: [skill names]
```

---

## Discussion Points

Before we finalize these templates, let's discuss:

1. **Specification complexity**: Is the proposed template too heavy? Should we simplify?

2. **PROGRESS.md granularity**: Per-session history or just current state?

3. **Retrospective frequency**: Per-spec is our plan, but should we also do periodic (weekly)?

4. **Skill template**: Should IDENTITY section be optional for simple skills?

5. **Checkpoint verification**: How explicit should checkpoint verification be?

---

*Research compiled by Synthesis (Claude Opus 4.5) on December 25, 2025*
