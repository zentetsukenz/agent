"use strict";

// Repairs the two structural defects graphify leaves in a prose corpus, then writes the graph back.
//
// WORKAROUND, with an exit condition. Both defects are upstream bugs:
//   1. A citing file mints a node for the document it cites, using the CITED file's stem. That
//      phantom then collects the edges, while the cited document's own node sits at degree 0 --
//      so "what references ADR-013?" answers nothing, confidently. graphify's own repair pass
//      (`_semantic_id_remap`) cannot see this: `context_doc` parses as a legal `{stem}_{entity}`
//      node with entity "doc", so it is skipped.
//   2. Relative Markdown links between documents do not reliably become edges. Roughly a quarter
//      of the corpus's stated relationships were missing.
// Delete this script once upstream fixes both. Until then the graph is only as honest as this pass.

const fs = require("node:fs");
const path = require("node:path");
const {
  stemFor,
  loadGraph,
  trackedMarkdown,
  outboundLinks,
  nodeSource,
  endpointId,
  normalizeId,
  forkTargetFor,
  buildStemIndex,
} = require("./lib.js");

// A readable label for a synthesized document node: the frontmatter title if present, else the
// first Markdown heading, else the caller falls back to the basename.
function headingFor(rootDir, relPath) {
  let text;
  try {
    text = fs.readFileSync(path.join(rootDir, relPath), "utf8");
  } catch {
    return "";
  }
  const front = text.match(/^---\n([\s\S]*?)\n---/);
  if (front) {
    const title = front[1].match(/^title:\s*(.+)$/m);
    if (title) return title[1].trim().replace(/^["']|["']$/g, "");
  }
  const heading = text.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : "";
}

// The node that best represents a whole file: the one whose id IS the file's stem, else the
// document-typed node from that file, else nothing (concept-only files have no single owner).
function canonicalNodeFor(file, nodesBySource, byId) {
  const stem = normalizeId(stemFor(file));
  const exact = byId.get(stem);
  if (exact) return exact;
  const candidates = nodesBySource.get(file) || [];
  return candidates.find((n) => n.file_type === "document") || null;
}

function canonicalize(graph, rootDir, tracked) {
  const stemToFile = buildStemIndex(tracked);
  const byId = new Map(graph.nodes.map((n) => [normalizeId(n.id), n]));
  const remap = new Map();
  const merged = [];
  const renamed = [];

  // --- Pass 0: normalize the `_doc` spelling of a file's own document node ----------------
  // Not a fork — the id derives from the right file — but it is the undocumented semantic-tier
  // spelling, and it leaves the bare stem free so a later AST pass mints a second node for the
  // same document. Collapse it now so one file means one node id.
  for (const node of graph.nodes) {
    const src = nodeSource(node);
    if (!src || !src.endsWith(".md")) continue;
    const ownStem = normalizeId(stemFor(src));
    if (normalizeId(node.id) !== ownStem + "_doc") continue;
    const existing = byId.get(ownStem);
    if (existing && existing !== node) {
      if (!existing.description && node.description) existing.description = node.description;
      remap.set(node.id, existing.id);
      merged.push(`${node.id} -> ${existing.id}`);
    } else {
      remap.set(node.id, ownStem);
      node.id = ownStem;
      byId.set(ownStem, node);
      renamed.push(`${ownStem} (was ${ownStem}_doc)`);
    }
  }

  // --- Pass 1: fold each phantom into the document it actually names ----------------------
  for (const node of graph.nodes) {
    const target = forkTargetFor(node, stemToFile);
    if (!target) continue;
    const canonicalId = normalizeId(stemFor(target));
    const existing = byId.get(canonicalId);

    if (existing && existing !== node) {
      // A real node for that document already exists — the phantom is a duplicate. Keep the
      // richer description if the phantom carries one the canonical node lacks.
      if (!existing.description && node.description) existing.description = node.description;
      remap.set(node.id, existing.id);
      merged.push(`${node.id} -> ${existing.id}`);
    } else {
      // No node claims that document yet. The phantom IS the document's node, mis-filed: give it
      // the canonical id and point it at the file it describes.
      remap.set(node.id, canonicalId);
      node.id = canonicalId;
      node.source_file = target;
      byId.set(canonicalId, node);
      renamed.push(`${canonicalId} (was mis-filed under ${nodeSource(node)})`);
    }
  }

  const mergedIds = new Set(merged.map((m) => m.split(" -> ")[0]));
  graph.nodes = graph.nodes.filter((n) => !mergedIds.has(n.id));

  // --- Pass 2: re-point every edge, drop the self-loops merging creates -------------------
  const resolve = (id) => remap.get(id) || id;
  const seenEdges = new Set();
  const rewritten = [];
  let droppedSelfLoops = 0;
  let droppedDuplicates = 0;

  for (const link of graph.links) {
    const from = resolve(endpointId(link.source));
    const to = resolve(endpointId(link.target));
    if (from === to) {
      droppedSelfLoops += 1;
      continue;
    }
    const key = `${from}\u0000${to}\u0000${link.relation || ""}`;
    if (seenEdges.has(key)) {
      droppedDuplicates += 1;
      continue;
    }
    seenEdges.add(key);
    rewritten.push({ ...link, source: from, target: to });
  }
  graph.links = rewritten;

  // --- Pass 3: back-fill edges for links the corpus states and the graph lacks ------------
  const nodesBySource = new Map();
  for (const node of graph.nodes) {
    const src = nodeSource(node);
    if (!src) continue;
    if (!nodesBySource.has(src)) nodesBySource.set(src, []);
    nodesBySource.get(src).push(node);
  }
  const liveById = new Map(graph.nodes.map((n) => [normalizeId(n.id), n]));

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

  // Some files produced only concept nodes and no node representing the document itself, so
  // nothing can carry an inbound link to them. Mint the missing document node rather than
  // attaching the corpus's stated relationship to an arbitrary concept inside the file.
  let synthesized = 0;
  for (const file of tracked) {
    if (canonicalNodeFor(file, nodesBySource, liveById)) continue;
    const stem = normalizeId(stemFor(file));
    if (liveById.has(stem)) continue;
    const node = {
      id: stem,
      label: headingFor(rootDir, file) || path.posix.basename(file),
      file_type: "document",
      source_file: file,
      source_location: "L1",
      _origin: "loom-canonicalize",
    };
    graph.nodes.push(node);
    liveById.set(stem, node);
    if (!nodesBySource.has(file)) nodesBySource.set(file, []);
    nodesBySource.get(file).push(node);
    synthesized += 1;
  }

  const trackedSet = new Set(tracked);
  let backfilled = 0;
  let unresolvable = 0;
  for (const file of tracked) {
    for (const target of outboundLinks(rootDir, file, trackedSet)) {
      if (pairsWithEdge.has(`${file}\u0000${target}`)) continue;
      const fromNode = canonicalNodeFor(file, nodesBySource, liveById);
      const toNode = canonicalNodeFor(target, nodesBySource, liveById);
      if (!fromNode || !toNode || fromNode.id === toNode.id) {
        unresolvable += 1;
        continue;
      }
      graph.links.push({
        source: fromNode.id,
        target: toNode.id,
        relation: "references",
        confidence: "EXTRACTED",
        confidence_score: 1.0,
        source_file: file,
        source_location: "link",
        weight: 1,
        _origin: "loom-canonicalize",
      });
      pairsWithEdge.add(`${file}\u0000${target}`);
      pairsWithEdge.add(`${target}\u0000${file}`);
      backfilled += 1;
    }
  }

  return {
    merged: merged.length,
    renamed: renamed.length,
    droppedSelfLoops,
    droppedDuplicates,
    backfilled,
    unresolvable,
    synthesized,
    mergedDetail: merged,
    renamedDetail: renamed,
  };
}

function main() {
  const rootDir = path.resolve(__dirname, "..", "..");
  const graphPath = path.join(rootDir, "graphify-out", "graph.json");
  if (!fs.existsSync(graphPath)) {
    process.stderr.write("canonicalize: graphify-out/graph.json not found\n");
    process.exit(2);
  }

  const loaded = loadGraph(graphPath);
  const tracked = trackedMarkdown(rootDir);
  const before = { nodes: loaded.nodes.length, links: loaded.links.length };

  const working = { nodes: loaded.nodes, links: loaded.links };
  const stats = canonicalize(working, rootDir, tracked);

  const out = { ...loaded.raw, nodes: working.nodes, links: working.links };
  fs.writeFileSync(graphPath, JSON.stringify(out, null, 2) + "\n");

  process.stdout.write(
    `canonicalize: ${before.nodes} -> ${working.nodes.length} nodes, ` +
      `${before.links} -> ${working.links.length} edges\n` +
      `  merged phantoms into existing nodes: ${stats.merged}\n` +
      `  mis-filed nodes given canonical ids:  ${stats.renamed}\n` +
      `  self-loops dropped after merging:     ${stats.droppedSelfLoops}\n` +
      `  duplicate edges dropped:              ${stats.droppedDuplicates}\n` +
      `  document nodes synthesized:           ${stats.synthesized}\n` +
      `  link edges back-filled from corpus:   ${stats.backfilled}\n` +
      `  links with no resolvable node pair:   ${stats.unresolvable}\n`,
  );
}

if (require.main === module) main();

module.exports = { canonicalize, canonicalNodeFor };
