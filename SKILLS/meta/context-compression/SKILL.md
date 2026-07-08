---
name: context-compression
description: Model-invoked core primitive for compressing state blobs to a token budget while preserving load-bearing decisions, constraints, evidence, blockers, and next actions. Use when planning dispatch payloads, handoff summaries, continuation state, or any context-heavy work needs a smaller high-signal representation.
---

# Context Compression

Compress a state blob into a smaller form that another model, agent, or future session can safely act on. This is a **model-invoked core primitive**: it does not solve the domain task itself; it preserves enough state for the next step to solve it without re-reading everything.

## Inputs

- **State blob**: conversation notes, scratchpad, transcript, task state, plan, subagent result, or handoff material.
- **Token budget**: hard maximum for output size.
- **Consumer**: who will read it next — current agent, subagent, future session, reviewer, or human.
- **Purpose**: dispatch, continuation, handoff, verification, incident recovery, or decision record.

## Compression Contract

Preserve meaning before prose. Remove wording before facts.

Keep:

- load-bearing decisions and why they were made
- active constraints, non-goals, and forbidden paths
- current task status and exact next action
- file paths, commands, IDs, errors, versions, and other anchors
- evidence needed to verify or resume work
- blockers and ownership of unresolved questions

Compress:

- repeated status updates into one state line
- similar events into counted summaries
- long examples into representative examples plus path/anchor
- verbose prose into terse bullets
- chronological logs into phases: done, current, next, blocked

Drop:

- pleasantries, filler, apologies, and hedging
- duplicate observations that add no new constraint
- internal reasoning that is not needed for action
- failed attempts unless they prevent wasted repeat work
- raw file contents when a path, symbol, or excerpt suffices

## Procedure

### 1. Identify the Consumer

Ask what the next reader needs to do. Compression for dispatch favors isolated task context. Compression for handoff favors continuity and recovery. Compression for verification favors evidence and acceptance criteria.

### 2. Extract Load-Bearing State

Pull out only facts that change future behavior:

```markdown
## Objective
[What outcome is being pursued]

## Decisions
- [Decision] — [reason/evidence]

## Constraints
- [Must/never/path rule]

## Current State
- Done: [compressed completed work]
- Active: [where work stands now]
- Next: [exact next action]

## Evidence
- [Path/command/result/ID]

## Blockers
- [Question or external dependency]
```

### 3. Elide Low-Signal Tokens

Shorten without changing semantics:

- replace paragraphs with bullets
- remove setup story once decision is captured
- replace repeated tool chatter with final result
- keep exact strings only when exactness matters
- prefer `path:line`, command, or artifact path over copied content

### 4. Aggregate Similar Events

Merge repeated events into one actionable fact:

- `3 failed npm test runs: same TS error in src/foo.ts`
- `5 files migrated; index added; acceptance command OK`
- `2 subagents agree root cause is auth cache invalidation`

Keep dissent if it matters. Do not hide contradictions behind a bland summary.

### 5. Preserve Verification Surface

Always include how to prove the compressed state is still usable:

- acceptance command
- expected output
- changed files
- remaining checklist
- known failing check and why it is tolerated, if any

## Output Shape

Use this compact handoff unless the caller asks for another format:

```markdown
# Compressed Context

## Goal
[1 sentence]

## Current State
- Done: ...
- Active: ...
- Next: ...

## Decisions
- ...

## Constraints
- ...

## Evidence
- ...

## Blockers
- None | ...
```

## Budget Strategy

If output is over budget, cut in this order:

1. style and narrative
2. duplicate evidence
3. old completed phases
4. examples and raw excerpts
5. rationale detail, keeping decision labels

Never cut current objective, active constraints, next action, blockers, or verification evidence.

## Anti-patterns

- Sending full conversation history when a state summary suffices
- Keeping exact chronology when phase summary is enough
- Dropping a decision because it was mentioned only once
- Compressing away uncertainty or blockers
- Replacing concrete paths/commands with vague phrases like "some files" or "tests were run"
- Returning a polished narrative that is pleasant but not executable
