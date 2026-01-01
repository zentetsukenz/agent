# Prisma Patterns Classification: Skill vs Knowledge

**Date**: January 1, 2026  
**Status**: To be analyzed  
**File**: SKILLS/prisma-patterns.md

---

## Question

Is `SKILLS/prisma-patterns.md` actually a **skill** (procedural, "how to do X") or **knowledge** (declarative, reference material)?

---

## Decision Criteria

### Skill Characteristics

A file belongs in SKILLS/ if it:

- Describes **procedures** or **workflows** ("how to accomplish task X")
- Contains **when to use** guidance (triggers skill activation)
- Includes **step-by-step instructions**
- Shows **decision points** and **branching logic**
- Teaches **judgment patterns** (when/why, not just what)

**Example**: verification.md (checklist of steps to verify work)

### Knowledge Characteristics

A file belongs in docs/ if it:

- Provides **reference material** (patterns, examples, API docs)
- Contains **declarative information** (facts, configurations, schemas)
- Serves as **lookup documentation** (copy examples, check syntax)
- Has **no procedural flow** (no "first do X, then Y")
- Is **context that informs decisions** rather than procedure

**Example**: backend-api-patterns.md (reference examples for controller/service patterns)

---

## Analysis Tasks

### 1. Read Current Content

```bash
cat SKILLS/prisma-patterns.md
```

Document:

- Structure of the file
- Type of content (procedures vs reference)
- How it's currently used (based on references in agents)

### 2. Evaluate Against Criteria

For each section in prisma-patterns.md:

| Section | Procedural? | Reference? | Skill or Knowledge? |
|---------|-------------|------------|---------------------|
| [Name]  | [Y/N + why] | [Y/N + why]| [Conclusion]       |

### 3. Check Agent References

How do agents currently use it?

```bash
grep -r "prisma-patterns" .github/agents/
```

- Do agents reference it as "read this before doing X" (skill)?
- Or "check this for examples" (knowledge)?

### 4. Make Recommendation

Based on analysis:

**Option A: Keep as Skill**

- If: Primarily procedural with "when to use" guidance
- Action: Enhance procedural aspects, add decision points

**Option B: Move to Knowledge**

- If: Primarily reference/examples with minimal procedure
- Action: Move to `docs/prisma-patterns.md`
- Update: All agent references (.github/agents/*.md)

**Option C: Split**

- If: Contains both procedural and reference content
- Action:
  - Procedural → SKILLS/prisma-operations.md
  - Reference → docs/prisma-patterns.md

### 5. Implementation Checklist

If moving to docs/:

- [ ] Create docs/prisma-patterns.md with content
- [ ] Update backend-api.agent.md reference
- [ ] Update fullstack-developer.agent.md reference
- [ ] Delete SKILLS/prisma-patterns.md
- [ ] Update docs/index.md if it exists

If splitting:

- [ ] Create SKILLS/prisma-operations.md (procedural)
- [ ] Create docs/prisma-patterns.md (reference)
- [ ] Update agent references to use correct file
- [ ] Delete original SKILLS/prisma-patterns.md

---

## Expected Outcome

**Clear classification** that:

1. Aligns with framework principles (skills are procedural, docs are reference)
2. Makes content easier to find and use
3. Reduces confusion about SKILLS/ vs docs/ distinction
4. Improves agent context efficiency (load only what's needed)

---

## Next Steps

1. Read SKILLS/prisma-patterns.md completely
2. Fill out analysis sections above
3. Make recommendation
4. Implement if classification changes
