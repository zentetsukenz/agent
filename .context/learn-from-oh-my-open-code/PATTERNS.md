# Key Patterns: oh-my-opencode

> **Source**: https://github.com/code-yeongyu/oh-my-opencode
> **Extracted**: January 6, 2026

---

## Pattern 1: Tiered Model Orchestration

### Description
Route tasks to appropriate model tiers based on complexity and cost.

### Implementation
```
┌─────────────────────────────────────────────────────────┐
│                 Sisyphus (Opus 4.5)                     │
│                    Orchestrator                         │
│           Extended thinking, 32k token budget           │
└─────────────────┬───────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────────────┐
    │             │             │                     │
    ▼             ▼             ▼                     ▼
┌─────────┐ ┌─────────┐  ┌─────────────┐     ┌──────────────┐
│ explore │ │librarian│  │frontend-eng │     │   oracle     │
│  FREE   │ │  CHEAP  │  │   CHEAP     │     │  EXPENSIVE   │
│grok-code│ │ Sonnet  │  │  Gemini 3   │     │   GPT-5.2    │
│ glm-4.7 │ │         │  │             │     │ Reasoning    │
└─────────┘ └─────────┘  └─────────────┘     └──────────────┘
```

### Key Rules
- FREE tier for exploration, search, grep
- CHEAP tier for research, UI generation, docs
- EXPENSIVE tier only for architecture, hard debugging, reviews

### Our Framework Gap
We don't differentiate model selection. All agents use same model.

---

## Pattern 2: Dynamic Context Pruning (DCP)

### Description
Multiple pruning strategies beyond simple summarization.

### Strategies

#### 2a. Deduplication
```typescript
// Same tool + same args = prune earlier occurrences
const signature = createToolSignature(toolName, input)
if (signatures.has(signature)) {
  // Mark earlier calls for pruning
}
```

#### 2b. Supersede Writes
```typescript
// If file was written then read, prune the write input
fileOperations.get(filePath).filter(op => op.tool === "write")
// If any subsequent read exists, write can be pruned
```

#### 2c. Purge Errors
```typescript
// Remove errored tool inputs after N turns
if (errorAge > config.turns) {
  state.toolIdsToPrune.add(callID)
}
```

### Our Framework Gap
We only do LLM summarization. No semantic/structural pruning.

---

## Pattern 3: Protected Context

### Description
Some context should NEVER be pruned regardless of pressure.

### Protected Tools
```typescript
const DEFAULT_PROTECTED_TOOLS = new Set([
  "task",          // Task management state
  "todowrite",     // TODO state
  "todoread", 
  "lsp_rename",    // Code intelligence
  "lsp_code_action_resolve",
  "session_read",  // Session state
  "session_write",
  "session_search",
])
```

### Turn Protection
```typescript
turn_protection: {
  enabled: true,
  turns: 3,  // Protect last 3 turns
}
```

### Our Framework Gap
We don't classify context by criticality.

---

## Pattern 4: Delegation Protocol Structure

### Description
Formalized 7-section delegation format.

### Template
```markdown
1. TASK: [Atomic, specific goal - one action per delegation]

2. EXPECTED OUTCOME: [Concrete deliverables with success criteria]

3. REQUIRED SKILLS: [Which skill to invoke]

4. REQUIRED TOOLS: [Explicit tool whitelist - prevents tool sprawl]

5. MUST DO: [Exhaustive requirements - leave NOTHING implicit]

6. MUST NOT DO: [Forbidden actions - anticipate rogue behavior]

7. CONTEXT: [File paths, existing patterns, constraints]
```

### Post-Delegation Verification
```
AFTER DELEGATION COMPLETE, VERIFY:
- Does it work as expected?
- Does it follow existing codebase patterns?
- Did expected results come out?
```

### Our Framework Gap
Our dispatch-context.md is less structured. No explicit MUST NOT section.

---

## Pattern 5: Intent Gate (Phase 0)

### Description
Classify every message before processing.

### Implementation
```
Phase 0 - Intent Gate (EVERY message)
│
├── Step 1: Identify Key Triggers
│   - External library mentioned → fire librarian background
│   - 2+ modules involved → fire explore background
│   - UI/UX change needed → delegate to frontend-engineer
│
├── Step 2: Assess Complexity
│   - Simple: Direct action
│   - Medium: Plan briefly, then act
│   - Complex: Full R-P-I workflow
│
└── Step 3: Route to Phase
    - Phase 1: Quick actions
    - Phase 2A: Research
    - Phase 2B: Implementation
    - Phase 2C: Review
    - Phase 3: Delivery
```

### Our Framework Gap
We don't have systematic pre-processing classification.

---

## Pattern 6: Agent Metadata for Orchestration

### Description
Agents carry structured metadata that enables dynamic orchestrator behavior.

