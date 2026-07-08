---
name: browser-console-debugging
description: Debug frontend runtime errors by delegating browser console capture and analysis to browser-console-debugger, keeping stack traces and logs isolated while using concrete reproduction steps and structured reports.
---

# Browser Console Debugging

> **Purpose**: Debug frontend runtime errors by delegating to a specialized subagent that captures and analyzes browser console output. Ensures clean context and unbiased debugging sessions.

---

## When to Use This Skill

- Runtime error visible in UI (something crashes or doesn't work)
- JavaScript error suspected but unclear what
- React rendering issues
- "Something doesn't work" without clear cause
- Need to inspect browser console state

**NOT for** (use other skills):

- Server not running → `SKILLS/server-operations.md`
- API returning wrong data → investigate backend
- Performance issues → future lighthouse skill

---

## Core Principle: Always Delegate

**Never debug browser console directly.** Always delegate to the `browser-console-debugger` subagent.

Why:

- **Clean context** - Subagent has no bias from your previous work
- **Focused session** - Only debugging, no distractions
- **Context protection** - Console logs, stack traces stay in subagent
- **Predictable** - Same repro steps → same results

---

## Procedure

### Step 1: Gather Reproduction Steps

Before delegating, you MUST have clear reproduction steps:

```markdown
## Reproduction Steps
1. Navigate to [specific URL]
2. [Specific action - click button X, fill field Y, etc.]
3. [Another specific action]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens / error observed]
```

**Quality check:**

- [ ] URL is specific (e.g., `http://localhost:5173/tests/123`, not "the tests page")
- [ ] Actions are concrete (e.g., "Click the 'Run Test' button", not "run a test")
- [ ] Expected vs actual behavior is clear

If you can't write clear repro steps, investigate more before delegating.

### Step 2: Verify Server Is Running

Before delegating, confirm the app is accessible:

```fish
# Check backend
curl -s http://localhost:3001/api/health

# Check frontend
curl -s http://localhost:5173 | head -5
```

If either fails, use [server-operations.md](../../server-operations.md) first.

### Step 3: Delegate to Subagent

Use `runSubagent` with the `browser-console-debugger` agent:

```
Tool: runSubagent
agentName: "browser-console-debugger"
description: "Debug frontend console error"
prompt: """
## Reproduction Steps
1. Navigate to http://localhost:5173/[path]
2. [action]
3. [action]

## Expected Behavior
[what should happen]

## Actual Behavior
[what actually happens]

Execute these steps, capture all browser console output, and return a structured debugging report.
"""
```

### Step 4: Receive and Act on Report

The subagent returns a structured report with:

- Reproduction results (did the issue reproduce?)
- Console findings (errors, warnings, counts)
- Error details (messages, sources, stack traces)
- Analysis (what's causing it)
- Recommended investigation (where to look)

**Based on the report:**

| Report Says | Your Action |
|-------------|-------------|
| Error in specific file:line | Read that file, fix the issue |
| Network failure | Check server-operations, API endpoint |
| React warning | Fix the React pattern issue |
| Could not reproduce | Verify repro steps, try again with more detail |
| No errors found | Issue may be logic bug, not runtime error |

---

## Prompt Templates

### Basic Runtime Error

```
## Reproduction Steps
1. Navigate to http://localhost:5173/endpoints
2. Click the "Create New" button
3. Fill in Name: "Test", URL: "http://example.com"
4. Click "Save"

## Expected Behavior
Form submits, redirects to endpoint list, shows success toast

## Actual Behavior
Nothing happens when clicking Save, no error visible to user

Execute these steps, capture all browser console output, and return a structured debugging report.
```

### UI Not Rendering

```
## Reproduction Steps
1. Navigate to http://localhost:5173/tests/123
2. Wait for page to load

## Expected Behavior
Test details page shows with results, phases, and metrics

## Actual Behavior
Page shows loading spinner indefinitely, or blank content area

Execute these steps, capture all browser console output, and return a structured debugging report.
```

### After User Action

```
## Reproduction Steps
1. Navigate to http://localhost:5173/tests
2. Click on the first test row in the table
3. In the modal that opens, click "Delete"
4. Confirm deletion in the dialog

## Expected Behavior
Test is deleted, modal closes, table refreshes without the deleted item

## Actual Behavior
Modal closes but table still shows deleted item, requires manual refresh

Execute these steps, capture all browser console output, and return a structured debugging report.
```

---

## Quick Reference

```markdown
## Delegation Checklist

Before delegating:
- [ ] Repro steps are specific and concrete
- [ ] Server is running (backend + frontend)
- [ ] Expected vs actual behavior is clear

Delegation:
- [ ] Use `runSubagent` with `browser-console-debugger`
- [ ] Include full repro steps in prompt
- [ ] Ask for structured debugging report

After receiving report:
- [ ] Read the analysis and recommendations
- [ ] Fix the identified issue
- [ ] Re-run repro steps to verify fix
```

---

## Anti-patterns

❌ **Don't** use Playwright directly for debugging - always delegate  
❌ **Don't** delegate with vague steps like "check the page"  
❌ **Don't** skip server verification - debugging a dead server wastes time  
❌ **Don't** ignore the subagent's report - it captured actual console state  
❌ **Don't** retry same repro if it didn't reproduce - refine the steps first

---

## Related Skills

- [verification-before-completion](../verification-before-completion/SKILL.md) — Full verification checklist
- [visual-verification](../visual-verification/SKILL.md) — Visual UI verification
