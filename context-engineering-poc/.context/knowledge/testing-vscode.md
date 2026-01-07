# Testing VS Code Extensions

> **Purpose**: Testing patterns for VS Code extensions
> **Ref**: https://code.visualstudio.com/api/working-with-extensions/testing-extension

---

## Test Structure

```
extension/
├── src/
│   └── extension.ts
└── src/test/
    ├── runTest.ts        # Test runner entry
    ├── suite/
    │   ├── index.ts      # Test suite setup
    │   └── extension.test.ts
    └── fixtures/         # Test data
```

---

## Test Runner (runTest.ts)

```typescript
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, '../../');
  const extensionTestsPath = path.resolve(__dirname, './suite/index');
  
  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
  });
}

main();
```

---

## Suite Index (suite/index.ts)

```typescript
import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'tdd', color: true });
  const testsRoot = path.resolve(__dirname, '.');
  
  const files = await glob('**/**.test.js', { cwd: testsRoot });
  files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
  
  return new Promise((resolve, reject) => {
    mocha.run(failures => {
      failures > 0 ? reject(new Error(`${failures} failed`)) : resolve();
    });
  });
}
```

---

## Writing Tests

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start tests.');

  test('Extension should activate', async () => {
    const ext = vscode.extensions.getExtension('publisher.extension-name');
    assert.ok(ext);
    await ext.activate();
    assert.strictEqual(ext.isActive, true);
  });
  
  test('Command should be registered', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('extension.myCommand'));
  });
});
```

---

## Testing Tools

```typescript
test('Checkpoint tool should be registered', async () => {
  const tools = vscode.lm.tools;
  const checkpointTool = tools.find(
    t => t.name === 'context-engineering_checkpoint'
  );
  assert.ok(checkpointTool, 'Checkpoint tool not found');
});
```

---

## Testing File Operations

```typescript
test('Should create checkpoint file', async () => {
  const workspaceFolder = vscode.workspace.workspaceFolders![0];
  const checkpointPath = vscode.Uri.joinPath(
    workspaceFolder.uri,
    '.context',
    'CHECKPOINT.md'
  );
  
  // Invoke the command/tool that creates checkpoint
  await vscode.commands.executeCommand('context-engineering.checkpoint');
  
  // Verify file exists
  try {
    await vscode.workspace.fs.stat(checkpointPath);
    assert.ok(true, 'Checkpoint file created');
  } catch {
    assert.fail('Checkpoint file not created');
  }
});
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile",
    "test": "node ./out/test/runTest.js"
  }
}
```

---

## Manual Testing Checklist

For chat participants and tools, manual testing is often needed:

- [ ] Extension activates without errors
- [ ] `@participant` appears in chat
- [ ] Slash commands appear in autocomplete
- [ ] Commands execute and stream responses
- [ ] Tools appear in Agent Mode picker
- [ ] `#tool` invocation works
- [ ] Files are created/modified as expected
