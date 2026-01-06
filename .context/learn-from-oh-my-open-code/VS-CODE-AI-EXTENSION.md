# VS Code AI Extension Framework Research

> **Date**: January 6, 2026 (Updated)
> **Source**: https://code.visualstudio.com/api/extension-guides/ai/
> **Purpose**: Evaluate VS Code's AI extensibility for our Context Engineering framework
> **Status**: Research complete, experiment defined

---

## Executive Summary

VS Code provides mature AI extensibility APIs that enable deep integration with GitHub Copilot. This document defines a **Proof of Concept (PoC) experiment** to validate whether our context engineering patterns can be effectively delivered as a VS Code extension.

### Key Decision: Chat Participant + Language Model Tools

After research, the recommended approach combines:
1. **Chat Participant** (`@engineer`) - Own the conversation flow, implement RPI workflow
2. **Language Model Tools** - Expose discrete capabilities (checkpoint, dispatch, compress)

This hybrid approach provides maximum flexibility while leveraging VS Code's distribution and integration.

---

## PoC Experiment Specification

### Goal Statement

> **Validate that a VS Code extension can deliver context engineering patterns (checkpoints, context compression, agent dispatch) with measurable improvement to developer workflow efficiency.**

### Hypotheses to Test

| ID | Hypothesis | Measurement | Success Criteria |
|----|------------|-------------|------------------|
| H1 | Chat Participant can maintain session context across turns | Count context preservation vs loss | 90%+ context retained across 10 turns |
| H2 | Language Model Tools can be invoked from Agent Mode | Tool invocation success rate | 95%+ successful invocations |
| H3 | Checkpoint/restore improves task resumption | Time to resume after interruption | <30 seconds to full context restore |
| H4 | Tool-based dispatch provides context isolation | Memory before/after agent delegation | Delegated tasks don't pollute parent context |
| H5 | Users can discover and invoke tools naturally | Usability test (3 users) | 80%+ can use without documentation |

### Measurable Outcomes

1. **Functional**: Extension activates, participant responds, tools execute
2. **Performance**: Response latency <2s for tool invocations
3. **Reliability**: <5% error rate across 100 test interactions
4. **Usability**: 3/5 test users complete standard workflow unassisted

### Scope Boundaries

**In Scope (PoC)**:
- Single chat participant `@engineer`
- Three language model tools: `#checkpoint`, `#dispatch`, `#compress`  
- Basic slash commands: `/plan`, `/implement`, `/checkpoint`
- File-based state persistence in `.context/` folder
- Works with VS Code 1.95+ and GitHub Copilot

**Out of Scope (Future)**:
- Tiered model selection (oh-my-opencode pattern)
- Protected tools / turn protection (requires context window access)
- Dynamic Context Pruning (requires token counting API)
- Multi-agent parallel execution
- VS Code Marketplace publishing

---

## 1. VS Code AI Extensibility Options

VS Code provides four main ways to extend AI capabilities:

### 1.1 Language Model Tool

**What it is**: Tools that extend **Agent Mode** with domain-specific capabilities.

**How it works**:
- Tools are automatically invoked based on user chat prompts
- Users can explicitly invoke with `#tool-name` syntax
- Full access to VS Code extension APIs
- Distribution via VS Marketplace

**Example Use Cases**:
- `#checkpoint` - Save/restore session state
- `#compress` - Trigger context compression
- `#dispatch` - Route to specialized agent

**Relevance**: ⭐⭐⭐⭐⭐ HIGH - Our tools could integrate directly into Copilot's agent mode

---

### 1.2 Chat Participant

**What it is**: Specialized assistants invoked with `@participant-name` syntax.

**How it works**:
- Handles entire chat interaction flow
- Receives user prompt, orchestrates response
- Can include custom slash commands (`/command`)
- Can suggest follow-up questions

**Example**:
```typescript
const engineer = vscode.chat.createChatParticipant('context-eng.engineer', handler);

// Handler receives:
// - request.prompt (user message)
// - request.command (e.g., "/plan")
// - context.history (chat history)
// - stream (response stream)
```

**Relevance**: ⭐⭐⭐⭐⭐ HIGH - Could create `@engineer` participant with RPI workflow

---

### 1.3 Language Model API

**What it is**: Direct programmatic access to AI models for custom features.

**How it works**:
```typescript
const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot' });
const response = await model.sendRequest(messages, options, token);
```

**Use Cases**:
- AI-powered code actions
- Smart refactoring suggestions
- Custom hover providers with AI explanations

**Relevance**: ⭐⭐⭐ MEDIUM - Lower priority, but useful for integrations

---

### 1.4 MCP Tool

**What it is**: Model Context Protocol tools running outside VS Code.

