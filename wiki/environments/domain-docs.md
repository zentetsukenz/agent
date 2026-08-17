---
type: Environment
title: Domain Docs
description: Where a project's glossary (ubiquitous language) and ADRs live, and how skills resolve those paths across loom.toml, the wiki, and legacy layouts
tags: [glossary, adr, domain-model, context, paths]
timestamp: 2026-08-17T00:00:00Z
---

# Domain Docs

Several skills — [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md),
[domain-model](../../SKILLS/design/domain-model/SKILL.md), and
[improve-codebase-architecture](../../SKILLS/design/improve-codebase-architecture/SKILL.md) —
read and write a project's **glossary** (the ubiquitous language) and its **ADRs** (recorded
decisions). This page defines *where* those docs live and the single resolution order every
skill consumes, so the rule lives in one place instead of being restated in each skill.

## Path flexibility

Resolve the glossary and ADR locations in priority order:

1. **`loom.toml`** — `paths.glossary` and `paths.adr` (when the loom adapter ships). Honor
   the configured paths.
2. **Framework default** — `wiki/glossary/index.md` for the glossary and `wiki/adr/` for
   ADRs, when present.
3. **Legacy fallback** — `CONTEXT.md` at the repo root for the glossary and `docs/adr/` for
   ADRs, when neither of the above exists.

Use the resolved paths consistently for the rest of the operation. Create files lazily — only
when there is something to write (the first resolved term, the first ADR).

## File structure

Most repos have a single context: one glossary doc plus an ADR directory.

```
/
├── CONTEXT.md            ← glossary (or wiki/glossary/index.md)
├── docs/                 ← (or wiki/adr/)
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

If a `CONTEXT-MAP.md` exists at the root, the repo has **multiple contexts**. The map points
to where each one lives and how they relate:

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

Infer which structure applies:

- If `CONTEXT-MAP.md` exists, read it to find the contexts and pick the one the current topic
  relates to; if unclear, ask.
- If only a single glossary doc exists, it's a single context.
- If neither exists, create the glossary lazily when the first term is resolved.

## Formats

The two document formats are shared, not restated per skill:

- **Glossary** — [CONTEXT-FORMAT.md](../../SKILLS/discovery/grill-with-docs/CONTEXT-FORMAT.md).
- **ADR** — [ADR-FORMAT.md](../../SKILLS/discovery/grill-with-docs/ADR-FORMAT.md).

## Related

- [grill-with-docs](../../SKILLS/discovery/grill-with-docs/SKILL.md) — drives the interview that resolves terms and decisions into these docs.
- [domain-model](../../SKILLS/design/domain-model/SKILL.md) — the active capture discipline that writes them.
- [improve-codebase-architecture](../../SKILLS/design/improve-codebase-architecture/SKILL.md) — reads the glossary and ADRs before proposing deepenings.
</content>
