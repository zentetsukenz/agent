---
name: wiki-init
description: Bootstrap a fresh project wiki with core pages, navigation, ownership metadata, and first-pass cross-reference structure.
---

# Wiki Init

> **Strategy**: SEED + STRUCTURE  
> **Purpose**: Create a durable project wiki before knowledge fragments scatter

## Trigger

Use this skill when:

- Starting a new project wiki
- A repo has docs but no stable wiki root
- A team needs canonical pages for architecture, glossary, decisions, and runbooks
- A handoff or onboarding flow needs predictable wiki entry points

## Input

Gather:

- [ ] Project root and preferred wiki root (`wiki/`, `docs/wiki/`, or configured path)
- [ ] Existing docs that must become canonical or linked
- [ ] Project name, owner, and active domains
- [ ] Known ADR, glossary, runbook, and onboarding locations
- [ ] Link style preference: relative markdown links unless project uses another convention

## Procedure

### 1. Choose Wiki Root

Prefer configured wiki path first. If none exists, use `wiki/` at repo root.

Do not move existing docs unless user explicitly asks. Link to them from wiki pages instead.

### 2. Create Core Pages

Create minimum viable wiki:

| Page | Purpose |
|---|---|
| `index.md` | Entry point and page map |
| `glossary/index.md` | Shared terms and domain language |
| `adr/index.md` | Decision record index |
| `architecture.md` | System shape and boundaries |
| `onboarding.md` | First-session reading path |
| `runbooks/index.md` | Operational procedures |

### 3. Seed Page Metadata

For each page, include:

- Title
- Status (`draft`, `active`, `needs-review`)
- Owner if known
- Last reviewed date if known
- Related pages section

### 4. Wire First Links

Every page must link back to `index.md` and list related pages.

`index.md` must group links by concept: architecture, decisions, glossary, runbooks, onboarding.

### 5. Preserve Existing Knowledge

Add references to existing docs instead of copying large sections.

Mark source docs as canonical, supporting, or stale candidate when known.

## Output

- Fresh wiki directory with core pages
- `index.md` navigation table
- Initial glossary, ADR, architecture, onboarding, and runbook placeholders
- List of source docs linked but not migrated

## Cross-references

- **Wiki root**: canonical folder containing durable project knowledge
- **Glossary**: shared domain terms used by all wiki pages
- **ADR index**: decision records and rationale timeline
- **Link graph**: all wiki links and backlinks
- **Orphan page**: page with no incoming wiki link
- Related skills: [wiki-curator](../wiki-curator/SKILL.md), [wiki-crosslink](../wiki-crosslink/SKILL.md), [handoff](../handoff/SKILL.md)
