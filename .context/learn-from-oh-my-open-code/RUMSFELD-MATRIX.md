# Rumsfeld Matrix: oh-my-opencode Analysis

> **Source**: https://github.com/code-yeongyu/oh-my-opencode
> **Date**: January 6, 2026
> **Purpose**: Categorize what we know and don't know about their multi-agent context engineering approach

---

## 1. KNOWN KNOWNS
*Things we understand clearly from the codebase*

### 1.1 Agent Architecture

| Component | Implementation | Our Framework Equivalent |
|-----------|---------------|-------------------------|
| **Sisyphus** | Primary orchestrator with extended thinking (Claude Opus 4.5) | TheEngineer |
| **explore** | Fast codebase grep agent (FREE model tier) | Implementer with search focus |
| **librarian** | External docs research (Claude Sonnet) | Researcher agent |
| **oracle** | Strategic advisor (GPT-5.2) with high reasoning | N/A - we don't have this tier |
| **frontend-ui-ux-engineer** | UI generation specialist (Gemini) | frontend-dev specialist |
| **document-writer** | Technical docs (Gemini Flash) | N/A - we inline this |
| **multimodal-looker** | PDF/image analysis (Gemini Flash) | visual-qa agent |

### 1.2 Context Management Strategies

| Strategy | Their Implementation | Status |
|----------|---------------------|--------|
| **Preemptive Compaction** | Triggers at 85% context window usage | Known - We use 40%/80% thresholds |
| **Dynamic Context Pruning (DCP)** | Deduplication, supersede writes, purge errors | Known - Similar to our COMPRESS |
| **Tool Output Truncation** | Dynamic truncation based on remaining context | Known - We call this observation masking |
| **Compaction Context Injector** | Preserves critical context during compaction | Known - We save to CHECKPOINT.md |

### 1.3 Delegation Protocol

Their mandatory 7-section delegation prompt:
```
1. TASK: Atomic, specific goal
2. EXPECTED OUTCOME: Concrete deliverables with success criteria  
3. REQUIRED SKILLS: Which skill to invoke
4. REQUIRED TOOLS: Explicit tool whitelist
5. MUST DO: Exhaustive requirements
6. MUST NOT DO: Forbidden actions
7. CONTEXT: File paths, existing patterns, constraints
```

**Our equivalent**: dispatch-context.md pattern (less formalized)

### 1.4 Skills System

- Skills stored in `.opencode/skill/` or `~/.config/opencode/skill/`
- Frontmatter metadata: name, description, model, agent, allowed-tools
- Can embed MCP server configurations
- Lazy loading of skill content
- Scoped: builtin, config, user, project, opencode, opencode-project

### 1.5 Hook System

Extensive hook lifecycle:
- `preemptive-compaction` - Auto-compact before limits
- `context-window-monitor` - Track usage
- `tool-output-truncator` - Reduce tool output size
- `compaction-context-injector` - Preserve state during compaction
- `anthropic-context-window-limit-recovery` - Handle token limit errors

---

## 2. KNOWN UNKNOWNS
*Things we know we need to learn more about*

### 2.1 Multi-Model Orchestration

**Question**: How do they efficiently route tasks to different models?

**Evidence**:
- Sisyphus (Opus) orchestrates
- explore uses FREE tier models (grok-code, glm-4.7)
- librarian uses mid-tier (Sonnet)
- oracle uses premium reasoning (GPT-5.2)

**Gap in our framework**: We don't have tiered model selection.

### 2.2 Background Agent Pattern

**Question**: How does their background task system work?

**Evidence**:
```typescript
run_in_background: tool.schema.boolean().describe(
  "REQUIRED. true: run asynchronously (use background_output to get results)"
)
```

**Gap**: We dispatch to subagents but don't have async/background execution patterns.

### 2.3 Phase 0 - Intent Gate

**Question**: How does their "every message" intent analysis work?

