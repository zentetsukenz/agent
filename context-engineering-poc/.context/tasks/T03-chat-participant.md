# T03: Chat Participant Registration ✅

> **Phase**: 1 - Foundation
> **Agent**: backend-api
> **Depends on**: T02
> **Duration**: ~30 min
> **Status**: COMPLETED (2026-01-07)

---

## Objective

Implement and register the `@engineer` chat participant with basic request handling.

---

## Prerequisites

- T02 completed (package.json configured)

---

## Knowledge to Load

- [vscode-chat-api.md](../knowledge/vscode-chat-api.md) — Handler implementation

---

## Skills Reference

- [SKILLS/verification.md](../../../../SKILLS/verification.md)

---

## Files to Create/Edit

- `src/extension.ts` — Update activation
- `src/participant/index.ts` — Create
- `src/participant/handler.ts` — Create

---

## Implementation Spec

### 1. Create Participant Handler

**src/participant/handler.ts**:

```typescript
import * as vscode from 'vscode';

export async function handleRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  
  // Log for debugging
  console.log('[Engineer] Request:', request.prompt);
  console.log('[Engineer] Command:', request.command);
  
  // Handle slash commands
  if (request.command) {
    switch (request.command) {
      case 'plan':
        stream.markdown('## Research Phase\n\n');
        stream.markdown(`**Goal**: ${request.prompt || 'No goal specified'}\n\n`);
        stream.markdown('*Planning mode active. I will research before implementing.*\n');
        return { metadata: { command: 'plan' } };
        
      case 'implement':
        stream.markdown('## Implementation Phase\n\n');
        stream.markdown('*Implementation mode active. I will make changes with checkpoints.*\n');
        return { metadata: { command: 'implement' } };
        
      case 'checkpoint':
        stream.markdown('## Checkpoint\n\n');
        stream.markdown(`*Saving checkpoint: ${request.prompt || 'Manual checkpoint'}*\n`);
        return { metadata: { command: 'checkpoint' } };
        
      default:
        stream.markdown(`Unknown command: /${request.command}\n`);
    }
  }
  
  // Default: echo mode for validation
  stream.markdown(`**Received**: ${request.prompt}\n\n`);
  stream.markdown('*Use `/plan`, `/implement`, or `/checkpoint` for workflow commands.*\n');
  
  // Add follow-up suggestions
  return {
    metadata: { command: null },
  };
}
```

### 2. Create Participant Index

**src/participant/index.ts**:

```typescript
import * as vscode from 'vscode';
import { handleRequest } from './handler';

export function registerParticipant(context: vscode.ExtensionContext): void {
  const participant = vscode.chat.createChatParticipant(
    'context-engineering.engineer',
    handleRequest
  );
  
  // Optional: Set icon
  // participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png');
  
  context.subscriptions.push(participant);
  
  console.log('[Engineer] Chat participant registered');
}
```

### 3. Update Extension Entry Point

**src/extension.ts**:

```typescript
import * as vscode from 'vscode';
import { registerParticipant } from './participant';

export function activate(context: vscode.ExtensionContext) {
  console.log('[Context Engineering] Extension activating...');
  
  // Register chat participant
  registerParticipant(context);
  
  console.log('[Context Engineering] Extension activated');
}

export function deactivate() {
  console.log('[Context Engineering] Extension deactivated');
}
```

### 4. Create Directory Structure

```bash
mkdir -p src/participant
```

---

## Success Criteria

- [x] Extension compiles without errors
- [x] @engineer appears in chat participant list
- [x] @engineer hello → receives "Received: hello" response
- [x] @engineer /plan test → shows "Research Phase" header
- [x] @engineer /implement → shows "Implementation Phase"
- [x] @engineer /checkpoint → shows "Checkpoint"

---

## Verification Steps

1. Run `npm run compile`
2. Press F5 to launch Extension Development Host
3. Open Copilot Chat (Cmd+Shift+I)
4. Type `@engineer hello world` → verify response
5. Type `@engineer /plan build auth feature` → verify research phase
6. Type `@engineer /checkpoint` → verify checkpoint response
7. Check "Output > Extension Host" for console logs

---

## Handoff to T04

After this task:
- @engineer participant is functional
- Basic slash command routing works
- Ready to implement actual tool logic in T04-T06
