---
type: Research
title: Model — how much model a task needs
description: The Model pillar — evidence on what models cost, what small models can do given the right context, what no model can recover, how fast models change hands, and how to pick the smallest one that suffices
tags: [research, model, small-models, cost, context, routing, deprecation]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://a16z.com/llmflation-llm-inference-cost/, title: Welcome to LLMflation, last_modified: 2024-11-12 }
  - { resource: https://arxiv.org/abs/2510.04618, title: Agentic Context Engineering (ACE), last_modified: 2026-03-29 }
  - { resource: https://arxiv.org/abs/2602.22124, title: "SWE-Protégé: Learning to Selectively Collaborate With an Expert", last_modified: 2026-02-28 }
  - { resource: https://www.morphllm.com/best-open-source-coding-model-2026, title: Best open-source coding model 2026 (Morph) }
  - { resource: https://epoch.ai/benchmarks/swe-bench-verified, title: SWE-bench Verified (Epoch AI) }
  - { resource: https://arxiv.org/abs/2307.03172, title: Lost in the Middle, last_modified: 2023-07-03 }
  - { resource: https://www.trychroma.com/research/context-rot, title: Context Rot (Chroma) }
  - { resource: https://openai.com/index/introducing-swe-bench-verified/, title: Introducing SWE-bench Verified, last_modified: 2024-08-13 }
  - { resource: https://arxiv.org/abs/2511.08798, title: Structured Uncertainty guided Clarification for LLM Agents }
  - { resource: https://metr.org/blog/2026-1-29-time-horizon-1-1/, title: Time Horizon 1.1 (METR), last_modified: 2026-01-29 }
  - { resource: https://platform.claude.com/docs/en/models/overview, title: Anthropic models overview }
  - { resource: https://developers.openai.com/api/docs/deprecations, title: OpenAI deprecations }
  - { resource: https://arxiv.org/abs/2305.05176, title: FrugalGPT, last_modified: 2023-05-09 }
  - { resource: https://www.lmsys.org/blog/2024-07-01-routellm/, title: RouteLLM, last_modified: 2024-07-01 }
  - { resource: https://arxiv.org/abs/2506.02153, title: Small Language Models are the Future of Agentic AI, last_modified: 2026-09-22 }
  - { resource: http://incompleteideas.net/IncIdeas/BitterLesson.html, title: The Bitter Lesson, last_modified: 2019-03-13 }
  - { resource: https://llm-stats.com/benchmarks/terminal-bench-2, title: Terminal-Bench 2.0 (llm-stats aggregator) }
  - { resource: https://arxiv.org/abs/2604.11978, title: The Long-Horizon Task Mirage? }
---

# Model — how much model a task needs

*As of 2026-09-25.* One of the three [research](../index.md) pillars. The model is the half of
*agent = model + harness* that Jacquard does not build; this pillar asks how much of it a task needs
once the harness has done its job, what that costs, and how quickly the answer changes.

The [VISION](../../../VISION.md) sentences under test:

- "Code is cheap."
- "A model — even a small one — can carry an agentic workflow to a good result when it is given the
  right context."
- "A frontier model can guess its way around part of that gap; a smaller model cannot; no model can
  recover a decision nobody wrote down."
- "Models improve and change hands."
- "The better the project's context, the smaller, cheaper and more local the model each task needs."

Two named sources have their own pages: [BenchLM](benchlm.md), for picking a good-enough model per
job, and [System One models](system-one.md), for classify-and-decide steps.

## Code is cheap

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Guido Appenzeller (a16z), [*Welcome to LLMflation*](https://a16z.com/llmflation-llm-inference-cost/) | 2024-11-12 | "For an LLM of equivalent performance, the cost is decreasing by 10x every year." GPT-3-level MMLU cost $60/M tokens in Nov 2021 and $0.06/M with Llama 3.2 3B — 1000x in three years. *Vendor-adjacent analysis.* | "Code is cheap" |

## Even a small model, given the right context

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Zhang et al., [*Agentic Context Engineering (ACE)*](https://arxiv.org/abs/2510.04618) | 2025-10-06; rev. 2026-03-29 (ICLR 2026) | Evolving "playbook" contexts (generate → reflect → curate) let a *smaller* open model match the top-ranked production agent on AppWorld and beat it on the harder split; +10.6% on agent tasks. Names *brevity bias* and *context collapse*. *Relative*: smaller than the leaderboard model, not small. | "even a small one … given the right context" |
| [*SWE-Protégé*](https://arxiv.org/abs/2602.22124) | 2026-02-28 | A post-trained Qwen2.5-Coder-7B reaches 42.4% on SWE-bench Verified by calling an expert model about four times per task. *Preprint.* | A small model plus a structured route to help — a harness move, not a bigger model |
| Epoch AI, [SWE-bench Verified](https://epoch.ai/benchmarks/swe-bench-verified) | read 2026-09-25 | Qwen3.6-35B-A3B (35B total, 3B active) at 73.4% (2026-04-16), against frontier models in the 85–90% range. *Vendor-reported.* | "Why this is possible now" |
| Morph, [open-source coding model ranking](https://www.morphllm.com/best-open-source-coding-model-2026) | 2026 | Reported a dense ~27B model at ~77% SWE-bench Verified. *Vendor-reported; could not be re-read on 2026-09-25 (HTTP 429)* — the Epoch row above is the primary-sourced figure. Its deeper point stands: a benchmark **hands the model a well-formed issue**; a real project must produce that context itself. | "Why this is possible now" |
| Liu et al., [*Lost in the Middle*](https://arxiv.org/abs/2307.03172) | 2023-07-03; TACL 2024 | "Performance is often highest when relevant information occurs at the beginning or end of the input context, and significantly degrades when models must access relevant information in the middle." In the worst case, more documents scored below no documents at all. | "the smallest set of true, current facts the task needs" — more context is not better context |
| Chroma, [*Context Rot*](https://www.trychroma.com/research/context-rot) | 2025 | Across 18 models, performance degrades as input length grows, even on simple tasks. A property of every model size, not a small-model weakness. | Context quality is a lever at every size |

## No model recovers a decision nobody wrote down

| Source | Date | Key point | Bears on |
|---|---|---|---|
| OpenAI, [*Introducing SWE-bench Verified*](https://openai.com/index/introducing-swe-bench-verified/) | 2024-08-13 | 93 developers annotated 1,699 SWE-bench samples: 38.3% had underspecified problem statements, 61.1% unfair tests; 68.3% were filtered out. The best-known coding benchmark had to be *rewritten by humans* to be fair. | "no model can recover a decision nobody wrote down" |
| [*Structured Uncertainty guided Clarification for LLM Agents*](https://arxiv.org/abs/2511.08798) | 2025 | Agents can detect ambiguity and ask a targeted clarifying question. *Preprint.* | The honest move for a gap is a question to a human — "Humans decide" |

## Models improve and change hands

| Source | Date | Key point | Bears on |
|---|---|---|---|
| METR, [*Time Horizon 1.1*](https://metr.org/blog/2026-1-29-time-horizon-1-1/) | 2026-01-29 | The length of task a model completes at 50% reliability doubled every 196 days (about 7 months) over 2019–2025 — and, on the updated task suite, every 130.8 days since 2023 and every 88.6 days since 2024. | "Models improve" — a harness tuned to one model's limits dates fast |
| Anthropic, [models overview](https://platform.claude.com/docs/en/models/overview) | read 2026-09-25 | Each model carries a retirement date of "not sooner than" roughly a year out (e.g. Claude Opus 5.5: not sooner than 2027-09-22); at least 60 days' notice for public models. | "Models … change hands" |
| OpenAI, [deprecations](https://developers.openai.com/api/docs/deprecations) | read 2026-09-25 | At least 6 months' notice for GA models, 3 months for specialised variants, 2 weeks for previews. | "Models … change hands" |

## The smallest model that suffices

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Chen, Zaharia, Zou, [*FrugalGPT*](https://arxiv.org/abs/2305.05176) | 2023-05 | A cascade can "match the performance of the best individual LLM (e.g. GPT-4) with up to 98% cost reduction". | "smaller, cheaper … the model each task needs" |
| LMSYS, [*RouteLLM*](https://www.lmsys.org/blog/2024-07-01-routellm/) | 2024-07-01 | A learned router sends easy queries to a cheap model: "cost reductions of over 85% on MT Bench, 45% on MMLU, and 35% on GSM8K" at 95% of GPT-4's performance. | Per-task model choice is a harness decision |
| Belcak et al. (NVIDIA), [*Small Language Models are the Future of Agentic AI*](https://arxiv.org/abs/2506.02153) | 2025-06-02; v3 2026-09-22 | Position paper: SLMs suffice for most agent invocations; heterogeneous systems reserve a strong model for decide/plan moments. *Preprint.* | "smaller, cheaper and more local" |
| [BenchLM](benchlm.md) | read 2026-09-25 | A leaderboard with per-category scores and prices, downloadable — a shortlist for "good enough", not a verdict. | Picking the model per job |
| [System One models / Jev](system-one.md) | 2026-09-15 | A typed-output, calibrated model for classify/route/decide steps. *Early access; vendor-reported.* | The cheapest model is sometimes not a chat model at all |

## Against

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Richard Sutton, [*The Bitter Lesson*](http://incompleteideas.net/IncIdeas/BitterLesson.html) | 2019-03-13 | "General methods that leverage computation are ultimately the most effective, and by a large margin." Hand-built knowledge loses to scale. | The strongest objection to scaffolding. The vision concedes it for scaffolding that props up a weak model — and holds that a decision nobody wrote down is not scaffolding, so scale cannot supply it |
| Terminal-Bench 2.0, via [llm-stats](https://llm-stats.com/benchmarks/terminal-bench-2) | updated 2026-09-25 | The top score is 82.7% (GPT-5.5); the lowest listed is 37.5%; Qwen3.5-35B-A3B, 3B parameters active, scores 40.5%. Very small models are not listed at all. *Secondary aggregator.* | "even a small one" has a ceiling on long horizons |
| Wang et al., [*The Long-Horizon Task Mirage?*](https://arxiv.org/abs/2604.11978) | 2026-04 | Diagnoses horizon-dependent degradation across 3,100+ agent trajectories: agents that succeed on short tasks break as horizons lengthen. *Preprint.* | Small models on long work need the work cut short |

## Open for the how

- **Cut work short enough for the model you can afford.** The small-model ceiling is on *long*
  horizons. Ephemeral agents taking one piece of work each ([Agent](../agent/index.md)) is also how a
  small model stays inside its horizon.
- **Model choice is configuration, never code.** Retirement notices run 2 weeks to a year; nothing
  in Jacquard may name a model id where a setting could.
- **Measure "good enough" on the project, not the leaderboard.** A leaderboard ranks models under
  someone else's harness ([Harness](../harness/index.md) shows how much that moves the result); a
  shortlist from [BenchLM](benchlm.md) still needs the project's own checks to confirm.
- **Where does a System One model sit?** Triage, routing and gating steps in the resident loop are
  candidates; the calibrated confidence is a ready-made threshold for "act alone or ask".
