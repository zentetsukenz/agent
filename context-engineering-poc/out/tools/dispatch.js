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
exports.DispatchTool = void 0;
const vscode = __importStar(require("vscode"));
class DispatchTool {
    async invoke(options, token) {
        const { agent, task, expectedOutcome, mustDo, mustNotDo, context } = options.input;
        const delegationPrompt = this.formatDelegation({
            agent,
            task,
            expectedOutcome: expectedOutcome ?? "Task completed successfully",
            mustDo: mustDo ?? [],
            mustNotDo: mustNotDo ?? [],
            context: context ?? "",
        });
        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(delegationPrompt),
        ]);
    }
    formatDelegation(data) {
        let prompt = `## Delegation to ${data.agent}

---

### 1. TASK
${data.task}

### 2. EXPECTED OUTCOME
${data.expectedOutcome}

### 3. REQUIRED SKILLS
- Load relevant project documentation
- Follow established patterns
- Verify before claiming done

### 4. REQUIRED TOOLS
- File editing tools
- Terminal for verification
- Search for finding patterns

`;
        // MUST DO section
        prompt += `### 5. MUST DO\n`;
        if (data.mustDo.length > 0) {
            data.mustDo.forEach((item) => {
                prompt += `- ${item}\n`;
            });
        }
        else {
            prompt += `- Follow project patterns\n`;
            prompt += `- Write clean, documented code\n`;
            prompt += `- Verify changes work correctly\n`;
        }
        // MUST NOT DO section
        prompt += `\n### 6. MUST NOT DO\n`;
        if (data.mustNotDo.length > 0) {
            data.mustNotDo.forEach((item) => {
                prompt += `- ${item}\n`;
            });
        }
        else {
            prompt += `- Do not modify unrelated files\n`;
            prompt += `- Do not skip verification\n`;
            prompt += `- Do not introduce breaking changes\n`;
        }
        // CONTEXT section
        prompt += `\n### 7. CONTEXT\n`;
        if (data.context) {
            prompt += data.context;
        }
        else {
            prompt += `No additional context provided.`;
        }
        prompt += `

---

**AFTER COMPLETION, RETURN:**
- Summary of what was done (~500 tokens)
- Files created/modified
- Verification results
- Any blockers encountered
`;
        return prompt;
    }
}
exports.DispatchTool = DispatchTool;
//# sourceMappingURL=dispatch.js.map