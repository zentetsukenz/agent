# Visual Verification

> **Strategy**: ISOLATE  
> **Purpose**: Verify UI looks correct by delegating to visual-qa subagent

---

## ⚠️ CRITICAL: Never Take Screenshots Directly

Screenshots are expensive (~100KB each) and WILL overflow your context. Context fills up, errors occur, work is lost.

**The solution: Delegate visual verification to the `visual-qa` subagent.**

---

## Trigger

Use this skill when:

- UI changes need visual verification
- Need to confirm layout, styling, responsiveness
- Debugging a visual issue you can't understand from code
- Before claiming UI work is "done"

**NOT for:**

- After every small CSS tweak (wasteful)
- Non-visual changes (use code inspection)
- When you can verify via reading component code

---

## Input

Before delegating, determine:

- [ ] What URL to navigate to
- [ ] What interactions are needed (login, clicks, etc.)
- [ ] What specifically to verify
- [ ] What viewport size (desktop, mobile, tablet)

---

## Procedure

### 1. The Delegation Pattern

When you need visual verification, use `runSubagent` to spawn the `visual-qa` agent:

1. Takes screenshots (in its own isolated context)
2. Analyzes what it sees
3. Returns TEXT description to you (~500 tokens)

**You receive only the text description—your context stays clean.**

### 2. Construct Instructions

```
Tool: runSubagent
agentName: "visual-qa"
description: "Visual UI verification"
prompt: """
[Your instructions here - see examples below]
"""
```

### 3. Instruction Examples

#### Basic Verification

```
Navigate to http://localhost:5173 and analyze the current UI state.
Report any visual issues, layout problems, or polish concerns.
```

#### With Authentication

```
Navigate to http://localhost:5173
Login with:
- Username: test@test.com
- Password: test123
Then take a screenshot of the dashboard and analyze the UI.
```

#### With Interactions

```
Navigate to http://localhost:5173/endpoints
Click on the "Create New" button
Analyze the form that appears - check field layout, labels, and button placement.
```

#### Mobile Viewport

```
Navigate to http://localhost:5173
Set viewport to mobile (375x667)
Analyze the responsive layout - check if navigation collapses properly,
content stacks correctly, and touch targets are adequate size.
```

#### Specific Focus Area

```
Navigate to http://localhost:5173/tests
Focus specifically on:
1. The test results table - are columns aligned?
2. The status badges - are colors consistent?
3. The action buttons - are they properly spaced?
```

### 4. Receive and Act on Report

The visual-qa agent returns a structured text description:

```markdown
## Page Overview
[What page/view is shown]

## Layout Assessment
[Header, navigation, main content, footer status]

## Visual Issues Found
- [Specific issues with locations]

## UI Polish Check
- Spacing/alignment: [status]
- Typography: [status]
- Colors/contrast: [status]

## Recommendation
[Priority-ordered fixes]
```

---

## Output

- Text description of UI state (~500 tokens)
- List of visual issues found
- Priority-ordered recommendations

---

## Screenshot Limit: Maximum 5 Per Session

To prevent context overflow in the subagent:

**Hard limit: 5 screenshots maximum per visual-qa invocation**

When constructing instructions:

```
✅ Good: "Check homepage, endpoints page, and test results" (3 screenshots)
✅ Good: "Verify desktop and mobile views of dashboard" (2 screenshots)  
❌ Bad: "Check all 10 pages of the application" (exceeds limit)
```

**If you need more than 5 views:**

1. Split into multiple visual-qa invocations
2. Prioritize the most critical views first
3. Group related views in each invocation

---

## Strategic Pattern

```
Code change
    ↓
Quick mental check: "Is this visual?"
    ↓
NO  → Verify via tests/code
YES → "Is this a big visual change?"
    ↓
NO  → Skip visual-qa, trust the code
YES → Delegate to visual-qa
    ↓
Receive text report
    ↓
Fix issues if any
    ↓
Continue with clean context
```

---

## Anti-patterns

- ❌ Taking screenshots directly (fills YOUR context)
- ❌ Requesting visual-qa after every tiny change
- ❌ Vague instructions ("check if it looks good")
- ❌ Requesting more than 5 screenshots per invocation
- ❌ Not specifying viewport when responsive matters

---

## Related Skills

- [verification.md](verification.md) — Full verification checklist
- [dispatch-context.md](dispatch-context.md) — General subagent delegation
- [browser-console-debugging.md](browser-console-debugging.md) — Debug runtime errors
