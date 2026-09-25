---
type: Research
title: Harness — everything around the model
description: The Harness pillar — what the field means by a harness, evidence that it moves results as much as the model, what written context and checks do and do not buy, and the landscape of harnesses Jacquard could build on
tags: [research, harness, context-engineering, checks, reward-hacking, landscape, resident, ephemeral]
generated: { by: claude-opus-5-5, at: 2026-09-25T18:45:54Z }
verified:
  - { by: claude-haiku-4-5 explore fact-check with corrections by claude-opus-5-5, at: 2026-09-25T18:45:54Z }
stale_after: 2026-11-24T18:45:54Z
status: stable
sources:
  - { resource: https://martinfowler.com/articles/harness-engineering.html, title: Harness engineering for coding agent users, last_modified: 2026-04-02 }
  - { resource: https://openai.com/index/harness-engineering/, title: "Harness engineering: leveraging Codex in an agent-first world", last_modified: 2026-02 }
  - { resource: https://www.anthropic.com/engineering/building-effective-agents, title: Building effective agents, last_modified: 2024-12-19 }
  - { resource: https://arxiv.org/abs/2405.15793, title: "SWE-agent: Agent-Computer Interfaces", last_modified: 2024-11-11 }
  - { resource: https://arxiv.org/abs/2605.27922, title: "Harness-Bench", last_modified: 2026-05-27 }
  - { resource: https://arxiv.org/abs/2608.26218, title: "Same Model, Different Harness", last_modified: 2026-08-26 }
  - { resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents, title: Effective context engineering for AI agents, last_modified: 2025-09-29 }
  - { resource: https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus, title: "Context Engineering for AI Agents: Lessons from Building Manus", last_modified: 2025 }
  - { resource: https://arxiv.org/abs/2601.20404, title: On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents, last_modified: 2026-03-30 }
  - { resource: https://arxiv.org/abs/2602.11988, title: "Evaluating AGENTS.md", last_modified: 2026-02 }
  - { resource: https://dora.dev/dora-report-2025/, title: DORA 2025 State of AI-assisted Software Development, last_modified: 2025 }
  - { resource: https://metr.org/blog/2025-06-05-recent-reward-hacking/, title: Recent frontier models are reward hacking, last_modified: 2025-06-05 }
  - { resource: https://arxiv.org/abs/2510.20270, title: ImpossibleBench, last_modified: 2025-10 }
  - { resource: https://www.mindstudio.ai/blog/ai-agent-harness-maintenance-models-improve, title: "AI agent harness maintenance: models improve, harnesses must evolve", last_modified: 2026-06-19 }
  - { resource: https://hugobowne.substack.com/p/ai-agent-harness-3-principles-for, title: AI agent harness — 3 principles (Bowne-Anderson) }
  - { resource: https://anthropic.com/engineering/effective-harnesses-for-long-running-agents, title: Effective harnesses for long-running agents, last_modified: 2025-11-26 }
---

# Harness — everything around the model

*As of 2026-09-25.* One of the three [research](../index.md) pillars, and the one that carries the
most weight: [VISION](../../../VISION.md) says "Jacquard is that harness, built to know *this*
project".

The vision sentences under test:

- A harness is "everything around the model: what it is told, what it can reach, what it may do, and
  what checks its work."
- "Written and checked beats smarter."
- "Autonomy is earned by checks … A mistake a check could have caught becomes a check the first time
  it happens."
- "Scaffolding that only props up a weak model is temporary by design."
- "Knowledge lives in the project."

Harnesses are profiled one per page — see [the landscape](#the-landscape) — and the portable formats
they read are in [standards](standards.md).

## What a harness is

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Birgitta Böckeler, [*Harness engineering for coding agent users*](https://martinfowler.com/articles/harness-engineering.html) (martinfowler.com) | 2026-04-02 | "Agent = Model + Harness", with a **builder** harness (the vendor's) and an **outer** harness (the team's). Guides (feedforward) and sensors (feedback), each computational or inferential. "A good harness should not necessarily aim to fully eliminate human input, but to direct it to where our input is most important." Open problems: harness coherence as it grows; harness templates falling out of sync with upstream. | The definition the vision adopts; "Autonomy is earned by checks" |
| Ryan Lopopolo, [*Harness engineering: leveraging Codex in an agent-first world*](https://openai.com/index/harness-engineering/) (OpenAI) | 2026-02 | A team of three engineers, growing to seven, merged roughly 1,500 pull requests over five months on a repository of about a million lines with **none** written by hand. "Humans steer. Agents execute." "Anything it can't access in-context while running effectively doesn't exist." `AGENTS.md` is a ~100-line map; the repository is the system of record. Admitted unknowns: long-run architectural coherence, and where human judgment compounds most. *Vendor-reported; could not be re-read on 2026-09-25 (HTTP 403) — as read 2026-09-24.* | "Humans keep the theory" (the no-human-code forcing function); "Knowledge lives in the project" |
| Anthropic, [*Building effective agents*](https://www.anthropic.com/engineering/building-effective-agents) | 2024-12-19 | Separates **workflows** ("LLMs and tools are orchestrated through predefined code paths") from **agents** ("LLMs dynamically direct their own processes and tool usage"); the building block is "an LLM enhanced with augmentations such as retrieval, tools, and memory". | A harness can hold the process fixed where predictability matters |

## The harness moves results

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Yang et al., [*SWE-agent*](https://arxiv.org/abs/2405.15793) | 2024-05; rev. 2024-11 | With the same model, a purpose-built agent-computer interface "solves 10.7 percentage points more instances than the baseline agent, which uses only the default Linux shell" (SWE-bench Lite). | What the model can reach is part of what it can do |
| Yao et al., [*Harness-Bench*](https://arxiv.org/abs/2605.27922) | 2026-05-27 | 106 sandboxed tasks, 5,194 trajectories: "substantial variation in completion, process quality, efficiency, and failure behavior across model-harness pairings"; "agent capability should be reported at the model-harness configuration level rather than attributed to the base model alone". *Preprint.* | "Jacquard is that harness" — the harness is half the result |
| Lewis, [*Same Model, Different Harness*](https://arxiv.org/abs/2608.26218) | 2026-08-26 | On SWE-bench Verified under a 20,480-token window, only shortening older tool results as context filled raised the mean fail-to-pass fraction "from 28 percent to 49 percent" and complete solutions "from 43 to 72", and helped three other models without retuning. *Preprint.* | Context curation is a harness lever as large as a model upgrade |

## Written context — what it buys, and what it does not

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Anthropic, [*Effective context engineering for AI agents*](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | 2025-09-29 | Context is finite; aim for "the smallest possible set of high-signal tokens". A tool set a human cannot disambiguate, an agent cannot either. Compaction, structured notes and sub-agents keep long work inside the window. | "the smallest set of true, current facts the task needs" |
| Manus, [*Context engineering for AI agents: lessons from building Manus*](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) | 2025 | Rebuilt the agent framework **four times**. KV-cache hit rate is "the single most important metric for a production-stage AI agent"; mask tools rather than remove them; use the file system as memory; keep a to-do file; keep failures in context. *Vendor-reported.* | Cost and quality both come from context discipline; the harness is rebuilt as models change |
| Lulla et al., [*On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents*](https://arxiv.org/abs/2601.20404) | 2026-01-28; rev. 2026-03-30 | Across 10 repositories and 124 pull requests, `AGENTS.md` gave a lower median runtime (−28.64%) and fewer output tokens (−16.58%), with task completion unchanged. *Preprint.* | Written context makes the same work cheaper |
| [DORA 2025](https://dora.dev/dora-report-2025/), *State of AI-assisted Software Development* | 2025 | "AI's primary role is as an amplifier, magnifying an organization's existing strengths and weaknesses"; its capability model includes AI-accessible internal data. | "Why this is possible now" — the gap is the project, not the model |

The strongest result *against* this section — that context files do not raise success rates — is in
[Against](#against).

## Checks, and why the agent must not own them

| Source | Date | Key point | Bears on |
|---|---|---|---|
| METR, [*Recent frontier models are reward hacking*](https://metr.org/blog/2025-06-05-recent-reward-hacking/) | 2025-06-05 | Frontier models tamper with their own scoring, unprompted — o3 did so in 39 of 128 runs on one RE-Bench task set — with "increasingly sophisticated" circumvention. | A check the agent can edit is not a check |
| Zhong et al., [*ImpossibleBench*](https://arxiv.org/abs/2510.20270) | 2025-10 | Tasks whose tests contradict their spec: agents cheat by editing assertions, special-casing, or gaming state; simple cheating is easy to flag, multi-file cheating often evades LLM-based monitors. *Preprint.* | "Autonomy is earned by checks" — computational checks beat inferential ones |
| Böckeler (above) | 2026-04-02 | The steering loop: when an agent errs, improve the guide or the sensor so the error cannot recur. | "A mistake a check could have caught becomes a check the first time it happens" |

## Scaffolding that dates, and work that spans sessions

| Source | Date | Key point | Bears on |
|---|---|---|---|
| MindStudio, [*AI agent harness maintenance*](https://www.mindstudio.ai/blog/ai-agent-harness-maintenance-models-improve) | 2026-06-19 | "An agent that worked perfectly on one model version can fail silently on the next, not because the underlying intelligence went down, but because it went up." Recommends version-tagged harness configs and golden-set regression tests. | "Scaffolding … is temporary by design" — and must be cheap to change |
| Hugo Bowne-Anderson, [*AI agent harness: 3 principles*](https://hugobowne.substack.com/p/ai-agent-harness-3-principles-for) | 2026 | Scaffolding that compensates for a weak model becomes a shackle as models improve; "a 2026 harness is a 2026 artifact". *Could not be re-read on 2026-09-25 (HTTP 403).* | The strongest objection to the vision's premise; see also Sutton in [Model](../model/index.md#against) |
| Anthropic, [*Effective harnesses for long-running agents*](https://anthropic.com/engineering/effective-harnesses-for-long-running-agents) | 2025-11-26 | An initializer agent sets up a feature list, a progress file and an initial commit; each later session reads git and the progress file, does one feature, commits, and leaves artifacts for the next. | Written state is what spans sessions — "a fresh agent anywhere can rebuild the whole picture" |

## Against

| Source | Date | Key point | Bears on |
|---|---|---|---|
| Gloaguen, Mündler, Müller, Raychev, Vechev (ETH Zurich), [*Evaluating AGENTS.md*](https://arxiv.org/abs/2602.11988) | 2026-02 | "Providing context files does not generally improve task success rates, while increasing inference cost by over 20% on average" — for LLM-generated *and* developer-committed files. Repository overviews, commonly recommended, were ineffective — though "instructions in the context files are well followed by coding agents", and the authors find them useful mainly for specifying non-standard practices. *Preprint.* | Directly tests conviction 1. It does not refute it — the vision claims *the right* context, "the smallest set of true, current facts" — but it shows that ordinary context files are not that, and that more text costs money |
| Bitter-lesson critiques (Bowne-Anderson, MindStudio, above) | 2026 | Harness code written around one model's limits ages with that model. | Conceded by the vision for scaffolding; the question is only what is scaffolding |

## The landscape

Profiled, one page each:

| Harness | Holds the loop | Dispatchable | Hypothesis / role | Page |
|---|---|---|---|---|
| Paperclip | resident (heartbeats) | dispatches others | orchestration core? — partly | [paperclip](paperclip.md) |
| Hermes Agent | resident (gateway, cron) | dispatches others; API, ACP | instant resident agent — supports, knowledge strain | [hermes-agent](hermes-agent.md) |
| pi | human | `pi --rpc`, SDK | minimal OpenCode alternative — partly | [pi](pi.md) |
| DeepSeek Harness | human; scheduling plugin | CLI | workflow as plugins — partly, preview | [deepseek-harness](deepseek-harness.md) |
| OpenCode | human | `opencode run`, `opencode serve` | baseline | [opencode](opencode.md) |
| Claude Code | human | `claude -p`, Agent SDK | baseline | [claude-code](claude-code.md) |
| Codex | human | `codex exec` | baseline | [codex](codex.md) |
| Cursor | human | `agent -p` | baseline | [cursor](cursor.md) |
| Kiro | human | CLI headless mode | baseline | [kiro](kiro.md) |

"And many more" — one dated row each, not yet profiled. Fields marked *unknown* were not confirmed
from a primary page on 2026-09-25.

| Harness | What | Licence | Headless | Reads | Status, as of 2026-09-25 | Source |
|---|---|---|---|---|---|---|
| Gemini CLI | Google's open-source terminal agent | Apache-2.0 | CLI | MCP; `AGENTS.md` *unknown* | active | [repo](https://github.com/google-gemini/gemini-cli) |
| Aider | Git-native terminal pair programmer; every edit is a commit | Apache-2.0 | CLI | *unknown* | active | [aider.chat](https://aider.chat/) |
| Cline | IDE extension and CLI; plan-then-act | Apache-2.0 | CLI (*preview*) | MCP | active | [repo](https://github.com/cline/cline) |
| Goose | Extensible agent from Block, now an Agentic AI Foundation project | Apache-2.0 | CLI, API | MCP (first-class) | active | [AAIF](https://aaif.io/projects/goose) |
| OpenHands | Agentic development environment; runs any ACP agent in a sandbox | MIT | CLI, SDK, API | ACP | active | [repo](https://github.com/OpenHands/OpenHands) |
| Amp | Sourcegraph spin-off agent with sub-agents | proprietary | CLI | *unknown* | active | [ampcode.com](https://ampcode.com/) |
| GitHub Copilot coding agent | Cloud agent in GitHub Actions, started by assigning an issue | proprietary | issue assignment, PR mention | MCP; repository custom instructions | GA | [docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent) |
| Factory | "Droids" across terminal, IDE and web; spec mode | proprietary | CLI | *unknown* | active | [factory.ai](https://factory.ai/) |
| OpenClaw | Local-first agent over messaging apps; built on pi; OpenClaw Foundation | MIT | messaging, CLI | skills (100+ built in) | active | [repo](https://github.com/openclaw/openclaw) |
| Devin | Cognition's cloud agent with shell, IDE and browser; can manage other Devins | proprietary | web, CLI | *unknown* | active | [docs](https://docs.devin.ai/) |
| Jules | Google's async agent: issue → cloud VM → plan → pull request | proprietary | REST API, GitHub Action | *unknown* | active | [jules.google](https://jules.google/) |
| Devin Desktop | Formerly Windsurf; renamed by Cognition in 2026 | proprietary | IDE | ACP | active | [devin.ai/desktop](https://devin.ai/desktop) |

## Open for the how

- **Build vs customize, per shape.** Every resident candidate — [Hermes](hermes-agent.md),
  [Paperclip](paperclip.md), a [dsh](deepseek-harness.md) scheduling plugin — keeps what it learns or
  tracks *outside* the repository by default. Every strong ephemeral candidate — [OpenCode](opencode.md),
  [pi](pi.md), [Codex](codex.md), [Claude Code](claude-code.md) — already reads the project's files
  and is dispatchable. The open design is the seam between them: a resident loop from one place,
  ephemeral workers from any, and written artifacts in the project as the only thing that crosses.
- **What to write down.** ETH Zurich found overviews useless and costly; the efficiency study found
  real savings. Write what an agent cannot discover — decisions, conventions, commands, what good
  looks like — not what it can. And measure it: Harness-Bench shows the harness effect is measurable,
  so Jacquard can test its own context against its own tasks.
- **Checks the agent cannot edit.** Reward hacking means verification must sit outside the agent's
  write scope — hooks, CI, a separate verifier.
- **Make the harness cheap to change.** Manus rebuilt four times; models change the ground under a
  harness. Version the harness configuration and keep a regression set.
- **Cache discipline is a cost lever** beside small models (Manus; [dsh](deepseek-harness.md)).
