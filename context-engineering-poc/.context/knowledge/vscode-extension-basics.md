# VS Code Extension Basics

> **Purpose**: Extension structure, activation, and package.json essentials
> **Ref**: https://code.visualstudio.com/api/get-started/extension-anatomy

---

## Project Structure

```
extension-name/
├── package.json          # Extension manifest (CRITICAL)
├── tsconfig.json         # TypeScript config
├── src/
│   └── extension.ts      # Entry point (activate/deactivate)
├── out/                   # Compiled JS (gitignored)
└── .vscode/
    ├── launch.json       # Debug config (F5 to test)
    └── tasks.json        # Build tasks
```

---

## package.json Essentials

```json
{
  "name": "extension-name",
  "displayName": "Extension Display Name",
  "version": "0.0.1",
  "engines": { "vscode": "^1.95.0" },
  "activationEvents": [],
  "main": "./out/extension.js",
  "contributes": {
    // Commands, chat participants, etc.
  }
}
```

**Key fields**:
- `engines.vscode` — Minimum VS Code version
- `activationEvents` — When to activate (empty = on-demand)
- `main` — Entry point (compiled JS)
- `contributes` — What the extension provides

---

## Extension Entry Point

```typescript
// src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Called when extension activates
  // Register commands, participants, tools here
  
  // Use context.subscriptions to auto-dispose
  context.subscriptions.push(
    vscode.commands.registerCommand('ext.hello', () => {
      vscode.window.showInformationMessage('Hello!');
    })
  );
}

export function deactivate() {
  // Cleanup (optional)
}
```

---

## Activation Events

| Event | Triggers When |
|-------|---------------|
| `onCommand:ext.cmd` | Command invoked |
| `onLanguage:typescript` | TS file opened |
| `onStartupFinished` | After VS Code starts |
| `*` | Always (avoid in production) |

For chat participants: activation is automatic when participant is invoked.

---

## Debug Launch (launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [{
    "name": "Run Extension",
    "type": "extensionHost",
    "request": "launch",
    "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
    "outFiles": ["${workspaceFolder}/out/**/*.js"],
    "preLaunchTask": "npm: watch"
  }]
}
```

Press **F5** to launch Extension Development Host.

---

## Common Patterns

**Show messages**:
```typescript
vscode.window.showInformationMessage('Info');
vscode.window.showWarningMessage('Warning');
vscode.window.showErrorMessage('Error');
```

**Read/write files**:
```typescript
const uri = vscode.Uri.file('/path/to/file');
const content = await vscode.workspace.fs.readFile(uri);
await vscode.workspace.fs.writeFile(uri, Buffer.from('content'));
```

**Get workspace folder**:
```typescript
const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
const contextPath = vscode.Uri.joinPath(workspaceFolder.uri, '.context');
```
