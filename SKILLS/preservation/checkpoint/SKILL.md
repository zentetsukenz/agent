---
name: checkpoint
description: Keep a running, traceable trail of decision→result nodes in the memory system so a session can compress without fear of losing its thread. Use throughout a long run — especially for utility agents (quick, deep) driving toward a goal — not only at the end. NOT the formal cross-stage seam artifact (that is stage-handoff).
---

# Checkpoint

> **Strategy**: JOURNAL + COMPRESS (within-session)
> **Purpose**: Never lose your own thread — a traceable trail you can compress against fearlessly
> **Scope**: within a single session, for yourself (or a trivial same-work restart)

Checkpointing is **journalling as you go** — but selectively. You are not transcribing
everything you do; you are dropping a **node** each time a decision meets its result. Strung
together, these nodes form a small map — the same idea as a [wayfinder](../../planning/wayfinder/SKILL.md)
map, at session scale — that another instance of you can trace from start to finish without
re-deriving the journey.

This is the **within-session self-continuity** skill. It is the informal, lightweight pole of
loom's context-passing family. When ownership actually changes hands across a stage seam, that
is a **formal** artifact — use [stage-handoff](../stage-handoff/SKILL.md) instead, not this.

**Best fit:** utility agents (`quick`, `deep`) grinding toward a concrete goal across many
steps, where the risk is *losing your own reasoning trail*, not handing off to someone else.

---

## What a node is

Drop a node when a **decision produces a result worth remembering** — especially when the result
was *not* what you expected. A node is three short lines:

- **Decision** — what you chose to do, and the one-line why.
- **Result** — what actually happened (worked / failed / surprised you).
- **Next** — the move that result points to (only if non-obvious).

Skip the noise. A node is not "read file X" or "ran the test." It is "chose approach A over B
because Y → A dead-ended on Z → falling back to B." The trail should read like the decision
tree you actually walked, not a keystroke log.

---

## Where it lives — the memory system, not a file

Write nodes to the **memory system**, not a reused scratch file in the repo. Append to a
session-scoped memory note (e.g. \`/memories/session/<task-slug>.md\`) as you work. Memory:

- survives compression within the conversation,
- is discoverable by a fresh instance without polluting the repo tree,
- is cheap to append to mid-flight.

If the harness has no memory system, fall back to a single session note file — but the memory
system is the default.

---

## Trigger

Journal a node **as decisions resolve** — that is the main cadence. Additionally, compress the
trail (fold older nodes into a tighter summary, keep recent ones raw) when:

| Condition | Why |
|---|---|
| **~40% context used** | Compress early, while the thread is still fresh |
| **A sub-goal completes** | Natural boundary — fold the finished branch into one line |
| **~80% context used** | Emergency — compress now, prepare to continue fresh |
| **Session ending** | Final fold, so the next instance starts clean |

---

## Procedure

1. **As you work**, append a node whenever a decision meets its result. Keep it to the three
   lines above.
2. **When context gets heavy**, compress the trail: keep the current branch and recent nodes
   raw; fold resolved branches into single summary lines (decision + outcome, drop the detail).
   Reference files by path, never paste their contents.
3. **To continue**, a fresh instance reads the memory note top-to-bottom — the trail *is* the
   context. Pair with [session-bootstrap](../../discovery/session-bootstrap/SKILL.md) if the
   project has a ledger.

---

## Anti-patterns

- ❌ Journalling everything (keystroke log) instead of decision→result nodes
- ❌ Reusing a committed repo file instead of the memory system
- ❌ Waiting until 80% to start — the trail should already exist by then
- ❌ Pasting file contents into a node (reference by path)
- ❌ Using this for a real cross-stage handoff (that is [stage-handoff](../stage-handoff/SKILL.md))

---

## Related Skills

- [stage-handoff](../stage-handoff/SKILL.md) — the formal, mandatory cross-stage seam artifact (the opposite pole)
- [session-bootstrap](../../discovery/session-bootstrap/SKILL.md) — start a fresh session from the trail
- [wayfinder](../../planning/wayfinder/SKILL.md) — the same map idea at multi-session scale
- [context-compression](../../meta/context-compression/SKILL.md) — the compression primitive the fold step applies
