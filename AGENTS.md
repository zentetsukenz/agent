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

- **Check freshness first.** Nothing gates the query path on staleness. The graph records the
  content hash of every file it extracted (`graphify-out/extracted.json`), so the gate can name
  exactly the documents it has not seen:

  ```sh
  bash scripts/graph-check.sh
  ```

  Every file listed under "markdown changed since it was extracted" is a change the graph has not
  seen: read those files instead. Whoever changed them owed the graph a regeneration — see
  [Before you commit](#before-you-commit).
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

**Always regenerate the graph** — graphify's way, then loom's gate. After every change, and right
after any pull, merge or rebase:

1. **Re-extract what changed.** Documents: the graphify skill's `--update` flow, which finds
   changed files by content hash, then `node scripts/graph/stamp.js` to record what it extracted.
   Code: `graphify update .`. A targeted pass of loom's own — chunk files merged with
   `node scripts/graph/merge-extraction.js` — records what it covered itself. Re-extract changed
   files only: this corpus is prose, so every node goes through a language model.
2. **Re-link what pointed at it.** If a file's node ids changed, re-extract the documents that
   reference it; edges into replaced nodes are otherwise dropped.
3. **Canonicalize, cluster, canonicalize:** `node scripts/graph/canonicalize.js`, then
   `PYTHONHASHSEED=0 graphify cluster-only .` — clustering is what regenerates `GRAPH_REPORT.md`
   and `graph.html`; the pinned seed, as graphify's own hooks set it, keeps communities
   reproducible — then `canonicalize.js` again.
4. **`bash scripts/graph-check.sh` passes strict** — freshness and clustering included. Commit the
   regenerated `graphify-out/` with the change.

Once per clone, register graphify's merge driver, so a rebase or merge union-merges `graph.json`
(the rule is in `.gitattributes`) instead of conflicting:
`git config merge.graphify.driver "graphify merge-driver %O %A %B"`.