**How it works**:
- Local or remote service via stdio/SSE
- JSON configuration or programmatic setup
- No access to VS Code APIs directly

**Relevance**: ⭐⭐ LOW - We already use MCP, this is an alternative distribution

---

## 2. Potential Architecture: @Engineer Chat Participant

### 2.1 Registration

```json
{
  "contributes": {
    "chatParticipants": [
      {
        "id": "context-engineering.engineer",
        "name": "engineer",
        "fullName": "The Engineer",
        "description": "Multi-agent context engineering assistant",
        "isSticky": true,
        "commands": [
          { "name": "plan", "description": "Research and plan implementation" },
          { "name": "implement", "description": "Execute planned implementation" },
          { "name": "checkpoint", "description": "Save current session state" },
          { "name": "dispatch", "description": "Delegate to specialized agent" }
        ]
      }
    ]
  }
}
```

### 2.2 Handler Implementation

```typescript
const handler: vscode.ChatRequestHandler = async (request, context, stream, token) => {
  // Phase 0: Intent Classification
  const intent = classifyIntent(request.prompt, request.command);
  
  // Route based on command or detected intent
  switch (intent.type) {
    case 'plan':
      return await handlePlanPhase(request, context, stream);
    case 'implement':
      return await handleImplementPhase(request, context, stream);
    case 'checkpoint':
      return await handleCheckpoint(request, context, stream);
    case 'dispatch':
      return await dispatchToAgent(intent.agent, request, stream);
    default:
      return await handleDefaultConversation(request, context, stream);
  }
};
```

### 2.3 Slash Commands

| Command | Purpose | Maps to Our Framework |
|---------|---------|----------------------|
| `/plan` | Research-first exploration | Research phase of RPI |
| `/implement` | Execute with checkpoints | Implement phase of RPI |
| `/checkpoint` | Save progress | CHECKPOINT.md creation |
| `/compress` | Reduce context | COMPRESS strategy |
| `/dispatch backend-api` | Route to specialist | Agent delegation |

---

## 3. Potential Language Model Tools

### 3.1 Context Management Tools

```typescript
vscode.lm.registerTool('context-engineering.checkpoint', {
  displayName: 'Checkpoint',
  description: 'Save current session state for recovery',
  inputSchema: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'Session summary' },
      progress: { type: 'number', description: 'Completion percentage' }
    }
  },
  async invoke(options, token) {
    // Save checkpoint to .context/CHECKPOINT.md
  }
});
```

### 3.2 Agent Dispatch Tools

```typescript
vscode.lm.registerTool('context-engineering.dispatch', {
  displayName: 'Dispatch to Agent',
  description: 'Route task to specialized agent',
  inputSchema: {
    type: 'object',
    properties: {
      agent: { type: 'string', enum: ['backend-api', 'frontend-dev', 'researcher'] },
      task: { type: 'string' },
      context: { type: 'string' }
    }
  },
  async invoke(options, token) {
    // Use runSubagent with context isolation
  }
});
```

---

## 4. Questions to Research Further

### 4.1 Context Window Management

**Question**: Can we detect context window usage in VS Code chat sessions?

**Importance**: Critical for implementing our COMPRESS strategy triggers (40%/80% thresholds).

### 4.2 Parallel Subagent Execution

**Question**: Can chat participants invoke multiple language model requests in parallel?

**Importance**: Would enable our multi-agent dispatch pattern.

**Hypothesis**: Yes - standard async/await patterns should allow this:
```typescript
const [backendResult, frontendResult] = await Promise.all([
  dispatchToAgent('backend-api', task1),
  dispatchToAgent('frontend-dev', task2)
]);
```

### 4.3 Session State Persistence

**Question**: How can we persist chat participant state across sessions?

**Options**:
- VS Code `ExtensionContext.globalState`
- Workspace `.context/` folder
- External checkpoint file

### 4.4 Token Counting

**Question**: Does VS Code expose token counting for chat messages?

**Importance**: Required for threshold-based compression triggers.

---

## 5. Advantages of VS Code Extension Approach

| Aspect | OpenCode CLI Plugin | VS Code Extension |
|--------|---------------------|-------------------|
| Distribution | Manual install | VS Marketplace (millions of users) |
| Integration | Terminal-based | Native editor integration |
| Context Access | File system | Full editor state + file system |
| Model Access | Configured providers | Copilot (auto-configured) + custom |
| User Adoption | Niche CLI users | Massive VS Code user base |
| Development | Bun/TypeScript | Node/TypeScript |

---

## 6. Disadvantages / Risks

