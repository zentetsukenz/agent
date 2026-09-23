"use strict";

// Merges freshly extracted chunk files into graph.json, replacing the previous extraction for
// every file the chunks cover.
//
// Why we own this step: the skill's own merge dedups by id with first-wins, which silently keeps a
// stale shallow node when a richer one arrives for the same file. Re-extraction has to mean
// REPLACE for the files in scope, or a deep pass can never overwrite a degenerate one.
//
// Chunk files carry absolute `source_file` paths by design (the extraction spec demands verbatim
// paths so the build and incremental update share one base). graph.json stores repo-relative
// paths, so we relativize on the way in.

const fs = require("node:fs");
const path = require("node:path");

function relativize(sourceFile, rootDir) {
  if (!sourceFile) return "";
  let p = String(sourceFile).replace(/\\/g, "/");
  const root = rootDir.replace(/\\/g, "/").replace(/\/$/, "");
  if (p.startsWith(root + "/")) p = p.slice(root.length + 1);
  return p.replace(/^\.\//, "");
}

function mergeExtraction(graph, chunks, rootDir) {
  // Every file this extraction pass covered. Their previous nodes are stale by definition.
  const covered = new Set();
  for (const chunk of chunks) {
    for (const node of chunk.nodes || []) {
      const rel = relativize(node.source_file, rootDir);
      if (rel) covered.add(rel);
    }
  }

  const beforeNodes = graph.nodes.length;
  const keptNodes = graph.nodes.filter((n) => !covered.has(n.source_file || ""));
  const replacedNodes = beforeNodes - keptNodes.length;

  const byId = new Map(keptNodes.map((n) => [n.id, n]));
  let addedNodes = 0;
  let duplicateNodes = 0;
  for (const chunk of chunks) {
    for (const node of chunk.nodes || []) {
      const rel = relativize(node.source_file, rootDir);
      if (byId.has(node.id)) {
        duplicateNodes += 1;
        continue;
      }
      const merged = { ...node, source_file: rel };
      byId.set(node.id, merged);
      addedNodes += 1;
    }
  }
  graph.nodes = [...byId.values()];

  // Keep the edges that did not come from a re-extracted file, then add the new ones.
  const keptLinks = graph.links.filter((l) => !covered.has(relativize(l.source_file, rootDir)));
  const replacedLinks = graph.links.length - keptLinks.length;

  const seen = new Set(
    keptLinks.map((l) => `${endpoint(l.source)}\u0000${endpoint(l.target)}\u0000${l.relation || ""}`),
  );
  const added = [];
  let duplicateLinks = 0;
  for (const chunk of chunks) {
    for (const edge of chunk.edges || []) {
      const key = `${endpoint(edge.source)}\u0000${endpoint(edge.target)}\u0000${edge.relation || ""}`;
      if (seen.has(key)) {
        duplicateLinks += 1;
        continue;
      }
      seen.add(key);
      added.push({ ...edge, source_file: relativize(edge.source_file, rootDir) });
    }
  }

  // An edge whose endpoint vanished with the old extraction would be a dangling traversal. Drop
  // it here rather than leaving it for the gate to find.
  const liveIds = new Set(graph.nodes.map((n) => n.id));
  const combined = [...keptLinks, ...added];
  const survivors = combined.filter(
    (l) => liveIds.has(endpoint(l.source)) && liveIds.has(endpoint(l.target)),
  );
  const droppedDangling = combined.length - survivors.length;
  graph.links = survivors;

  return {
    filesCovered: covered.size,
    replacedNodes,
    addedNodes,
    duplicateNodes,
    replacedLinks,
    addedLinks: added.length,
    duplicateLinks,
    droppedDangling,
  };
}

function endpoint(e) {
  if (e && typeof e === "object") return e.id || "";
  return e || "";
}

function main() {
  const rootDir = path.resolve(__dirname, "..", "..");
  const outDir = path.join(rootDir, "graphify-out");
  const graphPath = path.join(outDir, "graph.json");

  const chunkPaths = fs
    .readdirSync(outDir)
    .filter((f) => /^\.graphify_chunk_\d+\.json$/.test(f))
    .sort()
    .map((f) => path.join(outDir, f));

  if (chunkPaths.length === 0) {
    process.stderr.write("merge-extraction: no chunk files found\n");
    process.exit(2);
  }

  const chunks = [];
  for (const p of chunkPaths) {
    try {
      chunks.push(JSON.parse(fs.readFileSync(p, "utf8")));
    } catch (err) {
      process.stderr.write(`merge-extraction: ${path.basename(p)} is not valid JSON — ${err.message}\n`);
      process.exit(1);
    }
  }

  const raw = JSON.parse(fs.readFileSync(graphPath, "utf8"));
  const graph = { nodes: raw.nodes || [], links: raw.links || [] };
  const before = { nodes: graph.nodes.length, links: graph.links.length };

  const stats = mergeExtraction(graph, chunks, rootDir);

  fs.writeFileSync(
    graphPath,
    JSON.stringify({ ...raw, nodes: graph.nodes, links: graph.links }, null, 2) + "\n",
  );

  process.stdout.write(
    `merge-extraction: ${chunkPaths.length} chunks over ${stats.filesCovered} files\n` +
      `  ${before.nodes} -> ${graph.nodes.length} nodes, ${before.links} -> ${graph.links.length} edges\n` +
      `  nodes replaced: ${stats.replacedNodes}, added: ${stats.addedNodes}, duplicate ids skipped: ${stats.duplicateNodes}\n` +
      `  edges replaced: ${stats.replacedLinks}, added: ${stats.addedLinks}, duplicates skipped: ${stats.duplicateLinks}\n` +
      `  edges dropped as dangling after replace: ${stats.droppedDangling}\n`,
  );
}

if (require.main === module) main();

module.exports = { mergeExtraction, relativize };