### Interface
```typescript
interface AgentPromptMetadata {
  category: "exploration" | "advisor" | "specialist" | "utility"
  cost: "FREE" | "CHEAP" | "EXPENSIVE"
  triggers: DelegationTrigger[]
  useWhen?: string[]
  avoidWhen?: string[]
  keyTrigger?: string
  promptAlias?: string
  dedicatedSection?: string
}
```

### Usage
Sisyphus prompt is dynamically built from available agents:
```typescript
function buildDynamicSisyphusPrompt(availableAgents, tools, skills) {
  return [
    buildKeyTriggersSection(agents),
    buildToolSelectionTable(agents, tools, skills),
    buildDelegationTable(agents),
    buildOracleSection(agents),
    // ... more sections
  ].join("\n")
}
```

### Our Framework Gap
Our agent descriptions are prose, not structured metadata.

---

## Pattern 7: Preemptive Compaction

### Description
Compact before hitting hard limits, not after.

### Configuration
```typescript
const DEFAULT_THRESHOLD = 0.85  // 85% usage triggers compaction
const MIN_TOKENS_FOR_COMPACTION = 50000  // Don't compact tiny sessions
const COMPACTION_COOLDOWN_MS = 30000  // Prevent rapid-fire compaction
```

### Flow
```
message.updated event
    │
    ├── Check if assistant message finished
    ├── Get token usage: input + cache.read + output
    ├── Calculate ratio: totalUsed / contextLimit
    │
    ├── If ratio >= 0.85:
    │   ├── Show "Compacting..." toast
    │   ├── Inject compaction context
    │   ├── Call session.summarize()
    │   └── Resume with "Continue" prompt
    │
    └── Else: Continue normally
```

### Compaction Context
```markdown
When summarizing, MUST include:
1. User Requests (As-Is) - original wording
2. Final Goal - end deliverable
3. Work Completed - files, features, problems solved
4. Remaining Tasks - what's pending
5. MUST NOT Do - constraints, failed approaches
```

### Our Framework Gap
We recommend 40% checkpointing but don't auto-trigger.

---

## Pattern 8: Skill-Embedded MCP

### Description
Skills can bundle their own MCP servers.

### Frontmatter Format
```yaml
---
name: playwright
description: Browser automation skill
mcp:
  playwright:
    command: npx
    args: ["-y", "@anthropic-ai/mcp-playwright"]
---
```

### Or via mcp.json
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Invocation
```typescript
// Load skill → MCP server auto-starts
skill("playwright")

// Call MCP tools directly
skill_mcp({
  mcp_name: "playwright",
  tool_name: "browser_navigate",
  arguments: '{"url": "https://example.com"}'
})
```

### Our Framework Gap
Skills are pure markdown procedures, no capability bundling.

---

## Pattern 9: Error Recovery Cascade

### Description
Graceful handling of context window errors.

### Recovery Phases
```
Token Limit Error
    │
    ├── Phase 1: Dynamic Context Pruning (DCP)
    │   ├── Deduplicate tool calls
    │   ├── Supersede writes
    │   └── Purge old errors
    │
    ├── Phase 2: Aggressive Truncation
    │   ├── Find largest tool outputs
    │   ├── Truncate until under limit
    │   └── Track what was truncated
    │
    └── Phase 3: Session Summarization
        ├── Call LLM summarize
        ├── Inject compaction context
        └── Resume session
```

### Our Framework Gap
We recommend checkpointing but no automatic recovery.

---

## Pattern 10: Tool Selection Priority

### Description
Clear hierarchy for choosing how to accomplish a task.

### Priority Order
```
1. Skills (INVOKE FIRST if matching)
   - Highest priority - specialized procedures
   
2. Direct Tools (background-friendly)
   - explore, librarian in parallel
   
3. Agents (strategic delegation)
   - oracle for architecture
   - frontend-engineer for UI
```

### Table Format
```markdown
| Resource | Cost | When to Use |
|----------|------|-------------|
| skill:code-review | FREE | Before PR, after significant changes |
| explore (multiple) | FREE | Unfamiliar module structure |
| librarian | CHEAP | External library questions |
| oracle | EXPENSIVE | Architecture decisions |
```

### Our Framework Gap
We don't formalize tool/agent selection hierarchy.

---

## Synthesis: What Makes Their System Work

1. **Cost-Aware Routing** - Not all tasks need expensive models
2. **Structured Pruning** - Multiple strategies beyond summarization
3. **Protected State** - Critical context survives pressure
4. **Formalized Delegation** - No ambiguity in handoffs
5. **Early Classification** - Know what you're dealing with before acting
6. **Dynamic Composition** - Orchestrator adapts to available agents
7. **Proactive Management** - Act before problems, not after
8. **Capability Bundling** - Skills bring their own tools
9. **Graceful Degradation** - Multiple fallback strategies
10. **Clear Priorities** - When in doubt, follow the hierarchy
