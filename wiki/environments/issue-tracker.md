---
type: Environment
title: Issue Tracker
description: Where issues, specs, and decision tickets live for a project, and the operations skills perform against them
tags: [tracker, issues, planning, wayfinding]
timestamp: 2026-07-16T00:00:00Z
---

# Issue Tracker

Several skills — [to-prd](../../SKILLS/planning/to-prd/SKILL.md), [to-issues](../../SKILLS/planning/to-issues/SKILL.md),
[triage](../../SKILLS/planning/triage/SKILL.md), and [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) — read from
and write to a project's **issue tracker**: the place work items, specs, and decision tickets live. This page defines
the abstraction those skills consume, and the **local-markdown tracker** every project gets by default.

## Path flexibility

Resolve the tracker configuration in priority order:

1. `loom.toml` `paths.tracker` (when the loom adapter ships) — points at a project-specific tracker doc.
2. A `docs/agents/issue-tracker.md` in the target project, if present — a project may override the tracker choice
   (GitHub Issues, GitLab Issues, Jira, Linear, etc.) there. Follow its conventions instead of the default below.
3. **This page's local-markdown default** — used when neither of the above exists. No setup step is required; a
   project can start using the tracker skills immediately.

## Local-markdown tracker (default)

Issues, specs, and decision tickets live as markdown files under `.scratch/` at the project root.

### Conventions

- One feature/effort per directory: `.scratch/<effort-slug>/`
- The spec (PRD) is `.scratch/<effort-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<effort-slug>/issues/<NN>-<slug>.md`, numbered from `01`
  — never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file — see the triage skill's role
  vocabulary for the canonical strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

### "Publish to the issue tracker"

Create a new file under `.scratch/<effort-slug>/` (creating the directory if needed).

### "Fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the ticket number directly.

## Wayfinding operations

Used by [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) to chart and work a **map** of decision tickets. The
map is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort-slug>/map.md` — the Destination / Notes / Decisions-so-far / Not-yet-specified /
  Out-of-scope body (see wayfinder's map template).
- **Child ticket**: `.scratch/<effort-slug>/issues/<NN>-<slug>.md`, numbered from `01`. A `Type:` line records the
  ticket type (`research` / `prototype` / `grilling` / `task`); a `Status:` line records `open` / `claimed` /
  `resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top, listing the ticket numbers that must resolve first. A
  ticket is **unblocked** when every file it lists is `resolved`.
- **Frontier**: scan `.scratch/<effort-slug>/issues/` for files that are `open`, unblocked, and unclaimed
  (no `Claimed-by:` line) — first by number wins.
- **Claim**: set `Status: claimed` and a `Claimed-by:` line, then save — before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context
  pointer (gist + relative link) to the map's Decisions-so-far in `map.md`.

### On a tracker with native issues (GitHub, GitLab, etc.)

When a project's `docs/agents/issue-tracker.md` names GitHub, GitLab, or another tracker with real issue objects,
prefer its **native** primitives over the file conventions above:

- The map is a single issue labelled `wayfinder:map`; tickets are its child issues.
- Ticket type is a `wayfinder:<type>` label (`wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`,
  `wayfinder:task`).
- **Claim** = assign the ticket to the driving session's user/bot identity.
- **Blocking** uses the tracker's native issue-dependency relationship (e.g. GitHub's "blocked by") so the frontier
  renders visually in the tracker's own UI. Only fall back to a body convention (a `Blocked by:` line) if the
  tracker has no native blocking relationship.
- **Frontier** = the open, unblocked, unassigned child issues of the map.

## Related

- [to-prd](../../SKILLS/planning/to-prd/SKILL.md), [to-issues](../../SKILLS/planning/to-issues/SKILL.md),
  [triage](../../SKILLS/planning/triage/SKILL.md) — publish to and query this tracker.
- [wayfinder](../../SKILLS/planning/wayfinder/SKILL.md) — the Wayfinding operations above.
