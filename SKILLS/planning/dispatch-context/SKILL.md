---
name: dispatch-context
description: Compress and dispatch the current session context to reduce token overhead. Invokes the context-compression core primitive.
---

> **Shared primitive:** Context compression steps in this skill invoke the
> `meta/context-compression` core primitive. See [context-compression](../../meta/context-compression/SKILL.md).

# Dispatch Context

> **Strategy**: ISOLATE + COMPRESS  
> **Purpose**: Engineer minimal context for subagent work

---

## Trigger

Use this skill when:

- Delegating work to a subagent
- Task is context-heavy (>20% estimated)
- Task involves expensive operations (screenshots, deep research)
- You want to keep your main context clean

---

## Input

Before dispatching, determine:

- [ ] Which subagent to use
- [ ] What the subagent needs to know
- [ ] What the subagent does NOT need to know
- [ ] How to verify the subagent's work
- [ ] What format you need back

---

## Procedure

### 1. Assess Task Size

Use [task-sizing](../task-sizing/SKILL.md) to confirm dispatch is appropriate.

| Size | Context Cost | Action |
|------|--------------|--------|
| Small (<5%) | Single file, quick fix | Do directly |
| Medium (5-20%) | Few files, moderate logic | Consider dispatch |
| **Large (>20%)** | Many files, complex logic | **Must dispatch** |

### 2. Choose Subagent

| Subagent | When to Use |
|----------|-------------|
| **visual-qa** | UI verification, screenshots |
| **Plan** | Complex multi-step research |
| **Implementer** | Large code changes |
| **Researcher** | Deep exploration tasks |

### 3. Engineer the Context

**Include only what subagent needs:**

```markdown
## Context for [Subagent]

### Background
[1-2 sentences: what project this is, what we're building]

### Relevant Code
[Only the specific snippets needed — NOT full files]

### Constraints
[Any rules, patterns, or standards to follow]
```

**Explicitly exclude:**

- Full conversation history
- Unrelated files
- Previous failed attempts (unless relevant)
- Your internal reasoning

### 4. State Task Clearly

One clear objective:

```markdown
## Task
[Single sentence: what to accomplish]

## Success Criteria
- [ ] [Specific, verifiable criterion]
- [ ] [Another criterion]
- [ ] [Final criterion]
```

### 5. Request Compressed Return

Tell subagent what to report back:

```markdown
## Return Format
Provide a summary (~500 tokens max) including:
- What was done
- Key findings or results
- Any issues encountered
- Files created/modified
```

### 6. Dispatch

Use `runSubagent` with the engineered prompt.

### 7. Integrate Result

When subagent returns:

- Read the summary (NOT full context)
- Verify against success criteria
- Update your own state
- Continue with clean context

---

## Output

Dispatch payload with:

- Minimal, relevant context
- Clear single objective
- Explicit success criteria
- Compressed return format

---

## Dispatch Template

```markdown
# Task for [Subagent Name]

## Context
[Project]: [1 sentence]
[Current Phase]: [R/P/I]
[What you need to know]: [2-3 sentences]

## Relevant Code
```[language]
[Only the specific snippet needed]
```

## Task

[Single clear objective]

## Success Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Constraints

- [Any rules to follow]
- [Patterns to use]

## Return Format

Provide TEXT summary only (~500 tokens):

- What was accomplished
- Key findings
- Files modified
- Any blockers

```

---

## Anti-patterns

- ❌ Sending full file contents when snippet suffices
- ❌ Vague task descriptions ("fix the bug", "make it work")
- ❌ No success criteria defined
- ❌ Expecting full context return (always ask for summary)
- ❌ Including your internal reasoning/frustrations
- ❌ Dispatching multiple objectives (one task per dispatch)

---

## Context Flow Diagram

```

TheEngineer (orchestrator)
    │
    │ dispatch: context (~500 tokens) + task + criteria
    ↓
Subagent (isolated context)
    │
    │ executes in own context window
    │ (screenshots, research, code stay here)
    ↓
Returns: TEXT summary (~500 tokens)
    │
    ↓
TheEngineer continues (main context clean)

```

---

## Related Skills

- [task-sizing](../task-sizing/SKILL.md) — Decide whether to dispatch
- [handoff](../../preservation/handoff/SKILL.md) — Uses similar compression
