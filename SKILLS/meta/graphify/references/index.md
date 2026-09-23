# graphify references

Progressive-disclosure detail for [SKILL.md](../SKILL.md), loaded only when the task needs it.

These files are **vendored third-party content** and are faithful copies — see the provenance note
in `SKILL.md`. This index is loom's own scaffolding, added so the reference files are reachable by
link: `SKILL.md` cites them in backticks rather than Markdown links, which `scripts/validate.sh`'s
reachability check cannot follow. Adding this manifest was preferable to rewriting a third-party
document to satisfy our validator.

| Reference | Covers |
|---|---|
| [extraction-spec.md](extraction-spec.md) | The exact subagent extraction prompt, node/edge schema, and the node-ID rule |
| [query.md](query.md) | Querying a built graph, and the vocabulary pre-step the literal matcher needs |
| [update.md](update.md) | Incremental refresh and how changed files are detected |
| [hooks.md](hooks.md) | The git hooks that rebuild on commit and checkout |
| [exports.md](exports.md) | Obsidian, Neo4j, FalkorDB, GraphML, SVG, and the MCP server |
| [github-and-merge.md](github-and-merge.md) | Cloning a repo to graph it, and merging graphs across repos |
| [add-watch.md](add-watch.md) | Adding URLs to the corpus and watching a folder |
| [transcribe.md](transcribe.md) | Video and audio transcription before extraction |
