import * as vscode from "vscode";

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
      new vscode.LanguageModelTextPart(compressionPrompt),
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

${
  options.preserveDecisions
    ? `## Key Decisions
- [Important decisions made and their rationale]
- [Constraints discovered]
- [Approaches rejected and why]

`
    : ""
}## Active Context
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
5. **Keep last ${
      options.turnsToKeep
    } turns** — Recent context stays uncompressed
${
  options.preserveDecisions
    ? "6. **Preserve decisions** — Keep what was decided and why"
    : ""
}

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