1. **Copilot Dependency**: Most features require GitHub Copilot subscription
2. **API Stability**: Chat/LM APIs may change as they're relatively new
3. **Limited Control**: Can't control underlying model behavior
4. **Context Limits**: Still subject to model context window limits
5. **Review Process**: Marketplace review can delay releases

---

## 7. PoC Experiment Phases

### Phase 1: Foundation (Day 1-2)
**Goal**: Minimal viable extension that activates and responds

#### Deliverables
- [ ] Scaffolded VS Code extension project
- [ ] Chat participant `@engineer` registered and responding
- [ ] Basic `/plan` command that echoes user input
- [ ] Extension loads in VS Code Extension Host

#### Validation
```bash
# Extension activates
✓ No activation errors in Extension Host console

# Participant responds  
✓ @engineer hello world → receives response

# Command works
✓ @engineer /plan implement auth → receives planning response
```

#### Technical Setup
```
vscode-context-engineering/
├── package.json           # Extension manifest
├── src/
│   ├── extension.ts       # Activation
│   └── participant.ts     # Chat handler
└── tsconfig.json
```

---

### Phase 2: Core Tools (Day 3-4)
**Goal**: Implement three language model tools

#### Deliverables
- [ ] `#checkpoint` tool - saves session state to `.context/CHECKPOINT.md`
- [ ] `#dispatch` tool - formats delegation prompt (7-section format)
- [ ] `#compress` tool - summarizes conversation history
- [ ] Tools visible in Agent Mode tools picker

#### Tool Specifications

**#checkpoint**
```typescript
{
  name: "context-engineering_checkpoint",
  displayName: "Checkpoint",
  description: "Save current session state for recovery",
  inputSchema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "Brief session summary" },
      progress: { type: "number", description: "Completion percentage 0-100" },
      nextSteps: { type: "array", items: { type: "string" } }
    },
    required: ["summary"]
  }
}
```

**#dispatch**
```typescript
{
  name: "context-engineering_dispatch",
  displayName: "Dispatch to Agent",
  description: "Delegate task to specialized agent with context isolation",
  inputSchema: {
    type: "object",
    properties: {
      agent: { type: "string", enum: ["backend-api", "frontend-dev", "researcher"] },
      task: { type: "string", description: "Atomic task description" },
      mustDo: { type: "array", items: { type: "string" } },
      mustNotDo: { type: "array", items: { type: "string" } },
      context: { type: "string", description: "Relevant file paths, patterns" }
    },
    required: ["agent", "task"]
  }
}
```

**#compress** 
```typescript
{
  name: "context-engineering_compress",
  displayName: "Compress Context",
  description: "Summarize conversation to reduce context usage",
  inputSchema: {
    type: "object",
    properties: {
      preserveTools: { type: "array", items: { type: "string" } },
      turnsToKeep: { type: "number", default: 3 }
    }
  }
}
```

#### Validation
```bash
# Tools register
✓ All 3 tools appear in vscode.lm.tools list

# Tools execute
✓ #checkpoint creates .context/CHECKPOINT.md
✓ #dispatch returns 7-section formatted prompt
✓ #compress returns condensed conversation summary
```

---

### Phase 3: Integration (Day 5-6)
**Goal**: Wire tools into participant, implement slash commands

#### Deliverables
- [ ] `/plan` command - Research phase of RPI
- [ ] `/implement` command - Implementation phase with checkpoints
- [ ] `/checkpoint` command - Quick save current state
- [ ] History context passed between turns
- [ ] Follow-up suggestions after responses

#### Slash Command Behavior

| Command | Behavior |
|---------|----------|
| `/plan <goal>` | Research mode: gather context, don't edit files |
| `/implement <spec>` | Edit mode: make changes, create checkpoints |
| `/checkpoint [note]` | Save state with optional note |

#### Validation
```bash
# Commands work
✓ @engineer /plan add user authentication → returns research summary
✓ @engineer /implement → edits files based on plan
✓ @engineer /checkpoint → creates timestamped checkpoint

# Context persists
✓ Follow-up questions reference previous turns
```

---

### Phase 4: Validation (Day 7)
**Goal**: Validate hypotheses with real-world testing

#### Test Protocol
1. **Solo Testing**: Developer uses extension for 2 hours on real task
2. **Usability Testing**: 3 colleagues attempt standard workflow
3. **Metric Collection**: Log all tool invocations and outcomes

#### Metrics Dashboard
```
┌─────────────────────────────────────────────────┐
│ PoC Validation Metrics                          │
├─────────────────────────────────────────────────┤
│ H1: Context Retention     [██████████] 95%      │
│ H2: Tool Invocation       [█████████░] 92%      │
│ H3: Resume Time           [████████░░] 25s avg  │
│ H4: Context Isolation     [███████░░░] 70%      │
│ H5: Usability Score       [████████░░] 3/5 pass │
├─────────────────────────────────────────────────┤
│ Overall: PoC VALIDATED / NEEDS WORK / FAILED    │
└─────────────────────────────────────────────────┘
```