**Evidence**: Sisyphus has "Phase 0 - Intent Gate (EVERY message)" with key triggers.

**Gap**: We don't have systematic intent classification before processing.

### 2.4 Dynamic Prompt Building

**Question**: How exactly does `sisyphus-prompt-builder.ts` construct context-aware prompts?

**Evidence**:
- `buildKeyTriggersSection()` - Dynamic trigger list
- `buildToolSelectionTable()` - Priority: Skills → Direct Tools → Agents
- `buildDelegationTable()` - Agent routing table
- Agents have metadata that builds into Sisyphus prompt

**Gap**: Our agent prompts are static, not dynamically composed.

### 2.5 Pruning Strategies

**Question**: What are the exact algorithms for each pruning strategy?

**Evidence**:
- Deduplication: Remove duplicate tool calls (same tool + same args)
- Supersede Writes: Prune write inputs when file subsequently read
- Purge Errors: Remove errored tool inputs after N turns

**Gap**: We summarize but don't have granular pruning strategies.

---

## 3. UNKNOWN KNOWNS
*Tacit knowledge embedded in their system we might miss*

### 3.1 Tool Signature Deduplication

They track tool call signatures to remove duplicates:
```typescript
export function createToolSignature(toolName: string, input: unknown): string {
  // Creates deterministic signature for deduplication
}
```

**Insight**: Not just "compress context" but "identify semantic duplicates."

### 3.2 Turn Protection

```typescript
turn_protection: z.object({
  enabled: z.boolean().default(true),
  turns: z.number().min(1).max(10).default(3),
})
```

**Insight**: Recent tool outputs are protected from pruning. We don't consider recency.

### 3.3 Protected Tools List

```typescript
protected_tools: z.array(z.string()).default([
  "task", "todowrite", "todoread",
  "lsp_rename", "lsp_code_action_resolve",
  "session_read", "session_write", "session_search",
])
```

**Insight**: Some tools should NEVER be pruned regardless of context pressure.

### 3.4 File Operation Tracking

```typescript
fileOperations: Map<string, FileOperation[]>
```

**Insight**: They track write→read sequences to know when writes can be pruned.

### 3.5 Agent Metadata for Orchestration

```typescript
export interface AgentPromptMetadata {
  category: AgentCategory  // "exploration", "advisor", "specialist", "utility"
  cost: AgentCost          // "FREE", "CHEAP", "EXPENSIVE"
  triggers: DelegationTrigger[]
  useWhen?: string[]
  avoidWhen?: string[]
  keyTrigger?: string
}
```

**Insight**: Agents have structured metadata that the orchestrator uses to decide routing.

---

## 4. UNKNOWN UNKNOWNS → RESEARCH FINDINGS
*Areas where we didn't know what we were missing — now resolved through research*

### 4.1 Real-World Performance ✅ KEEP AS UNKNOWN UNKNOWN

- How does their system perform on actual tasks?
- What failure modes have they encountered?
- How often does preemptive compaction trigger in practice?

> **Decision**: Leave as Unknown Unknown until we see it firsthand. Even with positive reviews, we need tangible evidence from our own testing.

---

### 4.2 Plugin Ecosystem ✅ RESOLVED → KNOWN KNOWN

