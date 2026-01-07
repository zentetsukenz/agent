# VS Code Context Engineering PoC — Implementation Plan

> **Created**: January 6, 2026
> **Location**: `/context-engineering-poc/`
> **Timeline**: 7 days (Phase 1-4)
> **Status**: Ready to begin

---

## Executive Summary

Build a VS Code extension that delivers context engineering patterns (checkpoints, context compression, agent dispatch) via GitHub Copilot integration. This PoC validates whether these patterns can measurably improve developer workflow efficiency.

### Core Deliverables
1. **Chat Participant**: `@engineer` with RPI workflow commands
2. **Language Model Tools**: `#checkpoint`, `#dispatch`, `#compress`
3. **State Persistence**: `.context/` folder for session checkpoints

---

## Hypotheses Under Test

| ID | Hypothesis | Success Criteria |
|----|------------|------------------|
| H1 | Context retained across turns | 90%+ retention over 10 turns |
| H2 | Tools invokable from Agent Mode | 95%+ invocation success |
| H3 | Checkpoint improves resume time | <30s to restore |
| H4 | Dispatch provides isolation | Parent context unpolluted |
| H5 | Natural tool discovery | 80%+ unassisted use |

---

## Project Structure

```
context-engineering-poc/
├── package.json                    # Extension manifest
├── tsconfig.json                   # TypeScript config
├── README.md                       # Extension documentation
├── IMPLEMENTATION-PLAN.md          # This file
│
├── src/
│   ├── extension.ts                # Activation entry point
│   │
│   ├── participant/
│   │   ├── index.ts                # Chat participant registration
│   │   ├── handler.ts              # Main request handler
│   │   └── commands/
│   │       ├── plan.ts             # /plan - Research phase
│   │       ├── implement.ts        # /implement - Edit phase
│   │       └── checkpoint.ts       # /checkpoint - Quick save
│   │
│   ├── tools/
│   │   ├── index.ts                # Tool registration
│   │   ├── checkpoint.ts           # #checkpoint tool
│   │   ├── dispatch.ts             # #dispatch tool
│   │   └── compress.ts             # #compress tool
│   │
│   ├── context/
│   │   ├── manager.ts              # Session state management
│   │   ├── persistence.ts          # File-based storage
│   │   └── compression.ts          # Context compression logic
│   │
│   └── utils/
│       ├── markdown.ts             # Markdown generation
│       └── logger.ts               # Structured logging
│
├── test/
│   ├── suite/
│   │   ├── extension.test.ts       # Activation tests
│   │   ├── tools.test.ts           # Tool invocation tests
│   │   └── participant.test.ts     # Chat handler tests
│   └── runTest.ts                  # Test runner
│
└── .vscode/
    ├── launch.json                 # Debug configurations
    └── tasks.json                  # Build tasks
```

---

## Phase 1: Foundation (Day 1-2)

### Goal
Minimal viable extension that activates and responds to `@engineer`.

### Tasks

#### 1.1 Project Scaffold
- [ ] Initialize with `yo code` (TypeScript extension)
- [ ] Configure `package.json` with chat participant contribution
- [ ] Set up ESLint + Prettier
- [ ] Configure VS Code debug launch

#### 1.2 Chat Participant Registration
```json
// package.json contribution
{
  "contributes": {
    "chatParticipants": [{
      "id": "context-engineering.engineer",
      "name": "engineer",
      "fullName": "The Engineer",
      "description": "Context engineering assistant with RPI workflow",
      "isSticky": true,
      "commands": [
        { "name": "plan", "description": "Research and plan implementation" },
        { "name": "implement", "description": "Execute planned implementation" },
        { "name": "checkpoint", "description": "Save current session state" }
      ]
    }]
  }
}
```

#### 1.3 Basic Handler
```typescript
// src/participant/handler.ts
export async function handleRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  // Echo mode for validation
  stream.markdown(`**Received**: ${request.prompt}\n\n`);
  
  if (request.command) {
    stream.markdown(`**Command**: /${request.command}`);
  }
  
  return { metadata: { command: request.command } };
}
```

### Validation Criteria
```
✓ Extension activates without errors
✓ @engineer appears in chat participants
✓ @engineer hello → receives response
✓ @engineer /plan test → shows command received
```

---

## Phase 2: Core Tools (Day 3-4)

### Goal
Implement three language model tools that work in Agent Mode.

### Tasks

#### 2.1 Checkpoint Tool (`#checkpoint`)

**Schema**:
```typescript
{
  name: "context-engineering_checkpoint",
  displayName: "Checkpoint",
  description: "Save current session state for later recovery",
  inputSchema: {
    type: "object",
    properties: {
      summary: { 
        type: "string", 
        description: "Brief summary of session progress" 
      },
      progress: { 
        type: "number", 
        description: "Completion percentage (0-100)" 
      },
      completedWork: { 
        type: "array", 
        items: { type: "string" },
        description: "List of completed items"
      },
      remainingWork: { 
        type: "array", 
        items: { type: "string" },
        description: "List of remaining items"
      },
      keyDecisions: {
        type: "array",
        items: { type: "string" },
        description: "Important decisions made"
      }
    },
    required: ["summary"]
  }
}
```

