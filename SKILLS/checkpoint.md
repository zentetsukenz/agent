# Checkpoint

> **Strategy**: WRITE + COMPRESS  
> **Purpose**: Preserve context for fresh continuation

---

## Trigger

Use this skill when ANY of these conditions are true:

| Condition | Priority |
|-----------|----------|
| **~40% context used** | Proactive — context still fresh |
| **Phase complete** (R→P, P→I) | Natural boundary |
| **Significant discovery** | Preserve insight before it's lost |
| **3-5 tasks completed** | Implementation rhythm |
| **~80% context used** | Emergency — must checkpoint now |
| **Session ending** | Final checkpoint |
| **Human says "checkpoint"** | Explicit request |

---

## Input

Before generating a checkpoint, gather:

- [ ] Current phase (Research / Plan / Implement)
- [ ] What was accomplished this session
- [ ] Key decisions and their rationale
- [ ] Files created or modified
- [ ] Current blockers or unknowns
- [ ] What should happen next

---

## Procedure

### 1. Assess Context State

Ask yourself:

- How much context have I accumulated?
- Is my performance degrading? (repeating myself, forgetting earlier context)
- Am I at a natural boundary?

### 2. Compress Before Writing

Apply compression priority:

1. **Keep raw**: Current task, active errors, recent conversation
2. **Compact**: Replace file contents with path references
3. **Summarize**: Old decisions, completed work → bullet points

### 3. Generate Checkpoint

Use this exact template:

```markdown
# 📍 CHECKPOINT: [Brief Title]

**Date**: [YYYY-MM-DD]  
**Phase**: [Research | Plan | Implement]  
**Context**: [~X% estimated]

---

## Summary
[2-3 sentences: what was accomplished]

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| [What] | [Why] |

## Code Changes
- [file](path) — [what changed]

## Current State
- Phase: [R | P | I]
- Tasks: [X/Y complete]
- Blockers: [none | list]

## Next Steps
1. [Immediate next action]
2. [Following action]

## Files to Re-Read
| File | Why Needed |
|------|------------|
| [path] | [reason] |

## Key Context
[Critical domain knowledge that must survive — compress but preserve]
```

### 4. Save to File

Write checkpoint to `CHECKPOINT.md` (overwrite previous).

### 5. Inform Human

Tell the user:
> "Checkpoint saved. Context is at ~X%. [Recommend: continue | suggest fresh start]"

---

## Output

- Updated `CHECKPOINT.md` file
- Clear recommendation to human

---

## Thresholds Reference

| Threshold | State | Action |
|-----------|-------|--------|
| **<40%** | Fresh | Continue working |
| **40-60%** | Proactive | Checkpoint, continue in same session |
| **60-80%** | Heavy | Checkpoint, consider fresh start |
| **>80%** | Emergency | Checkpoint immediately, fresh start required |

---

## Anti-patterns

- ❌ Waiting until 80% to checkpoint (performance already degraded)
- ❌ Including full file contents (use path references)
- ❌ Vague summaries ("worked on stuff")
- ❌ Forgetting "Files to Re-Read" section
- ❌ Not specifying next steps

---

## Related Skills

- [session-bootstrap.md](session-bootstrap.md) — Starting from a checkpoint
- [dispatch-context.md](dispatch-context.md) — Uses similar compression
