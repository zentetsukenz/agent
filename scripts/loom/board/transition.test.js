const test = require("node:test");
const assert = require("node:assert/strict");
const board = require("./fixtures/board.json");
const { parseBoard, planTransition } = require("./model.js");

// The fixture has `assignees: []` on EVERY issue (measured), so "assigned to
// someone else" and "already yours" cannot be exercised against the real
// data — both are synthesised here by cloning the raw fixture and mutating
// the clone's `assignees` array before parsing. The committed fixture is
// never edited.
function withAssignee(rawIssues, number, login) {
  const clone = JSON.parse(JSON.stringify(rawIssues));
  const issue = clone.find((i) => i.number === number);
  issue.assignees = [{ login }];
  return clone;
}

// Post-migration fixture (mirrors model.test.js's withParentBlockingEdges):
// D1's migration adds a `blocking` edge from each ticket to its `parent`, so
// the child→parent membership chain `close` walks actually exists. The
// committed fixture is pre-migration (no such edges) — synthesised here
// rather than editing the fixture.
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

// --- claim ------------------------------------------------------------

test("claim on a ticket assigned to someone else -> exitCode 3", () => {
  // #26 is open/unassigned in the real fixture; synthesise "assigned to bob".
  const parsed = parseBoard(withAssignee(board, 26, "bob"));
  const result = planTransition(parsed, 26, "claim", { actor: "alice" });
  assert.equal(result.exitCode, 3);
  assert.equal(result.error !== undefined, true);
});

test("claim on a ticket already yours -> exit 0, noop: true", () => {
  const parsed = parseBoard(withAssignee(board, 26, "alice"));
  const result = planTransition(parsed, 26, "claim", { actor: "alice" });
  assert.equal(result.error, undefined);
  assert.equal(result.noop, true);
  assert.deepEqual(result.changed, []);
  assert.deepEqual(result.calls, []);
});

test("claim success: unassigned ticket -> exit 0, noop: false, changed[] populated", () => {
  // #26 is genuinely unassigned in the real fixture — no synthesis needed.
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 26, "claim", { actor: "alice" });
  assert.equal(result.error, undefined);
  assert.equal(result.noop, false);
  assert.deepEqual(result.changed, [
    { number: 26, field: "assignee", to: "alice" },
  ]);
  assert.deepEqual(result.calls, [
    { op: "assign", number: 26, login: "alice" },
  ]);
});

// --- dispatch ----------------------------------------------------------

test("dispatch on a blocked ticket -> exitCode 3", () => {
  // #22 is open, blockedBy [20], and #20 is open (measured) -> blocked.
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 22, "dispatch", { actor: "alice" });
  assert.equal(result.exitCode, 3);
  assert.equal(result.error !== undefined, true);
});

test("dispatch on a closed ticket -> exitCode 3", () => {
  // #19 is closed (measured).
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 19, "dispatch", { actor: "alice" });
  assert.equal(result.exitCode, 3);
  assert.equal(result.error !== undefined, true);
});

test("dispatch success: open, unblocked ticket -> exit 0, noop: false, changed[] populated", () => {
  // #20 is open, blockedBy [19, 18], both closed (measured) -> unblocked.
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 20, "dispatch", { actor: "alice" });
  assert.equal(result.error, undefined);
  assert.equal(result.noop, false);
  assert.deepEqual(result.changed, [
    { number: 20, field: "status", to: "in-progress" },
  ]);
  assert.deepEqual(result.calls, [
    { op: "addLabel", number: 20, name: "sdlc:in-progress" },
  ]);
});

// --- close ---------------------------------------------------------------

test("close #20 pre-migration -> exitCode 3 (no membership edge to a map yet)", () => {
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 20, "close", {
    actor: "alice",
    pointer: "shipped the distributable",
  });
  assert.equal(result.exitCode, 3);
  assert.equal(result.error !== undefined, true);
});

test("close #20 post-migration -> success, map is #17", () => {
  const parsed = parseBoard(withParentBlockingEdges(board));
  const result = planTransition(parsed, 20, "close", {
    actor: "alice",
    pointer: "shipped the distributable",
  });
  assert.equal(result.error, undefined);
  assert.equal(result.noop, false);
  assert.deepEqual(
    result.changed.map((c) => c.number),
    [20, 17],
  );
  assert.deepEqual(
    result.calls.map((c) => c.op),
    ["editBody", "close"],
  );
  const editCall = result.calls.find((c) => c.op === "editBody");
  assert.equal(editCall.number, 17);
  assert.equal(
    editCall.body.includes(
      "- [Build scripts/loom/ — the ADR-025 board-API distributable (all four verbs)](https://github.com/zentetsukenz/agent/issues/20) — shipped the distributable",
    ),
    true,
  );
  const closeCall = result.calls.find((c) => c.op === "close");
  assert.equal(closeCall.number, 20);
});

