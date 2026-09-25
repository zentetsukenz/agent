---
type: Research
title: BenchLM — grading models to pick a good-enough one
description: Whether BenchLM's leaderboard and dataset can pick a good-enough model for a job — what it measures, what it publishes, and where it cannot answer for Jacquard
tags: [research, model, benchmark, leaderboard, model-selection, benchlm]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://benchlm.ai/, title: BenchLM leaderboard, last_modified: 2026-09-24 }
  - { resource: https://benchlm.ai/methodology, title: BenchLM methodology }
  - { resource: https://benchlm.ai/data, title: BenchLM dataset }
  - { resource: https://benchlm.ai/about, title: About BenchLM }
  - { resource: https://benchlm.ai/deprecations, title: AI model deprecation calendar }
---

# BenchLM — grading models to pick a good-enough one

*As of 2026-09-25; BenchLM's own page read "Last verified: September 24, 2026".* Part of the
[Model](index.md) pillar.

**Hypothesis under test** (the user's): *"This is where I think you can grade the LLM intelligence
level so you can suggest a good enough model to fit a job."*

**Verdict: partly.** BenchLM publishes enough — per-category scores, prices and context windows, in a
downloadable dataset — for a script to shortlist the cheapest model above a bar. It cannot say
whether that model is good enough *for Jacquard's jobs*, because it grades models under other people's
harnesses on other people's tasks, and its weighting is not published.

## What it is

| Fact | As of | Source |
|---|---|---|
| A leaderboard tracking 507 LLMs, of which 194 are ranked and 74 "verified", from 483 benchmark records in 8 weighted categories | 2026-09-24 | [benchlm.ai](https://benchlm.ai/) |
| Built and maintained by one person ("Glevd") — not an institution | 2026-09-25 | [About](https://benchlm.ai/about) |
| The methodology combines "benchmark results, evidence quality, freshness, pricing, and runtime metadata"; the category weights are **not published** there | 2026-09-25 | [Methodology](https://benchlm.ai/methodology) |
| Dataset: machine-readable JSON — 380 canonical model families, 483 benchmarks, pricing, context windows, release metadata, runtime. **No licence stated.** | 2026-09-25 | [Dataset](https://benchlm.ai/data) |
| Also keeps a deprecation calendar across OpenAI, Anthropic, Google, Mistral and Azure | 2026-09-25 | [Deprecations](https://benchlm.ai/deprecations) |

Top of the board on 2026-09-24: GPT-6 Astra 88.69, Claude Opus 5.5 86.98, GPT-6 Sol 81.28 ($10/M output
tokens). Best open-weight: Qwen3.8 Max at 71.8. These numbers are the reason this page goes stale in
60 days.

## Bearing on Jacquard

- **For the shortlist, yes.** The dataset joins capability, price and context window per model. A
  per-job rule — "cheapest model with coding ≥ X and agentic ≥ Y, context ≥ Z" — is a script, not a
  judgment: "a model should never have to … reason about what a script could check" (VISION,
  conviction 1).
- **For the verdict, no.** The [Harness](../harness/index.md) pillar records the same model scoring
  very differently under different harnesses. A leaderboard grades a model inside someone else's
  harness; "good enough" for Jacquard is only known by running the project's own checks on the
  shortlisted model.
- **Small and local models are thin on the board.** A leaderboard led by frontier models under-serves
  "the smaller, cheaper and more local the model each task needs".

## Caveats

- One maintainer, unpublished weights, no dataset licence — fine to read, risky to build a
  dependency on. Pin a dated snapshot rather than calling it live.
- Scores aggregate published benchmark results, many *vendor-reported*.
