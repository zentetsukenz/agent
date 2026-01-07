# Session: LM Tools Schema Research

> **Date**: 2026-01-07
> **Task**: T02 - Package Manifest Configuration
> **Status**: Fixed

---

## Problem

Extension failed to load with 3 errors like:
```
Extension 'undefined_publisher.context-engineering' CANNOT register tool 
with 'canBeReferencedInPrompt' set without a 'toolReferenceName'
```

---

## Root Cause

Our knowledge docs were outdated. VS Code requires `toolReferenceName` when `canBeReferencedInPrompt: true`.

---

## Research Findings

### Source of Truth
- **VS Code source**: [languageModelToolsContribution.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/chat/common/tools/languageModelToolsContribution.ts)
- **Example**: `/extensions/vscode-api-tests/package.json` in VS Code repo

### Correct Schema

```json
{
  "languageModelTools": [{
    "name": "context-engineering_checkpoint",
    "displayName": "Checkpoint",
    "toolReferenceName": "checkpoint",
    "modelDescription": "Save current session state",
    "canBeReferencedInPrompt": true,
    "inputSchema": { ... }
  }]
}
```

### Required Fields
| Field | Always Required |
|-------|-----------------|
| `name` | ✅ Pattern: `^(?!copilot_\|vscode_)[\w-]+$` |
| `displayName` | ✅ |
| `modelDescription` | ✅ (NOT `description`!) |

### Conditional Fields
| Field | Required When |
|-------|---------------|
| `toolReferenceName` | `canBeReferencedInPrompt: true` |

---

## Fixes Applied

| File | Change |
|------|--------|
| `package.json` | Added `toolReferenceName` to all 3 tools |
| `.context/knowledge/vscode-lm-tools-api.md` | Updated schema docs |

---

## Verification

```bash
npm run compile  # ✅ Success
# F5 → Extension Host → No contribution errors
```

---

## Lessons Learned

1. **VS Code types lag behind runtime validation** — `@types/vscode` didn't include `toolReferenceName`
2. **Check VS Code source for schema** — Extension point schemas are in `*Contribution.ts` files
3. **VS Code test extensions are canonical examples** — `/extensions/vscode-api-tests/`