**Output**: Creates `.context/CHECKPOINT.md` with structured session state.

#### 2.2 Dispatch Tool (`#dispatch`)

**Schema**:
```typescript
{
  name: "context-engineering_dispatch",
  displayName: "Dispatch to Agent",
  description: "Delegate task to specialized agent with 7-section format",
  inputSchema: {
    type: "object",
    properties: {
      agent: { 
        type: "string", 
        enum: ["backend-api", "frontend-dev", "researcher", "visual-qa"],
        description: "Target agent for delegation"
      },
      task: { 
        type: "string", 
        description: "Atomic task description (one action)" 
      },
      expectedOutcome: {
        type: "string",
        description: "Concrete deliverable with success criteria"
      },
      mustDo: { 
        type: "array", 
        items: { type: "string" },
        description: "Exhaustive requirements"
      },
      mustNotDo: { 
        type: "array", 
        items: { type: "string" },
        description: "Forbidden actions"
      },
      context: { 
        type: "string", 
        description: "File paths, patterns, constraints" 
      }
    },
    required: ["agent", "task"]
  }
}
```

**Output**: Returns 7-section formatted delegation prompt.

#### 2.3 Compress Tool (`#compress`)

**Schema**:
```typescript
{
  name: "context-engineering_compress",
  displayName: "Compress Context",
  description: "Summarize conversation to reduce context usage",
  inputSchema: {
    type: "object",
    properties: {
      preserveTools: { 
        type: "array", 
        items: { type: "string" },
        description: "Tool outputs to preserve (e.g., checkpoint, todowrite)"
      },
      turnsToKeep: { 
        type: "number", 
        default: 3,
        description: "Number of recent turns to keep uncompressed"
      },
      preserveDecisions: {
        type: "boolean",
        default: true,
        description: "Keep key decisions in summary"
      }
    }
  }
}
```

**Output**: Returns compressed conversation summary.

### Validation Criteria
```
✓ All 3 tools appear in vscode.lm.tools
✓ #checkpoint creates .context/CHECKPOINT.md
✓ #dispatch returns 7-section format
✓ #compress returns condensed summary
✓ Tools work in Agent Mode (auto-invocation)
```

---

## Phase 3: Integration (Day 5-6)

### Goal
Wire tools into participant, implement slash commands with full workflow.

### Tasks

#### 3.1 Command Implementation

**`/plan` Command**:
```typescript
// Research-first exploration
async function handlePlan(request, context, stream) {
  // 1. Parse goal from prompt
  const goal = request.prompt;
  
  // 2. Set research mode (no file edits)
  stream.markdown("## Research Phase\n\n");
  stream.markdown(`**Goal**: ${goal}\n\n`);
  
  // 3. Suggest follow-ups
  stream.button({
    title: "Start Implementation",
    command: "context-engineering.startImplement"
  });
  
  return { metadata: { phase: "research", goal } };
}
```

**`/implement` Command**:
```typescript
// Edit phase with auto-checkpoints
async function handleImplement(request, context, stream) {
  // 1. Check for existing plan
  const planContext = findPlanInHistory(context.history);
  
  // 2. Implementation mode (edits allowed)
  stream.markdown("## Implementation Phase\n\n");
  
  // 3. Auto-checkpoint every N operations
  // Handled by context manager
  
  return { metadata: { phase: "implement" } };
}
```

**`/checkpoint` Command**:
```typescript
// Quick save current state
async function handleCheckpoint(request, context, stream) {
  const note = request.prompt || "Manual checkpoint";
  
  // Invoke checkpoint tool
  await invokeTool("context-engineering_checkpoint", {
    summary: note,
    progress: estimateProgress(context.history)
  });
  
  stream.markdown("✅ Checkpoint saved to `.context/CHECKPOINT.md`");
  return {};
}
```

#### 3.2 Context Management

```typescript
// src/context/manager.ts
class SessionContextManager {
  private history: ConversationTurn[] = [];
  private state: SessionState = {};
  
  // Track conversation for compression
  addTurn(turn: ConversationTurn) {
    this.history.push(turn);
    this.checkCompressionThreshold();
  }
  
  // Estimate context usage (no direct API)
  estimateTokenUsage(): number {
    const charCount = this.history
      .map(t => t.content.length)
      .reduce((a, b) => a + b, 0);
    return Math.ceil(charCount / 4); // ~4 chars per token
  }
  
  // Trigger compression at 85% estimated capacity
  private checkCompressionThreshold() {
    const usage = this.estimateTokenUsage();
    const threshold = 100000 * 0.85; // ~85% of 100k
    
    if (usage >= threshold) {
      this.suggestCompression();
    }
  }
}
```

#### 3.3 Follow-up Suggestions

```typescript
// Add contextual follow-ups after responses
function addFollowUps(result: vscode.ChatResult, phase: string) {
  if (phase === "research") {
    result.metadata.followUps = [
      { prompt: "/implement", label: "Start implementing" },
      { prompt: "/checkpoint", label: "Save progress" }
    ];
  }
  return result;
}
```

