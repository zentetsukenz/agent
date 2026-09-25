---
type: Index
title: Research
description: The dated literature and landscape behind Jacquard's vision, in three pillars — Model, Harness, Agent — kept as background, not authority
tags: [research, model, harness, agent, freshness]
---

# Research

The evidence behind [VISION.md](../../VISION.md), organised by the vision's own equation —
*agent = model + harness* — into three pillars. Harness carries the most weight, because the harness
is what Jacquard is.

This directory is **background, not authority**. The vision does not depend on any source here, and
nothing here amends it. Evidence *against* the vision is kept beside evidence for it: the "how"
documents need to know where the vision is hard, and a research base that only agrees is advocacy.

## The pillars

| Pillar | Asks | Mostly backs |
|---|---|---|
| [Model](model/index.md) | How much model does a task need once it has the right context — and what does that cost, and how fast does the answer change? | "Why this is possible now"; conviction 1 |
| [Harness](harness/index.md) | What around the model moves results; which harnesses exist, what shape each has, and where each keeps its knowledge | "The picture"; convictions 1, 2 and 4 |
| [Agent](agent/index.md) | How agents run — resident and ephemeral, alone and together — and how they work with the humans who decide | "The picture"; convictions 2 and 3 |

Outside the pillars: [naming](naming.md) — why the name Jacquard, and which names were already taken.

## Freshness

Everything here goes stale: a harness ships weekly, a leaderboard reorders monthly, a standard
changes governance in a quarter. So everything here is dated — the fields
[SPEC.md](../../SPEC.md#research--dated-pages) requires on every page (`generated`, `verified`,
`stale_after`), a date on every source, and an *as of* on every fast-moving number.

**Before you rely on a page:**

1. Read its `stale_after`. `bash scripts/validate.sh` lists every page past it as advisory.
2. Read each claim as true *as of* its date, not as true now. Even a fresh page holds numbers — a
   star count, a price, a benchmark score — that were only true on the day they were read.
3. If the page is stale, or the claim carries a decision, fact-check the claims you use against
   their sources first. A stale page is a lead, not an answer.
4. Record what you checked: append a `verified` entry, correct anything that changed (and bump
   `generated`), and move `stale_after` forward.

**When you add research:** go to primary sources; record each source's own date and the day you
read it; mark vendor numbers *vendor-reported*, pre-release software *preview*, and unreviewed
papers *preprint*. Set `stale_after` to 60 days after `generated` on a page that tracks products,
models, benchmarks or standards, and 180 days on a page that holds only literature.
