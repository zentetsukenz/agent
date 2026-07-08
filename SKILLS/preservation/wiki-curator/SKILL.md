---
name: wiki-curator
description: Ingest source material into the project wiki, integrate it into canonical pages, and update cross-references without duplicating knowledge.
---

# Wiki Curator

> **Strategy**: INGEST + INTEGRATE  
> **Purpose**: Keep wiki useful as source knowledge changes

## Trigger

Use this skill when:

- New source docs, plans, ADRs, issues, or handoffs contain durable knowledge
- A project wiki needs updates after implementation or discovery
- Knowledge exists in scattered files and should be integrated into canonical pages
- Cross-references need updates after adding or changing wiki content

## Input

Gather:

- [ ] Source material path or URL
- [ ] Wiki root and index path
- [ ] Target canonical page, if known
- [ ] Source freshness and authority level
- [ ] Concepts, decisions, terms, runbooks, or architecture notes to preserve

## Procedure

### 1. Classify Source

Label source as one or more:

- Decision
- Architecture
- Glossary term
- Runbook
- Onboarding knowledge
- Troubleshooting / known issue
- Historical context

### 2. Pick Canonical Destination

Prefer updating existing canonical pages over creating new pages.

Create a new page only when:

- Concept is durable
- Content has clear owner or audience
- Existing page would become too broad

### 3. Integrate, Do Not Dump

Summarize source into wiki language.

Keep links to source artifacts for traceability. Do not paste long raw source unless exact text is legally or operationally required.

### 4. Update Cross-References

Add links from:

- `index.md` to new or changed page
- Related concept pages to each other
- Glossary term to pages that use it
- ADR index to new decision pages

Add backlink sections where project convention uses them.

### 5. Mark Review State

Use `needs-review` when source conflicts with existing wiki or authority is unclear.

Record conflict instead of silently choosing one side.

## Output

- Updated canonical wiki pages
- New wiki pages only when justified
- Updated cross-references and index entries
- Short curation note: source, destination, conflicts, follow-ups

## Cross-references

- **Canonical page**: preferred durable home for one concept
- **Source artifact**: issue, plan, PRD, ADR, handoff, or doc being ingested
- **Backlink**: reverse link showing where a page is referenced
- **Authority level**: canonical, supporting, historical, stale candidate
- Related skills: [wiki-init](../wiki-init/SKILL.md), [wiki-crosslink](../wiki-crosslink/SKILL.md), [wiki-audit](../wiki-audit/SKILL.md)
