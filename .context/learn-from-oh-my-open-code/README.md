# Session: Learn from oh-my-opencode

> **Date**: January 6, 2026
> **Purpose**: Analyze multi-agent context engineering patterns
> **Source**: https://github.com/code-yeongyu/oh-my-opencode

---

## Session Files

| File | Purpose | Status |
|------|---------|--------|
| [RUMSFELD-MATRIX.md](RUMSFELD-MATRIX.md) | Known/Unknown categorization of findings | ✅ Updated with research |
| [PATTERNS.md](PATTERNS.md) | 10 key patterns extracted from codebase | ✅ Complete |
| [INTEGRATION-PLAN.md](INTEGRATION-PLAN.md) | How to incorporate into our framework | ✅ Complete |
| [VS-CODE-AI-EXTENSION.md](VS-CODE-AI-EXTENSION.md) | VS Code AI extensibility research | ✅ NEW |
| [scratchpad.md](scratchpad.md) | User notes (read-only for agent) | 📝 User-managed |

---

## Research Session Summary

### Unknown Unknowns → Resolved

| Item | Resolution |
|------|------------|
| **Plugin Ecosystem** | ✅ Confirmed: oh-my-opencode is a plugin for OpenCode CLI (https://opencode.ai/), a terminal-based AI coding agent by SST |
| **Claude Code Integration** | ✅ Confirmed: Deliberate compatibility layer for migration, not legacy code |
| **Session Recovery** | ✅ Documented: Handles tool_result_missing, thinking_block_order, empty_content, token_limit errors |
| **Model Fallback Chains** | ✅ Partially: User config + installer settings; opened door to VS Code AI extension research |
| **Real-world Performance** | 🔴 Keep unknown: Need firsthand testing |

### New Discoveries

1. **VS Code AI Extension Framework** - Potential new path for our framework:
   - Chat Participant API (`@engineer`)
   - Language Model Tools (`#checkpoint`, `#compress`)
   - Full VS Code integration
   
2. **PreCompact Hook** - They preserve context before summarization

3. **Parallel Subagent Execution** - Their BackgroundManager enables async agent dispatch

---

## Key Discoveries (Original Analysis)

### 1. Sophisticated Context Management
- **Dynamic Context Pruning (DCP)**: Deduplication, supersede writes, purge errors
- **Protected Tools**: Some context should NEVER be pruned
- **Turn Protection**: Recent outputs more valuable than old
- **Preemptive Compaction**: Act at 85%, not 100%

### 2. Tiered Agent Architecture
```
Sisyphus (Opus) - Orchestrator
    │
    ├── explore (FREE) - Codebase grep
    ├── librarian (CHEAP) - External docs
    ├── frontend-engineer (CHEAP) - UI
    └── oracle (EXPENSIVE) - Architecture
```

### 3. Structured Delegation Protocol
7 mandatory sections: TASK, EXPECTED OUTCOME, REQUIRED SKILLS, REQUIRED TOOLS, MUST DO, MUST NOT DO, CONTEXT

### 4. Intent Gate (Phase 0)
Every message classified before processing. Key triggers route to appropriate handling.

### 5. Agent Metadata
Structured metadata (category, cost, triggers, useWhen, avoidWhen) enables dynamic orchestrator behavior.

---

## Updated Priority Actions

### High Priority (P0)

1. **Protected Tools Pattern** - Implement in our framework
2. **Turn Protection** - Recent context more valuable
3. **7-Section Delegation** - Enhance dispatch-context.md
4. **Session Recovery Patterns** - Error handling for long sessions

### Medium Priority (P1)

5. **VS Code Extension PoC** - Evaluate as distribution path
6. **Intent Gate** - Add Phase 0 classification
7. **DCP Strategies** - Granular pruning beyond summarization
8. **PreCompact Hook** - Context preservation before summarization

### Lower Priority (P2)

9. **Model Tiering** - Route by cost/capability
10. **Agent Metadata** - Structured orchestrator config
11. **Background Execution** - Async agent dispatch

---

## Context Loaded

Essential docs read:
- `docs/context-engineering.md` - Our WRITE/SELECT/COMPRESS/ISOLATE framework
- `docs/framework-design.md` - RPI workflow, agent model
- `docs/agent-spec.md` - Agent file structure
- `docs/skill-spec.md` - Skill file structure

Repository analyzed:
- `code-yeongyu/oh-my-opencode` - Multi-agent context engineering system

Web research conducted:
- OpenCode.ai documentation
- VS Code AI Extensibility APIs
