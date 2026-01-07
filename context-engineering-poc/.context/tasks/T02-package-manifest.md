# T02: Package Manifest Configuration ✅

> **Phase**: 1 - Foundation
> **Agent**: backend-api
> **Depends on**: T01
> **Duration**: ~20 min
> **Status**: COMPLETED (Jan 7, 2026)

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
        "toolReferenceName": "dispatch",
        "modelDescription": "Delegate task to specialized agent with 7-section format",
        "canBeReferencedInPrompt": true,
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
        "toolReferenceName": "compress",
        "modelDescription": "Summarize conversation to reduce context usage",
        "canBeReferencedInPrompt": true,
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

**Key schema requirements (VS Code 1.107+):**

| Field | Required | Notes |
|-------|----------|-------|
| `name` | ✅ | Pattern: `^(?!copilot_\|vscode_)[\w-]+$` |
| `displayName` | ✅ | Human-readable name |
| `modelDescription` | ✅ | Description for LLM (NOT `description`!) |
| `toolReferenceName` | ✅ if `canBeReferencedInPrompt: true` | What users type after `#` |

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

- [x] `npm run compile` still succeeds
- [x] package.json has valid JSON (no syntax errors)
- [x] Chat participant contribution defined
- [x] All 3 tool schemas defined
- [x] VS Code version ^1.95.0
- [x] `extensionKind: ["ui"]` set
- [x] All tools have `modelDescription` field
- [x] All tools have `toolReferenceName` field

---

## Verification Steps

1. ✅ Run `npm run compile` — PASSED
2. ✅ Validate JSON syntax — PASSED
3. ⏭️ Press F5 to launch Extension Development Host (deferred to T03)
4. ⏭️ Type `@` and verify `@engineer` appears (deferred to T03)
5. ⏭️ Check "Output > Extension Host" for errors (deferred to T03)

---

## Completion Summary

**Completed**: Jan 7, 2026

**Changes made**:
- Updated `engines.vscode` to `^1.95.0`
- Added `extensionKind: ["ui"]`
- Registered `@engineer` chat participant with 3 commands
- Defined 3 language model tools with proper VS Code 1.107+ schema:
  - `context-engineering_checkpoint` (#checkpoint)
  - `context-engineering_dispatch` (#dispatch)
  - `context-engineering_compress` (#compress)

**Verification**:
- ✅ TypeScript compilation succeeds
- ✅ JSON syntax valid
- ✅ All required fields present

---

## Handoff to T03

After this task:
- package.json fully configured with contributions
- Ready to implement handler in T03
