# T06: Compress Tool

> **Phase**: 2 - Core Tools
> **Agent**: backend-api
> **Depends on**: T05
> **Duration**: ~30 min
> **Status**: ✅ COMPLETE

---

## Objective

Implement the `#compress` language model tool that generates compressed context summaries.

---

## Prerequisites

- T05 completed (dispatch tool working)

---

## Knowledge to Load

- [vscode-lm-tools-api.md](../knowledge/vscode-lm-tools-api.md) — Tool implementation

---

## Skills Reference

- [SKILLS/checkpoint.md](../../../../SKILLS/checkpoint.md) — Compression format reference
- [SKILLS/verification.md](../../../../SKILLS/verification.md)

---

## Files to Create/Edit

- `src/tools/compress.ts` — Create
- `src/tools/index.ts` — Add registration

---

## Implementation Spec

### 1. Create Compress Tool

**src/tools/compress.ts**:

```typescript
import * as vscode from 'vscode';

interface CompressInput {
  preserveDecisions?: boolean;
  turnsToKeep?: number;
}

export class CompressTool implements vscode.LanguageModelTool<CompressInput> {
  
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<CompressInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    
    const { preserveDecisions = true, turnsToKeep = 3 } = options.input;
    
    // Generate compression instructions
    // Note: We cannot access actual conversation history from a tool
    // This tool returns instructions for the model to compress
    
    const compressionPrompt = this.formatCompressionInstructions({
      preserveDecisions,
      turnsToKeep,
    });
    
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(compressionPrompt)
    ]);
  }
  
  private formatCompressionInstructions(options: {
    preserveDecisions: boolean;
    turnsToKeep: number;
  }): string {
    
    return `## Context Compression Instructions

To compress the current conversation context, create a summary following this structure:

---

### Summary Format

\`\`\`markdown
# Session Summary

## Goal
[What the user is trying to accomplish - preserve original wording]

## Progress
[Current status and completion percentage]

## Completed Work
- [List of completed items with file paths]

## Remaining Work  
- [List of remaining items]

${options.preserveDecisions ? `## Key Decisions
- [Important decisions made and their rationale]
- [Constraints discovered]
- [Approaches rejected and why]

` : ''}## Active Context
[Last ${options.turnsToKeep} turns of conversation - keep as-is]

## Files Modified
- [path/to/file.ts] - [what changed]
\`\`\`

---

### Compression Rules

1. **Preserve original user requests** — Keep exact wording of what user asked
2. **Keep file paths** — Reference files by path, not by copying content
3. **Summarize explorations** — Compress research into findings
4. **Remove redundancy** — Deduplicate repeated information
5. **Keep last ${options.turnsToKeep} turns** — Recent context stays uncompressed
${options.preserveDecisions ? '6. **Preserve decisions** — Keep what was decided and why' : ''}

### What to Remove

- Tool outputs that have been processed
- File contents (keep paths only)
- Failed approaches (unless they inform constraints)
- Intermediate reasoning (keep conclusions)

---

**After compression, the conversation should continue seamlessly.**
`;
  }
}
```

### 2. Update Tools Index

**src/tools/index.ts** — Add compress registration:

```typescript
import { CompressTool } from './compress';

export function registerTools(context: vscode.ExtensionContext): void {
  // ... existing registrations ...
  
  // Register compress tool
  const compressTool = vscode.lm.registerTool(
    'context-engineering_compress',
    new CompressTool()
  );
  
  context.subscriptions.push(compressTool);
}
```

---

## Design Note

The compress tool cannot access actual conversation history from the tool context. Instead, it returns **instructions** that guide the model on how to compress the conversation.

This is a limitation of the VS Code Language Model Tools API — tools receive only their input parameters, not the conversation context.

**Alternative approach (future)**: The chat participant handler has access to `context.history` and could implement compression directly.

---

## Success Criteria

- [x] Extension compiles without errors
- [x] #compress appears in tools list
- [x] Invoking #compress returns compression instructions
- [x] Instructions include summary format template
- [x] preserveDecisions parameter works
- [x] turnsToKeep parameter appears in output

---

## Verification Steps

1. Run `npm run compile`
2. Press F5 to launch Extension Development Host
3. Open Copilot Chat in Agent Mode
4. Type: `Compress the current context`
5. Verify response includes compression instructions
6. Verify summary format template is present

---

## Handoff to T07

After this task:
- All 3 tools are functional (#checkpoint, #dispatch, #compress)
- Ready to implement slash commands in T07
