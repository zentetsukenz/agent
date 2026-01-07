# T05: Dispatch Tool

> **Phase**: 2 - Core Tools
> **Agent**: backend-api
> **Depends on**: T04
> **Duration**: ~30 min

---

## Objective

Implement the `#dispatch` language model tool that formats delegation prompts using the 7-section pattern.

---

## Prerequisites

- T04 completed (checkpoint tool working)

---

## Knowledge to Load

- [vscode-lm-tools-api.md](../knowledge/vscode-lm-tools-api.md) — Tool implementation

---

## Skills Reference

- [SKILLS/dispatch-context.md](../../../../SKILLS/dispatch-context.md) — Delegation format
- [SKILLS/verification.md](../../../../SKILLS/verification.md)

---

## Files to Create/Edit

- `src/tools/dispatch.ts` — Create
- `src/tools/index.ts` — Add registration

---

## Implementation Spec

### 1. Create Dispatch Tool

**src/tools/dispatch.ts**:

```typescript
import * as vscode from 'vscode';

interface DispatchInput {
  agent: 'backend-api' | 'frontend-dev' | 'researcher' | 'visual-qa';
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
    
    const { agent, task, expectedOutcome, mustDo, mustNotDo, context } = options.input;
    
    const delegationPrompt = this.formatDelegation({
      agent,
      task,
      expectedOutcome: expectedOutcome ?? 'Task completed successfully',
      mustDo: mustDo ?? [],
      mustNotDo: mustNotDo ?? [],
      context: context ?? '',
    });
    
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(delegationPrompt)
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
      data.mustDo.forEach(item => {
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
      data.mustNotDo.forEach(item => {
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
```

### 2. Update Tools Index

**src/tools/index.ts** — Add dispatch registration:

```typescript
import { DispatchTool } from './dispatch';

export function registerTools(context: vscode.ExtensionContext): void {
  // ... existing checkpoint registration ...
  
  // Register dispatch tool
  const dispatchTool = vscode.lm.registerTool(
    'context-engineering_dispatch',
    new DispatchTool()
  );
  
  context.subscriptions.push(dispatchTool);
}
```

---

## Success Criteria

- [x] Extension compiles without errors
- [x] #dispatch appears in tools list
- [x] Invoking #dispatch returns 7-section formatted prompt
- [x] All agents in enum work (backend-api, frontend-dev, researcher, visual-qa)
- [x] Default values populate empty arrays

---

## Verification Steps

1. Run `npm run compile`
2. Press F5 to launch Extension Development Host
3. Open Copilot Chat in Agent Mode
4. Type: `Dispatch to backend-api: Create a new API endpoint for users`
5. Verify response has all 7 sections
6. Verify MUST DO and MUST NOT DO have defaults

---

## Example Output

When invoked with:
```json
{
  "agent": "backend-api",
  "task": "Create GET /api/users endpoint",
  "mustDo": ["Add input validation", "Write tests"]
}
```

Should produce formatted delegation prompt with all 7 sections.

---

## Handoff to T06

After this task:
- #dispatch tool is functional
- 7-section format implemented
- Ready to implement #compress tool
