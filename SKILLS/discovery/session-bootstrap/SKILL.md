---
name: session-bootstrap
description: Start a fresh session with optimal context—read checkpoint, load focused docs, verify understanding, resume work. Merges local bootstrap workflow (minimal focused context, template-driven) with external start-task insights (zero-question goal, context compression, exemplar-driven guidance). Use when starting a new session, continuing from checkpoint, or human says "continue from checkpoint".
---

# Session Bootstrap

> **Strategy**: SELECT  
> **Purpose**: Start a fresh session with optimal context

---

## Trigger

Use this skill when:

- Starting a new chat/session
- Continuing from a checkpoint
- Human says "continue from checkpoint"
- Context was reset

---

## Input

Identify what's available:

- [ ] `CHECKPOINT.md` — Most recent checkpoint
- [ ] `docs/index.md` — Document manifest (if exists)
- [ ] `NOTES.md` — Session learnings
- [ ] Task description from human

---

## Procedure

### 1. Read Checkpoint First

```
Read CHECKPOINT.md
```

Extract:

- Current phase (R/P/I)
- Next steps
- Files to re-read
- Key context

### 2. Load Relevant Documents

Based on current phase and task:

| Phase | Typically Need |
|-------|----------------|
| **Research** | architecture.md, tech-stack.md |
| **Plan** | patterns/*.md, STANDARDS.md |
| **Implement** | KNOWLEDGE.md, relevant feature files |

**Only SELECT what's needed for the immediate task.**

### 3. Re-Read Listed Files

From checkpoint's "Files to Re-Read":

- Read each file listed
- Note any changes since checkpoint

### 4. Verify Understanding

Before proceeding, confirm:

- [ ] I know what phase I'm in
- [ ] I know the immediate next step
- [ ] I have the context I need
- [ ] I don't have context I don't need

### 5. Resume Work

Pick up exactly where the checkpoint left off.

---

## Output

- Agent has minimal, focused context
- Ready to continue from checkpoint
- No redundant context loaded

---

## Context Budget

When selecting documents, stay within budget:

| Document Type | Typical Size | Priority |
|---|---|---|
| CHECKPOINT.md | ~500 tokens | Always load |
| NOTES.md | ~500 tokens | Usually load |
| KNOWLEDGE.md | ~1000 tokens | Load for implementation |
| architecture.md | ~500 tokens | Load for research |
| Full source files | 1000+ tokens | Load only when editing |

**Goal**: Start session at <10% context, leaving room for work.

---

## Principles

1. **Zero-question goal** — The executing agent should never need to ask "why?" or "how?"
2. **Context compression** — Just enough to make autonomous decisions. Not a novel.
3. **Exemplar over prose** — Point to existing code patterns instead of describing from scratch.
4. **Bounded autonomy** — Explicit "you can decide X" and "escalate if Y" for every task.
5. **Executable verification** — Every success criterion maps to a runnable command or dispatchable check.

---

## Anti-patterns

- ❌ Loading all documents at once ("just in case")
- ❌ Reading full source files before knowing what to edit
- ❌ Ignoring the checkpoint's "Files to Re-Read"
- ❌ Starting work without verifying understanding

---

## Template: Bootstrap Message

When resuming, acknowledge the checkpoint:

```markdown
**Resuming from checkpoint**

📍 Phase: [R/P/I]
📋 Next: [immediate next step]
📂 Loaded: [list of docs read]

Ready to continue. [First action I'll take]
```

---

## Related Skills

- [handoff](../../preservation/handoff/SKILL.md) — Creating checkpoints
- [task-sizing](../../planning/task-sizing/SKILL.md) — Assess before starting work
