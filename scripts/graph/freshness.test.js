"use strict";

// Freshness by content hash (lib.js), the stamps graphify vouches for (stamp.js), what an
// extraction pass stamps (merge-extraction.js), and folding a document's stand-in for a code file
// (canonicalize.js Pass 1b).

const test = require("node:test");
const assert = require("node:assert");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { STAMPS_PATH, contentHash, loadStamps, writeStamps, staleFiles } = require("./lib.js");
const { stampsFromManifest } = require("./stamp.js");
const { mergeExtraction } = require("./merge-extraction.js");
const { canonicalize } = require("./canonicalize.js");

function fixtureRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "graphfresh-"));
  fs.mkdirSync(path.join(dir, "graphify-out"), { recursive: true });
  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body);
  }
  return dir;
}

const md5 = (text) => crypto.createHash("md5").update(text).digest("hex");

test("contentHash is graphify's: the md5 of the file's bytes", () => {
  const dir = fixtureRepo({ "VISION.md": "# Vision\n" });
  assert.strictEqual(contentHash(dir, "VISION.md"), md5("# Vision\n"));
});

test("a file is fresh when its content matches its stamp, whatever commit it sits on", () => {
  const dir = fixtureRepo({ "VISION.md": "# Vision\n" });
  assert.deepStrictEqual(staleFiles(dir, ["VISION.md"], { "VISION.md": md5("# Vision\n") }), []);
});

test("a file edited since extraction, or never extracted, is stale — and says which", () => {
  const dir = fixtureRepo({ "VISION.md": "# Vision, restated\n", "NEW.md": "# New\n" });
  const stale = staleFiles(dir, ["VISION.md", "NEW.md"], { "VISION.md": md5("# Vision\n") });
  assert.deepStrictEqual(stale, ["VISION.md  (changed since extracted)", "NEW.md  (never extracted)"]);
});

test("a missing or corrupt record reads as null, so the check can fail closed", () => {
  const dir = fixtureRepo({});
  assert.strictEqual(loadStamps(dir), null);
  fs.writeFileSync(path.join(dir, STAMPS_PATH), "{ not json");
  assert.strictEqual(loadStamps(dir), null);
});

test("the written record is sorted and forgets files that no longer exist", () => {
  const dir = fixtureRepo({ "b.md": "b", "a.md": "a" });
  writeStamps(dir, { "b.md": "2", "gone.md": "x", "a.md": "1" });
  const text = fs.readFileSync(path.join(dir, STAMPS_PATH), "utf8");
  assert.deepStrictEqual(Object.keys(JSON.parse(text).files), ["a.md", "b.md"]);
  assert.deepStrictEqual(loadStamps(dir), { "a.md": "1", "b.md": "2" });
});

test("only graphify's semantic stamps are copied — not empty ones, not absolute keys", () => {
  const manifest = {
    "VISION.md": { mtime: 1, seen: 2, ast_hash: "a", semantic_hash: "s1" },
    "FAILED.md": { mtime: 1, ast_hash: "a", semantic_hash: "" },
    "scripts/x.sh": { mtime: 1, ast_hash: "a" },
    "/abs/OTHER.md": { semantic_hash: "s2" },
  };
  assert.deepStrictEqual(stampsFromManifest(manifest), { "VISION.md": "s1" });
});

test("an extraction pass covers only the files it produced nodes for; an edges-only pass covers none", () => {
  const graph = {
    nodes: [{ id: "vision", source_file: "VISION.md" }, { id: "research", source_file: "docs/r.md" }],
    links: [],
  };
  const withNodes = mergeExtraction(
    graph,
    [{ nodes: [{ id: "research_claim", source_file: "/repo/docs/r.md" }], edges: [] }],
    "/repo",
  );
  assert.deepStrictEqual(withNodes.coveredFiles, ["docs/r.md"]);

  const edgesOnly = mergeExtraction(
    graph,
    [{ nodes: [], edges: [{ source: "research_claim", target: "vision", relation: "rationale_for", source_file: "/repo/docs/r.md" }] }],
    "/repo",
  );
  assert.deepStrictEqual(edgesOnly.coveredFiles, []);
  assert.ok(graph.nodes.some((n) => n.id === "research_claim"), "an edges-only pass must not replace nodes");
  assert.ok(graph.links.some((l) => l.target === "vision"), "and its edges are added");
});

test("a document's stand-in for a code file folds into that file's node, edges and all", () => {
  const dir = fixtureRepo({ "AGENTS.md": "# Agents\n", "scripts/validate.sh": "#!/bin/sh\n" });
  const graph = {
    nodes: [
      { id: "agents", source_file: "AGENTS.md", file_type: "document" },
      { id: "agents_gate", source_file: "AGENTS.md", file_type: "concept" },
      { id: "agents_validate_sh", label: "scripts/validate.sh", source_file: "AGENTS.md", file_type: "code" },
      { id: "scripts_validate", label: "validate.sh", source_file: "scripts/validate.sh", file_type: "code" },
    ],
    links: [{ source: "agents_gate", target: "agents_validate_sh", relation: "references" }],
  };
  canonicalize(graph, dir, ["AGENTS.md"]);
  assert.ok(!graph.nodes.some((n) => n.id === "agents_validate_sh"));
  assert.ok(graph.links.some((l) => l.source === "agents_gate" && l.target === "scripts_validate"));
});

test("a code-typed concept that names no real file is left alone", () => {
  const dir = fixtureRepo({ "AGENTS.md": "# Agents\n" });
  const graph = {
    nodes: [
      { id: "agents", source_file: "AGENTS.md", file_type: "document" },
      { id: "agents_retry_loop", label: "retry loop", source_file: "AGENTS.md", file_type: "code" },
      { id: "agents_missing_sh", label: "scripts/missing.sh", source_file: "AGENTS.md", file_type: "code" },
    ],
    links: [],
  };
  canonicalize(graph, dir, ["AGENTS.md"]);
  assert.ok(graph.nodes.some((n) => n.id === "agents_retry_loop"));
  assert.ok(graph.nodes.some((n) => n.id === "agents_missing_sh"));
});
