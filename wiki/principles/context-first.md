---
type: Principle
title: Context-First Philosophy
description: How to manage context as a first-class resource in agent design
tags: [context, efficiency, design]
timestamp: 2026-01-07T00:00:00Z
---

# Context-First Philosophy

Context is fuel. Manage it deliberately, not accidentally.

## Core Idea

Context window is finite. Every byte you load costs reasoning capacity for the rest of the session. Context-first design means:

- **Minimize what enters context** — Use sandboxes for analysis, indexing for search, code for derivation
- **Maximize signal-to-noise** — One focused question beats ten scattered ones
- **Checkpoint early** — At 40% capacity, checkpoint. At 80%, performance degrades
- **One task per dispatch** — Context purity. Mixing tasks contaminates context

## Principles

### Think in Code

Analyze data in a sandbox. Only the answer enters context.

```javascript
// WRONG: Read raw data into context
const data = fs.readFileSync('huge.log', 'utf8');
const errors = data.split('\n').filter(l => /ERROR/.test(l));
console.log(errors.length);

// RIGHT: Process in sandbox, return only the answer
// ctx_execute(language: "javascript", code: "...")
// console.log(errors.length) // Only this enters context
```

### Index, Don't Read

Store content in FTS5. Query it later.

```javascript
// WRONG: Read file to understand it
const content = fs.readFileSync('spec.md', 'utf8');
// Now 50KB of spec is in your conversation

// RIGHT: Index it, search it
// ctx_index(path: "spec.md", source: "openapi-spec")
// ctx_search(queries: ["authentication endpoints"])
// Only matching sections come back
```

### Batch I/O

Parallel fetches, one round trip.

```javascript
// WRONG: Sequential fetches
fetch(url1); // Wait
fetch(url2); // Wait
fetch(url3); // Wait

// RIGHT: Parallel batch
// ctx_batch_execute(commands: [
//   {label: "api1", command: "curl url1"},
//   {label: "api2", command: "curl url2"},
//   {label: "api3", command: "curl url3"}
// ], concurrency: 3)
```

### Delegate Exploration

Don't re-search what agents already searched.

```javascript
// WRONG: After delegating explore, grep the same files
// call_omo_agent(subagent_type="explore", ...)
// Then immediately grep for the same thing

// RIGHT: Delegate, continue non-overlapping work
// call_omo_agent(subagent_type="explore", run_in_background=true, ...)
// Work on unrelated files while they search
// Wait for notification, then collect results
```

## Checkpointing

Context accumulates. Manage it:

| Capacity | Action |
|----------|--------|
| 0-40% | Continue normally |
| 40-60% | Start planning checkpoint |
| 60-80% | Prepare handoff |
| 80%+ | Checkpoint now |

Checkpoint = summarize decisions, store in memory, purge session, resume fresh.

## Anti-Patterns

- **Inline HTTP** — Use `ctx_fetch_and_index`, not `fetch()`
- **Raw grep output** — Use `ctx_execute` to filter, return only matches
- **Re-searching delegated work** — Wait for agent results, don't duplicate
- **Mixing tasks** — One clear objective per dispatch
- **Hoarding context** — Checkpoint early, not late

## See Also

- `mem:rpi` — Research → Plan → Implement workflow
- `mem:verification-culture` — Verify before claiming done
