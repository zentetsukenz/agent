# Integration Plan: oh-my-opencode → Our Framework

> **Date**: January 6, 2026
> **Purpose**: How to incorporate learnings into our context engineering framework

---

## Executive Summary

The oh-my-opencode system reveals sophisticated context management patterns we can adopt. Key integration opportunities:

| Priority | Pattern | Effort | Impact |
|----------|---------|--------|--------|
| P0 | Protected Tools | Low | High |
| P0 | Turn Protection | Low | High |
| P0 | Delegation Protocol Structure | Medium | High |
| P1 | Intent Gate (Phase 0) | Medium | Medium |
| P1 | DCP Strategies | High | High |
| P2 | Model Tiering | High | Medium |
| P2 | Agent Metadata | High | Medium |

---

## P0: Immediate Integrations

### 1. Protected Tools Pattern

**What**: Some tool outputs should never be pruned.

**Integration**:

Update `docs/context-engineering.md` COMPRESS section:

```markdown
### Protected Context (Never Prune)

Some context is critical and should survive all compression:

| Protected Category | Examples | Why Protected |
|-------------------|----------|---------------|
| **Task State** | todowrite, todoread, task | Losing this = losing plan |
| **Code Intelligence** | lsp_rename, code_action | Active refactoring state |
| **Session State** | session_read, session_write | Continuity across checkpoints |
| **Current Errors** | Recent error outputs | Needed for debugging |
```

**Effort**: Low - just documentation update
**Files**: `docs/context-engineering.md`

---

### 2. Turn Protection

**What**: Recent tool outputs are more valuable than old ones.

**Integration**:

Update COMPRESS priority order:

```markdown
### Compression Priority (Updated)

| Priority | What | Strategy | Notes |
|----------|------|----------|-------|
| **1. Never Compress** | Current task, active errors | Keep raw | Last 3 turns protected |
| **2. Recent (3 turns)** | Recent tool outputs | Keep raw | Turn protection |
| **3. Older Successful** | Completed tool outputs | Compact | Path reference |
| **4. Oldest** | Old decisions, completed work | Summarize | Structured notes |
```

**Effort**: Low - documentation update
**Files**: `docs/context-engineering.md`

---

### 3. Delegation Protocol Structure

**What**: Formalize our dispatch format.

**Integration**:

Update `SKILLS/dispatch-context.md`:

```markdown
## Delegation Template (7-Section)

When dispatching to a subagent, MUST include:

### 1. TASK
[Single atomic goal - one action per delegation]

### 2. EXPECTED OUTCOME
[Concrete deliverables with measurable success criteria]

### 3. REQUIRED SKILLS
[Which skill to invoke, if any]
- skill: verification
- skill: checkpoint

### 4. REQUIRED TOOLS
[Explicit tool whitelist - prevents tool sprawl]
- read_file
- grep_search
- run_in_terminal

### 5. MUST DO
[Exhaustive requirements - leave NOTHING implicit]
- Follow existing patterns in [file]
- Test edge cases: [list]
- Verify by running [command]

### 6. MUST NOT DO
[Forbidden actions - anticipate rogue behavior]
- Do not modify files outside [directory]
- Do not add new dependencies
- Do not skip verification

### 7. CONTEXT
[File paths, patterns, constraints]
- Pattern: See [file] for existing implementation
- Constraint: Must maintain backward compatibility
- Files to load: #file:src/utils.ts
```

**Effort**: Medium - skill file update
**Files**: `SKILLS/dispatch-context.md`

---

## P1: Near-Term Integrations

### 4. Intent Gate (Phase 0)

**What**: Classify every request before processing.

**Integration**:

Add new skill `SKILLS/intent-gate.md`:

```markdown
# Intent Gate

> Classify before acting. Every message gets routed.

---

## Trigger

Use at the START of every substantive user request.

## Procedure

### Step 1: Identify Key Triggers

| Trigger | Action |
|---------|--------|
| External library mentioned | Research first (librarian pattern) |
| 2+ modules involved | Explore codebase structure first |
| UI/UX change needed | Consider visual-qa verification |
| "How" or "best practice" | May need oracle/researcher |
| Error after 2+ attempts | Escalate complexity |

### Step 2: Assess Complexity

| Complexity | Indicators | Approach |
|------------|------------|----------|
| Simple | Single file, clear action | Direct action |
| Medium | 2-3 files, some unknowns | Brief plan, then act |
| Complex | Multiple systems, unknowns | Full R-P-I workflow |

### Step 3: Route

- Simple → Implement directly
- Medium → Plan briefly in response
- Complex → Enter Research phase

## Output

[Complexity: X] [Route: Y] [Triggers: Z]
```

