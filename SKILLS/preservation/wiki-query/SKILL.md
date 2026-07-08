---
name: wiki-query
description: Answer questions from the project wiki and optionally file the answer back into canonical wiki pages when durable knowledge is missing.
---

# Wiki Query

> **Strategy**: READ + ANSWER + FILE-BACK  
> **Purpose**: Make wiki knowledge easy to retrieve and improve during use

## Trigger

Use this skill when:

- User asks a question that should be answerable from the project wiki
- An agent needs domain context before planning or implementation
- Existing wiki pages may contain relevant decisions, glossary terms, or runbooks
- A useful answer should become durable wiki knowledge

## Input

Gather:

- [ ] User question
- [ ] Wiki root and `index.md`
- [ ] Relevant wiki pages, glossary entries, ADRs, and runbooks
- [ ] Whether user wants file-back updates
- [ ] Confidence threshold for answering vs reporting missing knowledge

## Procedure

### 1. Start at Index

Read `index.md` first to identify canonical pages.

Follow concept links before searching random files.

### 2. Trace Concepts

For each key term in the question:

- Check glossary
- Check related architecture pages
- Check ADR index for decisions
- Check runbooks for operational steps

### 3. Answer with Sources

Answer directly and cite wiki paths.

Separate facts from inference.

Say when wiki is silent, stale, or contradictory.

### 4. Optional File-Back

If answer exposes durable missing knowledge, ask or follow instruction to update wiki.

File back into canonical page. Add source link and update cross-references.

### 5. Flag Follow-ups

Flag missing pages, stale terms, broken links, or decisions needing ADRs.

## Output

- Answer with wiki path citations
- Confidence statement: high, medium, or low
- Optional wiki patch summary
- Follow-up gaps for curator or audit

## Cross-references

- **Index-first lookup**: use wiki navigation before broad search
- **Glossary term**: concept definition used to disambiguate answers
- **ADR citation**: decision source for why system behaves this way
- **File-back**: durable update made from useful Q&A
- Related skills: [wiki-curator](../wiki-curator/SKILL.md), [wiki-audit](../wiki-audit/SKILL.md), [handoff](../handoff/SKILL.md)
