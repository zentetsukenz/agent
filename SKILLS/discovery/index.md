---
type: Index
title: Discovery skills
description: Skills for beginning sessions, understanding codebases, and grilling plans against domain models
---

| Skill | Description |
|---|---|
| [session-bootstrap](session-bootstrap/SKILL.md) | Start a fresh session with optimal context—read checkpoint, load focused docs, verify understanding, resume work. Merges bootstrap workflow with start-task insights. |
| [zoom-out](zoom-out/SKILL.md) | Tell the agent to zoom out and give broader context or a higher-level perspective. Use when you're unfamiliar with a section of code or need to understand how it fits into the bigger picture. |
| [grill-me](grill-me/SKILL.md) | Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me". |
| [grill-with-docs](grill-with-docs/SKILL.md) | Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (CONTEXT.md, ADRs) inline as decisions crystallise. Use when user wants to stress-test a plan against their project's language and documented decisions. |
| [research-recommend](research-recommend/SKILL.md) | Use when a user needs decision-informed comparative research: multi-candidate comparison, option scoring, shortlist creation, literature review, and a recommendation report. Trigger on genuine comparison requests even if phrased casually. |
| [research](research/SKILL.md) | Investigate a single focused question against primary sources via a background subagent, capturing findings as a cited Markdown file. Use for one-question fact-finding, not comparisons. |

> Architecture interrogation lives in the [design](../design/index.md) bucket now — see [improve-codebase-architecture](../design/improve-codebase-architecture/SKILL.md).
