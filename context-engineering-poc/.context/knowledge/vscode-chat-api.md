# VS Code Chat Participant API

> **Purpose**: Register chat participants and handle slash commands
> **Ref**: https://code.visualstudio.com/api/extension-guides/ai/chat

---

## Registration (package.json)

```json
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

**Key fields**:
- `id` — Unique identifier (publisher.name pattern)
- `name` — What users type after `@`
- `isSticky` — Keep participant selected between turns
- `commands` — Slash commands (`/plan`, `/implement`)

---

## Handler Implementation

```typescript
import * as vscode from 'vscode';

const handler: vscode.ChatRequestHandler = async (
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> => {
  
  // Access user's message
  const userMessage = request.prompt;
  
  // Access slash command (if used)
  const command = request.command; // 'plan', 'implement', etc.
  
  // Access conversation history
  const history = context.history;
  
  // Stream response to user
  stream.markdown('**Processing...**\n\n');
  stream.markdown(`You said: ${userMessage}`);
  
  // Return result with metadata
  return {
    metadata: { command }
  };
};
```

---

## Registering the Participant

```typescript
// In activate()
const participant = vscode.chat.createChatParticipant(
  'context-engineering.engineer',
  handler
);

participant.iconPath = vscode.Uri.joinPath(
  context.extensionUri, 
  'media', 
  'icon.png'
);

context.subscriptions.push(participant);
```

---

## ChatRequest Object

| Property | Type | Description |
|----------|------|-------------|
| `prompt` | string | User's message text |
| `command` | string? | Slash command without `/` |
| `references` | ChatPromptReference[] | Attached files, selections |
| `toolReferences` | ChatLanguageModelToolReference[] | Referenced tools |

---

## ChatContext Object

| Property | Type | Description |
|----------|------|-------------|
| `history` | ChatRequestTurn[] | Previous turns in conversation |

**Accessing history**:
```typescript
for (const turn of context.history) {
  if (turn instanceof vscode.ChatRequestTurn) {
    console.log('User:', turn.prompt);
  } else if (turn instanceof vscode.ChatResponseTurn) {
    // Response turn
  }
}
```

---

## ChatResponseStream Methods

| Method | Purpose |
|--------|---------|
| `stream.markdown(text)` | Stream markdown content |
| `stream.anchor(uri, title)` | Add clickable file link |
| `stream.button({command, title})` | Add action button |
| `stream.progress(message)` | Show progress indicator |
| `stream.reference(uri)` | Reference a file |

---

## Follow-up Suggestions

```typescript
return {
  metadata: { command },
  followUp: [
    { prompt: '/implement', label: 'Start implementing' },
    { prompt: '/checkpoint', label: 'Save progress' }
  ]
};
```

---

## Routing by Command

```typescript
switch (request.command) {
  case 'plan':
    return handlePlan(request, context, stream);
  case 'implement':
    return handleImplement(request, context, stream);
  case 'checkpoint':
    return handleCheckpoint(request, context, stream);
  default:
    return handleDefault(request, context, stream);
}
```
