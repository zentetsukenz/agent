"use strict";

// The gate for loom's committed context, alongside validate.sh (prose) and quality.sh (code).
//
// Every check here compares the graph against the CORPUS. That is deliberate: graphify's own
// health check is explicitly non-aborting ("do not abort — the graph is still usable"), and
// `graph.json` is post-build, so a clean `graphify diagnose` is not evidence of a clean build.
// A graph can be perfectly self-consistent and still answer "what references ADR-013?" with
// nothing, which is the failure this gate exists to catch.

const path = require("node:path");
const fs = require("node:fs");
const {
  loadGraph,
  trackedMarkdown,
  outboundLinks,
  nodeSource,
  endpointId,
  gitLines,
  forkTargetFor,
  buildStemIndex,
} = require("./lib.js");

const MAX_EXAMPLES = 8;

function analyze(rootDir, graphPath) {
  const graph = loadGraph(graphPath);
  const tracked = trackedMarkdown(rootDir);
  const trackedSet = new Set(tracked);
  const findings = [];

  const nodeIds = new Set(graph.nodes.map((n) => n.id));

  // Which canonical file node represents each source file. A file may legitimately own many
  // concept nodes; what matters is that at least one node claims it.
  const nodesBySource = new Map();
  for (const node of graph.nodes) {
    const src = nodeSource(node);
    if (!src) continue;
    if (!nodesBySource.has(src)) nodesBySource.set(src, []);
    nodesBySource.get(src).push(node);
  }

  // --- 1. Dangling edges -----------------------------------------------------------------
  const dangling = [];
  for (const link of graph.links) {
    const from = endpointId(link.source);
    const to = endpointId(link.target);
    // `ref_`-prefixed targets are graphify's deliberate out-of-corpus references, not defects.
    if (from && !nodeIds.has(from)) dangling.push(`${from} -> ${to} (source missing)`);
    else if (to && !nodeIds.has(to) && !to.startsWith("ref_")) {
      dangling.push(`${from} -> ${to} (target missing)`);
    }
  }
  findings.push({
    name: "dangling edges",
    count: dangling.length,
    examples: dangling.slice(0, MAX_EXAMPLES),
    detail: "an edge endpoint that is not a node — a traversal that goes nowhere",
  });

  // --- 2. Forked identities --------------------------------------------------------------
  // The defect that makes the graph lie. A node whose id is derived from a DIFFERENT file than
  // the one it came from is a phantom: edges land on it instead of on the real document's node,
  // and the real node is left with degree 0 while answering queries about itself.
  const stemToFile = buildStemIndex(tracked);
  const forked = [];
  for (const node of graph.nodes) {
    const target = forkTargetFor(node, stemToFile);
    if (target) {
      forked.push(`${node.id}  (extracted from ${nodeSource(node)}, but names ${target})`);
    }
  }
  findings.push({
    name: "forked identities",
    count: forked.length,
    examples: forked.slice(0, MAX_EXAMPLES),
    detail: "a node whose id names a different file than it came from — edges land on the wrong copy",
  });

  // --- 3. `_doc` suffix drift -------------------------------------------------------------
  // The suffix appears in no prompt graphify ships; it is residue from an older vintage that the
  // builder's own repair pass cannot see, because `context_doc` parses as a legal `{stem}_{entity}`.
  const docSuffix = graph.nodes.filter((n) => /_doc$/.test(n.id)).map((n) => n.id);
  findings.push({
    name: "_doc suffix drift",
    count: docSuffix.length,
    examples: docSuffix.slice(0, MAX_EXAMPLES),
    detail: "undocumented id convention that splits one document across two nodes",
  });

  // --- 4. Corpus coverage -----------------------------------------------------------------
  const uncovered = tracked.filter((p) => !nodesBySource.has(p));
  findings.push({
    name: "tracked .md with no node",
    count: uncovered.length,
    examples: uncovered.slice(0, MAX_EXAMPLES),
    detail: "a document the graph cannot answer anything about",
  });

  // --- 5. Link coverage -------------------------------------------------------------------
  // Ground truth: every relative Markdown link between two tracked files is a real relationship.
  // If the graph has no edge for it, a traversal will miss a connection the corpus states outright.
  const pairsWithEdge = new Set();
  const sourceOfNode = new Map(graph.nodes.map((n) => [n.id, nodeSource(n)]));
  for (const link of graph.links) {
    const a = sourceOfNode.get(endpointId(link.source));
    const b = sourceOfNode.get(endpointId(link.target));
    if (a && b && a !== b) {
      pairsWithEdge.add(`${a}\u0000${b}`);
      pairsWithEdge.add(`${b}\u0000${a}`);
    }
  }
  const missingLinkEdges = [];
  let totalLinks = 0;
  for (const file of tracked) {
    for (const target of outboundLinks(rootDir, file, trackedSet)) {
      totalLinks += 1;
      if (!pairsWithEdge.has(`${file}\u0000${target}`)) {
        missingLinkEdges.push(`${file} -> ${target}`);
      }
    }
  }
  findings.push({
    name: "markdown links with no edge",
    count: missingLinkEdges.length,
    examples: missingLinkEdges.slice(0, MAX_EXAMPLES),
    detail: `${totalLinks} real doc-to-doc links in the corpus; each should have an edge`,
  });

  // --- 6. Self-loops in prose -------------------------------------------------------------
  // Recursion in code is a real `calls` edge and legitimate. A document that references itself is
  // an extraction artifact.
  const proseSelfLoops = [];
  for (const link of graph.links) {
    const from = endpointId(link.source);
    if (from !== endpointId(link.target)) continue;
    const src = sourceOfNode.get(from) || "";
    if (src.endsWith(".md")) proseSelfLoops.push(`${from} (${src})`);
  }
  findings.push({
    name: "self-loops on prose nodes",
    count: proseSelfLoops.length,
    examples: proseSelfLoops.slice(0, MAX_EXAMPLES),
    detail: "code recursion is legitimate and ignored; a document citing itself is not",
  });

  // --- 7. Depth floor ---------------------------------------------------------------------
  // Catches the degenerate extraction that started all of this: one node per file, which is a
  // filename index wearing a knowledge graph's clothes.
  const byDir = new Map();
  for (const file of tracked) {
    const top = file.includes("/") ? file.split("/")[0] : "(root)";
    if (!byDir.has(top)) byDir.set(top, { files: 0, nodes: 0 });
    const bucket = byDir.get(top);
    bucket.files += 1;
    bucket.nodes += (nodesBySource.get(file) || []).length;
  }
  const degenerate = [];
  for (const [dir, { files, nodes }] of byDir) {
    if (files < 5) continue;
    const mean = nodes / files;
    if (mean <= 1.0) degenerate.push(`${dir}/  ${files} files, ${nodes} nodes, mean ${mean.toFixed(2)}`);
  }
  findings.push({
    name: "directories with degenerate depth",
    count: degenerate.length,
    examples: degenerate,
    detail: "mean of 1.00 nodes per file means structural-only extraction, not concept extraction",
  });

  // --- 8. Freshness -----------------------------------------------------------------------
  let staleFiles = [];
  if (graph.builtAtCommit) {
    staleFiles = gitLines(
      ["diff", "--name-only", graph.builtAtCommit, "HEAD", "--", "*.md", ":!graphify-out"],
      rootDir,
    );
  }
  findings.push({
    name: "markdown changed since the graph was built",
    count: staleFiles.length,
    // Staleness is a different kind of problem from corruption. Editing any document makes the
    // graph stale immediately, and a rebuild is expensive, so an edit-time hook that blocked on
    // this would make the repository unworkable. Corruption is never acceptable; staleness is an
    // expected state between rebuilds. The hook runs with --advisory-freshness; a direct run and
    // CI do not, and there it blocks.
    advisory: true,
    examples: staleFiles.slice(0, MAX_EXAMPLES),
    detail: graph.builtAtCommit
      ? `graph built at ${graph.builtAtCommit.slice(0, 7)}`
      : "graph records no build commit",
  });

  return { findings, graph, tracked };
}