test("close #23 (open, no parent, no blocking) -> exitCode 3 in both pre- and post-migration states", () => {
  const preParsed = parseBoard(board);
  const preResult = planTransition(preParsed, 23, "close", {
    actor: "alice",
    pointer: "gist",
  });
  assert.equal(preResult.exitCode, 3);

  const postParsed = parseBoard(withParentBlockingEdges(board));
  const postResult = planTransition(postParsed, 23, "close", {
    actor: "alice",
    pointer: "gist",
  });
  assert.equal(postResult.exitCode, 3);
});

test("close is idempotent: pointer line already present -> noop: true, line occurs exactly once", () => {
  const clone = withParentBlockingEdges(board);
  const parsed = parseBoard(clone);
  const first = planTransition(parsed, 20, "close", {
    actor: "alice",
    pointer: "shipped the distributable",
  });
  const newMapBody = first.calls.find((c) => c.op === "editBody").body;

  // Apply the planned body onto a fresh clone (simulating the caller having
  // already executed the calls), then close the same ticket again.
  const clone2 = withParentBlockingEdges(board);
  clone2.find((i) => i.number === 17).body = newMapBody;
  const parsed2 = parseBoard(clone2);
  const second = planTransition(parsed2, 20, "close", {
    actor: "alice",
    pointer: "shipped the distributable",
  });
  assert.equal(second.noop, true);
  assert.deepEqual(second.calls, []);

  const pointerLine =
    "- [Build scripts/loom/ — the ADR-025 board-API distributable (all four verbs)](https://github.com/zentetsukenz/agent/issues/20) — shipped the distributable";
  const occurrences = newMapBody.split(pointerLine).length - 1;
  assert.equal(occurrences, 1);
});

test("close on a map whose body lacks '## Decisions so far' -> exitCode 3", () => {
  // Clone the map ticket (#17) and strip its heading — never edit the
  // committed fixture.
  const clone = withParentBlockingEdges(board);
  const mapTicket = clone.find((i) => i.number === 17);
  mapTicket.body = mapTicket.body.replace(
    "## Decisions so far",
    "## Something Else",
  );
  const parsed = parseBoard(clone);
  const result = planTransition(parsed, 20, "close", {
    actor: "alice",
    pointer: "shipped the distributable",
  });
  assert.equal(result.exitCode, 3);
  assert.equal(result.error !== undefined, true);
});

// --- cross-cutting -------------------------------------------------------

test("unknown transition name -> exitCode 1", () => {
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 20, "not-a-real-transition", {
    actor: "alice",
  });
  assert.equal(result.exitCode, 1);
  assert.equal(result.error !== undefined, true);
});

test("unknown issue number -> exitCode 3", () => {
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 999999, "claim", { actor: "alice" });
  assert.equal(result.exitCode, 3);
  assert.equal(result.error !== undefined, true);
});

// --- open-clarification ---------------------------------------------------

test("open-clarification: doctrine settles it -> creates a wayfinder:grilling issue", () => {
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 26, "open-clarification", {
    actor: "alice",
    question: "does close need opts.pointer or can it be inferred?",
  });
  assert.equal(result.error, undefined);
  assert.equal(result.noop, false);
  assert.deepEqual(result.changed, []);
  assert.equal(result.calls.length, 1);
  const call = result.calls[0];
  assert.equal(call.op, "createIssue");
  assert.deepEqual(call.labels, ["wayfinder:grilling"]);
  assert.equal(
    call.body.includes("does close need opts.pointer or can it be inferred?"),
    true,
  );
});

test("open-clarification without opts.question -> exitCode 1 naming the gap", () => {
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 26, "open-clarification", {
    actor: "alice",
  });
  assert.equal(result.exitCode, 1);
  assert.equal(result.error.includes("opts.question"), true);
});

// --- graduate-recharter (deliberate doctrine gap) -------------------------

test("graduate-recharter: doctrine does not settle who creates the sub-map -> exitCode 1 naming the gap", () => {
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 26, "graduate-recharter", {
    actor: "alice",
  });
  assert.equal(result.exitCode, 1);
  assert.equal(result.error.includes("sub-map"), true);
  assert.equal(result.error.includes("blocking edge"), true);
});

// --- seed-regression-map (deliberate doctrine gap) ------------------------

test("seed-regression-map: doctrine does not settle membership/<X> sourcing -> exitCode 1 naming the gap", () => {
  const parsed = parseBoard(board);
  const result = planTransition(parsed, 26, "seed-regression-map", {
    actor: "alice",
  });
  assert.equal(result.exitCode, 1);
  assert.equal(result.error.includes("blocking edge"), true);
  assert.equal(result.error.includes("<X>"), true);
});

test("planTransition never mutates its inputs (planning only, executing nothing)", () => {
  const raw = withAssignee(board, 26, "bob");
  const parsed = parseBoard(raw);
  const before = JSON.stringify(parsed.byNumber.get(26));
  planTransition(parsed, 26, "claim", { actor: "alice" });
  planTransition(parsed, 20, "dispatch", { actor: "alice" });
  assert.equal(JSON.stringify(parsed.byNumber.get(26)), before);
});
