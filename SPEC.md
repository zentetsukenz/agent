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

Skills are organised into 7 lifecycle buckets under `skills/`:

| Bucket | Path | Purpose |
|---|---|---|
| discovery | `skills/discovery/` | Explore a problem space before committing |
| design | `skills/design/` | Shape the solution — domain model, interfaces, and deep-module architecture — before decomposing it |
| planning | `skills/planning/` | Decompose a shaped solution into risk-ordered, dispatchable tasks |
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

---

## Setup contract conformance

loom installs into a project through a **harness-agnostic entrypoint** (`SETUP.md`) that
runs a universal **setup contract** via the target harness's **adapter** (see
`wiki/adr/adr-005-harness-agnostic-setup.md`; terms defined in `wiki/glossary/index.md`).
Every adapter MUST conform to the following:

- **Implements the five-step contract**: explore → interview → present & confirm →
  generate (in the harness's native format) → verify. The interview is not optional — a
  mechanical copy is non-conformant.
- **Owns only harness-specific knowledge.** The generic entrypoint (`SETUP.md`), the
  universal safety rules, and the contract itself stay harness-agnostic; per-harness config
  formats, paths, and frontmatter live under `adapters/<harness>/` and the adapter's setup
  entrypoint. Harness detail MUST NOT leak into `SETUP.md` or other shared documents.
- **Supplies the four port obligations and references — never restates — the shared core.**
  The generic contract body (five steps, `init`/`update`, the six primitives with their skill
  rosters/capability sets/model archetypes, the interview questions, and the invariant-checks)
  lives once in `contract/` (`wiki/adr/adr-013-shared-adapter-contract-core.md`). An adapter
  MUST supply the four port obligations enumerated in `contract/PORTS.md` (the three
  render-binding ports — `capability→tool`, `archetype→model`, `seam-obligation→wiring` — plus
  the `primitive→file` manifest) and reference the generic content in `contract/` rather than
  restating any of it.
- **Honors the universal safety rules**: never overwrite/delete existing files (edit only
  loom-owned, provenance-marked sections); change no application code, CI, or runtime
  config; confirm the proposed tree before writing; ask for the model list rather than
  guessing model-name strings.
- **Is invoked by reading, not by a command**: an agent runs an adapter by reading
  `SETUP.md` and the adapter entrypoint (locally or remotely) — loom ships no setup slash
  command and requires no repo clone. `init` and `update` are modes of the contract, not
  separate commands.
- **Is registered in `SETUP.md`'s harness table** so the entrypoint can route to it.

Adding support for a new harness means adding an adapter that conforms to the above, never
editing the entrypoint's core.

---

## Mirai delivery conformance

The **Mirai** harness is loom's first concrete adapter — the first implementation of the
setup contract above (see `wiki/adr/adr-004-loom-mirai-setup.md`, which implements
`wiki/adr/adr-005-harness-agnostic-setup.md`). When a project's `.mirai/` directory
contains loom-authored content, `scripts/validate.sh` additionally checks:

- `.mirai/skills/<name>/SKILL.md` — required `name` (kebab-case, ≤64 chars, **must equal
  the folder name** — a Mirai-specific requirement beyond the generic skill rule above)
  and required `description` (non-empty, ≤1024 chars).
- `.mirai/agents/*.agent.md` and `.mirai/prompts/*.prompt.md` — required non-empty
  `description`.
- `.mirai/instructions/*.instructions.md` — required non-empty `description`.
- `.mirai/hooks/*.json` — must parse as valid JSON.
- Exactly one of root `AGENTS.md` or `.mirai/mirai-instructions.md` may exist — never both.

See `wiki/environments/mirai.md` for the full frontmatter reference these checks enforce
a subset of, and `adapters/mirai/setup.md` for the adapter setup instruction that
generates conformant `.mirai/` content.
