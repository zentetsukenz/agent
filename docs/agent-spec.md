# Agent Specification

> **Type**: Knowledge (specification)  
> **Purpose**: How to create and structure agent files

---

## Overview

Agents are specialized AI assistants with defined identities, capabilities, and workflows. Each agent file codifies:

- **Who** the agent is (identity)
- **What** the agent does (capabilities)
- **How** the agent works (workflow)
- **Why** the agent makes decisions (wisdom)

---

## File Location

```
.github/agents/[name].agent.md
```

Examples:

- `.github/agents/TheEngineer.agent.md`
- `.github/agents/backend-api.agent.md`
- `.github/agents/visual-qa.agent.md`

---

## File Structure

### Frontmatter (Required)

```yaml
---
description: "Brief description (triggers agent selection)"
model: Claude Sonnet 4.5
tools: [list, of, tools]
---
```

**Description**: One sentence that captures:

- What the agent does
- When to use it
- Key differentiator

**Tools**: Array of tool categories/names the agent needs.

### Required Sections

```markdown
# Agent Name

## Identity
Who the agent is. Core beliefs. Position in the system.

## Responsibilities / Capabilities
What the agent does. Clear scope boundaries.

## Workflow
How the agent works. Phases, procedures, decision points.

## Success Criteria
How to know the agent succeeded.
```

### Optional Sections

```markdown
## Wisdom
Core principles that guide decisions.
Link to docs/wisdom.md for extended wisdom.

## File Organization
Where the agent's outputs go.

## Operating Modes
Different modes the agent can operate in.

## Verification
How to verify the agent's work.
```

---

## Design Principles

### Identity-First Design

**Identity shapes behavior.** A well-defined identity beats a thousand instructions.

Good identity:

```markdown
## Identity

You are **TheEngineer**, a creator.

**You create, not execute:**
- Create agents, skills, knowledge, tools, context
- Dispatch context-heavy work to subagents
- Do small tasks directly (<5% context)
- Checkpoint proactively at ~40%
```

Weak identity:

```markdown
## Identity

You are a helpful coding assistant.
```

### Specialize by Problem

**Problem domains > Technology stacks**

✅ Good specialization:

- "Authentication and authorization specialist"
- "API design and REST patterns expert"
- "Performance testing specialist"

❌ Weak specialization:

- "Node.js agent"
- "React agent"
- "Database agent"

### Clear Boundaries

**No overlapping responsibilities.** When two agents might both handle something, neither does it well.

Define what the agent does NOT do:

```markdown
**Not responsible for:**
- Frontend UI implementation
- Infrastructure/DevOps
- Direct database queries (use the API)
```

### Embedded Wisdom

**Wisdom is the edge.** Domain knowledge multiplies effectiveness.

Don't just say WHAT to do; explain WHY:

```markdown
### On Verification
**Nothing is done until verified.**

Not "I added the code" — but "Tests pass."
Not "It should work" — but "I ran it and saw expected output."

Why: "Done" without verification is the #1 cause of the "60% barrier."
```

---

## Size Guidelines

| Section | Target Lines | Purpose |
|---------|--------------|---------|
| Frontmatter | 5-10 | Metadata, triggers |
| Identity | 15-25 | Core beliefs, position |
| Workflow | 50-100 | Procedures, decision points |
| Capabilities | 40-80 | What agent can do |
| Wisdom | 30-50 | Core principles (link to extended) |
| **Total** | **200-500** | Fits in context without dominating |

**Principle**: Agent files should fit in context alongside working code. If an agent file exceeds 600 lines, externalize content to docs/ and SKILLS/.

---

## Externalization Pattern

Keep agent files focused by externalizing:

| Content | Externalize To | Reference As |
|---------|---------------|--------------|
| Extended wisdom | docs/wisdom.md | "Full wisdom → docs/wisdom.md" |
| Detailed procedures | SKILLS/*.md | "See SKILLS/verification.md" |
| Domain knowledge | docs/*.md | "See docs/context-engineering.md" |
| Templates | assets/ or inline | Include critical templates only |

---

## Example: Minimal Agent

```markdown
---
description: "Visual verification specialist. Takes screenshots, returns text descriptions."
tools: [screenshot, read]
---

# Visual QA Agent

## Identity

You verify that UI looks correct by taking screenshots and describing what you see.

**Key constraint**: Return TEXT descriptions only (~500 tokens). Never return actual images to the calling agent.

## Workflow

1. Receive verification request with expected state
2. Take screenshot(s) of specified UI
3. Compare actual vs expected
4. Return text description of findings

## Success Criteria

- Screenshots captured successfully
- Comparison is accurate
- Description is concise (~500 tokens)
- Issues clearly identified
```

---

## Anti-patterns

### ❌ Kitchen Sink Agent

An agent that "does everything" has no identity and makes inconsistent decisions.

### ❌ Instruction Overload

Thousands of lines of instructions indicate missing identity. If you need many rules, the identity isn't clear enough.

### ❌ Technology-Based Identity

"You are a Node.js agent" doesn't guide decisions. "You are an API design specialist" does.

### ❌ No Workflow

Without a clear workflow, the agent improvises inconsistently. Define phases and decision points.

### ❌ No Success Criteria

If you can't define success, you can't verify completion. Every agent needs clear success criteria.
