---
type: Log
title: Workflows log
description: Chronological record of significant changes to workflows
---

# Workflows Log

## 2026-07-14

- Introduced the `workflows/` top-level directory: prose-first orchestration documents
  that seed adapter-built harnesses.
- Added the [sdlc](sdlc/index.md) workflow — five ordered phases (Discovery → Planning →
  Implementation → Verification → Preservation) with three cross-cutting principles:
  shift-left verification, documentation, and architecture-first / research-backed
  decision-making.
- Named the **Orchestrator** agent role: sizes tasks and dispatches to the correct
  agent class (high/mid/low intelligence), enforcing the ~80/20 plan-output policy and
  the architecture-prerequisite gate.
- Baked the task-decomposition (6-pass + sizing scorecard) and TDD execution
  (ORIENT → SCOUT → IMPLEMENT → VERIFY → MARK DONE) playbooks into the Planning and
  Implementation phase policies.
</content>
