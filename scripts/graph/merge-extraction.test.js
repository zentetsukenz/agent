"use strict";

const test = require("node:test");
const assert = require("node:assert");

const { mergeExtraction, relativize } = require("./merge-extraction.js");

const ROOT = "/repo";

test("relativize strips the repo root from an absolute chunk path", () => {
  assert.strictEqual(relativize("/repo/SKILLS/a/SKILL.md", ROOT), "SKILLS/a/SKILL.md");
  assert.strictEqual(relativize("SKILLS/a/SKILL.md", ROOT), "SKILLS/a/SKILL.md");
  assert.strictEqual(relativize("", ROOT), "");
});

test("a re-extracted file REPLACES its old nodes rather than deduping against them", () => {
  // This is the whole point: first-wins dedup would keep the shallow node forever.
  const graph = {
    nodes: [{ id: "skills_a_skill", source_file: "SKILLS/a/SKILL.md", label: "shallow" }],
    links: [],
  };
  const chunks = [
    {
      nodes: [
        { id: "skills_a_skill", source_file: "/repo/SKILLS/a/SKILL.md", label: "deep" },
        { id: "skills_a_skill_phase_one", source_file: "/repo/SKILLS/a/SKILL.md", label: "Phase One" },
      ],
      edges: [],
    },
  ];

  const stats = mergeExtraction(graph, chunks, ROOT);

  assert.strictEqual(stats.replacedNodes, 1);
  assert.strictEqual(stats.addedNodes, 2);
  assert.strictEqual(graph.nodes.length, 2);
  assert.strictEqual(graph.nodes.find((n) => n.id === "skills_a_skill").label, "deep");
  // And the absolute path was relativized on the way in.
  assert.strictEqual(graph.nodes[0].source_file, "SKILLS/a/SKILL.md");
});

test("nodes from files outside the extraction scope are left alone", () => {
  const graph = {
    nodes: [
      { id: "wiki_x", source_file: "wiki/x.md", label: "untouched" },
      { id: "skills_a_skill", source_file: "SKILLS/a/SKILL.md", label: "shallow" },
    ],
    links: [],
  };
  const chunks = [
    { nodes: [{ id: "skills_a_skill", source_file: "/repo/SKILLS/a/SKILL.md", label: "deep" }], edges: [] },
  ];

  mergeExtraction(graph, chunks, ROOT);

  assert.ok(graph.nodes.find((n) => n.id === "wiki_x" && n.label === "untouched"));
});

test("an edge left dangling by the replace is dropped, not kept", () => {
  const graph = {
    nodes: [
      { id: "wiki_x", source_file: "wiki/x.md" },
      { id: "skills_a_gone", source_file: "SKILLS/a/SKILL.md" },
    ],
    // An inbound edge from an untouched file onto a node the re-extraction removes.
    links: [{ source: "wiki_x", target: "skills_a_gone", relation: "references", source_file: "wiki/x.md" }],
  };
  const chunks = [
    { nodes: [{ id: "skills_a_skill", source_file: "/repo/SKILLS/a/SKILL.md" }], edges: [] },
  ];

  const stats = mergeExtraction(graph, chunks, ROOT);

  assert.strictEqual(stats.droppedDangling, 1);
  assert.strictEqual(graph.links.length, 0);
});

test("a stable node id keeps its inbound edge across re-extraction", () => {
  const graph = {
    nodes: [
      { id: "wiki_x", source_file: "wiki/x.md" },
      { id: "skills_a_skill", source_file: "SKILLS/a/SKILL.md", label: "shallow" },
    ],
    links: [{ source: "wiki_x", target: "skills_a_skill", relation: "references", source_file: "wiki/x.md" }],
  };
  const chunks = [
    { nodes: [{ id: "skills_a_skill", source_file: "/repo/SKILLS/a/SKILL.md", label: "deep" }], edges: [] },
  ];

  const stats = mergeExtraction(graph, chunks, ROOT);

  assert.strictEqual(stats.droppedDangling, 0);
  assert.strictEqual(graph.links.length, 1, "the inbound edge survived because the id is deterministic");
});

test("duplicate ids across chunks are counted, not silently doubled", () => {
  const graph = { nodes: [], links: [] };
  const chunks = [
    { nodes: [{ id: "shared", source_file: "/repo/a.md" }], edges: [] },
    { nodes: [{ id: "shared", source_file: "/repo/b.md" }], edges: [] },
  ];

  const stats = mergeExtraction(graph, chunks, ROOT);

  assert.strictEqual(stats.addedNodes, 1);
  assert.strictEqual(stats.duplicateNodes, 1);
  assert.strictEqual(graph.nodes.length, 1);
});

test("edges from the chunks are added with relativized provenance", () => {
  const graph = { nodes: [], links: [] };
  const chunks = [
    {
      nodes: [
        { id: "a", source_file: "/repo/a.md" },
        { id: "b", source_file: "/repo/b.md" },
      ],
      edges: [
        { source: "a", target: "b", relation: "references", source_file: "/repo/a.md", confidence: "EXTRACTED" },
      ],
    },
  ];

  const stats = mergeExtraction(graph, chunks, ROOT);

  assert.strictEqual(stats.addedLinks, 1);
  assert.strictEqual(graph.links[0].source_file, "a.md");
});
