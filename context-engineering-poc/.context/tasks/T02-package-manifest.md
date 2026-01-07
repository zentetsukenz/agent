# T02: Package Manifest Configuration

> **Phase**: 1 - Foundation
> **Agent**: backend-api
> **Depends on**: T01
> **Duration**: ~20 min

---

## Objective

Configure package.json with chat participant and language model tool contributions.

---

## Prerequisites

- T01 completed (project scaffold exists)

---

## Knowledge to Load

- [vscode-chat-api.md](../knowledge/vscode-chat-api.md) — Chat participant registration
- [vscode-lm-tools-api.md](../knowledge/vscode-lm-tools-api.md) — Tool schema format

---

## Skills Reference

- [SKILLS/verification.md](../../../../SKILLS/verification.md)

---

## Files to Edit

- `package.json` — Add contributions

---

## Implementation Spec

### 1. Update package.json

Add these sections to the `contributes` block:

```json
{
  "contributes": {
    "chatParticipants": [
      {
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
      }
    ],
    "languageModelTools": [
      {
        "name": "context-engineering_checkpoint",
        "displayName": "Checkpoint",
        "canBeReferencedInPrompt": true,
        "description": "Save current session state for later recovery",
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
            },
            "completedWork": {
              "type": "array",
              "items": { "type": "string" },
              "description": "List of completed items"
            },
            "remainingWork": {
              "type": "array",
              "items": { "type": "string" },
              "description": "List of remaining items"
            }
          },
          "required": ["summary"]
        }
      },
      {
        "name": "context-engineering_dispatch",
        "displayName": "Dispatch to Agent",
        "canBeReferencedInPrompt": true,
        "description": "Delegate task to specialized agent with 7-section format",
        "inputSchema": {
          "type": "object",
          "properties": {
            "agent": {
              "type": "string",
              "enum": ["backend-api", "frontend-dev", "researcher", "visual-qa"],
              "description": "Target agent for delegation"
            },
            "task": {
              "type": "string",
              "description": "Atomic task description (one action)"
            },
            "expectedOutcome": {
              "type": "string",
              "description": "Concrete deliverable with success criteria"
            },
            "mustDo": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Exhaustive requirements"
            },
            "mustNotDo": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Forbidden actions"
            },
            "context": {
              "type": "string",
              "description": "File paths, patterns, constraints"
            }
          },
          "required": ["agent", "task"]
        }
      },
      {
        "name": "context-engineering_compress",
        "displayName": "Compress Context",
        "canBeReferencedInPrompt": true,
        "description": "Summarize conversation to reduce context usage",
        "inputSchema": {
          "type": "object",
          "properties": {
            "preserveDecisions": {
              "type": "boolean",
              "description": "Keep key decisions in summary"
            },
            "turnsToKeep": {
              "type": "number",
              "description": "Number of recent turns to keep uncompressed"
            }
          }
        }
      }
    ]
  }
}
```

### 2. Update Engine Version

Ensure minimum VS Code version supports chat API:

```json
{
  "engines": {
    "vscode": "^1.95.0"
  }
}
```

### 3. Add Extension Kind

For chat participants:

```json
{
  "extensionKind": ["ui"]
}
```

---

## Success Criteria

- [ ] `npm run compile` still succeeds
- [ ] package.json has valid JSON (no syntax errors)
- [ ] Chat participant contribution defined
- [ ] All 3 tool schemas defined
- [ ] VS Code version ^1.95.0

---

## Verification Steps

1. Run `npm run compile`
2. Press F5 to launch Extension Development Host
3. In new window, open chat (Cmd+Shift+I or click Copilot icon)
4. Type `@` — should see `@engineer` in autocomplete (won't work yet, but should appear)
5. Check "Output > Extension Host" for any contribution errors

---

## Handoff to T03

After this task:
- package.json fully configured with contributions
- Ready to implement handler in T03
