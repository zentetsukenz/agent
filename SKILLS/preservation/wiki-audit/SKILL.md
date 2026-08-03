---
name: wiki-audit
description: Health-check a project wiki for rot, broken links, orphan pages, stale metadata, duplicate concepts, and missing cross-references.
---

# Wiki Audit

> **Strategy**: INSPECT + REPORT  
> **Purpose**: Keep wiki trustworthy over time

## Trigger

Use this skill when:

- Wiki feels stale, inconsistent, or hard to navigate
- Broken links or orphan pages are suspected
- Major project change may have invalidated docs
- Before handoff, release, onboarding, or documentation cleanup

## Input

Gather:

- [ ] Wiki root and all markdown files under it
- [ ] Configured canonical paths, if any
- [ ] Expected index pages (`index.md`, glossary index, ADR index, runbook index)
- [ ] Project docs outside wiki that should be linked
- [ ] Last-reviewed metadata convention, if any

## Procedure

### 1. Build Link Graph

Collect all markdown links inside wiki.

Resolve relative links against source pages.

Classify each page as indexed, linked, orphaned, or dead-end.

### 2. Check Broken Links

Flag links to missing files, missing anchors, or moved pages.

Do not auto-delete links without confirming source intent.

### 3. Detect Rot

Look for:

- Stale `last reviewed` dates
- TODOs without owner
- Contradictory statements across pages
- References to removed files, commands, branches, or services
- Pages marked draft for too long

### 4. Find Duplicates and Gaps

Flag duplicate glossary terms, overlapping architecture pages, and ADRs not listed in ADR index.

Flag important docs outside wiki that no wiki page links to.

### 5. Recommend Fixes

Group findings by severity:

- **Critical**: broken canonical path, dangerous stale runbook, wrong decision guidance
- **High**: broken navigation, orphan canonical page, duplicate conflicting concept
- **Medium**: missing backlinks, stale review date, incomplete metadata
- **Low**: naming cleanup, formatting consistency

## Output

- Wiki health report
- Broken link list
- Orphan and dead-end page list
- Rot and duplicate concept findings
- Prioritized fix plan for curator or crosslink pass

## Cross-references

- **Rot**: stale or misleading wiki content
- **Broken link**: link target or anchor that no longer resolves
- **Orphan page**: page with no incoming wiki links
- **Dead-end page**: page with no outgoing wiki navigation
- **Duplicate concept**: two pages claiming same canonical meaning
- Related skills: [wiki-crosslink](../wiki-crosslink/SKILL.md), [wiki-curator](../wiki-curator/SKILL.md), [stage-handoff](../stage-handoff/SKILL.md)
