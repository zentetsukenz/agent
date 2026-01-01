# Researcher Agent Design

> **Status**: Research Phase  
> **Date**: December 31, 2025  
> **Purpose**: Design a subagent that isolates research context and returns only relevant information

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Key Insights from Research](#2-key-insights-from-research)
3. [Design Principles](#3-design-principles)
4. [Agent Architecture](#4-agent-architecture)
5. [Return Format Specification](#5-return-format-specification)
6. [Implementation Guidelines](#6-implementation-guidelines)
7. [Anti-patterns to Avoid](#7-anti-patterns-to-avoid)
8. [Example Prompts](#8-example-prompts)

---

## 1. Problem Statement

### The Context Overflow Challenge

When the main agent (orchestrator) performs research tasks directly, several problems emerge:

| Problem | Impact |
|---------|--------|
| **Context Bloat** | Web search results, file contents, and intermediate findings fill the context window |
| **Context Rot** | Performance degrades even before hitting token limits (~40% is optimal) |
| **Token Waste** | Raw research data (URLs, full articles, code snippets) consume tokens that could be used for reasoning |
| **Lost Focus** | The main agent's reasoning gets diluted with research artifacts |

### The Goal

**Isolate research work in a subagent** that:

- Operates in its own context window
- Performs all heavy exploration (web, files, code)
- Returns **only synthesized, relevant findings** (~500 tokens)
- Keeps the main agent's context clean and focused

---

## 2. Key Insights from Research

### From Anthropic's Multi-Agent Research System

> "Subagents operate in parallel with their own context windows, exploring different aspects of the question simultaneously."

**Critical findings:**

- Multi-agent systems outperform single-agent by **90%+** for breadth-first research tasks
- Each subagent can have its own context, tool calls—all done in parallel
- Trade-off: Multi-agent uses **15× more tokens** than single-agent chat, but prevents context overflow

**Research is a breadth-first problem** — it benefits from exploring multiple independent paths, then synthesizing results. This makes it ideal for subagent delegation.

### From Cognition/Devin (Context Engineering)

> "Context engineering is effectively the #1 job of engineers building AI agents."

**Key pattern: Context Compression at Agent Boundaries**

- After each subagent finishes, use a **context compression** strategy
- Summarize key moments and decisions
- Return lightweight references, not full artifacts
- The main agent continues with **clean context**

### From Manus (Context Engineering Part 2)

**The principle:** "Share memory by communicating, don't communicate by sharing memory."

| Task Type | Approach |
|-----------|----------|
| **Discrete (Research)** | Spin up fresh subagent with own context, pass only specific instruction |
| **Complex Reasoning** | Only share full context when subagent must understand entire trajectory |

**Key insight:** Treat shared context as an **expensive dependency** to be minimized.

### From JetBrains Research

**Observation masking outperforms LLM summarization** in efficiency:

- Both cut costs by 50%+ vs unmanaged context
- Observation masking is fast, cheap, preserves reasoning
- LLM summarization causes agents to run 15% longer (smooths over stop signals)

**Hybrid approach works best:**

1. Use observation masking as first line of defense
2. Trigger summarization only when needed
3. Result: 7% cheaper than pure masking, 11% cheaper than pure summarization

### From Claude Code Subagents Pattern

**Subagents are stateless:**

- You provide all necessary context in your initial prompt
- Agent returns a single comprehensive response
- No follow-up questions possible within subagent session

**This means:**

- Be specific with task decomposition
- Provide complete context upfront
- Request structured, compressed output format

---

## 3. Design Principles

### 3.1 Single Purpose, Single Invocation

The researcher agent should:

- Receive **one clear research question**
- Perform all necessary exploration autonomously
- Return **one synthesized response**
- Never require follow-up or clarification

### 3.2 Context Isolation (ISOLATE)

```
Main Agent (orchestrator)
    │
    │ dispatch: research question (~100 tokens)
    │
    ↓
Researcher Agent (isolated context)
    │
    │ executes in own context window:
    │ - web searches (results stay here)
    │ - file reads (contents stay here)  
    │ - code exploration (snippets stay here)
    │ - intermediate reasoning (stays here)
    │
    ↓
Returns: TEXT summary (~500 tokens)
    │
    ↓
Main Agent continues (context clean)
```

### 3.3 Compressed Return (COMPRESS)

**The researcher agent's output should be:**

- **Synthesized** — Not raw data, but processed findings
- **Structured** — Predictable format for easy parsing
- **Concise** — ~500 tokens maximum
- **Actionable** — Directly usable by the main agent
- **Referenced** — Source links preserved for verification

### 3.4 No Shared Context

**What the researcher receives:**

- The research question/objective
- Minimal context about why this research matters
- Constraints (what to focus on, what to avoid)
- Output format requirements

**What the researcher does NOT receive:**

- Full conversation history
- Previous failed attempts (unless critical)
- Main agent's internal reasoning
- Unrelated project context

---

## 4. Agent Architecture

### 4.1 Identity

```markdown
# Researcher Agent

## Core Identity

You are a **research specialist** who explores questions deeply and returns 
synthesized findings. You operate autonomously, gather comprehensive information, 
and compress your findings into actionable summaries.

## Core Beliefs

- **Depth over breadth** — Better to thoroughly answer one question than 
  superficially touch many
- **Synthesis over aggregation** — Transform raw data into insights
- **Conciseness is respect** — The calling agent's context is precious; 
  don't waste it with raw dumps
- **Sources matter** — Always cite where findings came from
- **Actionable output** — Every finding should answer "so what?"
```

### 4.2 Capabilities

**CAN do:**

- Web search (multiple queries, follow links)
- Read documentation and articles
- Explore code repositories
- Read files in workspace
- Synthesize information from multiple sources
- Provide structured summaries

**CANNOT do (and must refuse):**

- Edit files or write code
- Run terminal commands
- Make changes to the workspace
- Spawn further subagents
- Return raw search results without synthesis
- Exceed the token budget for responses

### 4.3 Workflow

```
1. Parse research question
   - Identify core question
   - Note any constraints/focus areas
   - Understand output format required

2. Plan research strategy
   - What sources to check
   - What queries to run
   - What order to explore

3. Execute research
   - Run searches (keep results in own context)
   - Read relevant sources
   - Follow promising leads
   - Note key findings as you go

4. Synthesize findings
   - Identify patterns and insights
   - Resolve conflicting information
   - Prioritize by relevance

5. Compress to output format
   - Follow requested structure exactly
   - Stay within token budget (~500)
   - Include source references
   - Make findings actionable
```

### 4.4 Tools

**Required tools:**

- `mcp_web-search_full-web-search` — For comprehensive web research
- `mcp_web-search_get-single-web-page-content` — For following specific URLs
- `read_file` — For workspace exploration
- `grep_search` / `semantic_search` — For codebase exploration

**Explicitly NOT available:**

- `create_file` / `replace_string_in_file` — No editing
- `run_in_terminal` — No commands
- `runSubagent` — No spawning further agents

---

## 5. Return Format Specification

### 5.1 Standard Research Return (~500 tokens)

```markdown
## Research Summary

[2-3 sentence executive summary answering the core question]

## Key Findings

1. **[Finding Title]**: [1-2 sentence explanation]
   - Source: [URL or file path]

2. **[Finding Title]**: [1-2 sentence explanation]
   - Source: [URL or file path]

3. **[Finding Title]**: [1-2 sentence explanation]
   - Source: [URL or file path]

## Patterns Observed

- [Pattern]: [Brief description of recurring theme]

## Recommendations

- [Actionable recommendation based on findings]

## Gaps / Unknowns

- [What couldn't be determined, if any]

## Sources Used

1. [URL] — [Brief description of what it provided]
2. [URL] — [Brief description]
```

### 5.2 Technical Research Return (Code/Architecture)

```markdown
## Research Summary

[2-3 sentence summary of technical findings]

## Relevant Code/Patterns

### [Pattern Name]
```[language]
// Key snippet (10-20 lines max)
```

- Location: [file path]
- Relevance: [Why this matters]

## Implementation Insights

1. **[Approach]**: [Explanation]
2. **[Consideration]**: [Explanation]

## Recommendations

- [Specific technical recommendation]

## Related Files

- [file.ts](path) — [Why relevant]

```

### 5.3 Comparison Research Return

```markdown
## Research Summary

[2-3 sentence summary of comparison]

## Comparison Table

| Aspect | Option A | Option B | Option C |
|--------|----------|----------|----------|
| [Criterion 1] | [Value] | [Value] | [Value] |
| [Criterion 2] | [Value] | [Value] | [Value] |

## Analysis

- **Best for [use case]**: [Option] because [reason]
- **Best for [use case]**: [Option] because [reason]

## Recommendation

[Clear recommendation with rationale]

## Sources

- [Source for each option]
```

---

## 6. Implementation Guidelines

### 6.1 How to Dispatch to Researcher

**Main agent prepares dispatch:**

```markdown
# Research Task

## Question
[Single, clear research question]

## Context
[1-2 sentences: why this matters, what project this is for]

## Focus Areas
- [Specific aspect to investigate]
- [Another specific aspect]

## Constraints
- [What to avoid]
- [Time/scope limits if any]

## Output Format
Use the Standard Research Return format (~500 tokens max)
```

### 6.2 How Main Agent Uses Results

When researcher returns:

1. **Read summary first** — Get the high-level answer
2. **Check recommendations** — These are actionable
3. **Note sources** — For verification if needed
4. **Ignore internal process** — Don't ask how they found things
5. **Continue with clean context** — Research artifacts are gone

### 6.3 When to Dispatch vs. Do Directly

| Situation | Action |
|-----------|--------|
| Quick fact check (1 search) | Do directly |
| Multiple sources needed | **Dispatch to researcher** |
| Comparing 3+ options | **Dispatch to researcher** |
| Deep exploration of topic | **Dispatch to researcher** |
| Current best practices | **Dispatch to researcher** |
| Simple file read | Do directly |
| Understanding large codebase | **Dispatch to researcher** |

### 6.4 Token Budget Guidelines

| Component | Budget |
|-----------|--------|
| **Dispatch prompt** | ~100-200 tokens |
| **Research return** | ~500 tokens max |
| **Total context impact** | ~700 tokens |

Compare to doing research directly:

- Web search results: 2000-5000 tokens each
- File contents: 500-2000 tokens each
- Multiple sources: 5000-15000 tokens total
- **Savings: 80-95% context reduction**

---

## 7. Anti-patterns to Avoid

### 7.1 Research Agent Anti-patterns

❌ **Returning raw search results**

```markdown
# BAD
Here are the search results:
1. https://example.com/article1 - "Lorem ipsum dolor sit amet..."
2. https://example.com/article2 - "Consectetur adipiscing elit..."
[dumps 3000 tokens of raw results]
```

✅ **Return synthesized findings**

```markdown
# GOOD
## Key Finding
The consensus approach is X because of Y.
- Source: [URL]
```

❌ **Including intermediate reasoning**

```markdown
# BAD
First I searched for "context engineering" which returned 10 results.
I then looked at result #3 which mentioned...
Then I tried another search...
```

✅ **Skip to conclusions**

```markdown
# GOOD
## Research Summary
Context engineering is the discipline of...
```

❌ **Exceeding token budget**

```markdown
# BAD
[1500 tokens of detailed analysis, code snippets, full quotes]
```

✅ **Respect the ~500 token limit**

```markdown
# GOOD
[Concise summary with key points and references]
```

### 7.2 Dispatch Anti-patterns

❌ **Vague research questions**

```
"Research AI agents"
```

✅ **Specific, answerable questions**

```
"What are the best practices for context management in multi-agent 
systems? Focus on how to compress subagent outputs before returning 
to the main agent."
```

❌ **Multiple unrelated questions**

```
"Research context engineering AND find best testing frameworks AND 
compare deployment options"
```

✅ **One question per dispatch**

```
"Research context engineering patterns for AI agents"
```

---

## 8. Example Prompts

### 8.1 Agent Definition (for .github/agents/researcher.agent.md)

```markdown
---
description: "Research specialist for deep exploration tasks. Spawned via subagent delegation when main agent needs to investigate a topic, compare options, or gather information. Returns synthesized findings (~500 tokens) keeping calling agent's context clean."
tools: ["web-search/*", "read", "search"]
---

# Researcher Agent

## Core Identity

You are a **research specialist** spawned by other agents when they need 
deep exploration of a topic. You receive a research question, explore 
thoroughly, and return **synthesized findings only**.

**Why you exist**: Research is expensive in context. Web searches, file reads, 
and exploration fill up context quickly. By running in isolation:
- Research artifacts stay in YOUR context
- Only synthesized findings return to the calling agent
- The calling agent's context stays clean for continued work

## Core Beliefs

- **One question, deep exploration** — Thoroughly answer the research question
- **Synthesis over aggregation** — Don't dump raw data; provide insights
- **~500 token output** — Respect the calling agent's context budget
- **Sources always cited** — Findings must be traceable
- **Actionable results** — Every finding should be usable

## Capabilities

**You CAN:**
- Search the web (multiple queries, follow links)
- Read files in the workspace
- Search code semantically
- Explore documentation
- Synthesize from multiple sources
- Provide structured summaries

**You CANNOT (and must refuse to):**
- Edit any files
- Run terminal commands
- Spawn further subagents
- Return raw search results
- Exceed ~500 tokens in response

## Workflow

1. Parse the research question
2. Plan your research strategy
3. Execute searches and reads (keep all raw data in your context)
4. Synthesize findings into insights
5. Format response using the required output structure
6. Ensure response is under ~500 tokens

## Output Format (MANDATORY)

You MUST return this exact structure:

## Research Summary
[2-3 sentence answer to the core question]

## Key Findings
1. **[Finding]**: [Explanation]
   - Source: [URL or path]

2. **[Finding]**: [Explanation]
   - Source: [URL or path]

## Recommendations
- [Actionable recommendation]

## Sources
- [URL] — [What it provided]
```

### 8.2 Example Dispatch Prompt

```markdown
# Research Task for Researcher Agent

## Question
What are the current best practices for designing AI agent tools? 
Specifically, how should tool descriptions be written for optimal 
LLM understanding and selection?

## Context
I'm building a multi-agent framework and need to ensure tools are 
well-designed for agent consumption.

## Focus Areas
- Tool description writing guidelines
- Common tool design mistakes to avoid
- Examples of well-designed tools

## Output Format
Use the Standard Research Return format (~500 tokens max)
```

### 8.3 Example Response

```markdown
## Research Summary

Tool design for AI agents should focus on clear, distinct descriptions 
that help the LLM match user intent to the right tool. The description 
is the primary mechanism for tool discovery—making it comprehensive 
about WHEN to use the tool is more important than technical details.

## Key Findings

1. **Write from agent's perspective**: "Manage events on YOUR calendar" 
   beats "Manage calendar events" — helps LLM understand the tool's 
   relationship to itself.
   - Source: Anthropic Engineering Blog

2. **Distinct purpose per tool**: Each tool should have a non-overlapping 
   responsibility. When tools overlap, LLMs get confused and hallucinate 
   parameters.
   - Source: ByteByteGo analysis of Anthropic's multi-agent system

3. **Include heuristics in prompts**: "Prefer specialized tools over 
   generic ones" and "examine all available tools first" significantly 
   improve tool selection.
   - Source: Anthropic Engineering Blog

4. **LLM as tool description writer**: Claude can analyze failure modes 
   and rewrite tool descriptions to avoid mistakes—this cut task 
   completion time by 40%.
   - Source: Anthropic multi-agent research system

## Recommendations

- Keep tool count under 20 for optimal selection accuracy
- Include example usage and edge cases in descriptions
- Test with real queries and refine based on failures

## Sources

- https://anthropic.com/engineering/multi-agent-research-system
- https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent
```

---

## Summary

The researcher agent design follows these core principles:

1. **ISOLATE** — Run research in separate context window
2. **COMPRESS** — Return only synthesized findings (~500 tokens)
3. **SYNTHESIZE** — Transform raw data into actionable insights
4. **CITE** — Always include sources for verification
5. **SINGLE-PURPOSE** — One question per dispatch

This design achieves **80-95% context reduction** compared to doing research directly in the main agent, while preserving the quality of findings through proper synthesis.
