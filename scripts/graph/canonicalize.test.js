"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { canonicalize } = require("./canonicalize.js");
const { stemFor, forkTargetFor, buildStemIndex, outboundLinks, normalizeId } = require("./lib.js");

// A throwaway corpus on disk, because back-filling reads the real Markdown to find the links the
// graph should have had.
function fixtureRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "graphfix-"));
  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body);
  }
  return dir;
}

test("stemFor keeps every path segment so same-named files stay distinct", () => {
  assert.strictEqual(stemFor("wiki/adr/adr-013-shared.md"), "wiki_adr_adr_013_shared");
  assert.strictEqual(stemFor("GATE.md"), "gate");
  assert.notStrictEqual(stemFor("a/index.md"), stemFor("b/index.md"));
});

test("forkTargetFor ignores a concept node that derives from its own file", () => {
  const stemToFile = buildStemIndex(["CONTEXT.md", "GATE.md"]);
  const concept = { id: "context_harness", source_file: "CONTEXT.md" };
  assert.strictEqual(forkTargetFor(concept, stemToFile), null);
});

test("forkTargetFor catches a node naming a document it did not come from", () => {
  const stemToFile = buildStemIndex(["CONTEXT.md", "GATE.md", "contract/PORTS.md"]);
  const phantom = { id: "gate_doc", source_file: "contract/PORTS.md" };
  assert.strictEqual(forkTargetFor(phantom, stemToFile), "GATE.md");
});

test("a phantom merges into the real document node and its edges follow", () => {
  const dir = fixtureRepo({
    "GATE.md": "# Gate\n",
    "contract/PORTS.md": "# Ports\n",
    "other.md": "# Other\n",
  });
  const tracked = ["GATE.md", "contract/PORTS.md", "other.md"];
  const graph = {
    nodes: [
      { id: "gate", source_file: "GATE.md", file_type: "document" },
      { id: "gate_doc", source_file: "contract/PORTS.md", file_type: "document" },
      { id: "other", source_file: "other.md", file_type: "document" },
    ],
    links: [{ source: "other", target: "gate_doc", relation: "references" }],
  };

  const stats = canonicalize(graph, dir, tracked);

  assert.strictEqual(stats.merged, 1);
  assert.ok(!graph.nodes.some((n) => n.id === "gate_doc"), "phantom is gone");
  // The edge that pointed at the phantom now points at the real document.
  assert.ok(
    graph.links.some((l) => l.source === "other" && l.target === "gate"),
    "edge was re-pointed onto the canonical node",
  );
  fs.rmSync(dir, { recursive: true, force: true });
});

test("a mis-filed node with no canonical twin is renamed, not deleted", () => {
  const dir = fixtureRepo({ "GATE.md": "# Gate\n", "contract/PORTS.md": "# Ports\n" });
  const tracked = ["GATE.md", "contract/PORTS.md"];
  const graph = {
    nodes: [
      { id: "gate_doc", source_file: "contract/PORTS.md", file_type: "document" },
      { id: "contract_ports", source_file: "contract/PORTS.md", file_type: "document" },
    ],
    links: [],
  };

  const stats = canonicalize(graph, dir, tracked);

  assert.strictEqual(stats.renamed, 1);
  const gate = graph.nodes.find((n) => n.id === "gate");
  assert.ok(gate, "the node now carries the canonical id");
  assert.strictEqual(gate.source_file, "GATE.md", "and points at the file it describes");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("a file's own _doc node collapses onto its bare stem", () => {
  const dir = fixtureRepo({ "notes.md": "# Notes\n" });
  const graph = {
    nodes: [{ id: "notes_doc", source_file: "notes.md", file_type: "document" }],
    links: [],
  };

  canonicalize(graph, dir, ["notes.md"]);

  assert.deepStrictEqual(
    graph.nodes.map((n) => n.id),
    ["notes"],
  );
  fs.rmSync(dir, { recursive: true, force: true });
});

test("a link the corpus states but the graph lacks is back-filled", () => {
  const dir = fixtureRepo({
    "a.md": "# A\n\nSee [B](b.md).\n",
    "b.md": "# B\n",
  });
  const graph = {
    nodes: [
      { id: "a", source_file: "a.md", file_type: "document" },
      { id: "b", source_file: "b.md", file_type: "document" },
    ],
    links: [],
  };

  const stats = canonicalize(graph, dir, ["a.md", "b.md"]);

  assert.strictEqual(stats.backfilled, 1);
  const added = graph.links[0];
  assert.strictEqual(added.source, "a");
  assert.strictEqual(added.target, "b");
  // Provenance must be honest: this edge came from us, not from extraction.
  assert.strictEqual(added._origin, "loom-canonicalize");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("a document node is synthesized for a file that has only concept nodes", () => {
  const dir = fixtureRepo({
    "a.md": "# A\n\nSee [B](b.md).\n",
    "b.md": "---\ntitle: The B Document\n---\n\n# B\n",
  });
  const graph = {
    nodes: [
      { id: "a", source_file: "a.md", file_type: "document" },
      { id: "b_someconcept", source_file: "b.md", file_type: "concept" },
    ],
    links: [],
  };

  const stats = canonicalize(graph, dir, ["a.md", "b.md"]);

  assert.strictEqual(stats.synthesized, 1);
  const synth = graph.nodes.find((n) => n.id === "b");
  assert.ok(synth, "b.md now has a node representing the document itself");
  assert.strictEqual(synth.label, "The B Document", "labelled from frontmatter title");
  assert.strictEqual(stats.unresolvable, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("canonicalize is idempotent", () => {
  const dir = fixtureRepo({
    "a.md": "# A\n\nSee [B](b.md) and [Gate](GATE.md).\n",
    "b.md": "# B\n",
    "GATE.md": "# Gate\n",
    "contract/PORTS.md": "# Ports\n\nCites [Gate](../GATE.md).\n",
  });
  const tracked = ["a.md", "b.md", "GATE.md", "contract/PORTS.md"];
  const build = () => ({
    nodes: [
      { id: "a", source_file: "a.md", file_type: "document" },
      { id: "b", source_file: "b.md", file_type: "document" },
      { id: "gate_doc", source_file: "contract/PORTS.md", file_type: "document" },
      { id: "contract_ports", source_file: "contract/PORTS.md", file_type: "document" },
    ],
    links: [{ source: "a", target: "gate_doc", relation: "references" }],
  });

  const once = build();
  canonicalize(once, dir, tracked);
  const snapshot = JSON.stringify(once);

  const stats = canonicalize(once, dir, tracked);
  assert.strictEqual(JSON.stringify(once), snapshot, "a second pass changes nothing");
  assert.strictEqual(stats.merged + stats.renamed + stats.backfilled + stats.synthesized, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("outboundLinks ignores fenced examples, anchors and external URLs", () => {
  const dir = fixtureRepo({
    "a.md": [
      "# A",
      "",
      "Real: [B](b.md)",
      "Anchor only: [x](#section)",
      "External: [y](https://example.com/b.md)",
      "",
      "```",
      "Fenced: [B](b.md) should not count twice",
      "```",
    ].join("\n"),
    "b.md": "# B\n",
  });
  const links = outboundLinks(dir, "a.md", new Set(["a.md", "b.md"]));
  assert.deepStrictEqual(links, ["b.md"]);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("normalizeId treats a leading separator as a spelling difference", () => {
  assert.strictEqual(normalizeId("_claude_agents_pm"), "claude_agents_pm");
  assert.strictEqual(normalizeId("claude_agents_pm"), "claude_agents_pm");
});
