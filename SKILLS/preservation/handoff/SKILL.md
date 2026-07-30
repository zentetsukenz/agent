---
name: handoff
description: Compact the current conversation into a checkpoint-backed handoff document for another agent or fresh session to continue safely.
---

> **Shared primitive:** Context compression steps in this skill invoke the
> `meta/context-compression` core primitive. See [context-compression](../../meta/context-compression/SKILL.md).

# Handoff

> **Strategy**: WRITE + COMPRESS  
> **Purpose**: Preserve context for fresh continuation  
> **Role**: the **PRODUCE** adapter of the [Seam Artifact Protocol](../../../wiki/patterns/seam-artifact-protocol.md)

Write a handoff document summarising the current conversation so a fresh agent can continue the
work. This skill is how a producing agent **writes a seam artifact** — see the
[Seam Artifact Protocol](../../../wiki/patterns/seam-artifact-protocol.md) for the contract it
implements.

**Where to write it — the ledger, not a flat folder.** Resolve the ledger location and namespace
from the project's [communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document)
(each project chooses its substrate at setup — harness memory, a committed folder, or both). Write
the artifact to `<ledger-root>/<stage>/<milestone-slug>/` and **register a row in the manifest**
at `<ledger-root>/index.md` so the receiving agent can discover it. If no protocol document exists
(loom not set up in this project), fall back to a committed `<project-root>/.loom/handoffs/`
directory and create a manifest there.

> **Mandatory at stage seams.** At the two stage seams (Shaping → Delivery, Delivery → Closing)
> producing the seam artifact is a **gate obligation**, not a nudge — the stage's exit gate is not
> satisfied until it is written and registered. Within a stage, this skill is advisory (fire it on
> context pressure, see the trigger table).

Include a "suggested skills" section in the document, which suggests skills that the agent should invoke.

Do not duplicate content already captured in other artifacts (PRDs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

---

## Trigger

Use this skill when ANY of these conditions are true:

| Condition                                | Priority                          |
| ---------------------------------------- | --------------------------------- |
| **~40% context used**                    | Proactive — context still fresh   |
| **Phase complete** (R→P, P→I)            | Natural boundary                  |
| **Significant discovery**                | Preserve insight before it's lost |
| **3-5 tasks completed**                  | Implementation rhythm             |
| **~80% context used**                    | Emergency — must checkpoint now   |
| **Session ending**                       | Final checkpoint                  |
| **Human says "checkpoint" or "handoff"** | Explicit request                  |

---

## Input

Before generating a handoff, gather:

- [ ] Current phase (Research / Plan / Implement)
- [ ] What was accomplished this session
- [ ] Key decisions and their rationale
- [ ] Files created or modified
- [ ] Current blockers or unknowns
- [ ] What should happen next
- [ ] What the next session will focus on, if the user provided it

---

## Procedure

### 1. Assess Context State

Ask yourself:

- How much context have I accumulated?
- Is my performance degrading? (repeating myself, forgetting earlier context)
- Am I at a natural boundary?

### 2. Compress Before Writing

Invoke `meta/context-compression` before drafting the handoff.

Apply compression priority:

1. **Keep raw**: Current task, active errors, recent conversation
2. **Compact**: Replace file contents with path references
3. **Summarize**: Old decisions, completed work → bullet points

### 3. Generate Handoff

Use this exact template:

```markdown
# 📍 HANDOFF: [Brief Title]

**Date**: [YYYY-MM-DD]  
**Phase**: [Research | Plan | Implement]  
**Context**: [~X% estimated]

---

## Summary

[2-3 sentences: what was accomplished]

## Suggested Skills

- [skill-name] — [why next agent should invoke it]

## Decisions Made

| Decision | Rationale |
| -------- | --------- |
| [What]   | [Why]     |

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

| File   | Why Needed |
| ------ | ---------- |
| [path] | [reason]   |

## Key Context

[Critical domain knowledge that must survive — compress but preserve]
```

### 4. Save to the ledger + register in the manifest

1. Resolve `<ledger-root>`, the namespace convention, and the stage's expected artifact filenames
   from the project's [communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document).
2. Write the artifact to `<ledger-root>/<stage>/<milestone-slug>/<artifact>.md`
   (e.g. `shaping/add-oauth-login/findings.md`). At a stage seam, write the full set the seam
   expects (Shaping: findings + domain model or link + design decisions; Delivery:
   verified-change with evidence).
3. **Register a row in the manifest** at `<ledger-root>/index.md`:
   `| <milestone> | <stage> | <artifact-path> | <status> | <date> |` — status is
   `ready-for-delivery`, `shipped`, or `preserved` at a seam; `in-progress` for a within-stage
   checkpoint. Latest row for a milestone wins.

For legacy checkpoint workflows, also write or update `CHECKPOINT.md` when the next continuation
expects that file.

### 5. Inform Human

Tell the user:

> "Handoff saved. Context is at ~X%. [Recommend: continue | suggest fresh start]"

---

## Output

- A seam artifact under `<ledger-root>/<stage>/<milestone>/`
- A registered row in the ledger manifest (`<ledger-root>/index.md`)
- Optional updated `CHECKPOINT.md` file for legacy continuation
- Clear recommendation to human

---

## Thresholds Reference

| Threshold  | State     | Action                                       |
| ---------- | --------- | -------------------------------------------- |
| **<40%**   | Fresh     | Continue working                             |
| **40-60%** | Proactive | Handoff/checkpoint, continue in same session |
| **60-80%** | Heavy     | Handoff/checkpoint, consider fresh start     |
| **>80%**   | Emergency | Handoff immediately, fresh start required    |

---

## Anti-patterns

- ❌ Waiting until 80% to checkpoint (performance already degraded)
- ❌ Including full file contents (use path references)
- ❌ Vague summaries ("worked on stuff")
- ❌ Forgetting "Files to Re-Read" section
- ❌ Not specifying next steps
- ❌ Duplicating details already captured in PRDs, plans, ADRs, issues, commits, or diffs
- ❌ Leaking secrets, passwords, API keys, or personally identifiable information
- ❌ Writing to a flat, un-namespaced folder or forgetting to register the manifest row (the receiving agent then can't discover it)

---

## Related Skills

- [seam-artifact-protocol](../../../wiki/patterns/seam-artifact-protocol.md) — the contract this skill produces into
- [session-bootstrap](../../discovery/session-bootstrap/SKILL.md) — the DISCOVER adapter that reads what this writes
- [dispatch-context](../../planning/dispatch-context/SKILL.md) — Uses similar compression
- [context-compression](../../meta/context-compression/SKILL.md) — Shared compression primitive
