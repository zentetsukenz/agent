"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressTool = void 0;
const vscode = __importStar(require("vscode"));
class CompressTool {
    async invoke(options, token) {
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
    formatCompressionInstructions(options) {
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

${options.preserveDecisions
            ? `## Key Decisions
- [Important decisions made and their rationale]
- [Constraints discovered]
- [Approaches rejected and why]

`
            : ""}## Active Context
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
${options.preserveDecisions
            ? "6. **Preserve decisions** — Keep what was decided and why"
            : ""}

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
exports.CompressTool = CompressTool;
//# sourceMappingURL=compress.js.map