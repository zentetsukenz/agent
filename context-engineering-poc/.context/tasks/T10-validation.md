# T10: Validation

> **Phase**: 4 - Validation
> **Agent**: team-lead
> **Depends on**: T09
> **Duration**: ~2-4 hours

---

## Objective

Validate all hypotheses with structured testing protocol and document results.

---

## Prerequisites

- T09 completed (full integration working)

---

## Knowledge to Load

- [testing-vscode.md](../knowledge/testing-vscode.md) — Testing patterns

---

## Skills Reference

- [SKILLS/verification.md](../../../../SKILLS/verification.md)

---

## Files to Create

- `src/test/suite/extension.test.ts` — Update
- `src/test/suite/tools.test.ts` — Create
- `src/test/suite/participant.test.ts` — Create
- `.context/VALIDATION-RESULTS.md` — Create (output)

---

## Hypotheses to Validate

| ID | Hypothesis | Success Criteria |
|----|------------|------------------|
| H1 | Context retained across turns | 90%+ retention over 10 turns |
| H2 | Tools invokable from Agent Mode | 95%+ invocation success |
| H3 | Checkpoint improves resume time | <30s to restore |
| H4 | Dispatch provides isolation | Parent context unpolluted |
| H5 | Natural tool discovery | 80%+ unassisted use |

---

## Test Protocol

### 1. Automated Tests

**src/test/suite/tools.test.ts**:

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Tools Test Suite', () => {
  
  test('Checkpoint tool is registered', async () => {
    const tools = vscode.lm.tools;
    const tool = tools.find(t => t.name === 'context-engineering_checkpoint');
    assert.ok(tool, 'Checkpoint tool not registered');
  });
  
  test('Dispatch tool is registered', async () => {
    const tools = vscode.lm.tools;
    const tool = tools.find(t => t.name === 'context-engineering_dispatch');
    assert.ok(tool, 'Dispatch tool not registered');
  });
  
  test('Compress tool is registered', async () => {
    const tools = vscode.lm.tools;
    const tool = tools.find(t => t.name === 'context-engineering_compress');
    assert.ok(tool, 'Compress tool not registered');
  });
});
```

**src/test/suite/participant.test.ts**:

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Participant Test Suite', () => {
  
  test('Extension activates', async () => {
    const ext = vscode.extensions.getExtension('context-engineering.context-engineering');
    assert.ok(ext, 'Extension not found');
    await ext.activate();
    assert.strictEqual(ext.isActive, true);
  });
});
```

### 2. Manual Test Script

**H1: Context Retention Test**

```
1. Start fresh chat with @engineer
2. Have 10-turn conversation:
   - Turn 1: @engineer /plan build user dashboard
   - Turn 2: Ask about data requirements
   - Turn 3: Discuss API endpoints
   - Turn 4: Ask about UI components
   - Turn 5: @engineer /implement dashboard API
   - Turn 6: Continue with specific endpoint
   - Turn 7: Ask to add authentication
   - Turn 8: Discuss error handling
   - Turn 9: Ask to review the plan
   - Turn 10: @engineer /checkpoint
3. Verify: Can @engineer recall goal from Turn 1?
4. Score: [X]/10 turns retained context
```

**H2: Tool Invocation Test**

```
1. Open Agent Mode in Copilot
2. Test each tool 5 times:
   - "Save a checkpoint summarizing our work"
   - "Dispatch this task to backend-api"
   - "Compress the current context"
3. Record success/failure for each
4. Score: [X]/15 successful invocations
```

**H3: Resume Time Test**

```
1. Create checkpoint with substantial state
2. Close and reopen VS Code
3. Start timer
4. Open chat, type "@engineer /checkpoint resume"
5. Stop timer when full context restored
6. Score: [X] seconds to restore
```

**H4: Context Isolation Test**

```
1. Start conversation with @engineer
2. Use #dispatch to delegate task
3. Complete delegated task
4. Return to @engineer
5. Verify: No pollution from delegated context
6. Score: Isolated (Y/N)
```

**H5: Usability Test**

```
Test with 3 users unfamiliar with extension:

Script:
"Please use @engineer to plan a new feature, save your progress, and resume later."

Observe:
- Did they discover /plan without help?
- Did they use /checkpoint or #checkpoint?
- Did they successfully resume?

Score: [X]/3 users completed unassisted
```

---

## Validation Results Template

Create `.context/VALIDATION-RESULTS.md`:

```markdown
# Validation Results

**Date**: [YYYY-MM-DD]
**Tester**: [Name]
**Extension Version**: 0.0.1

---

## Results Summary

| Hypothesis | Target | Actual | Status |
|------------|--------|--------|--------|
| H1: Context Retention | 90% | __% | ⬜ |
| H2: Tool Invocation | 95% | __% | ⬜ |
| H3: Resume Time | <30s | __s | ⬜ |
| H4: Context Isolation | Yes | __ | ⬜ |
| H5: Usability | 80% | __% | ⬜ |

## Detailed Results

### H1: Context Retention
[Details]

### H2: Tool Invocation
[Details]

### H3: Resume Time
[Details]

### H4: Context Isolation
[Details]

### H5: Usability
[Details]

---

## Issues Found
- [ ] Issue 1
- [ ] Issue 2

## Recommendations
1. ...
2. ...

---

## Overall Assessment

⬜ PoC VALIDATED
⬜ PoC NEEDS WORK
⬜ PoC FAILED
```

---

## Success Criteria

- [ ] All automated tests pass
- [ ] H1-H5 manually tested
- [ ] Validation results documented
- [ ] Issues logged with severity
- [ ] Go/no-go decision documented

---

## Verification Steps

1. Run `npm test` — all automated tests pass
2. Execute manual test scripts
3. Fill out validation results
4. Review with stakeholder
5. Document decision

---

## Completion

After this task:
- PoC is validated against hypotheses
- Clear documentation of what works/doesn't
- Recommendation for next steps
