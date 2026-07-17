---
type: Pattern
title: Deep Modules
description: Design interfaces that hide complexity
tags: [design, architecture, modularity]
timestamp: 2026-01-07T00:00:00Z
---

# Deep Modules

From "A Philosophy of Software Design" by John Ousterhout.

> **Applied vocabulary:** the [codebase-design](../../SKILLS/design/codebase-design/SKILL.md) skill operationalises this pattern into a working glossary (module, interface, seam, adapter, leverage, locality) and design principles (the deletion test, "the interface is the test surface"). This page is the conceptual reference; the skill is the vocabulary agents design with.

## Core Idea

**Deep module** = small interface + lots of implementation

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
│                     │
└─────────────────────┘
```

**Shallow module** = large interface + little implementation (avoid)

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

## Design Questions

When designing interfaces, ask:

- Can I reduce the number of methods?
- Can I simplify the parameters?
- Can I hide more complexity inside?

## Example: Shallow vs Deep

### Shallow: File I/O

```typescript
// Shallow: caller must manage everything
interface FileOps {
  open(path: string): FileHandle;
  read(handle: FileHandle, offset: number, length: number): Buffer;
  write(handle: FileHandle, offset: number, data: Buffer): void;
  close(handle: FileHandle): void;
  seek(handle: FileHandle, offset: number): void;
  flush(handle: FileHandle): void;
}

// Caller must coordinate all these
const handle = fileOps.open('data.txt');
fileOps.seek(handle, 100);
const data = fileOps.read(handle, 100, 1024);
fileOps.close(handle);
```

### Deep: File I/O

```typescript
// Deep: simple interface, complex internals
interface FileOps {
  read(path: string, offset?: number, length?: number): Buffer;
  write(path: string, data: Buffer, offset?: number): void;
}

// Caller just calls what they need
const data = fileOps.read('data.txt', 100, 1024);
fileOps.write('data.txt', newData, 100);
```

## Benefits of Deep Modules

- **Easier to use** — Caller doesn't need to understand internals
- **Easier to change** — Hide implementation details
- **Better encapsulation** — Complexity stays inside
- **Fewer bugs** — Less coordination needed by caller

## Anti-Pattern: Shallow Modules

Shallow modules create work for callers:

```typescript
// Shallow: caller must do the work
class Logger {
  constructor() { this.buffer = []; }
  add(msg: string) { this.buffer.push(msg); }
  flush() { /* write to disk */ }
}

// Caller must remember to flush
logger.add("event 1");
logger.add("event 2");
logger.flush();  // Oops, forgot this once
```

Better: Deep module handles flushing automatically.

```typescript
// Deep: caller just logs
class Logger {
  log(msg: string) {
    this.buffer.push(msg);
    if (this.buffer.length >= 100) {
      this.flush();  // Hidden from caller
    }
  }
}

logger.log("event 1");
logger.log("event 2");
// Flushing happens automatically
```

## When to Break This Rule

Deep modules are ideal for:

- Core infrastructure (file I/O, networking, databases)
- Frequently-used utilities
- Complex domains (auth, validation, data transformation)

Shallow modules are OK for:

- Thin adapters (wrapping external libraries)
- Simple pass-through layers
- Temporary scaffolding

## See Also

- `mem:wisdom` — "Explicit beats implicit"
- `mem:patterns/backend-api-patterns` — API design patterns