**Effort**: Medium - new skill file
**Files**: `SKILLS/intent-gate.md`, update TheEngineer prompt

---

### 5. DCP Strategies

**What**: Granular pruning beyond summarization.

**Integration**:

Add to `docs/context-engineering.md`:

```markdown
### Advanced Compression Strategies

Beyond LLM summarization, consider structural pruning:

#### 5a. Deduplication
Remove duplicate tool calls (same tool + same arguments).

**When**: Multiple identical searches, repeated file reads.

**How**: If tool signature matches earlier call, prune the earlier one.

#### 5b. Supersede Writes
If a file was written then subsequently read, the write input can be pruned.

**When**: Edit → Read → Edit → Read patterns.

**How**: The read proves the write succeeded; write details no longer needed.

#### 5c. Purge Errors
Remove errored tool outputs after N turns.

**When**: Old errors no longer relevant to current work.

**How**: After 3-5 turns, errors can be summarized to "Attempted X, failed due to Y."
```

**Effort**: High - requires understanding when to apply each
**Files**: `docs/context-engineering.md`, potentially new skill

---

## P2: Future Integrations

### 6. Model Tiering

**What**: Route tasks to appropriate cost tiers.

**Design Questions**:
- What models do we have access to?
- How do we measure "cost" of a task?
- What's the fallback if preferred model unavailable?

**Sketch**:
```markdown
| Task Type | Model Tier | Examples |
|-----------|-----------|----------|
| Exploration | FREE | Codebase search, file listing |
| Research | CHEAP | Docs lookup, pattern finding |
| Implementation | STANDARD | Code writing, testing |
| Architecture | PREMIUM | Design decisions, reviews |
```

**Effort**: High - requires model switching capability
**Deferred to**: Future design phase

---

### 7. Agent Metadata

**What**: Structured metadata enabling dynamic orchestration.

**Design Questions**:
- How does TheEngineer discover available agents?
- Should prompts be dynamically composed?
- What's the maintenance cost?

**Sketch for agent-spec.md**:
```yaml
---
metadata:
  category: specialist
  cost: cheap
  triggers:
    - domain: API development
      trigger: REST endpoints, Express routes
  useWhen:
    - Backend API changes
    - Database schema updates
  avoidWhen:
    - Frontend-only changes
    - Simple file edits
---
```

**Effort**: High - requires agent file format changes
**Deferred to**: Future design phase

---

## Implementation Order

```
Week 1: P0 Items (Low effort, high impact)
├── Update context-engineering.md with protected tools
├── Add turn protection to compression priority
└── Enhance dispatch-context.md with 7-section format

Week 2: P1 Items (Medium effort)
├── Create intent-gate.md skill
├── Update TheEngineer to reference intent-gate
└── Document DCP strategies (theory, not implementation)

Future: P2 Items (Design phase)
├── Research model tiering approaches
└── Design agent metadata schema
```

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `docs/context-engineering.md` | Protected tools, turn protection, DCP | P0, P1 |
| `SKILLS/dispatch-context.md` | 7-section delegation format | P0 |
| `SKILLS/intent-gate.md` | New file - intent classification | P1 |
| `docs/agent-spec.md` | Future: metadata schema | P2 |
| `docs/framework-design.md` | Reference new patterns | P0, P1 |

---

## Success Criteria

### P0 Complete When:
- [ ] Protected tools documented in context-engineering.md
- [ ] Turn protection added to compression priority
- [ ] Delegation template has all 7 sections

### P1 Complete When:
- [ ] Intent-gate skill created and usable
- [ ] DCP strategies documented (theory)
- [ ] TheEngineer references intent-gate

### P2 Ready for Design When:
- [ ] Model tiering requirements clear
- [ ] Agent metadata schema drafted
- [ ] Implementation cost estimated

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Over-engineering | Start with documentation, not automation |
| Complexity creep | Only implement what we actively use |
| Context overhead | Measure before/after context usage |
| Breaking changes | Additive changes only for now |

---

## Next Steps

1. **Immediate**: Update `dispatch-context.md` with 7-section format
2. **This session**: Update `context-engineering.md` with P0 items
3. **Next session**: Create `intent-gate.md` skill
4. **Future**: Design model tiering approach
