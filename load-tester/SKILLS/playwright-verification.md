# UI Verification with Playwright

## ⚠️ CRITICAL: Never Take Screenshots Directly

Screenshots are expensive (~100KB each) and WILL overflow your context. You have experienced this failure before—context fills up, 413 errors occur, work is lost.

**The solution: Delegate visual verification to a subagent (visual-qa).**

## The Delegation Pattern

When you need visual verification, use `runSubagent` to spawn the visual-qa agent that:
1. Takes the screenshot (in its own isolated context)
2. Analyzes what it sees
3. Returns a TEXT description to you

You receive only the text description—your context stays clean.

## How to Delegate

Use the `runSubagent` tool with the visual-qa agent:

```
Tool: runSubagent
agentName: "visual-qa"
Description: "Visual UI verification"
Prompt: """
[Your instructions here - see examples below]
"""
```

## Instruction Examples

The visual-qa agent is instruction-aware. You can pass dynamic instructions based on what you need.

### Basic Verification
```
Navigate to http://localhost:5173 and analyze the current UI state.
Report any visual issues, layout problems, or polish concerns.
```

### With Authentication
```
Navigate to http://localhost:5173
Login with:
- Username: test@test.com
- Password: test123
Then take a screenshot of the dashboard and analyze the UI.
```

### With Interactions
```
Navigate to http://localhost:5173/endpoints
Click on the "Create New Endpoint" button
Analyze the form that appears - check field layout, labels, and button placement.
```

### Mobile Viewport
```
Navigate to http://localhost:5173
Set viewport to mobile (375x667)
Analyze the responsive layout - check if navigation collapses properly,
content stacks correctly, and touch targets are adequate size.
```

### Scroll Verification
```
Navigate to http://localhost:5173
Scroll to the bottom of the page
Verify the footer is visible, properly positioned, and styled correctly.
```

### Specific Focus Area
```
Navigate to http://localhost:5173/tests
Focus specifically on:
1. The test results table - are columns aligned?
2. The status badges - are colors consistent?
3. The action buttons - are they properly spaced?
```

## What Visual-QA Returns

The visual-qa agent returns a structured text description:

```markdown
## Page Overview
[What page/view is shown]

## Instructions Followed
[Confirms what actions were taken]

## Layout Assessment
[Header, navigation, main content, footer status]

## Visual Issues Found
- [Specific issues with locations]

## UI Polish Check
- Spacing/alignment: [status]
- Typography: [status]
- Colors/contrast: [status]
- Loading/empty/error states: [status]

## Recommendation
[Priority-ordered fixes]
```

## When to Request Visual Verification

**Do request verification:**
- After completing a logical chunk of UI changes
- Before claiming UI work is done
- When debugging a visual issue you can't understand from code

**Don't request verification:**
- After every small CSS tweak (wasteful)
- For non-visual changes (use code inspection)
- When you can verify via reading component code

## ⚠️ Screenshot Limit: Maximum 5 Per Session

The visual-qa agent can take multiple screenshots in a single session (e.g., checking different pages or states). However, to prevent context overflow:

**Hard limit: 5 screenshots maximum per visual-qa invocation**

When constructing instructions that require multiple screenshots:

```
✅ Good: "Check the homepage, endpoints page, and test results page" (3 screenshots)
✅ Good: "Verify desktop and mobile views of the dashboard" (2 screenshots)  
❌ Bad: "Check all 10 pages of the application" (exceeds limit)
```

**If you need more than 5 views verified:**
1. Split into multiple visual-qa invocations
2. Prioritize the most critical views first
3. Group related views in each invocation

Example of splitting:
```
# First invocation (3 screenshots)
"Check homepage, endpoints list, and create endpoint form"

# Second invocation (3 screenshots)  
"Check test configuration page, test results page, and dashboard"
```

## Strategic Pattern

```
Iterations 1-3: Make changes → verify via code reading
Checkpoint:     Request visual-qa verification
Iterations 4-6: Fix reported issues → verify via code reading  
Final:          Request visual-qa verification → confirm done
```

## Anti-patterns

- ❌ Taking screenshots directly (NEVER do this)
- ❌ Requesting verification after every small change
- ❌ Ignoring the subagent's findings
- ❌ Skipping verification entirely before claiming done

## Fallback: If Subagent Fails

If subagent delegation doesn't work for some reason:
1. Ask the user to check the UI manually
2. Request they describe what they see
3. Work from their text description

Never fall back to taking screenshots directly—the context overflow is not worth it.
