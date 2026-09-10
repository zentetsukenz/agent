const test = require("node:test");
const assert = require("node:assert/strict");
const board = require("./fixtures/board.json");
const { parseBoard, takeable, frontier, unmapped } = require("./model.js");

// Post-migration fixture: D1's migration adds a `blocking` edge from each
// ticket to its `parent` (the child completing advances the parent map). The
// committed fixture is pre-migration (no such edges exist yet), so this is
// synthesised here rather than editing the fixture (which must never change).
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

test("board fixture loads with expected issue count", () => {
  assert.equal(board.length, 24);
});

test("parses a wayfinder:* label into type, strips the prefix", () => {
  const { byNumber } = parseBoard(board);
  // #23 carries wayfinder:grilling and no sdlc:* label.
  const ticket = byNumber.get(23);
  assert.equal(ticket.type, "grilling");
  assert.equal(ticket.status, null);
});

test("an issue with no labels at all gets type: null, status: null", () => {
  const { byNumber } = parseBoard(board);
  // #26 has labels: [] in the fixture.
  const ticket = byNumber.get(26);
  assert.equal(ticket.type, null);
  assert.equal(ticket.status, null);
});

test("parses a sdlc:* label into status (synthesised — fixture has none)", () => {
  const clone = JSON.parse(JSON.stringify(board));
  const issue = clone.find((i) => i.number === 23);
  issue.labels.push({ name: "sdlc:doing" });
  const { byNumber } = parseBoard(clone);
  const ticket = byNumber.get(23);
  assert.equal(ticket.type, "grilling");
  assert.equal(ticket.status, "doing");
});

test("no raw labels field is passed through on the output ticket", () => {
  const { byNumber } = parseBoard(board);
  const ticket = byNumber.get(23);
  assert.equal("labels" in ticket, false);
});

test("assignees (plain array) and blockedBy/blocking ({nodes}) are both normalised without .nodes leaking", () => {
  const { byNumber } = parseBoard(board);
  // #18 has a non-empty assignees array and a non-empty blocking edge.
  const ticket = byNumber.get(18);
  assert.equal(Array.isArray(ticket.assignees), true);
  assert.equal(ticket.assignees.length, 1);
  assert.equal(ticket.assignees[0].login, "zentetsukenz");
  // blocking must be normalised to a plain array of numbers, not {nodes: [...]}.
  assert.deepEqual(ticket.blocking, [20]);
  assert.equal(ticket.blocking.nodes, undefined);
});

test("blockedBy is normalised to an array of issue numbers", () => {
  const { byNumber } = parseBoard(board);
  // #22 is blockedBy #20 in the fixture.
  const ticket = byNumber.get(22);
  assert.deepEqual(ticket.blockedBy, [20]);
});

test("state is normalised to lowercase", () => {
  const { byNumber } = parseBoard(board);
  assert.equal(byNumber.get(26).state, "open");
  const closed = board.find((i) => i.state === "CLOSED");
  if (closed) {
    assert.equal(byNumber.get(closed.number).state, "closed");
  }
});

test("parent is carried through as a raw issue number (for B5b only)", () => {
  const { byNumber } = parseBoard(board);
  // #22's parent is #17 in the fixture.
  assert.equal(byNumber.get(22).parent, 17);
  // #26 has no parent.
  assert.equal(byNumber.get(26).parent, null);
});

test("maps collects every ticket with type === 'map'", () => {
  const { maps } = parseBoard(board);
  assert.deepEqual(
    maps.map((t) => t.number).sort((a, b) => a - b),
    [3, 17],
  );
});

test("two wayfinder:* labels on one issue throws, naming the issue number", () => {
  // Clone-and-mutate: the real fixture never has this (measured 0/24), so the
  // corrupt condition must be constructed here rather than edited into the fixture.
  const clone = JSON.parse(JSON.stringify(board));
  const issue = clone.find((i) => i.number === 23);
  issue.labels.push({ name: "wayfinder:task" });
  assert.throws(() => parseBoard(clone), /#23/);
});

test("truncated relationship (totalCount > nodes.length) throws", () => {
  // Clone-and-mutate: this never fires on today's board (measured 0/24), so the
  // truncated condition is constructed here rather than edited into the fixture.
  const clone = JSON.parse(JSON.stringify(board));
  const issue = clone.find((i) => i.number === 22);
  issue.blockedBy.totalCount = issue.blockedBy.nodes.length + 1;
  assert.throws(() => parseBoard(clone), /truncated/);
});

// --- B3: membership, takeable, frontier, unmapped (ADR-029 D1/D2) ---------

test("pre-migration fixture: frontier is empty (no ticket reaches a map yet)", () => {
  // MEASURED: the committed fixture has 10 `parent` edges but none of them
  // exist as `blocking` edges yet, so only #3/#17 (the maps themselves) are
  // members. Nothing else can be takeable.
  const parsed = parseBoard(board);
  assert.deepEqual(frontier(parsed), []);
});

test("pre-migration fixture: unmapped is every other open ticket", () => {
  const parsed = parseBoard(board);
  assert.deepEqual(unmapped(parsed), [13, 15, 16, 20, 21, 22, 23, 24, 25, 26]);
});

test("post-migration fixture (parent edges synthesised): frontier is [20]", () => {
  const parsed = parseBoard(withParentBlockingEdges(board));
  assert.deepEqual(frontier(parsed), [20]);
});

test("post-migration fixture: unmapped drops every ticket now reachable from a map", () => {
  const parsed = parseBoard(withParentBlockingEdges(board));
  assert.deepEqual(unmapped(parsed), [13, 15, 16, 23, 24, 25, 26]);
});

test("cycle safety: a blocking cycle that never reaches a map terminates and is not a member", () => {
  // A -> B -> A, neither is type "map". An unguarded walk would recurse forever;
  // the `onPath` cycle guard must make this resolve to false without hanging or
  // throwing.
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
    blocking: { nodes: [{ number: 9002 }], totalCount: 1 },
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
  const result = frontier(parsed);
  assert.equal(Date.now() - start < 1000, true);
  assert.equal(result.includes(9001), false);
  assert.equal(result.includes(9002), false);
});

test("old 3-conjunct predicate (open ∧ unblocked ∧ unassigned, no membership) yields 9 items including map #17 — the regression D1 fixes", () => {
  // Local-only, not exported: the pre-D1 predicate that let a macro-PM tick
  // dispatch a map (#17) because it never checked membership or excluded
  // type === "map".
  function oldTakeable(ticket, byNumber) {
    const hasOpenBlocker = ticket.blockedBy.some((num) => {
      const blocker = byNumber.get(num);
      return blocker ? blocker.state === "open" : false;
    });
    return (
      ticket.state === "open" &&
      !hasOpenBlocker &&
      ticket.assignees.length === 0
    );
  }
  const parsed = parseBoard(board);
  const oldResult = parsed.tickets
    .filter((ticket) => oldTakeable(ticket, parsed.byNumber))
    .map((ticket) => ticket.number)
    .sort((a, b) => a - b);
  assert.equal(oldResult.length, 9);
  assert.equal(oldResult.includes(17), true);

  // New 5-conjunct predicate excludes #17 (type === "map").
  const newResult = frontier(parsed);
  assert.equal(newResult.includes(17), false);
});
