# Context Engineering

> **Type**: Knowledge (conceptual understanding)  
> **Related Skills**: checkpoint, session-bootstrap, dispatch-context, task-sizing

---

## What is Context Engineering?

**Definition** (Andrej Karpathy):
> "The delicate art and science of filling the context window with just the right information for the next step."

LLMs are like CPUs; the context window is like RAM. Just as an operating system curates what fits into a CPU's RAM, context engineering curates what fits into the context window.

**Why it matters** (Cognition/Devin):
> "Context engineering is effectively the #1 job of engineers building AI agents."

---

## The Problem: Context Accumulates

As agents work longer, context accumulates and causes problems:

| Problem | Description | Symptom |
|---------|-------------|---------|
| **Context Poisoning** | Hallucination enters context, propagates | Agent repeats mistakes |
| **Context Distraction** | Too much context overwhelms signal | Agent loses focus |
| **Context Confusion** | Superfluous context influences responses | Irrelevant suggestions |
| **Context Clash** | Parts of context contradict each other | Inconsistent behavior |
| **Context Rot** | Performance degrades as context fills | Quality drops at ~60%+ |

**Key Insight**: Even with longer context windows, you **always** get better results with a small, focused context.

---

## The Four Strategies

### WRITE — Save Context Outside the Window

Persist information outside the context window for later retrieval.

| Technique | Description | Example |
|-----------|-------------|---------|
| **Scratchpads** | Note-taking during a task | Save plan to NOTES.md |
| **Checkpoints** | Session state for continuation | CHECKPOINT.md |
| **Files** | Persistent documents | KNOWLEDGE.md, STANDARDS.md |
| **Memories** | Cross-session learnings | Patterns discovered |

**Skill**: [checkpoint.md](../SKILLS/checkpoint.md)

---

### SELECT — Pull Context Into the Window

Retrieve relevant information when needed.

| Technique | Description | Example |
|-----------|-------------|---------|
| **File Read** | Fetch saved notes/files | Read KNOWLEDGE.md at start |
| **Semantic Search** | Find relevant code/docs | Search codebase for patterns |
| **Memory Retrieval** | Pull relevant memories | Similar past problems |

**Memory Types**:

- **Episodic** — Few-shot examples of desired behavior
- **Procedural** — Instructions to steer behavior (SKILLS/)
- **Semantic** — Facts for task-relevant context (KNOWLEDGE.md)

**Skill**: [session-bootstrap.md](../SKILLS/session-bootstrap.md)

---

### COMPRESS — Retain Only Required Tokens

Reduce context size while preserving essential information.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Compaction** | Replace contents with references | After editing a file |
| **Summarization** | LLM distills key points | At phase boundaries |
| **Observation Masking** | Hide older tool outputs | During long implementation |

**Priority Order**: Raw > Compaction > Summarization

| Priority | What to Keep | Strategy |
|----------|--------------|----------|
| **1. Raw** | Current task, active errors, recent conversation | Never compress |
| **2. Compact** | File contents already edited | Replace with path reference |
| **3. Summarize** | Old decisions, completed work | Compress to structured notes |

**Key Finding** (JetBrains Research):
> "Observation masking outperforms LLM summarization in overall efficiency and reliability."

**Skill**: [checkpoint.md](../SKILLS/checkpoint.md) (COMPRESS happens during checkpoint)

---

### ISOLATE — Split Context Across Boundaries

Prevent context explosion by separating concerns.

| Technique | Description | Example |
|-----------|-------------|---------|
| **Subagents** | Each has own context window | visual-qa for screenshots |
| **Phase Boundaries** | Checkpoint between phases | R → P → I transitions |
| **Task Isolation** | Fresh context per major task | New chat for new feature |

**Subagent Pattern**:

```
TheEngineer (orchestrator)
    │
    │ dispatch: minimal context (~500 tokens)
    ↓
Subagent (isolated context)
    │
    │ executes (screenshots, research stay here)
    ↓
Returns: TEXT summary (~500 tokens)
    │
    ↓
TheEngineer continues (main context clean)
```

**Trade-off**: Multi-agent can use up to 15× more tokens than single-agent, but prevents context overflow and degradation.

**Skill**: [dispatch-context.md](../SKILLS/dispatch-context.md)

---

## Context Thresholds

| Threshold | State | Action |
|-----------|-------|--------|
| **<40%** | Fresh | Continue working normally |
| **~40%** | Proactive | Checkpoint — context still fresh, performance optimal |
| **40-60%** | Working | Checkpoint and continue, or consider fresh start |
| **60-80%** | Heavy | Checkpoint, recommend fresh start |
| **~80%** | Emergency | Checkpoint immediately, fresh start required |

**Key Insight**: Context rot happens even within limits. Waiting until 80% means performance has already degraded. Checkpoint at 40% to keep context fresh.

---

## When to Apply Each Strategy

| Situation | Primary Strategy | Skill to Use |
|-----------|------------------|--------------|
| End of phase | WRITE + COMPRESS | checkpoint.md |
| Starting fresh session | SELECT | session-bootstrap.md |
| Delegating to subagent | ISOLATE + COMPRESS | dispatch-context.md |
| Before large task | WRITE (checkpoint first) | checkpoint.md |
| Context feels heavy | COMPRESS (checkpoint) | checkpoint.md |
| Need specific file | SELECT | (read_file tool) |

---

## Trigger Phrases

Standard phrases for humans to invoke context management:

| Phrase | Action |
|--------|--------|
| `checkpoint` | Generate session summary, save to CHECKPOINT.md |
| `compress` | Summarize recent work, suggest fresh start |
| `save notes` | Update NOTES.md with key discoveries |
| `continue from checkpoint` | Bootstrap session from CHECKPOINT.md |

---

## The WRITE/SELECT Cycle

Context engineering is a continuous cycle:

```
    ┌────────────────────────────────────────┐
    │                                        │
    ▼                                        │
  WORK ──────► context grows ──────► COMPRESS
    ▲                                        │
    │                                        │
    │         ┌─────────────┐               │
    │         │             │               │
    └── SELECT from ◄── WRITE to ◄──────────┘
              │   files     │
              │             │
              └─────────────┘
```

1. **Work** generates context
2. **COMPRESS** when context grows heavy
3. **WRITE** compressed context to files
4. **SELECT** relevant context when needed
5. Return to **Work** with fresh, focused context

---

## Key Insights from Research

> "Context engineering is effectively the #1 job of engineers building AI agents."  
> — Cognition/Devin

> "Observation masking outperforms LLM summarization in overall efficiency and reliability."  
> — JetBrains Research

> "Even with longer context windows, you always get better results with a small, focused prompt and context."  
> — Industry consensus

> "If you're regularly hitting 80%+ of your context window, you're one edge case away from failures."  
> — Comet

---

## Related Resources

### Skills (How-To)

- [SKILLS/checkpoint.md](../SKILLS/checkpoint.md) — How to perform checkpoints
- [SKILLS/session-bootstrap.md](../SKILLS/session-bootstrap.md) — How to start fresh sessions
- [SKILLS/dispatch-context.md](../SKILLS/dispatch-context.md) — How to delegate with clean context
- [SKILLS/task-sizing.md](../SKILLS/task-sizing.md) — How to assess task context cost

### Source of Truth

- [FRAMEWORK-DESIGN.md](../FRAMEWORK-DESIGN.md) — Full framework specification
