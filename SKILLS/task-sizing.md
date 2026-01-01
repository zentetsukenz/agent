# Task Sizing

> **Strategy**: Assessment before action  
> **Purpose**: Decide whether to do directly or dispatch

---

## Trigger

Use this skill:

- Before starting ANY non-trivial task
- When unsure whether to dispatch
- When planning implementation phase

---

## Input

For the task at hand, estimate:

- Number of files to read
- Amount of code to generate
- Number of commands to run
- Whether task is exploratory or well-defined

---

## Procedure

### 1. Ask Sizing Questions

| Question | Low Context | High Context |
|----------|-------------|--------------|
| How many files to read? | 1-2 | 5+ |
| How much code to write? | <50 lines | 200+ lines |
| How many commands to run? | 1-3 | 10+ |
| Is it exploratory? | No, well-defined | Yes, unknown scope |
| Does it involve media? | No | Screenshots, large outputs |

### 2. Apply Heuristics

| Size | Context Cost | Indicators | Action |
|------|--------------|------------|--------|
| **Small** | ~1-5% | Single file, quick fix, clarification, config change | **Do directly** |
| **Medium** | ~5-20% | Few files, moderate logic, some research, new feature | **Consider dispatch** |
| **Large** | >20% | Many files, complex logic, deep research, UI verification | **Must dispatch** |

### 3. Check for Dispatch Triggers

**Always dispatch when:**

- [ ] Task involves screenshots or visual verification → `visual-qa`
- [ ] Task requires reading 5+ files
- [ ] Task involves deep research with many web queries → `Researcher`
- [ ] Task is implementing a large feature (100+ lines)

**Consider dispatch when:**

- [ ] You're already at >40% context
- [ ] Task feels "heavy" or exploratory
- [ ] Multiple unknowns exist

### 4. Make Decision

```
IF task is Small (<5%):
    → Do directly
    
ELSE IF task is Medium (5-20%):
    → Consider current context level
    → If <40% context: probably do directly
    → If >40% context: probably dispatch
    
ELSE IF task is Large (>20%):
    → Must dispatch
```

---

## Output

Clear decision:

- **Do directly** — proceed with task
- **Dispatch to [subagent]** — use [dispatch-context.md](dispatch-context.md)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                    TASK SIZING                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SMALL (<5%)           → Do directly                    │
│  • Single file                                          │
│  • Quick fix                                            │
│  • Config change                                        │
│                                                         │
│  MEDIUM (5-20%)        → Consider dispatch              │
│  • Few files                                            │
│  • Moderate logic                                       │
│  • Some research                                        │
│                                                         │
│  LARGE (>20%)          → Must dispatch                  │
│  • Many files                                           │
│  • Complex logic                                        │
│  • Deep research                                        │
│  • Visual verification                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Current context >40%? Bias toward dispatch.            │
└─────────────────────────────────────────────────────────┘
```

---

## Examples

### Small Task (Do Directly)
>
> "Fix the typo in the button label"

- 1 file to read
- 1 line to change
- No research needed
- **→ Do directly**

### Medium Task (Consider)
>
> "Add validation to the form"

- 2-3 files (component, service, tests)
- ~50 lines of code
- Pattern exists in codebase
- **→ Do directly if context <40%, dispatch if >40%**

### Large Task (Must Dispatch)
>
> "Verify the entire checkout flow looks correct"

- Multiple pages/states
- Screenshots needed
- Visual comparison
- **→ Dispatch to visual-qa**

---

## Anti-patterns

- ❌ Not assessing before starting (jumping in)
- ❌ Doing large tasks directly ("I can handle it")
- ❌ Dispatching trivial tasks (overhead not worth it)
- ❌ Ignoring current context level

---

## Related Skills

- [dispatch-context.md](dispatch-context.md) — How to dispatch
- [checkpoint.md](checkpoint.md) — If context is high, checkpoint first
