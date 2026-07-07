# SPEC — loom Agent Framework Conformance Rules

This document defines the conformance rules for the loom content-only agent framework.
All framework artifacts (skills, wiki files, agents, commands) MUST satisfy these rules.
The validation script at `scripts/validate.sh` mechanically enforces a subset.

---

## Skills — agentskills.io conformance

Skills conform to the [agentskills.io specification](https://agentskills.io/specification).

### Directory structure

Each skill lives in its own directory: `skills/<bucket>/<slug>/SKILL.md`
Optional subdirs: `scripts/`, `references/`, `assets/`

### Required YAML frontmatter

Every `SKILL.md` MUST open with a YAML frontmatter block:

```yaml
---
name: <kebab-case-slug>
description: <one-line description, ≤1024 chars>
---
```

Constraints:
- `name`: kebab-case, ≤64 characters, no leading/trailing hyphens, lowercase
- `description`: non-empty string, ≤1024 characters

### Optional frontmatter fields

- `license`: SPDX identifier
- `compatibility`: list of tools this skill targets
- `metadata`: arbitrary key-value pairs
- `allowed-tools`: list of permitted tool names

---

## Wiki — OKF v0.1 conformance

The wiki follows the Open Knowledge Framework (OKF v0.1) conventions.

### Required frontmatter

Every `.md` file in `wiki/` MUST have YAML frontmatter with `type:` present:

```yaml
---
type: <Type>       # required: Principle | Pattern | Environment | Term | Index | Log | ADR
title: <title>     # optional
description: <desc> # optional
tags: [tag1, tag2] # optional
timestamp: <iso>   # optional
---
```

### Progressive disclosure

The wiki uses progressive disclosure: roots summarize, leaves hold detail.
Each subtree root has an `index.md` (`type: Index`) that catalogs its direct children
with a one-line summary and link per entry.

### Chronological log

Each subtree root has a `log.md` (`type: Log`) recording significant changes in
chronological order.

---

## Cross-linking convention

All inter-framework links use **relative paths** from the `agent/` root:

```markdown
[deep-modules](wiki/patterns/deep-modules.md)
[context-compression](skills/meta/context-compression/SKILL.md)
```

Rules:
- No absolute file paths
- No `../` traversals that escape `agent/`
- Every link must resolve to an existing file (enforced by `scripts/validate.sh`)
- HTTP/HTTPS links are exempt from link resolution checks

---

## Lifecycle bucket definitions

Skills are organised into 6 lifecycle buckets under `skills/`:

| Bucket | Path | Purpose |
|---|---|---|
| discovery | `skills/discovery/` | Explore a problem space before committing |
| planning | `skills/planning/` | Design and decompose work before implementation |
| implementation | `skills/implementation/` | Build, debug, and refactor |
| verification | `skills/verification/` | Validate, test, and review |
| preservation | `skills/preservation/` | Hand off, document, and maintain knowledge |
| meta | `skills/meta/` | Shared primitives used by skills in other buckets |

Each bucket has its own `index.md` (OKF `type: Index`) cataloging the skills inside it.

---

## User-invoked wrapper vs model-invoked core

Following the mattpocock split, skills divide into two roles:

**User-invoked wrappers** — exposed as slash commands or triggered by the agent directly.
They set context, delegate to the model, and surface output. Example: `dispatch-context`.

**Model-invoked cores** — shared logic imported or referenced by wrappers.
They define reusable procedures without a user-facing trigger. Example: `context-compression`.

### Pattern

```
skills/planning/dispatch-context/SKILL.md   ← wrapper (user-invoked)
  references →
skills/meta/context-compression/SKILL.md    ← core (model-invoked)
```

A core SKILL.md MUST include `model-invoked` or `core primitive` in its description
so validators can identify it.

---

## Extension points — adapter contract

The adapter layer (deferred to v2) is responsible for loading framework content
into a consuming tool (OpenCode, Claude Code, Cursor, Aider, etc.).

See `wiki/adr/adr-001-adapter-pattern.md` for the full design, including:
- Path X: TypeScript OpenCode plugin
- Path Y: Rust CLI (`loom` binary)
- Path Z: Hybrid

### Path-flexibility preamble

Three doc-informed skills include a path-flexibility preamble that resolves paths
at runtime in priority order:

1. `loom.toml` `paths.*` section (when adapter ships)
2. Framework-relative default (e.g. `wiki/adr/`, `wiki/glossary/index.md`)
3. Legacy fallback (e.g. `docs/adr/`, `CONTEXT.md`)

This preamble appears at the top of: `grill-with-docs`, `domain-model`,
`improve-codebase-architecture`.
