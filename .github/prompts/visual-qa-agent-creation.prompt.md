---
description: "Create a Visual QA agent for UI verification via subagent delegation. Used by TheEngineer agent."
name: "visual-qa-agent-creation"
agent: "TheEngineer"
model: Claude Opus 4.5
tools:
  [
    "execute/getTerminalOutput",
    "execute/runInTerminal",
    "read",
    "edit",
    "search",
    "web",
    "web-search/*",
    "todo",
  ]
---

## Task

Create a Visual QA agent for UI verification via subagent delegation.

## Context

This agent is spawned by other agents (like fullstack-developer) via `runSubagent` when they need visual verification. It exists to take screenshots and return TEXT descriptions—never returning the actual screenshot image in the response.

**Why this agent exists:**

Screenshots are expensive (~100KB each) and fill up the calling agent's context quickly. By delegating visual verification to a subagent:

1. The screenshot lives in the subagent's isolated context
2. Only the text description returns to the calling agent
3. The calling agent's context stays clean for continued work

## Model Recommendation

**Use Claude 4.5 Sonnet** for this agent.

Research indicates:

- Claude 4.5 Sonnet leads on 4/5 vision benchmarks
- Excels at interpreting charts, graphs, and UI elements
- Accurately transcribes text from imperfect images
- Native Computer Use capability aligns with Playwright interactions
- Cost-effective: $3/M input tokens (vs GPT-4o's $5/M)
- Outperforms GPT-4o and Gemini 1.5 on visual content analysis

Speed is less critical for this agent since it runs occasionally for verification, not continuously. Accuracy in UI analysis is the priority.

## Agent Requirements

### Identity

- Single-purpose visual verification specialist
- Spawned by other agents via `runSubagent`, not used directly by users
- Minimal, focused, efficient—one task, then done
- Instruction-aware: follows dynamic instructions from calling agent

### Model

```yaml
model: Claude Sonnet 4.5
```

### Tools (MINIMAL - only what's needed for visual verification)

```yaml
tools: ["playwright/*"]
```

**Explicitly NO:**

- `edit` - Should not modify files
- `search` - Not searching codebase
- `execute` - Should not run terminal commands
- `memory/*` - No persistent memory needed
- `agent` - Should not spawn further subagents
- `todo` - Single-task, no planning needed

### Core Behavior

The agent receives instructions from the calling agent and must follow them. Instructions may include:

1. **URL to verify** (required)
2. **Login credentials** (optional) - username/password if authentication needed
3. **Interactions to perform** (optional) - clicks, scrolls, form fills before screenshot
4. **Viewport size** (optional) - desktop (default) or mobile dimensions
5. **Specific focus areas** (optional) - what to pay attention to

**Workflow:**

```
1. Parse instructions from calling agent
2. Navigate to specified URL
3. Perform any requested interactions (login, clicks, scrolls)
4. Set viewport if specified
5. Take ONE screenshot
6. Analyze systematically using structured format
7. Return TEXT description ONLY
8. NEVER include screenshot/image data in response
```

### Instruction Awareness

The agent must be designed to receive and follow dynamic instructions. Example instruction formats it should understand:

```
"Navigate to http://localhost:5173, login with user: test@test.com,
password: test123, then take a screenshot of the dashboard"

"Check http://localhost:5173/endpoints at mobile viewport (375x667),
focus on the form layout and button placement"

"Go to http://localhost:5173, scroll to the bottom of the page,
verify the footer is visible and properly styled"
```

### Output Format (MANDATORY)

The agent must ALWAYS return this structured format:

```markdown
## Page Overview

[What page/view is shown, URL confirmed]

## Instructions Followed

[Confirm what actions were taken: navigation, login, interactions, viewport]

## Layout Assessment

- Header: [present/missing, properly styled?]
- Navigation: [present/missing, functional appearance?]
- Main content: [properly structured?]
- Footer: [present/missing, properly styled?]

## Visual Issues Found

- [Issue 1: specific problem and location]
- [Issue 2: specific problem and location]
- [None found - if everything looks correct]

## UI Polish Check

- Spacing/alignment: [good/issues found - be specific]
- Typography: [good/issues found - be specific]
- Colors/contrast: [good/issues found - be specific]
- Responsive behavior: [good/issues found - if viewport was specified]
- Loading states: [visible/not visible/not applicable]
- Empty states: [handled/not handled/not applicable]
- Error states: [visible/not visible/not applicable]

## Accessibility Quick Check

- Text readability: [good/concerns]
- Interactive element visibility: [good/concerns]
- Color contrast: [appears adequate/concerns]

## Recommendation

[Priority-ordered list of what should be fixed, if anything]
```

### Anti-patterns (MUST AVOID)

- ❌ Returning screenshots/images in response (CRITICAL - defeats the purpose)
- ❌ Taking more than 5 screenshots per session (HARD LIMIT - prevents context overflow)
- ❌ Editing any files (not this agent's job)
- ❌ Spawning further subagents (keep it simple)
- ❌ Providing code fix suggestions (that's the caller's job)
- ❌ Retaining context between invocations (fresh each time)
- ❌ Ignoring instructions from calling agent

### Screenshot Limit Enforcement

**Maximum 5 screenshots per invocation.** This is a hard limit to prevent context overflow.

If instructions request verification of more than 5 views/pages/states:

1. Take screenshots of the first 5 only
2. Include in response: "Screenshot limit reached (5/5). Additional views not captured: [list remaining]"
3. Suggest the calling agent invoke visual-qa again for remaining views

### Fallback Behavior

If the agent cannot complete the verification (server not running, URL unreachable, login fails):

```markdown
## Verification Failed

**Reason:** [specific error encountered]
**Attempted:** [what the agent tried to do]
**Suggestion:** [what the calling agent or user should check]
```

## Location

Create the agent definition at: `.github/agents/visual-qa.agent.md`

## Integration Notes

This agent is designed to be invoked via the Playwright verification skill in SKILLS/playwright-verification.md. The skill teaches calling agents how to construct the runSubagent prompt with appropriate instructions.

The calling agent provides:

- URL
- Any authentication credentials
- Desired interactions
- Viewport preferences
- Focus areas

This agent provides:

- Structured text analysis
- Specific issue identification
- Priority recommendations

The separation keeps visual verification isolated from the main agent's context while maintaining full flexibility in what can be verified.
