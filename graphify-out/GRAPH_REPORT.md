# Graph Report - doc-architecture  (2026-09-22)

## Corpus Check
- 223 files · ~247,865 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .template 12, (none) 7)

## Summary
- 596 nodes · 1611 edges · 48 communities (25 shown, 23 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Glossary Terms & Framework Log
- Bootstrap Docs & Macro-PM
- Hermes & Mirai Adapter Mappings
- validate.sh Gate Checks
- Board Model (scripts/loom)
- Board Reconcile & Verbs
- Dev Environments & Anti-Patterns
- Board Model Tests
- Board Tree Renderer
- Mirai Verify Checks
- OpenCode Capability Mapping
- Hermes Persist & Verify
- Adapter Pattern & Setup Contract
- GitHub CLI Wrapper (gh.js)
- Board CLI Entrypoint & ADRs
- Hermes Setup & Shared Core
- docs-lookup Capability & Roles
- Seam Artifact Protocol
- Claude Code Settings & Hooks
- Board Reconcile Tests
- Hermes Port Obligations
- loom Command Catalog
- Provenance Marking & Idempotency
- Micro Ledger & Harness Archetypes
- Task-Sizing Script
- Claude Code Harness Config
- Validate Gate Hook
- Quality Baseline Script
- adapter-conformance Agent
- corpus-cartographer Agent
- editor Agent
- explore Agent
- thoth Agent (.claude render)
- adr-new Command
- tick Command
- validate Command
- Hermes docs-lookup Binding
- OpenCode interview clarify Tool
- Hermes Existing-State Rule
- Hermes Macro-PM §4f Resolution
- Hermes Project-Context Placement
- Hermes Adapter Render Scope
- Claude Code .agents Migration
- OpenCode Project-Context Placement
- OpenCode Quick-Commands Checks
- OpenCode Structure Checks
- REGISTRY.md
- README.md

## God Nodes (most connected - your core abstractions)
1. `Context` - 118 edges
2. `The six loom primitives + their generic content` - 36 edges
3. `Seam Artifact Protocol` - 36 edges
4. `Determinism that a workflow asserts must be made executable, not left as prose — loom is organised into a Core/Gate/M...` - 29 edges
5. `SDLC Workflow` - 29 edges
6. `PORTS.md — the five port obligations` - 27 edges
7. `Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue ...` - 27 edges
8. `Generic interview questions` - 27 edges
9. `ADR change log` - 27 edges
10. `ADR-018: Macro Project-Management as a Recursive Wayfinding Layer over SDLC` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Port 5: mechanism→install` --semantically_similar_to--> `Mirai mechanism→install answer (.mirai/mechanisms/loom)`  [INFERRED] [semantically similar]
  contract/PORTS.md → adapters/mirai/setup.md
- `Idempotency Rule (patch in place, never duplicate)` --conceptually_related_to--> `Provenance Marking (Hermes namespaced marker)`  [INFERRED]
  contract/discipline.md → adapters/hermes/references/write-format.md
- `Withhold mechanism (Mirai): omit tool` --conceptually_related_to--> `Port 1: capability→tool`  [INFERRED]
  adapters/mirai/references/capabilities.md → contract/PORTS.md
- `Mirai capability/invocation rendering checks` --conceptually_related_to--> `Generic Invariant-Checks (verify step, generic half)`  [INFERRED]
  adapters/mirai/references/verify.md → contract/discipline.md
- `OpenCode Capability→Permission Mapping Table` --conceptually_related_to--> `Port 1: capability→tool`  [INFERRED]
  adapters/opencode/references/capabilities.md → contract/PORTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Hermes Resident wayfinder-macro Profile Toolset Composition** — adapters_hermes_references_capabilities_withhold_mechanism, adapters_hermes_references_capabilities_persist_native_memory, adapters_hermes_references_capabilities_interview_clarify [INFERRED 0.85]
- **Mirai adapter files jointly answering the five port obligations** — adapters_mirai_setup, adapters_mirai_mapping, adapters_mirai_stages [EXTRACTED 1.00]
- **OpenCode Adapter Answers the Five Port Obligations** — contract_ports_port1_capability_tool, contract_ports_port2_archetype_model, contract_ports_port3_seam_obligation_wiring, contract_ports_port4_primitive_file_manifest, contract_ports_port5_mechanism_install, adapters_opencode_setup_port_answers [EXTRACTED 1.00]
- **The Five Port Obligations (Ports 1-5)** — contract_ports_port1_capability_tool, contract_ports_port2_archetype_model, contract_ports_port3_seam_obligation_wiring, contract_ports_port4_primitive_file_manifest, contract_ports_port5_mechanism_install [EXTRACTED 1.00]
- **The five port obligations forming loom's adapter-contract seam** — contract_ports, contract_ports_port1_capability_to_tool, contract_ports_port2_archetype_to_model, contract_ports_port3_seam_obligation_to_wiring, contract_ports_port4_primitive_to_file_manifest, contract_ports_port5_mechanism_to_install [EXTRACTED 1.00]
- **Adapter-Contract Ecosystem (Mirai, OpenCode, Shared Core)** — wiki_adr_adr_004_loom_mirai_setup_adr, wiki_adr_adr_014_loom_opencode_setup_adr, wiki_adr_adr_013_shared_adapter_contract_core_adr [EXTRACTED 1.00]
- **Macro-PM Protocol Design Lineage (ADR-018 → ADR-019 → ADR-020)** — wiki_adr_adr_018_macro_project_management, wiki_adr_adr_019_loom_hermes_setup, wiki_adr_adr_020_system_scoped_qa [EXTRACTED 1.00]
- **Backend API / Prisma Knowledge Cluster (Express + Prisma CRUD)** — wiki_patterns_backend_api_patterns, wiki_patterns_backend_api_gotchas, wiki_patterns_prisma_patterns [INFERRED 0.80]

## Communities (48 total, 23 thin omitted)

### Community 0 - "Glossary Terms & Framework Log"
Cohesion: 0.06
Nodes (93): `qa:regression-failed` (regression origin), Standing regression suite, Agent Collaboration Framework, Wisdom, GitHub Issue Dependencies (docs), loom framework change log, Deepening, Design It Twice (+85 more)

### Community 1 - "Bootstrap Docs & Macro-PM"
Cohesion: 0.07
Nodes (81): The macro-PM resident agent rendered onto Claude Code. Owns the GitHub board — reads the frontier, routes tickets mec..., Agent Instructions — loom, loom — Constitution, Amendment, How they compose, Quality, The binding rules, The entities (+73 more)

### Community 2 - "Hermes & Mirai Adapter Mappings"
Cohesion: 0.11
Nodes (74): loom → Hermes Mapping, Hermes macro-PM binding — the resident daemon & altitude seam, loom Stages in Hermes — deliberately empty, loom → Mirai Mapping, Capability → Mirai tool mapping (doc), Discover, don't guess deviation rule, docs-lookup Mirai binding, The capability→Mirai-tool mapping table (+66 more)

### Community 3 - "validate.sh Gate Checks"
Cohesion: 0.21
Nodes (23): check_gate_registry_join(), check_markdown_anchor(), check_markdown_links(), check_orphans(), file_anchors(), frontmatter_value(), is_relative_markdown_target(), report_error() (+15 more)

### Community 4 - "Board Model (scripts/loom)"
Cohesion: 0.15
Nodes (23): appendPointerLine(), findMap(), frontier(), hasOpenBlocker(), isMember(), ADR-0025, ADR-0029, KNOWN_TRANSITIONS (+15 more)

### Community 5 - "Board Reconcile & Verbs"
Cohesion: 0.12
Nodes (21): planReconcile(), planReconcileDone(), planReconcileLabels(), planReconcileParentMigration(), apply(), CALL_HANDLERS, gh, guard() (+13 more)

### Community 6 - "Dev Environments & Anti-Patterns"
Cohesion: 0.10
Nodes (24): Development Servers, Fish Shell, Environments Index, Agent Wiki, Backend API Common Pitfalls & Anti-Patterns, Anti-pattern: Exposing Internal Errors to Clients, Anti-pattern: Middleware Order Violations, Anti-pattern: Not Using Transactions for Multi-Step Operations (+16 more)

### Community 7 - "Board Model Tests"
Cohesion: 0.11
Nodes (12): scripts_loom_board_fixtures_board, parseBoard(), assert, board, ADR-0029, { parseBoard, takeable, frontier, unmapped }, test, assert (+4 more)

### Community 8 - "Board Tree Renderer"
Cohesion: 0.19
Nodes (16): buildChildIndex(), childrenOf(), escapeLabel(), formatLine(), ADR-0029, nodeId(), renderMermaid(), addNode() (+8 more)

### Community 9 - "Mirai Verify Checks"
Cohesion: 0.13
Nodes (18): Model Format Resolution (Hermes), Mirai verify — format-checks, File placement checks (Mirai), Frontmatter format-checks (Mirai), Handoff wiring (Mirai handoffs: schema) checks, Mirai capability/invocation rendering checks, Model fallback array checks (Mirai), Mirai harness manifest (primitive→file table) (+10 more)

### Community 10 - "OpenCode Capability Mapping"
Cohesion: 0.14
Nodes (18): interview — Native question Tool, OpenCode Capability→Permission Mapping Table, interview Capability — Native, No Resolution Needed, Mechanism Install (.opencode/mechanisms/loom), OpenCode's Five Port Answers Table, Mechanism Distributable Placement Checks, Quality Baseline Checks, GATE.md — the one narrow committed exception (+10 more)

### Community 11 - "Hermes Persist & Verify"
Cohesion: 0.14
Nodes (16): persist — Native Memory Tool (macro continuity only), Hermes Verify — Format-Checks, Delivery Shape — a Profile Distribution, Role Invocation Surface (Hermes), Harness Manifest (Hermes), persist — Scoped-Edit Glob for Ledger Writes, OpenCode Verify: Capability/Invocation Rendering Checks, OpenCode Harness Manifest (+8 more)

### Community 12 - "Adapter Pattern & Setup Contract"
Cohesion: 0.25
Nodes (16): OpenCode Adapter (setup.md), The Setup Contract (Five Steps), Adapter Layer (framework-to-tool distribution), ADR-001: Adapter Pattern, ADR-002: Workflow as Adapter Seed, Prose-First Workflow Seed, ADR-003: Architecture-First Ordering, ADR-004: loom Setup Approach for the Mirai Harness (+8 more)

### Community 13 - "GitHub CLI Wrapper (gh.js)"
Cohesion: 0.18
Nodes (13): ref_node_child_process, ref_node_test, buildArgv(), createGh(), defaultClient, { execFileSync }, GhError, { parseBoard } (+5 more)

### Community 14 - "Board CLI Entrypoint & ADRs"
Cohesion: 0.15
Nodes (13): ADR-0027, ref_node_assert, EXIT, gh, ADR-0025, main(), NAMESPACES, parseArgv() (+5 more)

### Community 15 - "Hermes Setup & Shared Core"
Cohesion: 0.25
Nodes (11): Hermes Interview Resolution Steps (doc), Setup loom for Hermes — The Hermes Adapter, The Shared Adapter-Contract Core, Adapter Conformance Rule, SETUP.md (harness-agnostic entrypoint), grill-with-docs SKILL (discovery), SPEC.md (setup contract conformance), ADR-001: Adapter Pattern (+3 more)

### Community 16 - "docs-lookup Capability & Roles"
Cohesion: 0.27
Nodes (10): docs-lookup OpenCode Binding (scout / MCP), OpenCode Withhold Mechanism (permission: deny), docs-lookup — Prefer Built-in scout, ADR-006: Capability-Based Roles, Role-Scoped Capabilities Pattern, ADR-007: Optional Documentation-Lookup Capability, docs-lookup Capability, ADR-010: Keyless-by-Default Recommendations (+2 more)

### Community 17 - "Seam Artifact Protocol"
Cohesion: 0.20
Nodes (10): OpenCode Verify: Handoff Wiring Checks, Handoff / Communication Protocol Checks, Architecture-First & Research-Backed Principle, ADR-011: Seam Artifact Protocol, Seam Artifact Protocol (namespaced, manifest-indexed ledger), ADR-015: Communication-Line Refinement, Three Communication Lanes (checkpoint / dispatch-context / stage-handoff), ADR-016: Embedded Review Gate + Commit-Often (+2 more)

### Community 18 - "Claude Code Settings & Hooks"
Cohesion: 0.22
Nodes (8): hooks, PostToolUse, Stop, model, permissions, allow, ask, $schema

### Community 19 - "Board Reconcile Tests"
Cohesion: 0.22
Nodes (6): assert, board, EXPECTED_PARENT_MIGRATION_PAIRS, LOOM_LABEL_NAMES, { parseBoard, planReconcile }, test

### Community 20 - "Hermes Port Obligations"
Cohesion: 0.25
Nodes (8): Capability → Hermes Tool Mapping (detail), The Withhold Mechanism (Hermes), The Per-Tool Withhold Key (Hermes), The Per-Tool Withhold (Write-Time), Hermes's Five Port Answers, The Five Port Obligations, ADR-002: Workflow as Adapter Seed, ADR-006: Capability-Based Roles

### Community 21 - "loom Command Catalog"
Cohesion: 0.25
Nodes (8): Command Catalog, Generate user-facing release notes from git history, Chart or work through a wayfinder map — a shared plan of decision tickets for work too big for one session., Audit wiki health and drift through Thoth., Crosslink related wiki pages through Thoth., Curate durable wiki knowledge through Thoth., Initialize or refresh an OKF wiki structure through Thoth., Query the project wiki through Thoth.

### Community 22 - "Provenance Marking & Idempotency"
Cohesion: 0.48
Nodes (7): Provenance Marking (Hermes namespaced marker), OpenCode Verify: File Placement Checks, discipline.md — provenance/idempotency + invariant checks, Frontmatter Reconcile (for update), Idempotency Rule (patch in place, never duplicate), Provenance Marking (idempotent patching), init vs update Semantics

### Community 23 - "Micro Ledger & Harness Archetypes"
Cohesion: 0.47
Nodes (6): Micro Ledger Substrate (Hermes) — No Choice, Handoff / Communication Protocol Checks, Port 3: seam-obligation→wiring, ADR-011: Seam Artifact Protocol, ADR-014: loom OpenCode Setup, Harness Archetypes (resident vs per-invocation)

### Community 24 - "Task-Sizing Script"
Cohesion: 0.67
Nodes (5): action_for(), band_for(), self_test(), size-score.sh script, usage()

## Knowledge Gaps
- **153 isolated node(s):** `validate-gate.sh script`, `$schema`, `model`, `allow`, `ask` (+148 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 194 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Context` connect `Bootstrap Docs & Macro-PM` to `Glossary Terms & Framework Log`, `Hermes & Mirai Adapter Mappings`, `Dev Environments & Anti-Patterns`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Why does `PORTS.md — the five port obligations` connect `Hermes & Mirai Adapter Mappings` to `Glossary Terms & Framework Log`, `Bootstrap Docs & Macro-PM`, `Mirai Verify Checks`, `Hermes Setup & Shared Core`, `Provenance Marking & Idempotency`, `Claude Code Harness Config`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `Adapter Conformance Rule` connect `Hermes Setup & Shared Core` to `Hermes & Mirai Adapter Mappings`, `Adapter Pattern & Setup Contract`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `validate-gate.sh script`, `$schema`, `model` to the rest of the system?**
  _153 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Glossary Terms & Framework Log` be split into smaller, more focused modules?**
  _Cohesion score 0.06404862085086489 - nodes in this community are weakly interconnected._
- **Should `Bootstrap Docs & Macro-PM` be split into smaller, more focused modules?**
  _Cohesion score 0.06728395061728396 - nodes in this community are weakly interconnected._
- **Should `Hermes & Mirai Adapter Mappings` be split into smaller, more focused modules?**
  _Cohesion score 0.10625694187338022 - nodes in this community are weakly interconnected._