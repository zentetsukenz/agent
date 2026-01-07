# T01: Project Scaffold

> **Phase**: 1 - Foundation
> **Agent**: backend-api
> **Depends on**: None
> **Duration**: ~30 min

---

## Objective

Initialize a VS Code extension project using `yo code` generator with TypeScript configuration.

---

## Prerequisites

- Node.js 18+ installed
- Yeoman and VS Code generator: `npm install -g yo generator-code`

---

## Knowledge to Load

- [vscode-extension-basics.md](../knowledge/vscode-extension-basics.md)

---

## Skills Reference

- [SKILLS/verification.md](../../../../SKILLS/verification.md) — Verify before claiming done

---

## Implementation Spec

### 1. Generate Extension

```bash
cd context-engineering-poc
yo code
```

**Generator answers**:
- Type: `New Extension (TypeScript)`
- Name: `context-engineering`
- Identifier: `context-engineering`
- Description: `Context engineering patterns for GitHub Copilot`
- Initialize git: `No` (already in repo)
- Bundle with webpack: `No` (keep simple for PoC)
- Package manager: `npm`

### 2. Restructure (if needed)

The generator creates a subfolder. Move contents up:
```bash
mv context-engineering/* .
rm -rf context-engineering
```

### 3. Update tsconfig.json

Ensure strict mode and proper output:
```json
{
  "compilerOptions": {
    "module": "Node16",
    "target": "ES2022",
    "outDir": "out",
    "lib": ["ES2022"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true
  }
}
```

### 4. Install Dependencies

```bash
npm install
npm run compile
```

---

## Files Created

```
context-engineering-poc/
├── package.json
├── tsconfig.json
├── src/
│   └── extension.ts
├── .vscode/
│   ├── launch.json
│   └── tasks.json
└── .vscodeignore
```

---

## Success Criteria

- [ ] `npm run compile` succeeds without errors
- [ ] Press F5 launches Extension Development Host
- [ ] Extension activates (check "Output > Extension Host" for errors)
- [ ] "Hello World" command works (default from generator)

---

## Verification Steps

1. Run `npm run compile` — should complete without errors
2. Press F5 in VS Code
3. In new window, open Command Palette (Cmd+Shift+P)
4. Run "Hello World" command from your extension
5. Should see information message

---

## Handoff to T02

After this task:
- package.json exists with basic extension metadata
- Extension compiles and runs
- Ready to add chat participant contributions in T02