**CONFIRMED**: oh-my-opencode is a **plugin** built specifically for **OpenCode** (https://opencode.ai/).

**What is OpenCode?**
- An **open source AI coding agent** built by SST (creators of terminal.shop)
- A **terminal-based CLI tool** similar to Claude Code but 100% open source
- Provider-agnostic: works with Claude, OpenAI, Google, or local models
- Has built-in agents: `build` (full access), `plan` (read-only analysis)
- Plugin system via `opencode.json` configuration
- Config stored at `~/.config/opencode/opencode.json`

**Plugin Architecture Example**:
```json
{
  "plugin": ["oh-my-opencode", "opencode-antigravity-auth@1.2.7"],
  "sisyphus_agent": { "disabled": false, "planner_enabled": true }
}
```

**Key Insight**: oh-my-opencode patterns are designed for a **CLI/terminal** context, not VS Code. The patterns (DCP, hooks, tiered agents) are excellent and transferable, but the distribution mechanism differs from VS Code extensions.

---

### 4.3 Claude Code Integration ✅ RESOLVED → KNOWN KNOWN

**CONFIRMED**: This is a **deliberate compatibility layer**, not legacy code.

**What it does**:
- Reads Claude Code's `settings.json` hook configurations from:
  - `~/.claude/settings.json` (user level)
  - `./.claude/settings.json` (project level)
  - `./.claude/settings.local.json` (local, git-ignored)
- Executes the same hook types: `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`, `PreCompact`
- Loads commands from `~/.claude/commands/*.md`
- Loads skills from `~/.claude/skills/*/SKILL.md`
- Can be toggled off with `"claude_code": { "hooks": false }`

**Why they did this**: 
> "If you were using Claude Code, your existing config just works."

This is a **user migration strategy** to attract Claude Code users to OpenCode. It's intentional compatibility for adoption, not accidental leftover code.

**Insight for us**: This is a clever migration pattern. If we build tools competing with existing solutions, offering compatibility layers reduces adoption friction.

---

### 4.4 Model Fallback Chains ✅ PARTIALLY RESOLVED

**Their Approach**:
```typescript
// Fallback logic in createBuiltinAgents:
// 1. User config override
// 2. Installer settings (claude max20, gemini antigravity)
// 3. Default model
```

**How they handle it**: Users configure subscription availability during install (`--claude=yes --chatgpt=no --gemini=yes`), and agents auto-select appropriate models based on what's available.

**NEW DISCOVERY: VS Code Extension AI Framework**

VS Code has a comprehensive **AI Extensibility API** (documented at code.visualstudio.com):

| Extension Point | Capability | Relevance |
|----------------|-----------|-----------|
| **Language Model Tool** | Extend agent mode with domain-specific tools | High - Could add our context engineering tools |
| **Chat Participant** | Create @-mentionable assistants for chat | High - Could create @engineer participant |
| **Language Model API** | Direct programmatic access to AI models | High - Build custom AI features |
| **MCP Tool** | Integrate external services via Model Context Protocol | Medium - Already using MCP |
| **Inline Completions** | Custom code completion providers | Low - Not our focus |

**Key APIs Available**:
- `vscode.lm.tools` - Access available language model tools
- `vscode.chat.createChatParticipant()` - Register chat participants
- `vscode.LanguageModelChatProvider` - Provide custom language models
- Full access to VS Code extension APIs from tools

**Potential for Our Framework**:
1. **Chat Participant**: Create `@engineer` that uses our RPI workflow
2. **Language Model Tool**: Expose checkpoint, context compression as tools
3. **Custom Agent Mode**: Our tiered agent dispatch as VS Code tools

> **Next Step**: Create separate research file on VS Code AI extension possibilities.

---

### 4.5 Session Recovery ✅ RESOLVED → KNOWN KNOWN

**CONFIRMED**: Session recovery is a critical reliability feature for long-running AI sessions.

**Problem Scenarios They Handle**:

| Error Type | Recovery Strategy |
|------------|-------------------|
| `tool_result_missing` | Inject "Operation cancelled by user" for orphaned tool calls |
| `thinking_block_order` | Prepend thinking blocks to fix malformed message structure |
| `thinking_disabled_violation` | Strip thinking blocks from messages when model doesn't support |
| `empty_content_message` | Replace empty text parts with "[user interrupted]" placeholder |
| `token_limit_exceeded` | Auto-compact via summarization + truncate large tool outputs |

**Recovery Flow**:
```
session.error → detectErrorType() → abort session → apply fix → resume session
```

**Key Hooks**:
- `session-recovery` - Handles structural message errors
- `anthropic-context-window-limit-recovery` - Token limit overflow
- `todo-continuation-enforcer` - Resume incomplete tasks after recovery

**Why This Complexity Exists**: Long AI coding sessions are fragile. Users press ESC mid-tool, context overflows, API errors occur. Without recovery, users lose session progress.

**Insight for Our Framework**: We should implement similar recovery for:
1. Checkpoint restoration after crashes
2. Graceful handling of context overflow
3. Resume protocols after interruption

---

## 5. NEW UNKNOWN UNKNOWNS DISCOVERED

### 5.1 Parallel Subagent Execution

Their `BackgroundManager` allows async agent execution:
```typescript
run_in_background: tool.schema.boolean()
```

**Question**: Can VS Code's chat/agent system support parallel subagent execution? If so, this could dramatically speed up multi-agent workflows.

### 5.2 PreCompact Hook

They have a `PreCompact` hook that injects additional context before summarization:
```typescript
executePreCompactHooks() → { context: string[] }
```

**Question**: What critical context do they preserve during compaction that we might be losing?

### 5.3 Interactive Bash Sessions

```typescript
interactive_bash_session
```

**Question**: How do they maintain bash session state across tool calls?

---

## 6. PRIORITY LEARNINGS FOR OUR FRAMEWORK

### High Priority (Implement Soon)

1. **Protected Tools Pattern** - Some tools should never be pruned
2. **Turn Protection** - Recent outputs are more valuable
3. **Delegation Protocol Structure** - Formalize our dispatch format
4. **Intent Gate (Phase 0)** - Classify before acting
5. **Session Recovery Patterns** - Graceful error handling *(NEW)*

### Medium Priority (Design Further)

5. **Model Tiering** - Route tasks to appropriate cost tiers
6. **Background Execution** - Async agent dispatch
7. **Dynamic Prompt Building** - Compose orchestrator prompt from agent metadata
8. **Pruning Strategies** - Granular alternatives to summarization
9. **VS Code Extension Architecture** - Explore AI extensibility APIs *(NEW)*

### Low Priority (Track for Later)

10. **Plugin System** - Extensibility architecture (now understood as OpenCode-specific)
11. **Claude Code Compatibility** - Migration layer pattern
12. **MCP Integration** - Skill-embedded MCP servers

---

## 7. OPEN QUESTIONS FOR RESEARCH

1. How does their 85% threshold compare to our 40%/80%? Is earlier better?
2. Is deduplication sufficient, or do we need summarization too?
3. How do they handle cross-agent context sharing?
4. What's the token overhead of their metadata-driven prompt building?
5. How do they measure "cost" of agents vs value delivered?
6. **NEW**: Can we use VS Code Chat Participant API for our RPI workflow?
7. **NEW**: Can VS Code Language Model Tools support parallel invocation?

---

## 8. RESEARCH SUMMARY

| Original Unknown | Status | Key Finding |
|------------------|--------|-------------|
| Real-world Performance | ✅ Keep Unknown | Need firsthand evidence |
| Plugin Ecosystem | ✅ Resolved | OpenCode CLI plugin system (not VS Code) |
| Claude Code Integration | ✅ Resolved | Deliberate migration/compatibility layer |
| Model Fallback Chains | ✅ Partially | User config + installer settings |
| Session Recovery | ✅ Resolved | Critical reliability for long sessions |

**New Doors Opened**:
- VS Code AI Extension Framework (potential path for our framework)
- PreCompact hooks for context preservation
- Parallel subagent execution patterns

---

## Next Steps

1. ~~Create `PATTERNS.md` - Extract reusable patterns from their code~~ ✅ Done
2. ~~Create `INTEGRATION-PLAN.md` - How to incorporate learnings~~ ✅ Done
3. **NEW**: Create `VS-CODE-AI-EXTENSION.md` - Research VS Code AI framework
4. Update `docs/context-engineering.md` with new strategies
5. Prototype protected tools and turn protection
