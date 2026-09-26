# Agent Instructions — loom

Your job before doing work here is to **bootstrap context**. This file tells you how, and
nothing else. Everything you might otherwise look for is one link away.

## Bootstrap — the guaranteed path

Read [VISION.md](VISION.md), then [CONSTITUTION.md](CONSTITUTION.md), then
[CONTEXT.md](CONTEXT.md). In that order: purpose, then construction, then vocabulary. VISION.md
routes to everything else.

loom's vocabulary is **exact, not decorative**. `harness`, `workflow`, `altitude`, `seam artifact`
and the rest each mean one specific thing, and using them loosely produces work that looks right
and is wrong. CONTEXT.md is the only place they are defined.

Research under [docs/research/](docs/research/index.md) is dated, and it goes stale. Read its
[freshness rule](docs/research/index.md#freshness) before you rely on any of it.

## Bootstrap — the fast path

`graphify-out/` holds a committed knowledge graph of this corpus. Query it instead of reading
your way in:

```sh
graphify query "<question>"          # BFS, broad context
graphify explain "<node>"            # one node and everything it connects to
graphify path "<node-a>" "<node-b>"  # how two things relate
```

Two conditions on trusting it:

- **Check freshness first.** Nothing gates the query path on staleness, and graphify's rebuild
  hook only watches *code* changes — which this corpus has almost none of. A graph can be many
  commits behind and will not say so:

  ```sh
  git diff --name-only "$(jq -r .built_at_commit graphify-out/graph.json)" HEAD -- '*.md' ':!graphify-out'
  ```

  Anything listed there is a change the graph has not seen: read those files instead. Whoever
  changed them owed the graph a regeneration — see [Before you commit](#before-you-commit).
- **Query in loom's own words.** The matcher is case-folded substring plus IDF — no stemming, no
  synonyms. A question phrased in general English returns nothing useful. Read
  [CONTEXT.md](CONTEXT.md) first and query using the terms defined there.

Where the graph and the documents disagree, the documents win.

## Before you commit

```sh
bash scripts/validate.sh     # prose: frontmatter, links, anchors, orphans, stranded files
bash scripts/quality.sh      # code: the lint and coverage floors
bash scripts/graph-check.sh  # context: the graph, checked against the corpus
```

See [CONSTITUTION.md](CONSTITUTION.md#the-gates) for what each one guards and why the third exists.
A *stranded* file is one that does not trace back to VISION.md
([rule 5](CONSTITUTION.md#the-binding-rules)); known ones are listed in
`.claude/hooks/validate-baseline.txt` and reviewed one at a time.

**Always regenerate the graph.** Every change ends with the graph re-extracted for every file
changed since its `built_at_commit`: the graphify skill writes the extraction chunks, then
`node scripts/graph/merge-extraction.js` and `node scripts/graph/canonicalize.js` fold them in.
Re-extract the changed files only — this corpus is prose, so every node goes through a language
model, and a full rebuild is rarely needed. The merge stamps `built_at_commit` with `HEAD`, so
commit your change first, then regenerate and commit the graph; extracting before the commit leaves
your own files reading as stale. The third gate then passes strict, freshness included.