function main() {
  const rootDir = path.resolve(__dirname, "..", "..");
  const graphPath = path.join(rootDir, "graphify-out", "graph.json");

  if (!fs.existsSync(graphPath)) {
    process.stderr.write("graph check: graphify-out/graph.json not found — nothing to verify\n");
    process.exit(2);
  }

  // Staleness warns instead of blocking when the caller asks for it — see the freshness finding.
  const advisoryFreshness = process.argv.includes("--advisory-freshness");
  const { findings, graph, tracked } = analyze(rootDir, graphPath);

  process.stdout.write(
    `graph: ${graph.nodes.length} nodes, ${graph.links.length} edges, ` +
      `${tracked.length} tracked markdown files\n\n`,
  );

  let failed = 0;
  for (const finding of findings) {
    const downgraded = advisoryFreshness && finding.advisory;
    const status = finding.count === 0 ? "ok  " : downgraded ? "warn" : "FAIL";
    if (finding.count !== 0 && !downgraded) failed += 1;
    process.stdout.write(`${status}  ${finding.name}: ${finding.count}\n`);
    if (finding.count !== 0 && !downgraded) {
      process.stdout.write(`      ${finding.detail}\n`);
      for (const example of finding.examples) process.stdout.write(`      - ${example}\n`);
      if (finding.count > finding.examples.length) {
        process.stdout.write(`      ... and ${finding.count - finding.examples.length} more\n`);
      }
    }
  }

  process.stdout.write("\n");
  if (failed > 0) {
    process.stdout.write(`graph check: FAILED — ${failed} of ${findings.length} checks\n`);
    process.exit(1);
  }
  process.stdout.write("graph check: all checks passed\n");
}

if (require.main === module) main();

module.exports = { analyze };
