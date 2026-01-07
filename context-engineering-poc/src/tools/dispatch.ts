import * as vscode from "vscode";

interface DispatchInput {
  agent: "backend-api" | "frontend-dev" | "researcher" | "visual-qa";
  task: string;
  expectedOutcome?: string;
  mustDo?: string[];
  mustNotDo?: string[];
  context?: string;
}

export class DispatchTool implements vscode.LanguageModelTool<DispatchInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<DispatchInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { agent, task, expectedOutcome, mustDo, mustNotDo, context } =
      options.input;

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

  private formatDelegation(data: {
    agent: string;
    task: string;
    expectedOutcome: string;
    mustDo: string[];
    mustNotDo: string[];
    context: string;
  }): string {
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
    } else {
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
    } else {
      prompt += `- Do not modify unrelated files\n`;
      prompt += `- Do not skip verification\n`;
      prompt += `- Do not introduce breaking changes\n`;
    }

    // CONTEXT section
    prompt += `\n### 7. CONTEXT\n`;
    if (data.context) {
      prompt += data.context;
    } else {
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