---

## 8. Technical Decisions & Rationale

### Why Chat Participant over MCP Server?

| Factor | Chat Participant | MCP Server |
|--------|------------------|------------|
| VS Code API Access | ✅ Full | ❌ None |
| Distribution | ✅ Marketplace | ❌ Manual setup |
| Deep Editor Integration | ✅ Yes | ❌ No |
| Cross-platform | ❌ VS Code only | ✅ Any MCP client |

**Decision**: Chat Participant for PoC. MCP Server as future option.

### Why Language Model Tools over pure Chat Participant?

**Tools provide**:
1. **Discoverability**: Appear in tools picker, auto-invoked by Agent Mode
2. **Composability**: Can be used by other extensions
3. **Explicit invocation**: Users can `#checkpoint` anywhere

**Chat Participant provides**:
1. **Conversation ownership**: Control entire interaction flow
2. **Custom commands**: `/plan`, `/implement`, etc.
3. **Follow-ups**: Suggest next steps

**Decision**: Hybrid approach. Participant orchestrates, tools execute.

### State Persistence Strategy

| Option | Pros | Cons |
|--------|------|------|
| ExtensionContext.globalState | Survives restarts | Per-machine, not versioned |
| Workspace `.context/` folder | Versioned, portable | Clutter in repo |
| External service | Cross-device sync | Dependency, complexity |

**Decision**: `.context/` folder for PoC. Add `globalState` fallback.

---

## 9. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API instability (Chat API is relatively new) | High | Medium | Pin to stable VS Code version |
| Copilot subscription required | Medium | High | Document requirement clearly |
| Context window limits still apply | Medium | High | Implement compression tool |
| Tool confirmation friction | Low | Medium | Provide clear confirmation messages |
| Token counting not exposed | High | Medium | Estimate based on character count |

---

## 10. Success Criteria Summary

### Minimum Viable PoC (Must Have)
- [ ] Extension loads without errors
- [ ] `@engineer` participant responds to prompts
- [ ] At least 1 tool (`#checkpoint`) works in Agent Mode
- [ ] Session state persists to `.context/CHECKPOINT.md`

### Target PoC (Should Have)
- [ ] All 3 tools functional
- [ ] All 3 slash commands working
- [ ] 80%+ usability test pass rate
- [ ] <2s tool response latency

### Stretch Goals (Nice to Have)
- [ ] Participant detection (auto-routing without @mention)
- [ ] Follow-up suggestions after responses
- [ ] Progress indicators during tool execution

---

## 11. Next Actions

1. **Immediate**: Create extension scaffold with `yo code`
2. **Day 1**: Register chat participant, implement basic handler
3. **Day 2**: Add `/plan` command, test context passing
4. **Day 3**: Implement `#checkpoint` tool
5. **Day 4**: Implement `#dispatch` and `#compress` tools
6. **Day 5**: Wire tools into participant, add remaining commands
7. **Day 6**: Polish, error handling, confirmation messages
8. **Day 7**: Validation testing, metrics collection

---

## 8. Sample Extension Structure

```
vscode-context-engineering/
├── package.json           # Extension manifest with chat participant
├── src/
│   ├── extension.ts       # Activation + registration
│   ├── participant/
│   │   ├── handler.ts     # Chat request handler
│   │   ├── commands/
│   │   │   ├── plan.ts
│   │   │   ├── implement.ts
│   │   │   └── checkpoint.ts
│   │   └── intent.ts      # Intent classification
│   ├── tools/
│   │   ├── checkpoint.ts
│   │   ├── dispatch.ts
│   │   └── compress.ts
│   ├── context/
│   │   ├── manager.ts     # Context state management
│   │   └── compression.ts # Compression strategies
│   └── agents/
│       ├── dispatcher.ts  # Agent routing
│       └── definitions/   # Agent configurations
├── .context/              # Workspace state storage
└── README.md
```

---

## References

- [AI Extensibility Overview](https://code.visualstudio.com/api/extension-guides/ai/ai-extensibility-overview)
- [Language Model Tools API](https://code.visualstudio.com/api/extension-guides/ai/language-model-tools)
- [Chat Participant API](https://code.visualstudio.com/api/extension-guides/ai/chat)
- [Language Model API](https://code.visualstudio.com/api/extension-guides/ai/language-model)
- [Chat Extension Sample](https://github.com/microsoft/vscode-extension-samples/tree/main/chat-sample)
