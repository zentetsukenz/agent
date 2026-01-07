# T07: Slash Commands

> **Phase**: 3 - Integration
> **Agent**: backend-api
> **Depends on**: T06
> **Duration**: ~45 min

---

## Objective

Implement full functionality for `/plan`, `/implement`, and `/checkpoint` slash commands.

---

## Prerequisites

- T06 completed (all tools working)

---

## Knowledge to Load

- [vscode-chat-api.md](../knowledge/vscode-chat-api.md) — Response streaming, follow-ups

---

## Skills Reference

- [SKILLS/verification.md](../../../../SKILLS/verification.md)

---

## Files to Create/Edit

- `src/participant/commands/plan.ts` — Create
- `src/participant/commands/implement.ts` — Create
- `src/participant/commands/checkpoint.ts` — Create
- `src/participant/handler.ts` — Update to use commands

---

## Implementation Spec

### 1. Create Plan Command

**src/participant/commands/plan.ts**:

```typescript
import * as vscode from 'vscode';

export async function handlePlan(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  
  const goal = request.prompt || 'No goal specified';
  
  stream.markdown('## 🔬 Research Phase\n\n');
  stream.markdown(`**Goal**: ${goal}\n\n`);
  
  stream.markdown('### Mode: Research-First\n\n');
  stream.markdown('In this phase, I will:\n');
  stream.markdown('1. Understand the requirements\n');
  stream.markdown('2. Research existing patterns and code\n');
  stream.markdown('3. Identify constraints and dependencies\n');
  stream.markdown('4. Create an implementation plan\n\n');
  
  stream.markdown('*No file edits will be made during research.*\n\n');
  
  stream.markdown('---\n\n');
  stream.markdown('**What would you like me to research?**\n');
  
  return {
    metadata: { 
      command: 'plan',
      phase: 'research',
      goal 
    },
  };
}
```

### 2. Create Implement Command

**src/participant/commands/implement.ts**:

```typescript
import * as vscode from 'vscode';

export async function handleImplement(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  
  const spec = request.prompt || '';
  
  stream.markdown('## 🛠️ Implementation Phase\n\n');
  
  // Check if there's a plan in history
  const hasPlan = context.history.some(turn => {
    if (turn instanceof vscode.ChatRequestTurn) {
      return turn.command === 'plan';
    }
    return false;
  });
  
  if (hasPlan) {
    stream.markdown('*Continuing from research phase.*\n\n');
  } else {
    stream.markdown('> ⚠️ No prior `/plan` found. Consider researching first.\n\n');
  }
  
  stream.markdown('### Mode: Implementation with Checkpoints\n\n');
  stream.markdown('In this phase, I will:\n');
  stream.markdown('1. Execute the planned changes\n');
  stream.markdown('2. Create checkpoints at key milestones\n');
  stream.markdown('3. Verify each change before proceeding\n\n');
  
  if (spec) {
    stream.markdown(`**Specification**: ${spec}\n\n`);
  }
  
  stream.markdown('---\n\n');
  stream.markdown('**Ready to implement. What should I build?**\n');
  
  return {
    metadata: { 
      command: 'implement',
      phase: 'implement',
      hasPlan 
    },
  };
}
```

### 3. Create Checkpoint Command

**src/participant/commands/checkpoint.ts**:

```typescript
import * as vscode from 'vscode';

export async function handleCheckpoint(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  
  const note = request.prompt || 'Manual checkpoint';
  
  stream.markdown('## 📍 Checkpoint\n\n');
  
  // Estimate progress from history
  const turnCount = context.history.length;
  const estimatedProgress = Math.min(turnCount * 5, 100);
  
  stream.markdown(`**Note**: ${note}\n\n`);
  stream.markdown(`**Estimated progress**: ${estimatedProgress}%\n\n`);
  
  stream.markdown('### Session Summary\n\n');
  
  // Extract topics from history
  const topics: string[] = [];
  for (const turn of context.history) {
    if (turn instanceof vscode.ChatRequestTurn && turn.prompt) {
      const summary = turn.prompt.substring(0, 50);
      topics.push(`- ${summary}${turn.prompt.length > 50 ? '...' : ''}`);
    }
  }
  
  if (topics.length > 0) {
    stream.markdown('**Topics discussed**:\n');
    topics.slice(-5).forEach(topic => stream.markdown(`${topic}\n`));
    stream.markdown('\n');
  }
  
  stream.markdown('---\n\n');
  stream.markdown('💡 *Use `#checkpoint` tool to save to file, or continue working.*\n');
  
  return {
    metadata: { 
      command: 'checkpoint',
      note,
      estimatedProgress 
    },
  };
}
```

### 4. Update Handler

**src/participant/handler.ts** — Replace with command imports:

```typescript
import * as vscode from 'vscode';
import { handlePlan } from './commands/plan';
import { handleImplement } from './commands/implement';
import { handleCheckpoint } from './commands/checkpoint';

export async function handleRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  
  console.log('[Engineer] Request:', request.prompt);
  console.log('[Engineer] Command:', request.command);
  
  // Route to command handlers
  switch (request.command) {
    case 'plan':
      return handlePlan(request, context, stream, token);
      
    case 'implement':
      return handleImplement(request, context, stream, token);
      
    case 'checkpoint':
      return handleCheckpoint(request, context, stream, token);
  }
  
  // Default: conversational mode
  stream.markdown(`**@engineer**: ${request.prompt}\n\n`);
  stream.markdown('*Available commands: `/plan`, `/implement`, `/checkpoint`*\n');
  
  return { metadata: { command: null } };
}
```

### 5. Create Directory

```bash
mkdir -p src/participant/commands
```

---

## Success Criteria

- [ ] Extension compiles without errors
- [ ] /plan shows research phase UI
- [ ] /implement shows implementation phase UI
- [ ] /implement detects prior /plan in history
- [ ] /checkpoint shows session summary
- [ ] /checkpoint extracts topics from history

---

## Verification Steps

1. Run `npm run compile`
2. Press F5 to launch Extension Development Host
3. Test sequence:
   - `@engineer /plan build user authentication`
   - `@engineer /implement JWT tokens`
   - `@engineer /checkpoint auth work`
4. Verify /implement shows "Continuing from research phase"
5. Verify /checkpoint shows topics discussed

---

## Handoff to T08

After this task:
- All slash commands are functional
- Commands integrate with conversation history
- Ready to implement context manager in T08
