---
name: stage-handoff
description: Produce the formal seam artifact when ownership crosses a stage boundary (Shaping→Delivery, Delivery→Closing) — compress the session, write a namespaced artifact to the ledger, and register it in the manifest so the next stage's agent can discover it. Use at a stage seam, or when explicitly handing work to a different agent. NOT within-session self-notes (that is checkpoint).
---

> **Shared primitive:** Context compression steps invoke the `meta/context-compression` core
> primitive. See [context-compression](../../meta/context-compression/SKILL.md).

# Stage Handoff

> **Strategy**: COMPRESS + PERSIST (cross-stage)
> **Purpose**: Pass a clean, discoverable baton to the *next stage's* agent
> **Role**: the **PRODUCE** adapter of the [Seam Artifact Protocol](../../../wiki/patterns/seam-artifact-protocol.md)

This is the **formal, cross-stage** pole of loom's context-passing family. It fires when
**ownership changes hands** — at a stage seam — not on context pressure. Its output is a durable,
manifest-indexed **seam artifact**, written to the ledger, so a *different* agent (or a fresh
session) can discover and trust it.

Contrast the two informal poles so you pick right:

| Skill | Scope | Recipient | Formality |
|---|---|---|---|
| [checkpoint](../checkpoint/SKILL.md) | within-session | your future self | informal notes in memory |
| [dispatch-context](../../planning/dispatch-context/SKILL.md) | within-stage | a peer (dispatcher ↔ utility) | organized but transient |
| **stage-handoff** (this) | **cross-stage** | **the next stage's owner** | **formal + manifest-registered** |

If you are not crossing a stage seam, you probably want one of the other two.

## Where to write it — the ledger, not a flat folder

Resolve the ledger location and namespace from the project's
[communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document)
(each project chooses its substrate at setup — harness memory, a committed folder, or both).
Write the artifact to \`<ledger-root>/<stage>/<milestone-slug>/\` and **register a row in the
manifest** at \`<ledger-root>/index.md\` so the receiving agent can discover it. If no protocol
document exists (loom not set up in this project), fall back to a committed
\`<project-root>/.loom/handoffs/\` directory and create a manifest there.

> **Mandatory at stage seams.** At the two stage seams (Shaping → Delivery, Delivery → Closing)
> producing the seam artifact is a **gate obligation**, not a nudge — the stage's exit gate is not
> satisfied until it is written and registered. Within a stage, prefer [checkpoint](../checkpoint/SKILL.md)
> (self-continuity) or [dispatch-context](../../planning/dispatch-context/SKILL.md) (peer dispatch).

Include a "Suggested skills" section that names the skills the receiving agent should invoke.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues,
commits, diffs). Reference them by path or URL instead.

Redact any sensitive information (API keys, passwords, PII).

If the user passed arguments, treat them as a description of what the next stage will focus on
and tailor the doc accordingly.

---

## Trigger

- **Stage seam reached** (Shaping → Delivery, Delivery → Closing) — **mandatory**, this is the gate.
- **Explicit handoff to a different agent** — the user hands the baton on.

Context-pressure thresholds are *not* the trigger for this skill — that is
[checkpoint](../checkpoint/SKILL.md)'s job. Handoff is about **ownership change**.

---

## Procedure

### 1. Gather

- Current stage and milestone
- What this stage accomplished; key decisions and their rationale
- Files/artifacts produced (by path — not contents)
- Open blockers or unknowns the next stage inherits
- What the next stage should focus on (from the user's args, if any)

### 2. Compress

Invoke `meta/context-compression`. Keep the current thread raw; compact file contents to path
references; summarize resolved work into bullets.

### 3. Write the seam artifact + register the manifest row

1. Resolve `<ledger-root>`, the namespace convention, and the stage's expected artifact
   filenames from the [communication protocol document](../../../wiki/patterns/seam-artifact-protocol.md#4-the-communication-protocol-document).
2. Write the artifact(s) to `<ledger-root>/<stage>/<milestone-slug>/<artifact>.md`
   (e.g. `shaping/add-oauth-login/findings.md`). At a stage seam, write the full set the seam
   expects (Shaping: findings + domain model or link + design decisions; Delivery:
   verified-change with evidence; Closing: knowledge).
3. **Register a row in the manifest** at `<ledger-root>/index.md`:
   `| <milestone> | <stage> | <artifact-path> | <status> | <date> |` — status is
   `ready-for-delivery`, `shipped`, or `preserved`. Latest row for a milestone wins.

Use this template for the artifact body:

```markdown
# 📍 HANDOFF: [Milestone] — [Stage] → [Next Stage]

**Date**: [YYYY-MM-DD]
**Stage**: [Shaping | Delivery | Closing]
**Milestone**: [slug]

## Summary
[2-3 sentences: what this stage produced]

## Suggested Skills
- [skill-name] — [why the next agent should invoke it]

## Decisions Made
| Decision | Rationale |
| -------- | --------- |

## Artifacts Produced
- [path] — [what it is]

## Open For Next Stage
- Blockers / unknowns the next stage inherits

## Key Context
[Connective tissue the next agent needs — compressed, not re-embedded]
```

### 4. Inform the human

> "Stage handoff written to `<path>` and registered in the manifest. The [next stage] agent can
> now discover it."

---

## Output

- A seam artifact under `<ledger-root>/<stage>/<milestone>/`
- A registered row in the ledger manifest (`<ledger-root>/index.md`)
- A clear pointer for the receiving agent

---

## Anti-patterns

- ❌ Firing on context pressure instead of ownership change (use [checkpoint](../checkpoint/SKILL.md))
- ❌ Writing to a flat, un-namespaced folder or forgetting the manifest row (the receiving agent can't discover it)
- ❌ Re-embedding specs/plans/ADRs/diffs instead of referencing them by path
- ❌ Vague summaries; leaking secrets or PII

---

## Related Skills

- [seam-artifact-protocol](../../../wiki/patterns/seam-artifact-protocol.md) — the contract this skill produces into
- [session-bootstrap](../../discovery/session-bootstrap/SKILL.md) — the DISCOVER adapter that reads what this writes
- [checkpoint](../checkpoint/SKILL.md) — the informal within-session pole
- [dispatch-context](../../planning/dispatch-context/SKILL.md) — the within-stage peer-dispatch pole
- [context-compression](../../meta/context-compression/SKILL.md) — the shared compression primitive
