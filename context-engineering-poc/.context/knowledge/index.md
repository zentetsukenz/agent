# Context Engineering PoC — Knowledge Index

> **Project**: VS Code Extension for Context Engineering
> **Last Updated**: January 7, 2026

---

## Quick Reference

| Document | Purpose | Load When |
|----------|---------|-----------|
| [vscode-extension-basics.md](vscode-extension-basics.md) | Extension structure, activation, package.json | Starting any task |
| [vscode-chat-api.md](vscode-chat-api.md) | Chat Participant API patterns | Building participant or commands |
| [vscode-lm-tools-api.md](vscode-lm-tools-api.md) | Language Model Tools API | Building #checkpoint, #dispatch, #compress |
| [testing-vscode.md](testing-vscode.md) | Extension testing patterns | Writing or running tests |

---

## Project Context

**What we're building**: A VS Code extension that delivers context engineering patterns (checkpoints, context compression, agent dispatch) via GitHub Copilot integration.

**Core deliverables**:
1. Chat Participant: `@engineer` with RPI workflow commands
2. Language Model Tools: `#checkpoint`, `#dispatch`, `#compress`
3. State Persistence: `.context/` folder for session checkpoints

**Tech stack**:
- TypeScript + Node.js
- VS Code Extension API (1.95+)
- GitHub Copilot Chat integration

---

## Skills Reference

These existing skills apply to this project:

| Skill | When to Use |
|-------|-------------|
| [SKILLS/checkpoint.md](../../../SKILLS/checkpoint.md) | Understanding checkpoint format and triggers |
| [SKILLS/verification.md](../../../SKILLS/verification.md) | Before claiming any task done |
| [SKILLS/dispatch-context.md](../../../SKILLS/dispatch-context.md) | When delegating to subagents |
| [SKILLS/task-sizing.md](../../../SKILLS/task-sizing.md) | Assessing task complexity |

---

## External References

- [VS Code AI Extensibility](https://code.visualstudio.com/api/extension-guides/ai/)
- [Chat Participant API](https://code.visualstudio.com/api/extension-guides/ai/chat)
- [Language Model Tools API](https://code.visualstudio.com/api/extension-guides/ai/language-model-tools)
- [Chat Extension Sample](https://github.com/microsoft/vscode-extension-samples/tree/main/chat-sample)
