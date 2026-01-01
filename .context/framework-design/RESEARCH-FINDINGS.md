# Research Findings

> **Date**: December 25-31, 2025
> **Purpose**: Inform Agent Collaboration Framework v0.4.0

---

## 1. Executive Summary

| Framework | Adopt | Avoid |
|-----------|-------|-------|
| **Spec-Kit** | User stories, checkpoints, `[P]` parallel markers | 7+ slash commands |
| **Fabric** | Identity/Steps/Output structure | No workflow |
| **Retrospectives** | Start/Stop/Continue | Blame dynamics |
| **Context Engineering** | WRITE/SELECT/COMPRESS/ISOLATE | Unbounded growth |

**Gap we fill**: Verification loops + context engineering + subagent isolation.

---

## 2. VS Code Context Engineering

> December 31, 2025

### 2.1 Context Measurement

No API. Use heuristics: task count, phase boundaries, "feels heavy."

| Source | Insight |
|--------|---------|
| GitHub #7823, #267651 | Token API requested, not implemented |
| Claude Code community | Act at 70%, degradation visible 70-80% |

### 2.2 SELECT Mechanism

Reading CHECKPOINT.md IS the SELECT. Triggers: `bootstrap`, `resume`, `continue`.

| Method | How |
|--------|-----|
| `#-mentions` | `#file`, `#codebase`, `#changes` |
| Custom instructions | CLAUDE.md-style persistent context |

### 2.3 Orchestrator Pattern

| Keep | Offload |
|------|---------|
| read, search, grep, agent, todo | execute, web-search |
| edit (planning docs only) | file creation/editing |

### 2.4 Context Purity

- 1 task per dispatch + context links (`#file:` what to load)
- 40% = within-task checkpoint for complex single tasks

### 2.5 Multi-Dispatch

| Pattern | When |
|---------|------|
| Pipeline | Sequential R → P → I |
| MapReduce | Parallel independent |
| Orchestrator-Workers | Dynamic decomposition |

State: Checkpoint + NOTES.md + todo list.

---

## 3. Spec-Kit Analysis

### 3.1 What Works

- **Given/When/Then** acceptance scenarios
- **Priority labels** (P1, P2, P3)
- **`[P]` parallel markers** — clear what can run simultaneously
- **`[USx]` story labels** — trace tasks to requirements
- **Checkpoints** — validation gates between phases
- **Phase structure** — Setup → Foundational → Per-Story → Polish

### 3.2 What We Skip

- 7 slash commands (too complex)
- No verification loop (we add this)

---

## 4. Fabric Analysis

### 4.1 Pattern Structure

```
IDENTITY → STEPS → OUTPUT → OUTPUT CONSTRAINTS
```

Markdown format. Single-purpose patterns.

### 4.2 What Works

- Identity shapes behavior
- Step-by-step as numbered list
- Output constraints prevent drift
- Pattern library concept → our SKILLS/

---

## 5. Retrospective Formats

### 5.1 Recommended: Start/Stop/Continue

| Section | Purpose |
|---------|---------|
| **START** | Actions to begin |
| **STOP** | Actions to cease |
| **CONTINUE** | Actions to keep |

Simple, action-oriented, forward-looking.

---

## 6. Context Engineering

> December 30, 2025 — Anthropic, LangChain, JetBrains, Google ADK, HumanLayer

### 6.1 Definition

> "The delicate art and science of filling the context window with just the right information for the next step." — Andrej Karpathy

Context = first-class system with architecture, lifecycle, constraints.

### 6.2 The Problem

| Issue | Description |
|-------|-------------|
| Context Poisoning | Hallucination enters context |
| Context Distraction | Irrelevant info dilutes attention |
| Context Overflow | Exceeds window limit |
| Context Rot | Performance degrades within limits |

### 6.3 Four Strategies

| Strategy | Purpose | Implementation |
|----------|---------|----------------|
| **WRITE** | Save outside window | docs/, NOTES.md, checkpoints |
| **SELECT** | Pull into window | Read docs/index.md, load relevant |
| **COMPRESS** | Retain only required | Checkpoint at 40%, compaction > summarization |
| **ISOLATE** | Split across boundaries | Dispatch to subagents |

### 6.4 Key Findings

| Finding | Implication |
|---------|-------------|
| 40% proactive > 80% emergency | Checkpoint early |
| Compaction > summarization | Keep structure, remove redundancy |
| Tool outputs biggest risk | Mask/compress tool returns |
| Fresh context = better performance | Don't fight degradation, restart |

### 6.5 Checkpoint Protocol

**When**: Phase complete, task done, context heavy.
**What**: Summary, decisions, changes, next steps, files to re-read.

### 6.6 Sources

- Lance Martin: Context Engineering for Agents
- LangChain Blog: Context Engineering
- JetBrains Research: Efficient Context Management
- Google ADK: Multi-Agent Framework
- HumanLayer: 12 Factor Agents

---

## 7. Synthesis

### From Spec-Kit

✅ User stories, Given/When/Then, `[P]` markers, checkpoints, phases
❌ 7 slash commands

### From Fabric

✅ Identity section, steps, output constraints, pattern library
⚠️ Stitch → workflow phases

### From Retrospectives

✅ Start/Stop/Continue

### From Context Engineering

✅ WRITE/SELECT/COMPRESS/ISOLATE, 40% threshold, checkpoint protocol

---

## 8. Templates

Templates moved to:

- **docs/agent-spec.md** — Agent specification patterns
- **docs/skill-spec.md** — Skill specification patterns
- **SKILLS/** — Procedural templates

*Research compiled December 25-31, 2025*
