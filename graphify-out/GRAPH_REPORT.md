# Graph Report - agent  (2026-09-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2263 nodes · 4889 edges · 133 communities (120 shown, 13 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 336 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `511d736a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SDLC Workflow
- Context
- The six loom primitives + their generic content
- Research Recommend
- model.js
- verbs.js
- Backend API Implementation Patterns
- model.test.js
- render.test.js
- Generic Invariant-Checks (verify step, generic half)
- Logic Prototype
- Architect Review
- ADR-013: Shared Adapter-Contract Core
- gh.js
- index.js
- visual-verification Skill
- ADR-007: Optional Documentation-Lookup Capability
- Harness — everything around the model
- settings.json
- reconcile.test.js
- The Withhold Mechanism (Hermes)
- Trigger eval queries (20, should_trigger flagged)
- ADR-017: Quality Baseline Embedded in Setup and Every Gate
- SDLC Design Phase
- size-score.sh
- ADR-031: The Knowledge Graph Is Gated Context
- validate-gate.sh
- AGENTS.md
- Agent — how agents run, and how they work with humans
- Wayfinder Skill
- Resident PM Agent
- validate.sh
- ADR-018: Macro Project-Management as a Recursive Wayfinding Layer
- Diagnosing Bugs
- loom Constitution
- PORTS.md — the five port obligations
- docs-lookup (Hermes binding)
- interview — Native clarify Tool
- Existing Hermes State (do no harm)
- Macro PM §4f Resolution (Hermes)
- Project-Context Placement (Hermes)
- What This Adapter Renders (and Does Not)
- Existing .claude/.agents Content Handling
- Project-Context Placement (OpenCode)
- OpenCode Verify: Quick Commands Checks
- Structure Checks
- Frontend Runtime Debugging
- README
- Triage Skill
- Part B - Semantic Extraction via Parallel Subagents
- Model — how much model a task needs
- The Orchestrator Role
- Hermes delivery conformance
- Design an Interface Skill
- The Gate
- Verification Before Completion Skill
- ADR Change Log
- ADR Format
- Session Bootstrap
- State and Race Failures
- Context Compression Skill
- Step 4 - Build, Cluster, Analyze, Export
- Rendering Failures
- To Tickets Skill
- Stage Handoff Skill
- Autonomy is earned by checks
- Discovery Skills Index
- Network Failures
- Implementation Phase
- Domain Model Skill
- Improve Codebase Architecture
- Rule 3: Reference, Never Restate
- Corpus Cartographer Agent
- Grill with Docs
- To Spec Skill
- Out-of-Scope Knowledge Base
- Wiki Audit Skill
- Wiki Curator Skill
- Seam Artifact Protocol
- Editor Agent
- Written and checked beats smarter
- Codebase Design Skill
- Resolving Merge Conflicts Skill
- Agent
- graphify references index
- Wiki Query Skill
- Wiki Crosslink Skill
- Operational DNA - Five-Phase Task Execution
- CONTEXT.md Format
- Claude Code Harness Config Readme
- --update incremental re-extraction
- Checkpoint Skill
- Wiki Init Skill
- Workflows Index
- Rule 5: Everything Traces to the Vision
- Thoth Wiki Scribe
- adr-new Command
- Architecture HTML Report Format
- Writing Agent Briefs
- The Deep-Module Glossary
- Test-Driven Development Skill
- /graphify query
- Five-dimension complexity score
- Macro-PM Workflow Seed
- Adapter Conformance Reviewer
- Ephemeral agents
- Hermes Agent — a resident agent with a chat gateway
- Design Skills Index
- Review-Gate Cadence
- Dependency Categories
- Extraction subagent prompt (verbatim, templated)
- build_merge
- Offer ADRs Sparingly - All Three Tests Must Hold
- Skills Index
- Pass 4 — Dependency Graph and Parallelism
- Graphify Exports Reference
- Architecture Gate
- Rule 6: Earn Your Abstractions
- Preservation Skills Index
- Planning Artifacts
- Step 2.5 — transcribe video/audio files
- Spec-Fidelity Check
- Implementation Skills Index
- Graphify Skill
- SDLC Preservation Phase Policy
- validate Command
- Deepening a Shallow Cluster
- Step 4: Compare Designs
- Phase Policy Anatomy
- Issue Tracker
- Manifest stamping of files that actually produced output (#2015)
- Standing Regression Suite
- Progressive disclosure (wiki roots summarize, leaves hold detail)

## God Nodes (most connected - your core abstractions)
1. `Context` - 117 edges
2. `Wayfinder Skill` - 72 edges
3. `ADR Change Log` - 59 edges
4. `ADR-013: Shared Adapter-Contract Core` - 45 edges
5. `The six loom primitives + their generic content` - 43 edges
6. `ADR-031: The Knowledge Graph Is Gated Context` - 43 edges
7. `Seam Artifact Protocol` - 42 edges
8. `Harness Archetypes` - 41 edges
9. `SDLC Workflow` - 40 edges
10. `SDLC Implementation Phase` - 39 edges

## Surprising Connections (you probably didn't know these)
- `scripts/validate.sh (the loom gate)` --semantically_similar_to--> `Setup contract (five-step: explore, interview, present & confirm, generate, verify)`  [INFERRED] [semantically similar]
  REGISTRY.md → SPEC.md
- `Autonomy is earned by checks` --semantically_similar_to--> `The Gates (pre-commit checks)`  [INFERRED] [semantically similar]
  VISION.md → AGENTS.md
- `Extraction: Dispatch, Never Inline` --semantically_similar_to--> `Step 2: Spawn 3+ Parallel Sub-Agents`  [INFERRED] [semantically similar]
  .claude/agents/corpus-cartographer.md → SKILLS/design/codebase-design/DESIGN-IT-TWICE.md
- `Cross-Reference Claims with the Code` --semantically_similar_to--> `Check: Archetype Consistency with the Two Axes`  [INFERRED] [semantically similar]
  SKILLS/design/domain-model/SKILL.md → .claude/agents/adapter-conformance.md
- `Rule 6: Earn Your Abstractions` --semantically_similar_to--> `Two Adapters Mean a Real Seam`  [INFERRED] [semantically similar]
  CONSTITUTION.md → SKILLS/design/codebase-design/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Adapter-Contract Ecosystem (Mirai, OpenCode, Shared Core)** — wiki_adr_adr_004_loom_mirai_setup_adr, wiki_adr_adr_014_loom_opencode_setup_adr [EXTRACTED 1.00]
- **The five port obligations forming loom's adapter-contract seam** — contract_ports, contract_ports_port1_capability_to_tool, contract_ports_port2_archetype_to_model, contract_ports_port3_seam_obligation_to_wiring, contract_ports_port4_primitive_to_file_manifest, contract_ports_port5_mechanism_to_install [EXTRACTED 1.00]
- **The Five Port Obligations (Ports 1-5)** — contract_ports_port1_capability_tool, contract_ports_port2_archetype_model, contract_ports_port3_seam_obligation_wiring, contract_ports_port4_primitive_file_manifest, contract_ports_port5_mechanism_install [EXTRACTED 1.00]
- **Macro-PM Protocol Design Lineage (ADR-018 → ADR-019 → ADR-020)** — wiki_adr_adr_018_macro_project_management, wiki_adr_adr_019_loom_hermes_setup, wiki_adr_adr_020_system_scoped_qa [EXTRACTED 1.00]
- **Mirai adapter files jointly answering the five port obligations** — adapters_mirai_setup, adapters_mirai_mapping, adapters_mirai_stages [EXTRACTED 1.00]
- **OpenCode Adapter Answers the Five Port Obligations** — contract_ports_port1_capability_tool, contract_ports_port2_archetype_model, contract_ports_port3_seam_obligation_wiring, contract_ports_port4_primitive_file_manifest, contract_ports_port5_mechanism_install, adapters_opencode_setup_port_answers [EXTRACTED 1.00]
- **Backend API / Prisma Knowledge Cluster (Express + Prisma CRUD)** — wiki_patterns_backend_api_patterns, wiki_patterns_backend_api_gotchas, wiki_patterns_prisma_patterns [INFERRED 0.80]
- **Hermes Resident wayfinder-macro Profile Toolset Composition** — adapters_hermes_references_capabilities_withhold_mechanism, adapters_hermes_references_capabilities_persist_native_memory, adapters_hermes_references_capabilities_interview_clarify [INFERRED 0.85]

## Communities (133 total, 13 thin omitted)

### Community 0 - "SDLC Workflow"
Cohesion: 0.20
Nodes (26): Agent Collaboration Framework, Wisdom, task-sizing skill, ADR-003: Architecture-First Ordering, Architecture-First & Research-Backed Principle, ADR-016: Embedded Review Gate + Commit-Often, Commit-Often Principle, Embedded Quality Gate (Verify → Review → Commit) (+18 more)

### Community 1 - "Context"
Cohesion: 0.13
Nodes (37): Context, ADR (Architecture Decision Record), Altitude, Altitude seam, Artifact ref, Board, Board API, Board member (+29 more)

### Community 2 - "The six loom primitives + their generic content"
Cohesion: 0.26
Nodes (35): Micro Ledger Substrate (Hermes) — No Choice, loom → Mirai Mapping, loom Stages in Mirai, loom → OpenCode Mapping, Capability → OpenCode permission mapping, OpenCode Withhold Mechanism (permission: deny), OpenCode verify — format-checks, OpenCode write format & template mechanics (+27 more)

### Community 3 - "Research Recommend"
Cohesion: 0.08
Nodes (43): Explore Agent, contract/ + adapters/<harness> (Shared Adapter Core), .claude/ Skill Symlinks Convention, CONTEXT.md, corpus-cartographer Agent, graphify-out/ (generated graph output), Explore Return Contract (few lines, exact path:line citations), Explore Search Strategy (Grep-first, Glob-for-layout, read-only Bash) (+35 more)

### Community 4 - "model.js"
Cohesion: 0.15
Nodes (23): appendPointerLine(), findMap(), frontier(), hasOpenBlocker(), isMember(), ADR-0025, ADR-0029, KNOWN_TRANSITIONS (+15 more)

### Community 5 - "verbs.js"
Cohesion: 0.12
Nodes (21): planReconcile(), planReconcileDone(), planReconcileLabels(), planReconcileParentMigration(), apply(), CALL_HANDLERS, gh, guard() (+13 more)

### Community 6 - "Backend API Implementation Patterns"
Cohesion: 0.13
Nodes (15): Backend API Common Pitfalls & Anti-Patterns, Anti-pattern: Exposing Internal Errors to Clients, Anti-pattern: Middleware Order Violations, Anti-pattern: Not Using Transactions for Multi-Step Operations, Anti-pattern: N+1 Query Problems, Anti-pattern: Generic Sanitization Middleware Corrupts Data, Anti-pattern: Swallowing Errors, Backend API Implementation Patterns (+7 more)

### Community 7 - "model.test.js"
Cohesion: 0.11
Nodes (12): scripts_loom_board_fixtures_board, parseBoard(), assert, board, ADR-0029, { parseBoard, takeable, frontier, unmapped }, test, assert (+4 more)

### Community 8 - "render.test.js"
Cohesion: 0.19
Nodes (16): buildChildIndex(), childrenOf(), escapeLabel(), formatLine(), ADR-0029, nodeId(), renderMermaid(), addNode() (+8 more)

### Community 9 - "Generic Invariant-Checks (verify step, generic half)"
Cohesion: 0.11
Nodes (23): Model Format Resolution (Hermes), Harness Manifest (Hermes), Mirai capability/invocation rendering checks, interview — Native question Tool, OpenCode Capability→Permission Mapping Table, interview Capability — Native, No Resolution Needed, Model Format Resolution (provider/model-id), OpenCode Verify: Frontmatter Format-Checks (+15 more)

### Community 10 - "Logic Prototype"
Cohesion: 0.06
Nodes (51): Logic Prototype, Logic Prototype Anti-Patterns, Step 7: Capture the Answer, Class/Module with Method Surface, Full-Frame Re-Render, Step 6: Hand It Over, Step 3: Isolate the Logic in a Portable Module, Keyboard Shortcuts Row (+43 more)

### Community 11 - "Architect Review"
Cohesion: 0.15
Nodes (21): Deepening Opportunity, Architect Review, Architectural Impact Rating, Architecture Documentation, Behavioral Traits, Cloud-Native Architecture, Data Architecture, Distributed Systems Design (+13 more)

### Community 12 - "ADR-013: Shared Adapter-Contract Core"
Cohesion: 0.30
Nodes (21): loom → Hermes Mapping, Hermes Interview Resolution Steps (doc), Hermes macro-PM binding — the resident daemon & altitude seam, Hermes Verify — Format-Checks, Hermes write format & template mechanics, Setup loom for Hermes — The Hermes Adapter, loom Stages in Hermes — deliberately empty, OpenCode interview resolution steps (+13 more)

### Community 13 - "gh.js"
Cohesion: 0.18
Nodes (13): ref_node_child_process, ref_node_test, buildArgv(), createGh(), defaultClient, { execFileSync }, GhError, { parseBoard } (+5 more)

### Community 14 - "index.js"
Cohesion: 0.15
Nodes (13): ADR-0027, ref_node_assert, EXIT, gh, ADR-0025, main(), NAMESPACES, parseArgv() (+5 more)

### Community 15 - "visual-verification Skill"
Cohesion: 0.06
Nodes (54): Command Catalog, /release-notes Command, User-Impact Release-Note Grouping (Features / Improvements / Bug Fixes / Breaking / Deprecations / Migration), /wayfinder Command, Chart the Map (name destination, map frontier, create tickets), One Ticket Per Session Rule (except research tickets), Work Through the Map (claim frontier ticket, resolve, record), /wiki-audit Command (+46 more)

### Community 16 - "ADR-007: Optional Documentation-Lookup Capability"
Cohesion: 0.14
Nodes (18): Capability → Hermes Tool Mapping (detail), docs-lookup OpenCode Binding (scout / MCP), persist — Scoped-Edit Glob for Ledger Writes, docs-lookup — Prefer Built-in scout, OpenCode Verify: Capability/Invocation Rendering Checks, OpenCode Verify: Handoff Wiring Checks, Handoff / Communication Protocol Checks, Invocation Surface Checks (+10 more)

### Community 17 - "Harness — everything around the model"
Cohesion: 0.14
Nodes (36): Adapter, Harness, Skill, Workflow, Claude Code and the Claude Agent SDK, Claude Agent SDK (same tools, loop, context management as Claude Code), 'Build = compose on a proven loop' (Agent SDK doesn't mean writing an agent loop), Claude Code knowledge (CLAUDE.md native, reads AGENTS.md, SKILL.md skills) (+28 more)

### Community 18 - "settings.json"
Cohesion: 0.22
Nodes (8): hooks, PostToolUse, Stop, model, permissions, allow, ask, $schema

### Community 19 - "reconcile.test.js"
Cohesion: 0.22
Nodes (6): assert, board, EXPECTED_PARENT_MIGRATION_PAIRS, LOOM_LABEL_NAMES, { parseBoard, planReconcile }, test

### Community 20 - "The Withhold Mechanism (Hermes)"
Cohesion: 0.67
Nodes (3): The Withhold Mechanism (Hermes), The Per-Tool Withhold Key (Hermes), The Per-Tool Withhold (Write-Time)

### Community 21 - "Trigger eval queries (20, should_trigger flagged)"
Cohesion: 0.05
Nodes (37): aggregate_benchmark script and benchmark.json, Analyst pass over benchmark data, Objectively verifiable assertions, Baseline run (without_skill or old_skill), Blind comparison (comparator + analyzer agents), Capture Intent, Claude.ai adaptations (no subagents, no browser), Cowork adaptations (static viewer, downloaded feedback) (+29 more)

### Community 22 - "ADR-017: Quality Baseline Embedded in Setup and Every Gate"
Cohesion: 0.15
Nodes (21): Delivery Shape — a Profile Distribution, Provenance Marking (Hermes namespaced marker), Hermes's Five Port Answers, OpenCode Verify: File Placement Checks, Mechanism Install (.opencode/mechanisms/loom), discipline.md — provenance/idempotency + invariant checks, Frontmatter Reconcile (for update), Idempotency Rule (patch in place, never duplicate) (+13 more)

### Community 23 - "SDLC Design Phase"
Cohesion: 0.08
Nodes (39): ADR-003: Architecture-First Ordering, Workflows Change Log, 2026-07-16: Solution-Shaping Skills Moved to design/ and codebase-design Extracted, 2026-07-16: Added the Design Phase (SDLC becomes Six Phases), 2026-07-14: Added the sdlc Workflow (Five Ordered Phases), 2026-07-16: Three-Stage Ownership Overlay (Shaping, Delivery, Closing), 2026-07-14: Introduced the workflows/ Top-Level Directory, SDLC Design Phase (+31 more)

### Community 24 - "size-score.sh"
Cohesion: 0.36
Nodes (8): REGISTRY.md — Mechanism Ledger, REGISTRY.md mechanism ledger (owner / grounds / earned-by / verified-failing), action_for(), band_for(), self_test(), size-score.sh script, usage(), .loom/handoffs/ ledger (OpenCode seam obligation)

### Community 25 - "ADR-031: The Knowledge Graph Is Gated Context"
Cohesion: 0.16
Nodes (28): ADR-031: The Knowledge Graph Is Gated Context, Rejected: Leave delegate Withheld And Accept Structural Extraction, Rejected: Gate On graphify's Own diagnose Output, Rejected: Report The Forking Upstream And Wait, Rejected: Grant corpus-cartographer Unrestricted Capabilities, scripts/graph/canonicalize.js Repair Pass, Capability Gap With No Detector, Context Slop: Internally Consistent And Externally False (+20 more)

### Community 27 - "AGENTS.md"
Cohesion: 0.10
Nodes (22): altitude (exact vocabulary term), Canonicalize, cluster, canonicalize, scripts/graph/canonicalize.js, graphify cluster-only ., graphify-out/extracted.json, Graph freshness check, The Gates (pre-commit checks), scripts/graph-check.sh (+14 more)

### Community 28 - "Agent — how agents run, and how they work with humans"
Cohesion: 0.08
Nodes (32): A2A — the Agent2Agent protocol, A2A protocol, A2ABreak: Systematic Security Analysis of the A2A Protocol (Lotfi et al.), Agent Card, Governance Gaps in Agent Interoperability Protocols (Kang & Diponegoro), A2A surpasses 150 organizations (Linux Foundation), MCP (Model Context Protocol), Agent — how agents run, and how they work with humans (+24 more)

### Community 29 - "Wayfinder Skill"
Cohesion: 0.07
Nodes (61): Wayfinder Skill, Behavioral-Artifact Test, Native Blocking Relationship, Buildable Leaf, Chart the Map, Coverage in the Destination, Decisions So Far, Destination (+53 more)

### Community 30 - "Resident PM Agent"
Cohesion: 0.09
Nodes (30): Resident PM Agent, Board CLI Distributable, The Board Is the Only Source of Truth, Step: Dispatch a Leaf or Resolve a Decision, Never Paper Over Board Drift, Board CLI Exit Codes, Step: Exit, Leaving All State on the Board, gh >= 2.47 for blockedBy Fields (+22 more)

### Community 31 - "validate.sh"
Cohesion: 0.18
Nodes (27): check_gate_registry_join(), check_markdown_anchor(), check_markdown_links(), check_orphans(), check_research_dates(), check_stranded(), file_anchors(), frontmatter_value() (+19 more)

### Community 32 - "ADR-018: Macro Project-Management as a Recursive Wayfinding Layer"
Cohesion: 0.10
Nodes (35): ADR-001: Adapter Pattern, ADR-002: Workflows Are Prose-First Adapter Seeds, ADR-004: loom Setup Approach for the Mirai Harness, ADR-005: Harness-Agnostic Setup Entrypoint and Universal Setup Contract, ADR-006: Capability-Based Role Discipline, ADR-008: Delivery Dispatchers Delegate Execution and Verification, ADR-011: Seam Artifact Protocol, ADR-012: Invocation Surface Is a Role Facet (+27 more)

### Community 33 - "Diagnosing Bugs"
Cohesion: 0.14
Nodes (29): Diagnosing Bugs, Bisection Harness, When You Genuinely Cannot Build a Loop, Correct Seam, Differential Loop, Failing Test Loop, Falsifiable Hypothesis, HITL Bash Script (Last Resort) (+21 more)

### Community 34 - "loom Constitution"
Cohesion: 0.08
Nodes (30): Bootstrap (context bootstrapping), agentskills.io specification, loom Constitution, Azure SRE Agent (Microsoft), Agent = Model + Harness, Builder harness vs outer harness, Harness-Bench, Same Model, Different Harness (+22 more)

### Community 35 - "PORTS.md — the five port obligations"
Cohesion: 0.11
Nodes (28): Open Question In Harness Altitude Seam, Capability → Mirai tool mapping (doc), Discover, don't guess deviation rule, docs-lookup Mirai binding, The capability→Mirai-tool mapping table, Withhold mechanism (Mirai): omit tool, Mirai interview resolution steps, AGENTS.md vs mirai-instructions.md resolution (+20 more)

### Community 46 - "Frontend Runtime Debugging"
Cohesion: 0.16
Nodes (25): Context Compression, Frontend Runtime Debugging, Frontend Debugging Anti-Patterns, Capture Capability Checklist, Capture Caveats, Capture to a File, Summarize into Context, Chrome DevTools MCP, Manual DevTools Capture (+17 more)

### Community 48 - "Triage Skill"
Cohesion: 0.15
Nodes (23): Issue Tracker Resolution, Ready-for-Agent Label Application, Enhancements Only, Never Bugs, Triage Skill, AI Triage Disclaimer, Apply the Outcome, Canonical Role Names, Category Roles (+15 more)

### Community 49 - "Part B - Semantic Extraction via Parallel Subagents"
Cohesion: 0.15
Nodes (20): Code-Only Changes Auto-Rebuild Without an LLM, Debounce Window, needs_update Flag for Semantic Changes, Watch in Agentic Workflows, Watch Mode, Absolute CHUNK_PATH Requirement, Chunk File on Disk Is the Success Signal, Extraction Spec Subagent Prompt (+12 more)

### Community 50 - "Model — how much model a task needs"
Cohesion: 0.10
Nodes (28): Prefix-cache discipline as a cost lever, Cache discipline as a cost lever, BenchLM — grading models to pick a good-enough one, BenchLM dataset, AI model deprecation calendar (BenchLM), BenchLM leaderboard, BenchLM methodology, Model — how much model a task needs (+20 more)

### Community 51 - "The Orchestrator Role"
Cohesion: 0.20
Nodes (12): Implementation-Agent Classes (High / Mid / Low), The Orchestrator Role, task-sizing Skill, Closing Holds No Edit Capability, Form Slop, GATE.md Criterion (Artifact-Typed), Judgment Slop, Mechanism Installed via Port 5 (+4 more)

### Community 52 - "Hermes delivery conformance"
Cohesion: 0.22
Nodes (7): Altitude (two altitude-scoped substrates: macro board tracker vs micro SDLC ledger), Hermes delivery conformance, Mechanism (mechanism→install port), OpenCode delivery conformance, Resident agent (Hermes macro-PM profile), wayfinder-macro profile (Mechanism-layer distributable location), workflows/macro-pm/ (reactive lifecycle)

### Community 53 - "Design an Interface Skill"
Cohesion: 0.11
Nodes (22): The Editor's Contract - Spec In, Edit Out, No Redesign, No Scope Expansion, Stop on an Ambiguous or Wrong Spec, Design It Twice - Parallel Sub-Agent Pattern, Give an Opinionated Recommendation, Not a Menu, Constraint: Optimise for the Most Common Caller, Constraint: Maximise Flexibility, Step 1: Frame the Problem Space (+14 more)

### Community 54 - "The Gate"
Cohesion: 0.16
Nodes (15): loom gate baseline — known, ticketed validate.sh violations., Advisory Freshness, Baseline Blocking Rule, Canonicalize Js, Graph Check Js, Graph Check Sh Strict, Graph Gate Verified Failing, Graphify Prerequisite (+7 more)

### Community 55 - "Verification Before Completion Skill"
Cohesion: 0.09
Nodes (38): Server Operations Skill, Check and Clear Ports, Check Logs via get_terminal_output, Common Issues Table, Coordinate Placeholder Table, Interactive stdin Signal Conflict (SIGTTOU), Never Accept Fallback Ports, Never Hardcode Ports, Hosts, or Paths (+30 more)

### Community 56 - "ADR Change Log"
Cohesion: 0.15
Nodes (32): persist — Native Memory Tool (macro continuity only), Role Invocation Surface (Hermes), Adapter (extension point / adapter contract), Chronological log.md convention, ADR-001: Adapter Pattern, Adapter Layer (framework-to-tool distribution), ADR-002: Workflow as Adapter Seed, Prose-First Workflow Seed (+24 more)

### Community 57 - "ADR Format"
Cohesion: 0.19
Nodes (20): ADR Format, Architectural Shape Decision, Boundary and Scope Decisions, Consequences Section, Considered Options Section, Deliberate Deviations from the Obvious Path, Hard to Reverse, Integration Patterns Between Contexts (+12 more)

### Community 58 - "Session Bootstrap"
Cohesion: 0.17
Nodes (20): Session Bootstrap, Bootstrap Anti-Patterns, Bootstrap Message Template, Bounded Autonomy, CHECKPOINT.md Fallback, Context Budget Table, DISCOVER Adapter of the Seam Artifact Protocol, Executable Verification (+12 more)

### Community 59 - "State and Race Failures"
Cohesion: 0.17
Nodes (20): State and Race Failures, Abandoned Request Flashes Stale Data, Action/Event Order Log, Cancel Stale Async, State Capture Recipe, Clean Up on Unmount, Correct Effect Dependencies, Duplicated Local State (+12 more)

### Community 60 - "Context Compression Skill"
Cohesion: 0.07
Nodes (39): Green Text With Red Tests Is Not Resolved, Run the Project's Automated Checks, Typecheck, Tests, Then Format/Lint, Design Bucket, Discovery Bucket, Meta Bucket, Planning Bucket, Preservation Bucket (+31 more)

### Community 61 - "Step 4 - Build, Cluster, Analyze, Export"
Cohesion: 0.16
Nodes (18): MCP Graph Tools, MCP Stdio Server, Wiki Export, Run Wiki Export Before Step 9 Cleanup, Community Detection, EXTRACTED / INFERRED / AMBIGUOUS Audit Trail, Cumulative Cost Tracker, Directed Graph Flag (+10 more)

### Community 62 - "Rendering Failures"
Cohesion: 0.17
Nodes (19): Rendering Failures, Blank Page from Uncaught Render Error, Break the Render Loop, Rendering Capture Recipe, Console First, Rendering Second, DOM Snapshot at Failure, Error Boundaries, Framework Warnings Name the Bug (+11 more)

### Community 63 - "To Tickets Skill"
Cohesion: 0.18
Nodes (19): To Tickets Skill, Acceptance Criteria Section, AFK Slice, Blocked-By Declaration, Dependency-Order Publishing, Do Not Modify the Parent Issue, Draft Vertical Slices, Explore the Codebase (+11 more)

### Community 64 - "Stage Handoff Skill"
Cohesion: 0.18
Nodes (21): PRODUCE Step, Reachable Artifact, Never a Local Path, Stage Handoff Skill, Stage-Handoff Anti-Patterns, COMPRESS + PERSIST Strategy, Compress Step, Fallback .loom/handoffs Directory, Gather Step (+13 more)

### Community 65 - "Autonomy is earned by checks"
Cohesion: 0.14
Nodes (22): Criterion type, Evidence producer, Form slop, Gate, MAST — Multi-Agent System Failure Taxonomy, Why do multi-agent LLM systems fail? (Cemri et al.), Claude Code permission modes and lifecycle hooks, Codex /permissions (sandbox and approval settings per run) (+14 more)

### Community 66 - "Discovery Skills Index"
Cohesion: 0.20
Nodes (12): Discovery Skills Index, Architecture Interrogation Relocation Note, grill-with-docs Skill Entry, research Skill Entry, research-recommend Skill Entry, session-bootstrap Skill Entry, zoom-out Skill Entry, Zoom Out (+4 more)

### Community 67 - "Network Failures"
Cohesion: 0.19
Nodes (18): Network Failures, 401/403 Auth Failure, 500 Server-Side Origin, Base URL by Environment, Network Capture Recipe, CORS Block, CORS Is a Server Fix, Credentials Include + Allow-Credentials (+10 more)

### Community 68 - "Implementation Phase"
Cohesion: 0.26
Nodes (15): Closing Stage, Delivery Stage, Design Phase, Discovery Phase, Implementation Phase, Meta Bucket Toolbox, Three-Stage Ownership Overlay, Planning Phase (+7 more)

### Community 69 - "Domain Model Skill"
Cohesion: 0.15
Nodes (13): Domain Model Skill, The Active Discipline of Changing the Model, Stress-Test Relationships with Concrete Scenarios, Single- vs Multi-Context File Structure, Create Files Lazily, Not a Grilling Interview - Use grill-with-docs, Path Flexibility via loom.toml, Sharpen Fuzzy or Overloaded Language (+5 more)

### Community 70 - "Improve Codebase Architecture"
Cohesion: 0.25
Nodes (15): Improve Codebase Architecture, ADR Conflict Rule, Before/After Visualisation, Candidate Card Template, The Deletion Test, Phase 1: Explore, Phase 3: Grilling Loop, Commit-History Hot Spot Inference (+7 more)

### Community 71 - "Rule 3: Reference, Never Restate"
Cohesion: 0.13
Nodes (16): Absence Is an Answer Only When Recorded, Check: All Five Port Obligations Answered, Name the Duplicated File, Quote the Text, Check: Reference, Never Restate, Restatement Detection - the Highest-Value Signal, Never Restate - Link Instead, Macro Altitude, Consequence 2: An Adapter Owns Only Harness-Specific Knowledge (+8 more)

### Community 72 - "Corpus Cartographer Agent"
Cohesion: 0.15
Nodes (16): Corpus Cartographer Agent, Back-Fill Real Token Counts Before Merging, Content-Hash Cache Makes Refresh Incremental, Skipping Clustering Hid Research and VISION Nodes, The Graph Is Committed With the Repo, Nonzero dangling_endpoint_edges Is a Hard Failure, Delete cache/semantic Before Rebuilding Bad Ids, Extraction: Dispatch, Never Inline (+8 more)

### Community 73 - "Grill with Docs"
Cohesion: 0.22
Nodes (16): Path Flexibility Resolution, Grill with Docs, The Capture Discipline, Cross-Reference with Code, Design Tree, Distilled Evidence, Not Raw Reading Context, Empty-Frontier Termination, Finding Facts Is Your Job, Never the User's (+8 more)

### Community 74 - "To Spec Skill"
Cohesion: 0.22
Nodes (16): To Spec Skill, Deep Module, Explore the Repo, Use Domain Glossary and Respect ADRs, Implementation Decisions Section, No File Paths or Code Snippets, No-Interview Synthesis, Out of Scope Section (+8 more)

### Community 75 - "Out-of-Scope Knowledge Base"
Cohesion: 0.22
Nodes (16): Out-of-Scope Knowledge Base, Check During Triage, Concept-Similarity Matching, Deduplication of Rejections, A Deferral Is Not a Rejection, Writing a Durable Reason, Out-of-Scope File Format, Institutional Memory (+8 more)

### Community 76 - "Wiki Audit Skill"
Cohesion: 0.21
Nodes (16): Wiki Audit Skill, Broken Link, Build Link Graph, Check Broken Links, Dead-End Page, Detect Rot, Wiki Health Report, Wiki Audit Input Checklist (+8 more)

### Community 77 - "Wiki Curator Skill"
Cohesion: 0.20
Nodes (16): Duplicate Concept, Find Duplicates and Gaps, Wiki Curator Skill, Authority Level, Canonical Page, Classify Source, Curation Note, INGEST + INTEGRATE Strategy (+8 more)

### Community 78 - "Seam Artifact Protocol"
Cohesion: 0.17
Nodes (16): Entry and Exit Gates, Ledger Manifest, Seam Artifact, Seam Artifact Protocol, Planning Entry Gate, Planner Bootstraps in a Fresh Session, ready-for-delivery Manifest Row, Stage Seam DISCOVER (Shaping to Delivery) (+8 more)

### Community 79 - "Editor Agent"
Cohesion: 0.23
Nodes (12): Semantic Orphans and Weak Clusters, Editor Agent, Frontmatter Requirements for Wiki and Skills, Relative Links and Anchors Must Resolve, New Subtree Content Needs a log.md Line, An Unlinked New File Is an Orphan and Fails the Gate, Editor Reporting Format, validate.sh Clean Before Reporting Done (+4 more)

### Community 80 - "Written and checked beats smarter"
Cohesion: 0.18
Nodes (15): On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents, Evaluating AGENTS.md, Written context engineering (smallest high-signal set), Kiro, Kiro project init (AWS Startups), Kiro CLI loading every steering file is a context cost, Kiro's approved spec artifacts are a seam artifact by another name, Kiro spec-driven development (requirements, design, task list in repo) (+7 more)

### Community 81 - "Codebase Design Skill"
Cohesion: 0.15
Nodes (15): Codebase Design Skill, Accept Dependencies, Don't Create Them, Deep Module, Designing for Testability, Vocabulary Relationships, Return Results, Don't Produce Side Effects, Shallow Module, Small Surface Area (+7 more)

### Community 82 - "Resolving Merge Conflicts Skill"
Cohesion: 0.23
Nodes (12): Resolving Merge Conflicts Skill, Always Resolve, Never --abort, Do Not Invent New Behaviour to Bridge Sides, Finish the Merge, Rebase, or Cherry-pick, Identify the Operation in Flight, Merge-Conflict Anti-patterns, Preserve Both Intents Where Possible, Preserve Intent, Not Hunks (+4 more)

### Community 83 - "Agent"
Cohesion: 0.28
Nodes (13): Agent, Capability, Dispatcher, Domain-specialized utility, Invocation surface, Orchestrator, Role, Utility (dispatched) agent (+5 more)

### Community 84 - "graphify references index"
Cohesion: 0.14
Nodes (14): graphify reference: extraction subagent prompt, graphify reference: commit hook and CLAUDE.md integration, Native CLAUDE.md integration (graphify claude install), graphify references index, Progressive-disclosure reference loading, Manifest added for validator reachability, Vendored third-party content, faithful copies, graphify reference: incremental update and cluster-only (+6 more)

### Community 85 - "Wiki Query Skill"
Cohesion: 0.27
Nodes (12): Wiki Query Skill, ADR Citation, Answer With Sources, Confidence Statement, Separate Facts From Inference, Index-First Lookup, Optional File-Back, READ + ANSWER + FILE-BACK Strategy (+4 more)

### Community 86 - "Wiki Crosslink Skill"
Cohesion: 0.25
Nodes (14): Wiki Crosslink Skill, Classify Pages Into Sections, Index Page, INDEX + VERIFY Strategy, Inventory Pages, Link Graph, Parent Index, Preserve Custom Intro Text (+6 more)

### Community 87 - "Operational DNA - Five-Phase Task Execution"
Cohesion: 0.11
Nodes (26): ADR-016: Embedded Review Gate and Commit-Often, ADR-017: Quality Baseline Embedded in Setup and Every Gate, 2026-07-14: Named the Orchestrator Agent Role, 2026-07-14: Task-Decomposition and TDD Playbooks Baked into Phase Policies, The Architecture-Prerequisite Gate, Quality Gate Step 3 - Commit the Slice, Dispatch to the Correct Implementation-Agent Class, Implementation Entry Gate (+18 more)

### Community 88 - "CONTEXT.md Format"
Cohesion: 0.26
Nodes (14): CONTEXT.md Format, Avoid Synonym List, Be Opinionated Rule, CONTEXT-MAP.md, Context Relationships, Context-Specific Terms Only, Group Terms Under Subheadings, Keep Definitions Tight (+6 more)

### Community 89 - "Claude Code Harness Config Readme"
Cohesion: 0.21
Nodes (11): The Resident Loop Is Human-Pulled Here, Claude Code Harness Config Readme, Adapter Must Emit Copies, Commands Directory, Gh Version Prerequisite, Main Session, Not An Adapter, Open Question Archetype Cell (+3 more)

### Community 90 - "--update incremental re-extraction"
Cohesion: 0.12
Nodes (20): Pure-code corpus skips Part B, Hook appends to an existing post-commit hook, Hook change detection via git diff HEAD~1, Post-commit rebuild hook, graphify reference: query, path, explain, Constrained query expansion (Step 0), Graph vocabulary file (.vocab.txt), graphify explain (single node and its neighbourhood) (+12 more)

### Community 91 - "Checkpoint Skill"
Cohesion: 0.25
Nodes (14): Checkpoint Skill, Checkpoint Anti-Patterns, Compression Trigger Table, Decision-Result Node, Fold Resolved Branches, JOURNAL + COMPRESS Strategy, The Memory System, Not a Repo File, Checkpoint Procedure (+6 more)

### Community 92 - "Wiki Init Skill"
Cohesion: 0.22
Nodes (15): Backlink, Wiki Init Skill, ADR Index, Choose Wiki Root, Minimum Viable Core Page Set, Create Core Pages, Do Not Move Existing Docs, Glossary (+7 more)

### Community 93 - "Workflows Index"
Cohesion: 0.25
Nodes (11): Workflows Index, Harness Archetype Renders a Lifecycle Kind, Macro-PM Workflow (Catalog Entry), Prose-First Principle, Reactive Lifecycle, SDLC Workflow (Catalog Entry), Terminating Lifecycle, Two Lifecycle Kinds (+3 more)

### Community 94 - "Rule 5: Everything Traces to the Vision"
Cohesion: 0.17
Nodes (13): Check: Registration in SETUP, SPEC and validate.sh, A Clean graphify diagnose Proves Nothing, God Nodes, graph-check.sh Decides Correctness, Gate: graph-check.sh Guards Context, Gate: quality.sh Guards Code, Gate: validate.sh Guards Prose, The Graph Is What an Agent Believes Before It Reads Anything (+5 more)

### Community 95 - "Thoth Wiki Scribe"
Cohesion: 0.18
Nodes (14): Honesty About EXTRACTED vs INFERRED Provenance, Surprising Edges, Write Scope: graphify-out/ Only, Seed and Charting Skill Are the Authority, Thoth Wiki Scribe, The Canonical Definition Wins Over the Render, The Scribe Records; It Does Not Decide, Keep Edits Narrow (+6 more)

### Community 96 - "adr-new Command"
Cohesion: 0.19
Nodes (14): Check: Each Adapter Has a Setup ADR, adr-new Command, Cite Evidence and Numbers, Not Intuition, ADR Frontmatter Shape, Output 2: The Index Row, Output 3: The Log Entry, Narrow Supersessions Are the Norm; Blanket Ones Are Suspect, Never Link Into the Gitignored .loom/ Tree (+6 more)

### Community 97 - "Architecture HTML Report Format"
Cohesion: 0.15
Nodes (13): Rejected: 'Boundary' for Seam, Rejected: Interface as the TypeScript Keyword, Challenge Terms Against the Glossary, Architecture HTML Report Format, Header and Compact Legend, Mix Mermaid with Hand-Built Visuals, Never Substitute Component, API, Boundary or Layer, Single-File HTML Scaffold (+5 more)

### Community 98 - "Writing Agent Briefs"
Cohesion: 0.23
Nodes (16): Writing Agent Briefs, Agent Brief, Bad Agent Brief Example, Behavioral, Not Procedural, The Brief Is the Contract, Agent Brief Template, Category Field, Complete Acceptance Criteria (+8 more)

### Community 99 - "The Deep-Module Glossary"
Cohesion: 0.26
Nodes (13): Comparison Axes - Depth, Locality, Seam Placement, Constraint: Minimize the Interface, Adapter, The Deletion Test, Depth, The Deep-Module Glossary, Implementation, Interface (+5 more)

### Community 100 - "Test-Driven Development Skill"
Cohesion: 0.06
Nodes (45): Find the Primary Sources for Each Conflict, Glossary and ADRs Settle the Canonical Reading, Deep Modules, A Philosophy of Software Design, Deep Module - Small Interface, Deep Implementation, Interface Reduction Questions, Shallow Module - Large Interface, Thin Implementation, Interface Design for Testability (+37 more)

### Community 101 - "/graphify query"
Cohesion: 0.40
Nodes (5): Fast Path - Answer From an Existing Graph, The Graph Is the Map, the Agent Is the Guide, /graphify query, NetworkX Traversal Fallback, Vocabulary Expansion Before Traversal

### Community 102 - "Five-dimension complexity score"
Cohesion: 0.08
Nodes (26): Discrete confidence_score rubric (0.95/0.85/0.75/0.65/0.55), Confidence tiers: EXTRACTED / INFERRED / AMBIGUOUS, DEEP_MODE aggressive inference, Answer only from the graph; cite source_location, Inline NetworkX traversal fallback, Token-budget aware subgraph output, BFS and DFS traversal modes, Explain the why instead of heavy-handed MUSTs (+18 more)

### Community 103 - "Macro-PM Workflow Seed"
Cohesion: 0.09
Nodes (34): `qa:regression-failed` (regression origin), Standing regression suite, Verification Culture, ADR-020: System-Scoped QA as a Coverage Judgment over Macro-PM, derive-e2e-coverage Coverage Judgment Skill, ADR-020: System-Scoped QA as a Coverage Judgment over Macro-PM, Verification Iron Law, Macro-PM Workflow Seed (+26 more)

### Community 104 - "Adapter Conformance Reviewer"
Cohesion: 0.22
Nodes (10): Adapter Conformance Reviewer, Check: Archetype Consistency with the Two Axes, Conformance Breaks vs Observations, Do Not Manufacture Findings to Look Thorough, Prioritized Findings Report, Read-Only Reviewer Constraint, Validator Checks Shape; Reviewer Checks Substance, Audit Discipline - Prioritized Findings with Repairs (+2 more)

### Community 105 - "Ephemeral agents"
Cohesion: 0.30
Nodes (12): Graduation, Mechanism, Re-executing reality, Recall slop, Claude Code headless mode (claude -p, Agent SDK as library), Codex headless mode (codex exec), Cursor headless CLI (agent -p print mode, --force to apply), Cordis plugin kernel (loops, scheduling, models, tools as plugins) (+4 more)

### Community 106 - "Hermes Agent — a resident agent with a chat gateway"
Cohesion: 0.24
Nodes (10): Ambient AI architecture (Tian Pan), Introducing ambient agents (LangChain), Notify / question / review pattern, Hermes Agent — a resident agent with a chat gateway, Chat gateway (Telegram, Discord, Slack, WhatsApp, Signal, Email, Home Assistant), claude-code skill (Hermes delegates coding to Claude Code), Built-in cron scheduler, Curator (reviews agent-written skills) (+2 more)

### Community 107 - "Design Skills Index"
Cohesion: 0.33
Nodes (7): Design Skills Index, codebase-design Skill Entry, design-an-interface Skill Entry, domain-model Skill Entry, improve-codebase-architecture Skill Entry, Shape the Solution Before Planning, Ubiquitous Language

### Community 108 - "Review-Gate Cadence"
Cohesion: 0.23
Nodes (12): Commit Often, Cross-Cutting Principles, Documentation Written As You Go, Implementation DNA, Quality Baseline (Four-Aspect Floor), Quality Gate (Verify to Review to Commit), Review-Gate Cadence, Tracer-Bullet Vertical Slice (+4 more)

### Community 109 - "Dependency Categories"
Cohesion: 0.24
Nodes (10): Dependency Categories, Category 1: In-Process, Category 2: Local-Substitutable, Ports-and-Adapters Recommendation Shape, Category 3: Remote but Owned - Ports and Adapters, Category 4: True External - Mock, Constraint: Design Around Ports and Adapters, Sub-Agent Output Shape (+2 more)

### Community 110 - "Extraction subagent prompt (verbatim, templated)"
Cohesion: 0.12
Nodes (16): Do not re-extract imports — AST already has them, calls edge direction and same-language constraint, Write chunk JSON to an absolute CHUNK_PATH, IDs must be deterministic — never chunk-suffixed, Extraction JSON schema (nodes/edges/hyperedges/token counts), Extraction subagent prompt (verbatim, templated), Six-value file_type enum, Hyperedge (3+ nodes, max 3 per chunk) (+8 more)

### Community 111 - "build_merge"
Cohesion: 0.13
Nodes (16): source_file verbatim rule, graphify reference: GitHub clone and cross-repo merge, --backend selector (gemini/kimi/openai/deepseek/claude-cli), Cross-repo graph, Fast path: query the existing graph instead of re-extracting, graphify clone (Step 0), graphify extract CLI (per-subfolder), graphify merge-graphs (+8 more)

### Community 112 - "Offer ADRs Sparingly - All Three Tests Must Hold"
Cohesion: 0.40
Nodes (5): ADR Test 1: Hard to Reverse, ADR Test 3: The Result of a Real Trade-Off, ADR Test 2: Surprising Without Context, Offer ADRs Sparingly - All Three Tests Must Hold, ADR Callout

### Community 113 - "Skills Index"
Cohesion: 0.15
Nodes (14): Skills Index, Skill File Layout Convention, dispatch-context skill, dispatch-context anti-patterns, ISOLATE + ORGANIZE strategy, Only cross-stage artifacts are manifest-registered, Promote within-stage output via stage-handoff, Transient does not mean scattered (+6 more)

### Community 114 - "Pass 4 — Dependency Graph and Parallelism"
Cohesion: 0.50
Nodes (5): Interface Contracts for Parallel Tasks, Pass 4 — Dependency Graph and Parallelism, Pass 5 — Task Document Generation, Pass 6 — Self-Critique, Zero-Question Test

### Community 115 - "Graphify Exports Reference"
Cohesion: 0.31
Nodes (9): Graphify Exports Reference, FalkorDB Export, Flag-Gated Export Steps, GraphML Export, MERGE Makes Pushes Safely Re-runnable, Neo4j Export, Prefer --falkordb-push Over the Cypher File, SVG Export (+1 more)

### Community 116 - "Architecture Gate"
Cohesion: 0.14
Nodes (17): Architecture-First / Research-Backed, Architecture-Prerequisite Gate, Planning DNA, Planning Agent-Effort Policy, Architecture Gate, Complexity-Scaled Gate Binding, Planning Exit Gate, Output-Plan Policy (80/20) (+9 more)

### Community 117 - "Rule 6: Earn Your Abstractions"
Cohesion: 0.29
Nodes (8): Rule 6: Earn Your Abstractions, Rule 1: Prose First, A Seam Observed Once Is a Hypothesis; Twice Is Real, Internal Seams vs External Seams, Seam Discipline, One Adapter Is a Hypothetical Seam; Two Are a Real One, Depth Is a Property of the Interface, Not the Implementation, Two Adapters Mean a Real Seam

### Community 118 - "Preservation Skills Index"
Cohesion: 1.00
Nodes (3): Preservation Skills Index, Preservation Lifecycle Bucket, Preservation Skill Catalog Table

### Community 119 - "Planning Artifacts"
Cohesion: 0.67
Nodes (3): Planning Artifacts, Design-Gap Loopback, High-Level Domain Model (Mandatory Citation)

### Community 120 - "Step 2.5 — transcribe video/audio files"
Cohesion: 0.25
Nodes (8): graphify reference: transcribe video and audio, Whisper domain-hint prompt written from god-node labels, Generic fallback Whisper prompt, Write JSON from Python, not a shell redirect (#1392), Step 2.5 — transcribe video/audio files, Transcripts join the docs list for Step 3B, GRAPHIFY_WHISPER_PROMPT / GRAPHIFY_WHISPER_MODEL exports, Rewrite detect JSON so transcripts, not raw media, reach subagents

### Community 123 - "Spec-Fidelity Check"
Cohesion: 0.40
Nodes (5): Invents No New Criteria, Verification Report, Verification Shift-Left Obligation: Closing the Loop, Spec Deviation as Evidence, Not Auto-Failure, Spec-Fidelity Check

### Community 124 - "Implementation Skills Index"
Cohesion: 0.29
Nodes (7): Implementation Skills Index, architect-review Skill Entry, diagnosing-bugs Skill Entry, frontend-runtime-debugging Skill Entry, prototype Skill Entry, resolving-merge-conflicts Skill Entry, server-operations Skill Entry

### Community 126 - "Graphify Skill"
Cohesion: 0.12
Nodes (21): Graphify Add and Watch Reference, Author and Contributor Tagging, Auto-Run --update After a Successful Save, Ingest a URL Into the Corpus, Supported URL Types, Surface Ingest Errors, Never Silently Continue, Claude Desktop Needs the Absolute Interpreter Path, Token Reduction Benchmark (+13 more)

### Community 129 - "SDLC Preservation Phase Policy"
Cohesion: 0.14
Nodes (16): Edit Article Skill, Confirm the Sections With the User, Divide the Article Into Sections, Information Is a Directed Acyclic Graph, Meta skills index, skill-creator skill, scripts.package_skill packaging, Principle of Lack of Surprise (+8 more)

### Community 130 - "validate Command"
Cohesion: 0.38
Nodes (7): validate.sh Clean of New Violations Before Done, validate Command, preservation.validate-passes Is an Executable Criterion, Never Edit the Baseline to Make a Failure Disappear, Separate New Violations from Baselined Ones, Clean Pass: Summary Line, No Commentary, Run the Gate and Report the Result

### Community 131 - "Deepening a Shallow Cluster"
Cohesion: 0.33
Nodes (6): Deepening a Shallow Cluster, Old Shallow-Module Unit Tests Become Waste - Delete Them, The Interface Is the Test Surface, Testing Strategy: Replace, Don't Layer, Tests Describe Behaviour, So They Survive Refactors, The Interface Is the Test Surface

### Community 132 - "Step 4: Compare Designs"
Cohesion: 0.33
Nodes (6): Step 4: Compare Designs, Criterion: Depth, Criterion: Ease of Correct Use vs Ease of Misuse, Criterion: General-Purpose vs Over-Generalized, Criterion: Implementation Efficiency, Criterion: Interface Simplicity

### Community 137 - "Phase Policy Anatomy"
Cohesion: 0.40
Nodes (5): Agent-Effort Policy, Phase Policy Anatomy, Skills Referenced by Intent, Not Ownership, Shift-Left Verification, Planning Shift-Left Obligation

### Community 138 - "Issue Tracker"
Cohesion: 0.13
Nodes (16): GATE.md — the one narrow committed exception, GATE, GitHub Issue Dependencies (docs), loom framework change log, ADR-024: Spec Fidelity Is a Surfaced-Delta Verification Evidence Category, Spec Fidelity Evidence Category (matches/deviates/not-addressed), GitHub Issue #14 — Affiliate-Project Spec-Fidelity Gap, Development Servers (+8 more)

### Community 142 - "Manifest stamping of files that actually produced output (#2015)"
Cohesion: 0.67
Nodes (3): clear_semantic re-queues failed chunks (#1948), Manifest stamping of files that actually produced output (#2015), scan_corpus distinguishes newly-excluded files from deletions (#1908)

### Community 143 - "Standing Regression Suite"
Cohesion: 0.67
Nodes (3): derive-e2e-coverage, Macro-PM Altitude, Standing Regression Suite

## Ambiguous Edges - Review These
- `Right-Sizing Announces Itself` → `Detect Rot`  [AMBIGUOUS]
  SKILLS/preservation/wiki-audit/SKILL.md · relation: semantically_similar_to

## Knowledge Gaps
- **318 isolated node(s):** `defaultClient`, `{ execFileSync }`, `{ parseBoard }`, `assert`, `{ buildArgv, createGh, GhError }` (+313 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 479 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Right-Sizing Announces Itself` and `Detect Rot`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `Context` connect `Context` to `SDLC Workflow`, `SDLC Preservation Phase Policy`, `The six loom primitives + their generic content`, `Issue Tracker`, `Logic Prototype`, `ADR-013: Shared Adapter-Contract Core`, `Harness — everything around the model`, `ADR-017: Quality Baseline Embedded in Setup and Every Gate`, `SDLC Design Phase`, `AGENTS.md`, `Wayfinder Skill`, `Resident PM Agent`, `loom Constitution`, `PORTS.md — the five port obligations`, `Verification Before Completion Skill`, `ADR Change Log`, `Stage Handoff Skill`, `Autonomy is earned by checks`, `Agent`, `Workflows Index`, `Macro-PM Workflow Seed`, `Ephemeral agents`?**
  _High betweenness centrality (0.210) - this node is a cross-community bridge._
- **Why does `SDLC Implementation Phase` connect `SDLC Workflow` to `Context`, `The six loom primitives + their generic content`, `PORTS.md — the five port obligations`, `Diagnosing Bugs`, `Test-Driven Development Skill`, `Improve Codebase Architecture`, `SDLC Preservation Phase Policy`, `Architect Review`, `ADR-013: Shared Adapter-Contract Core`, `Resolving Merge Conflicts Skill`, `Agent`, `Verification Before Completion Skill`, `ADR-017: Quality Baseline Embedded in Setup and Every Gate`, `SDLC Design Phase`, `Operational DNA - Five-Phase Task Execution`, `Workflows Index`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `SDLC Preservation Phase Policy` connect `SDLC Preservation Phase Policy` to `SDLC Workflow`, `Context`, `Stage Handoff Skill`, `PORTS.md — the five port obligations`, `Implementation Phase`, `The six loom primitives + their generic content`, `Issue Tracker`, `Wiki Audit Skill`, `Wiki Curator Skill`, `Seam Artifact Protocol`, `visual-verification Skill`, `Skills Index`, `Wiki Crosslink Skill`, `SDLC Design Phase`, `ADR Change Log`, `Session Bootstrap`, `Checkpoint Skill`, `Wiki Init Skill`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **What connects `defaultClient`, `{ execFileSync }`, `{ parseBoard }` to the rest of the system?**
  _318 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Context` be split into smaller, more focused modules?**
  _Cohesion score 0.12912912912912913 - nodes in this community are weakly interconnected._
- **Should `Research Recommend` be split into smaller, more focused modules?**
  _Cohesion score 0.0753045404208195 - nodes in this community are weakly interconnected._