---
name: research
description: Investigate a focused question against high-trust primary sources and capture the findings as a single cited Markdown file. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent. NOT for multi-candidate comparisons or recommendations (use research-recommend) — this skill answers one question, it doesn't score options.
---

# Research

A single-question research errand, run as a background subagent so the calling session keeps working while it reads.

Do not use this skill for comparative research, option scoring, or shortlist building — that's [research-recommend](../research-recommend/SKILL.md). Use this one when the question has a single answer to find, not several candidates to weigh.

## Process

1. **Dispatch.** Spin up an `Explore`-style subagent (via `runSubagent`) to do the reading, so the calling session isn't blocked on it. Hand it the precise question — not a vague topic.
2. **Primary sources only.** The subagent's job is to investigate against **primary sources** — official docs, source code, specs, first-party APIs — not a secondary write-up of them. Follow every claim back to the source that owns it.
3. **Write the findings.** One Markdown file, every claim cited with a source (path, URL, or doc section).
4. **Save it where the repo already keeps such notes.** Match the existing convention if one exists (e.g. a `.omo/research/` or `.scratch/` directory already in use). If there is none, default to `.omo/research/<topic-slug>-<YYYY-MM-DD>.md` and say where you put it.

## When invoked as a wayfinder research ticket

A [wayfinder](../../planning/wayfinder/SKILL.md) `research` ticket resolves through this skill: the ticket's Question becomes the subagent's brief, and the resulting findings file is what the ticket links as its resolution asset (see wayfinder's [Ticket Types](../../planning/wayfinder/SKILL.md#ticket-types)). Research tickets are the one wayfinder ticket type that can run several-at-once in parallel, since each is AFK and independent.

## Output

A single findings file containing:

- The question being answered.
- The answer, in prose, with inline citations back to primary sources.
- A short "sources consulted" list at the bottom (path/URL + what it confirmed).

Don't pad this into a full literature review or comparative matrix — that's out of scope for this skill.
