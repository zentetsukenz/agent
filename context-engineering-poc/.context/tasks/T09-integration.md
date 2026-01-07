# T09: Integration

> **Phase**: 3 - Integration
> **Agent**: team-lead
> **Depends on**: T08
> **Duration**: ~1 hour

---

## Objective

Wire tools, commands, and context manager together into a cohesive system. Add follow-up suggestions and error handling.

---

## Prerequisites

- T08 completed (context manager working)

---

## Knowledge to Load

- [vscode-chat-api.md](../knowledge/vscode-chat-api.md) — Follow-ups, buttons
- [vscode-lm-tools-api.md](../knowledge/vscode-lm-tools-api.md) — Tool invocation

---

## Skills Reference

- [SKILLS/verification.md](../../../../SKILLS/verification.md)
- [SKILLS/dispatch-context.md](../../../../SKILLS/dispatch-context.md) — If delegating

---

## Files to Edit

- `src/extension.ts` — Initialize context manager
- `src/participant/handler.ts` — Use context manager
- `src/participant/commands/*.ts` — Add follow-ups
- `src/tools/checkpoint.ts` — Use context manager state

---

## Implementation Spec

### 1. Update Extension Entry Point

**src/extension.ts**:

```typescript
import * as vscode from 'vscode';
import { registerParticipant } from './participant';
import { registerTools } from './tools';
import { SessionContextManager } from './context';

// Global context manager instance
let contextManager: SessionContextManager;

export async function activate(context: vscode.ExtensionContext) {
  console.log('[Context Engineering] Extension activating...');
  
  // Initialize context manager
  contextManager = new SessionContextManager();
  await contextManager.initialize();
  
  // Register chat participant (pass context manager)
  registerParticipant(context, contextManager);
  
  // Register language model tools (pass context manager)
  registerTools(context, contextManager);
  
  // Register quick checkpoint command
  const quickCheckpoint = vscode.commands.registerCommand(
    'context-engineering.quickCheckpoint',
    async () => {
      const state = contextManager.getState();
      // Trigger checkpoint tool with current state
      vscode.window.showInformationMessage(
        `Quick checkpoint: Phase ${state.phase}, ${state.completedTasks.length} tasks done`
      );
    }
  );
  
  context.subscriptions.push(quickCheckpoint);
  
  console.log('[Context Engineering] Extension activated');
}

export function deactivate() {
  console.log('[Context Engineering] Extension deactivated');
}

// Export for other modules
export function getContextManager(): SessionContextManager {
  return contextManager;
}
```

### 2. Update Participant Registration

**src/participant/index.ts**:

```typescript
import * as vscode from 'vscode';
import { handleRequest } from './handler';
import { SessionContextManager } from '../context';

export function registerParticipant(
  context: vscode.ExtensionContext,
  contextManager: SessionContextManager
): void {
  const handler = (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => handleRequest(request, chatContext, stream, token, contextManager);
  
  const participant = vscode.chat.createChatParticipant(
    'context-engineering.engineer',
    handler
  );
  
  context.subscriptions.push(participant);
  console.log('[Engineer] Chat participant registered');
}
```

### 3. Update Handler with Context Manager

**src/participant/handler.ts**:

```typescript
import * as vscode from 'vscode';
import { handlePlan } from './commands/plan';
import { handleImplement } from './commands/implement';
import { handleCheckpoint } from './commands/checkpoint';
import { SessionContextManager } from '../context';

export async function handleRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  contextManager: SessionContextManager
): Promise<vscode.ChatResult> {
  
  // Track user turn
  contextManager.addTurn('user', request.prompt, request.command);
  
  // Show context usage in debug
  const usage = contextManager.getUsageRatio();
  console.log(`[Engineer] Context usage: ${(usage * 100).toFixed(1)}%`);
  
  let result: vscode.ChatResult;
  
  // Route to command handlers
  switch (request.command) {
    case 'plan':
      contextManager.setPhase('research');
      if (request.prompt) {
        contextManager.setGoal(request.prompt);
      }
      result = await handlePlan(request, context, stream, token);
      break;
      
    case 'implement':
      contextManager.setPhase('implement');
      result = await handleImplement(request, context, stream, token);
      break;
      
    case 'checkpoint':
      result = await handleCheckpoint(request, context, stream, token, contextManager);
      break;
      
    default:
      result = await handleDefault(request, context, stream, contextManager);
  }
  
  // Track assistant response
  contextManager.addTurn('assistant', 'Response sent', request.command);
  
  return result;
}

async function handleDefault(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  contextManager: SessionContextManager
): Promise<vscode.ChatResult> {
  
  const state = contextManager.getState();
  
  stream.markdown(`**@engineer** (${state.phase} phase)\n\n`);
  stream.markdown(`${request.prompt}\n\n`);
  
  // Show current state
  stream.markdown('---\n');
  stream.markdown(`*Phase: ${state.phase} | Goal: ${state.goal || 'Not set'}*\n`);
  
  return { 
    metadata: { 
      command: null,
      phase: state.phase 
    }
  };
}
```

### 4. Add Follow-ups to Commands

**src/participant/commands/plan.ts** — Add to return:

```typescript
return {
  metadata: { command: 'plan', phase: 'research', goal },
  // Follow-up suggestions appear as buttons
};
```

### 5. Update Tools to Use Context Manager

**src/tools/index.ts**:

```typescript
import { SessionContextManager } from '../context';

export function registerTools(
  context: vscode.ExtensionContext,
  contextManager: SessionContextManager
): void {
  // Pass contextManager to tools that need it
  const checkpointTool = vscode.lm.registerTool(
    'context-engineering_checkpoint',
    new CheckpointTool(contextManager)
  );
  // ... rest of registrations
}
```

---

## Success Criteria

- [ ] Extension compiles without errors
- [ ] Context manager initializes on activation
- [ ] /plan sets phase to 'research' and saves goal
- [ ] /implement sets phase to 'implement'
- [ ] Context usage logged in Extension Host output
- [ ] Quick checkpoint command works
- [ ] State persists across commands

---

## Verification Steps

1. Run `npm run compile`
2. Press F5 to launch Extension Development Host
3. Full workflow test:
   - `@engineer /plan build user authentication`
   - `@engineer research JWT vs sessions`
   - `@engineer /implement JWT tokens`
   - `@engineer /checkpoint done with auth`
4. Check .context/session.json has correct state
5. Check Extension Host output for context usage logs

---

## Handoff to T10

After this task:
- All components are wired together
- Context tracking and persistence work
- Ready for validation testing in T10
