# VS Code Language Model Tools API

> **Purpose**: Register tools that work with Agent Mode and Copilot
> **Ref**: https://code.visualstudio.com/api/extension-guides/ai/language-model-tools

---

## What Tools Provide

- **Auto-invocation**: Agent Mode can invoke tools automatically
- **Explicit invocation**: Users type `#tool-name` in chat
- **Discoverability**: Appear in tools picker

---

## Tool Registration

```typescript
import * as vscode from 'vscode';

// In activate()
const checkpointTool = vscode.lm.registerTool(
  'context-engineering_checkpoint',
  new CheckpointTool()
);

context.subscriptions.push(checkpointTool);
```

---

## Tool Implementation

```typescript
class CheckpointTool implements vscode.LanguageModelTool<CheckpointInput> {
  
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<CheckpointInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    
    const { summary, progress } = options.input;
    
    // Do the work
    await this.saveCheckpoint(summary, progress);
    
    // Return result
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(
        `Checkpoint saved: ${summary}`
      )
    ]);
  }
}
```

---

## Tool Schema (package.json)

```json
{
  "contributes": {
    "languageModelTools": [{
      "name": "context-engineering_checkpoint",
      "displayName": "Checkpoint",
      "toolReferenceName": "checkpoint",
      "modelDescription": "Save current session state for later recovery",
      "canBeReferencedInPrompt": true,
      "inputSchema": {
        "type": "object",
        "properties": {
          "summary": {
            "type": "string",
            "description": "Brief summary of session progress"
          },
          "progress": {
            "type": "number",
            "description": "Completion percentage (0-100)"
          }
        },
        "required": ["summary"]
      }
    }]
  }
}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Unique tool ID. Pattern: `^(?!copilot_\|vscode_)[\w-]+$` |
| `displayName` | Human-readable name shown in UI |
| `modelDescription` | Description for the LLM (NOT `description`!) |

### Conditional Requirements

| Field | Required When |
|-------|---------------|
| `toolReferenceName` | **REQUIRED** if `canBeReferencedInPrompt: true`. Pattern: `^[\w-]+$`. This is what users type after `#` |

### Optional Fields

| Field | Description |
|-------|-------------|
| `userDescription` | Description shown to users |
| `canBeReferencedInPrompt` | Allow `#tool-name` syntax |
| `inputSchema` | JSON Schema for tool input |
| `icon` | Theme icon like `$(zap)` or file path |
| `when` | Condition expression |
| `tags` | Array of tag strings |

---

## Input Types

Define TypeScript interface matching schema:

```typescript
interface CheckpointInput {
  summary: string;
  progress?: number;
  completedWork?: string[];
  remainingWork?: string[];
}
```

---

## Tool Result Parts

| Part Type | Usage |
|-----------|-------|
| `LanguageModelTextPart` | Plain text response |
| `LanguageModelPromptTsxPart` | TSX component (advanced) |

```typescript
// Simple text result
return new vscode.LanguageModelToolResult([
  new vscode.LanguageModelTextPart('Tool completed successfully')
]);
```

---

## File Operations in Tools

```typescript
async saveCheckpoint(summary: string, progress: number) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error('No workspace folder open');
  }
  
  const checkpointPath = vscode.Uri.joinPath(
    workspaceFolder.uri,
    '.context',
    'CHECKPOINT.md'
  );
  
  const content = `# Checkpoint\n\n${summary}\n\nProgress: ${progress}%`;
  
  await vscode.workspace.fs.writeFile(
    checkpointPath,
    Buffer.from(content, 'utf-8')
  );
}
```

---

## Confirmation (Optional)

Tools can request user confirmation before executing:

```typescript
async prepareInvocation(
  options: vscode.LanguageModelToolInvocationPrepareOptions<CheckpointInput>,
  token: vscode.CancellationToken
): Promise<vscode.PreparedToolInvocation> {
  return {
    invocationMessage: `Save checkpoint: "${options.input.summary}"?`
  };
}
```

---

## Error Handling

```typescript
async invoke(options, token) {
  try {
    await this.doWork(options.input);
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart('Success')
    ]);
  } catch (error) {
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(`Error: ${error.message}`)
    ]);
  }
}
```
