const test = require("node:test");
const assert = require("node:assert/strict");
const board = require("./fixtures/board.json");
const { parseBoard } = require("./model.js");
const { renderTree, renderMermaid } = require("./render.js");

// Same synthesis pattern as model.test.js's withParentBlockingEdges: the
// committed fixture is pre-migration (almost no ticket blocks its map yet),
// so a populated-tree test clones and adds the child->parent blocking edge
// each ticket's `parent` implies. Never edit fixtures/board.json.
function withParentBlockingEdges(rawIssues) {
  const clone = JSON.parse(JSON.stringify(rawIssues));
  for (const issue of clone) {
    if (issue.parent) {
      issue.blocking.nodes.push({ number: issue.parent.number });
      issue.blocking.totalCount += 1;
    }
  }
  return clone;
}

test("renderMermaid: first line is exactly 'graph TD'", () => {
  const parsed = parseBoard(board);
  const out = renderMermaid(parsed);
  assert.equal(out.split("\n")[0], "graph TD");
});

test("renderMermaid: node count > 0 and a known map number appears", () => {
  const parsed = parseBoard(withParentBlockingEdges(board));
  const out = renderMermaid(parsed);
  const nodeCount = out
    .split("\n")
    .filter((line) => /^N\d+\[/.test(line)).length;
  assert.equal(nodeCount > 0, true);
  assert.equal(out.includes("N17["), true);
});

test("renderMermaid: escapes a title containing both '(' and '\"'", () => {
  const parsed = parseBoard(board);
  // Clone-and-mutate: synthesise a dangerous title rather than editing the fixture.
  const ticket = parsed.byNumber.get(17);
  const original = ticket.title;
  ticket.title = 'weird (title) with "quotes"';
  const out = renderMermaid(parsed);
  ticket.title = original; // restore in-memory ticket for any later assertions

  // The raw unescaped `"` must never appear right after `weird (title) with `
  // inside the label position — the escaped form uses #quot; instead.
  assert.equal(out.includes('with "quotes"]'), false);
  assert.equal(out.includes("weird (title) with #quot;quotes#quot;"), true);
});

test("renderMermaid: closed tickets render distinguishably from open ones", () => {
  const clone = JSON.parse(JSON.stringify(board));
  const target = clone.find((i) => i.number === 22);
  target.state = "CLOSED";
  const parsed = parseBoard(withParentBlockingEdges(clone));
  const out = renderMermaid(parsed);
  assert.equal(out.includes("classDef closed"), true);
  assert.equal(out.includes("N22"), true);
  assert.equal(out.includes("class ") && out.includes("N22"), true);
});

test("renderTree: closed tickets render distinguishably from open ones", () => {
  const clone = JSON.parse(JSON.stringify(board));
  const target = clone.find((i) => i.number === 22);
  target.state = "CLOSED";
  const parsed = parseBoard(withParentBlockingEdges(clone));
  const out = renderTree(parsed);
  assert.equal(out.includes("[CLOSED]"), true);
  assert.equal(out.includes("[OPEN]"), true);
});

test("renderMermaid: cycle in blocking graph terminates and does not throw", () => {
  const clone = JSON.parse(JSON.stringify(board));
  clone.push({
    number: 9001,
    state: "OPEN",
    title: "cycle A",
    url: "",
    body: "",
    labels: [],
    assignees: [],
    blockedBy: { nodes: [], totalCount: 0 },
    blocking: { nodes: [{ number: 9002 }, { number: 3 }], totalCount: 2 },
    parent: null,
  });
  clone.push({
    number: 9002,
    state: "OPEN",
    title: "cycle B",
    url: "",
    body: "",
    labels: [],
    assignees: [],
    blockedBy: { nodes: [], totalCount: 0 },
    blocking: { nodes: [{ number: 9001 }], totalCount: 1 },
    parent: null,
  });
  const parsed = parseBoard(clone);
  const start = Date.now();
  const out = renderMermaid(parsed);
  assert.equal(Date.now() - start < 1000, true);
  assert.equal(typeof out, "string");
});

test("renderTree: cycle in blocking graph terminates and does not throw", () => {
  const clone = JSON.parse(JSON.stringify(board));
  clone.push({
    number: 9003,
    state: "OPEN",
    title: "cycle C",
    url: "",
    body: "",
    labels: [],
    assignees: [],
    blockedBy: { nodes: [], totalCount: 0 },
    blocking: { nodes: [{ number: 9004 }, { number: 17 }], totalCount: 2 },
    parent: null,
  });
  clone.push({
    number: 9004,
    state: "OPEN",
    title: "cycle D",
    url: "",
    body: "",
    labels: [],
    assignees: [],
    blockedBy: { nodes: [], totalCount: 0 },
    blocking: { nodes: [{ number: 9003 }], totalCount: 1 },
    parent: null,
  });
  const parsed = parseBoard(clone);
  const start = Date.now();
  const out = renderTree(parsed);
  assert.equal(Date.now() - start < 1000, true);
  assert.equal(typeof out, "string");
});

test("renderTree: contains a known map's number and is non-empty", () => {
  const parsed = parseBoard(board);
  const out = renderTree(parsed);
  assert.equal(out.length > 0, true);
  assert.equal(out.includes("#17"), true);
  assert.equal(out.includes("#3 "), true);
});
