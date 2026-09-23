# Agent Instructions — loom

Your job before doing work here is to **bootstrap context**. This file tells you how, and
nothing else. Everything you might otherwise look for is one link away.

## Bootstrap — the guaranteed path

Read these three, in order. They are version-controlled, always present, and always current:

1. **[VISION.md](VISION.md)** — why loom exists and where it is going. Every document traces
   back here.
2. **[CONSTITUTION.md](CONSTITUTION.md)** — the entities, how they compose, and the rules
   binding them. Read this before changing anything structural.
3. **[CONTEXT.md](CONTEXT.md)** — every term loom uses. loom's vocabulary is **exact, not
   decorative**: `harness`, `workflow`, `altitude`, `seam artifact` and the rest each mean one
   specific thing. Using them loosely produces work that looks right and is wrong.

Then go to what your task needs: [SPEC.md](SPEC.md) for file-level conformance,
[SETUP.md](SETUP.md) for installing loom into a project,
[wiki/adr/](wiki/adr/index.md) for why something is the way it is.

## Bootstrap — the fast path, when it is available

If `graphify-out/` exists, a knowledge graph of this corpus is already built and you can query
it instead of reading your way in:

```sh
graphify query "<question>"          # BFS, broad context
graphify explain "<node>"            # one node and everything it connects to
graphify path "<node-a>" "<node-b>"  # how two things relate
```

Three conditions on trusting it, all load-bearing:

- **It is derived, not authoritative.** `graphify-out/` is rebuildable output. Where the graph
  and the documents disagree, the documents win. Never cite a `graphify-out/` path in a
  committed file — a permanent artifact may not depend on an ephemeral one.
- **Check freshness first.** Nothing gates the query path on staleness, and the auto-rebuild
  hook ignores prose changes — which is this entire corpus. Compare the graph's build commit to
  `HEAD` before trusting it:

  ```sh
  git merge-base --is-ancestor "$(jq -r .built_at_commit graphify-out/graph.json)" HEAD \
    && git diff --name-only "$(jq -r .built_at_commit graphify-out/graph.json)"..HEAD -- '*.md'
  ```

  Anything listed there is a change the graph has not seen. Refresh with `graphify update .`,
  or fall back to reading.
- **Query in loom's own words.** The matcher is case-folded substring plus IDF — no stemming,
  no synonyms. A question phrased in general English returns nothing useful. Read
  [CONTEXT.md](CONTEXT.md) first and query using the terms defined there.

If `graphify-out/` is absent — which is the normal state of a fresh clone — do not build it to
answer a question. A full build of this corpus costs over a million tokens because loom is
prose, so every node goes through a language model. Use the guaranteed path above.

## Before you commit

```sh
bash scripts/validate.sh
```

It checks frontmatter, link resolution, anchor existence, and orphan reachability. It blocks on
**new** violations only. Never add a line to `.claude/hooks/validate-baseline.txt` to get
unblocked — fix the break or file the issue. See
[CONSTITUTION.md](CONSTITUTION.md#the-gate).
