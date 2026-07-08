---
name: wiki-crosslink
description: Rebuild wiki index navigation and verify the markdown link graph so pages are discoverable, connected, and traceable.
---

# Wiki Crosslink

> **Strategy**: INDEX + VERIFY  
> **Purpose**: Make wiki navigation reliable

## Trigger

Use this skill when:

- New wiki pages were added or moved
- `index.md` is stale or missing pages
- Audit found orphan pages, dead ends, or broken cross-references
- Curator integrated source material and needs navigation rebuilt

## Input

Gather:

- [ ] Wiki root
- [ ] All wiki markdown pages
- [ ] Existing `index.md`
- [ ] Page titles, metadata, and status fields
- [ ] Existing glossary, ADR, runbook, and architecture index pages

## Procedure

### 1. Inventory Pages

List every markdown page under wiki root.

Exclude generated artifacts only if project convention says so.

### 2. Classify Pages

Group pages into sections:

- Start here / onboarding
- Architecture
- Decisions / ADRs
- Glossary
- Runbooks
- Troubleshooting
- Historical or archived

### 3. Rebuild `index.md`

Write a clear navigation table with page, status, and description.

Keep stable section order so diffs stay readable.

Preserve custom intro text unless it is stale or contradictory.

### 4. Verify Link Graph

Check:

- Every active page appears in `index.md`
- Every active page links back to `index.md` or parent index
- Related pages sections link to real pages
- ADR and glossary pages appear in their own indexes
- No broken relative markdown links remain

### 5. Report Remaining Gaps

If missing titles, duplicate names, or ambiguous canonical homes block clean indexing, report them instead of guessing.

## Output

- Rebuilt `index.md`
- Updated parent indexes when needed
- Verified link graph summary
- Remaining orphan, broken, or ambiguous pages

## Cross-references

- **Index page**: navigational page listing child or related pages
- **Link graph**: directed map of markdown links between wiki pages
- **Parent index**: section-level index, such as `adr/index.md`
- **Backlink**: link from page back to index or related canonical page
- Related skills: [wiki-audit](../wiki-audit/SKILL.md), [wiki-curator](../wiki-curator/SKILL.md), [wiki-init](../wiki-init/SKILL.md)