### Validation Criteria
```
✓ /plan enters research mode
✓ /implement enters edit mode  
✓ /checkpoint saves state
✓ Follow-up buttons appear
✓ Context persists across turns
```

---

## Phase 4: Validation (Day 7)

### Goal
Validate hypotheses with structured testing protocol.

### Test Protocol

#### 4.1 Functional Tests
```typescript
// test/suite/tools.test.ts
describe("Checkpoint Tool", () => {
  it("creates CHECKPOINT.md with valid structure", async () => {
    const result = await invokeTool("context-engineering_checkpoint", {
      summary: "Test session",
      progress: 50
    });
    
    assert(fs.existsSync(".context/CHECKPOINT.md"));
    const content = fs.readFileSync(".context/CHECKPOINT.md", "utf-8");
    assert(content.includes("Test session"));
    assert(content.includes("50%"));
  });
});
```

#### 4.2 Integration Tests
```typescript
describe("@engineer Participant", () => {
  it("responds to basic prompts", async () => {
    // Simulate chat interaction
  });
  
  it("handles /plan command", async () => {
    // Verify research mode
  });
  
  it("maintains context across turns", async () => {
    // H1 validation
  });
});
```

#### 4.3 Usability Test Script

**Test Users**: 3 colleagues unfamiliar with extension

**Script**:
1. "Please ask the engineer to help you plan a new feature"
2. "Save your progress so you can continue later"
3. "Resume from where you left off"

**Success**: 80%+ complete without documentation

#### 4.4 Metrics Collection

```typescript
// src/utils/logger.ts
interface MetricEvent {
  type: "tool_invocation" | "command" | "error" | "latency";
  tool?: string;
  command?: string;
  success: boolean;
  durationMs?: number;
  timestamp: Date;
}

function logMetric(event: MetricEvent) {
  // Append to .context/metrics.jsonl
}
```

### Validation Dashboard

```
┌─────────────────────────────────────────────────┐
│ PoC Validation Results                          │
├─────────────────────────────────────────────────┤
│ H1: Context Retention     [──────────] ___%     │
│ H2: Tool Invocation       [──────────] ___%     │
│ H3: Resume Time           [──────────] ___s     │
│ H4: Context Isolation     [──────────] ___%     │
│ H5: Usability Score       [──────────] _/5      │
├─────────────────────────────────────────────────┤
│ Overall: [ PENDING ]                            │
└─────────────────────────────────────────────────┘
```

---

## Technical Decisions

### 1. Chat Participant + Tools Hybrid
**Rationale**: Participant owns conversation flow, tools provide discrete capabilities that work in Agent Mode and are composable.

### 2. File-based State (`.context/`)
**Rationale**: Version-controllable, portable across machines, human-readable. Falls back to `ExtensionContext.globalState` for backup.

### 3. Token Estimation via Character Count
**Rationale**: VS Code doesn't expose token counting API. Use ~4 chars/token heuristic for threshold triggers.

### 4. 7-Section Dispatch Format
**Rationale**: From oh-my-opencode patterns—explicit MUST NOT section prevents rogue behavior.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API instability | Pin to VS Code 1.95+, test on stable release |
| Copilot required | Document clearly in README, provide mock for testing |
| Context limits | Implement compression tool as escape hatch |
| Token estimation inaccurate | Conservative 85% threshold, manual trigger option |

---

## Success Criteria

### Minimum Viable PoC ✓
- [ ] Extension loads without errors
- [ ] `@engineer` responds to prompts
- [ ] `#checkpoint` tool creates valid file
- [ ] State persists to `.context/`

### Target PoC ✓✓
- [ ] All 3 tools functional
- [ ] All 3 slash commands working
- [ ] 80%+ usability test pass
- [ ] <2s tool response latency

### Stretch Goals ✓✓✓
- [ ] Follow-up suggestions
- [ ] Progress indicators
- [ ] Auto-checkpoint triggers

---

## Immediate Next Steps

1. **Now**: Create extension scaffold with `yo code`
2. **Day 1**: Register chat participant, basic handler
3. **Day 2**: Add `/plan` command, validate activation
4. **Day 3**: Implement `#checkpoint` tool
5. **Day 4**: Implement `#dispatch` and `#compress` tools
6. **Day 5**: Wire tools into participant
7. **Day 6**: Polish, error handling, follow-ups
8. **Day 7**: Validation testing

---

## References

- [VS-CODE-AI-EXTENSION.md](../.context/learn-from-oh-my-open-code/VS-CODE-AI-EXTENSION.md) - Full research
- [PATTERNS.md](../.context/learn-from-oh-my-open-code/PATTERNS.md) - oh-my-opencode patterns
- [VS Code AI Extensibility](https://code.visualstudio.com/api/extension-guides/ai/)
- [Chat Extension Sample](https://github.com/microsoft/vscode-extension-samples/tree/main/chat-sample)
