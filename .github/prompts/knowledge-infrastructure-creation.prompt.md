---
description: "Create a knowledge infrastructure for a software project repository. Used by TheEngineer agent."
name: "knowledge-infrastructure-creation"
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

Create a knowledge infrastructure for the load-tester project that will serve as persistent memory across all agent interactions.

## Context

We're experimenting with solving context degradation in long-running agent tasks. The hypothesis is that separating persistent knowledge (what's true about the project) from episodic context (what happened today) will improve agent quality and reduce the need for human intervention.

## Pain Points This Should Solve

These are real issues we've experienced with agents:

1. **Quality degradation**: Agents claim "done" when work is functionally complete but not polished
2. **UI/UX roughness**: Application works but is unusable due to poor UX
3. **Ignored warnings**: Deprecation warnings and linting errors left unaddressed (e.g., recently upgraded from Prisma 5 to 7 due to deprecated URL field, but agent claimed "done" while deprecation warnings still existed)
4. **Skill loss**: Agents forget Fish shell syntax during long sessions, reverting to bash
5. **No self-verification**: Agents report completion without actually checking their work
6. **Lost context**: After context summarization, agents lose project-specific knowledge

## Environment

- Developer uses Fish shell (macOS) - NOT bash
- Quality bar is production-ready, not prototype
- "Done" means verified, polished, and warning-free

## Create these files in load-tester:

1. KNOWLEDGE.md - Project semantic memory

- Tech stack and versions (be specific—check actual package.json files)
- Architecture decisions and patterns used
- Project structure explanation
- Known gotchas and environment specifics (e.g., Fish shell, not bash)
- Recent learnings (leave space for future additions)

2. STANDARDS.md - Quality expectations

- Definition of "done" (be specific—what makes work production-ready, not just functional?)
- Code quality standards
- UI/UX standards (this project needs polish, not prototypes)
- Verification requirements (agents must verify work before claiming done)
- Communication standards (when to ask questions, when to proceed)

3. SKILLS/ directory - Procedural memory (create 2-3 initial skills)

- fish-shell.md - Correct Fish shell syntax (critical—agents often use bash syntax incorrectly)
- prisma-patterns.md - Common Prisma operations for this project
- verification-checklist.md - How to verify work is actually done

## Requirements:

- Read the actual codebase to extract accurate information
- These files will be read by agents at session start, so make them scannable and useful
- Include sections that can be updated as the project evolves
- Focus on information that prevents common mistakes and quality degradation

## Success criteria:

An agent reading these files should:

- Understand the project without reading every file
- Know what "done" means without asking
- Avoid common mistakes (wrong shell syntax, outdated Prisma patterns)
- Know when to ask clarifying questions vs. proceed
