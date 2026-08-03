---
name: session-bootstrap
description: Start a fresh session with optimal context—read checkpoint, load focused docs, verify understanding, resume work. Merges local bootstrap workflow (minimal focused context, template-driven) with external start-task insights (zero-question goal, context compression, exemplar-driven guidance). Use when starting a new session, continuing from checkpoint, or human says "continue from checkpoint".
---

# Session Bootstrap

> **Strategy**: SELECT  
> **Purpose**: Start a fresh session with optimal context  
> **Role**: the **DISCOVER** adapter of the [Seam Artifact Protocol](../../../wiki/patterns/seam-artifact-protocol.md)

This skill is how a receiving agent **discovers a seam artifact** left by a producing agent — it
reads the ledger manifest and loads the latest artifact for the seam it is picking up. See the
[Seam Artifact Protocol](../../../wiki/patterns/seam-artifact-protocol.md) for the contract, and
the project's [communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document)
for where that project's ledger lives.

---

## Trigger

Use this skill when:

- Starting a new chat/session
- Continuing from a checkpoint or a stage handoff
- Human says "continue from checkpoint", or names a milestone to pick up (e.g. "start planning the `<milestone>` findings")
- Receiving the baton at a stage seam (Delivery picking up Shaping, Closing picking up Delivery)
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

### 1. Discover the seam artifact (read the manifest first)

1. Resolve `<ledger-root>` from the project's [communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document).
2. Read the manifest at `<ledger-root>/index.md`. Find the latest row for the milestone you were
   asked to pick up (or, if none was named, the newest `ready-for-*` row) — **latest row wins**.
3. Load only that artifact — e.g. `shaping/<milestone>/` when Delivery is picking up Shaping, or
   `delivery/<milestone>/verified-change.md` when Closing is picking up Delivery.

If the project has no ledger (loom not set up), fall back to reading `CHECKPOINT.md`.

Extract from the artifact:

- Current phase / stage
- Next steps
- Files to re-read
- Key context

### 2. Load Relevant Documents

Based on current phase and task:

| Phase         | Typically Need                       |
| ------------- | ------------------------------------ |
| **Research**  | architecture.md, tech-stack.md       |
| **Plan**      | patterns/\*.md, STANDARDS.md         |
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

| Document Type     | Typical Size | Priority                |
| ----------------- | ------------ | ----------------------- |
| CHECKPOINT.md     | ~500 tokens  | Always load             |
| NOTES.md          | ~500 tokens  | Usually load            |
| KNOWLEDGE.md      | ~1000 tokens | Load for implementation |
| architecture.md   | ~500 tokens  | Load for research       |
| Full source files | 1000+ tokens | Load only when editing  |

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

- [seam-artifact-protocol](../../../wiki/patterns/seam-artifact-protocol.md) — the contract this skill discovers from
- [stage-handoff](../../preservation/stage-handoff/SKILL.md) — the PRODUCE adapter that writes what this reads
- [task-sizing](../../planning/task-sizing/SKILL.md) — Assess before starting work
