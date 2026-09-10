const test = require("node:test");
const assert = require("node:assert/strict");
const board = require("./fixtures/board.json");
const { parseBoard, planReconcile } = require("./model.js");

// The loom vocabulary reconcile checks (rule 3) — exactly 10 names, kept in
// sync with model.js's LOOM_LABEL_NAMES for the "all present" test.
const LOOM_LABEL_NAMES = [
  "wayfinder:map",
  "wayfinder:research",
  "wayfinder:grilling",
  "wayfinder:prototype",
  "wayfinder:task",
  "sdlc:done",
  "sdlc:in-progress",
  "sdlc:needs-recharter",
  "sdlc:needs-clarification",
  "qa:regression-failed",
];

// Clone the raw fixture and force one issue to status:"done" + state:"open"
// (measured: 0 such issues exist on the real fixture today) — the
// committed fixture is never edited.
function withDoneButOpen(rawIssues, number) {
  const clone = JSON.parse(JSON.stringify(rawIssues));
  const issue = clone.find((i) => i.number === number);
  issue.state = "OPEN";
  issue.labels = (issue.labels || []).filter(
    (label) => !label.name.startsWith("sdlc:"),
  );
  issue.labels.push({ name: "sdlc:done" });
  return clone;
}

// Clone the raw fixture and set one issue's body to a short literal string
// containing prose that mentions "Blocked by:" — pins rule 1's deletion
// (dropped by D3): this must never be parsed into an edge/repair.
function withBlockedByProse(rawIssues, number) {
  const clone = JSON.parse(JSON.stringify(rawIssues));
  const issue = clone.find((i) => i.number === number);
  issue.body = "See notes. Blocked by: #99 (informal, not a real edge).";
  return clone;
}

// --- rule 2: status done but still open -> close repair ---------------

test("reconcile rule 2 fires: status done + state open -> exactly 1 close repair", () => {
  const parsed = parseBoard(withDoneButOpen(board, 26));
  const result = planReconcile(parsed, LOOM_LABEL_NAMES);
  const closeRepairs = result.repairs.filter((r) => r.op === "close");
  assert.equal(closeRepairs.length, 1);
  assert.equal(closeRepairs[0].number, 26);
});

test("reconcile rule 2 does not fire on the unmodified fixture -> 0 close repairs", () => {
  const parsed = parseBoard(board);
  const result = planReconcile(parsed, LOOM_LABEL_NAMES);
  const closeRepairs = result.repairs.filter((r) => r.op === "close");
  assert.equal(closeRepairs.length, 0);
});

// --- rule 3: missing repo-level label definitions -----------------------

test("reconcile rule 3 with all 10 loom label names present -> 0 repairs", () => {
  const parsed = parseBoard(board);
  const result = planReconcile(parsed, LOOM_LABEL_NAMES);
  const labelRepairs = result.repairs.filter((r) => r.op === "ensureLabel");
  assert.equal(labelRepairs.length, 0);
});

test("reconcile rule 3 with 2 names removed -> exactly 2 ensureLabel repairs", () => {
  const parsed = parseBoard(board);
  const missing = ["sdlc:needs-recharter", "qa:regression-failed"];
  const present = LOOM_LABEL_NAMES.filter((name) => !missing.includes(name));
  const result = planReconcile(parsed, present);
  const labelRepairs = result.repairs.filter((r) => r.op === "ensureLabel");
  assert.equal(labelRepairs.length, 2);
  assert.deepEqual(
    labelRepairs.map((r) => r.name).sort(),
    missing.slice().sort(),
  );
});

// --- rule 1 deletion pin (D3: never reintroduce prose-parsed edges) -----

test("reconcile: a ticket whose body contains 'Blocked by:' prose produces no repair (rule 1 is dropped)", () => {
  const baseline = planReconcile(parseBoard(board), LOOM_LABEL_NAMES);
  const parsed = parseBoard(withBlockedByProse(board, 26));
  const result = planReconcile(parsed, LOOM_LABEL_NAMES);
  // Compare against the unmodified fixture's own repair count (rule 5's
  // parent->blocking migration fires unconditionally on this fixture) —
  // the prose edit itself must add zero repairs beyond that baseline.
  assert.equal(result.repairs.length, baseline.repairs.length);
});

// --- rule 5: parent -> blocking migration --------------------------------

// Exact 10 source->target pairs measured on the unmodified fixture. A
// count-only assertion would pass for the wrong 10 pairs, so assert the set.
const EXPECTED_PARENT_MIGRATION_PAIRS = [
  [22, 17],
  [21, 17],
  [20, 17],
  [19, 17],
  [18, 17],
  [10, 3],
  [7, 3],
  [6, 3],
  [5, 3],
  [4, 3],
];

test("reconcile rule 5 on the unmodified fixture -> exactly 10 addBlocking repairs, exact pairs", () => {
  const parsed = parseBoard(board);
  const result = planReconcile(parsed, LOOM_LABEL_NAMES);
  const addBlockingRepairs = result.repairs.filter(
    (r) => r.op === "addBlocking",
  );
  assert.equal(addBlockingRepairs.length, 10);
  const pairs = addBlockingRepairs
    .map((r) => [r.number, r.target])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const expected = EXPECTED_PARENT_MIGRATION_PAIRS.slice().sort(
    (a, b) => a[0] - b[0] || a[1] - b[1],
  );
  assert.deepEqual(pairs, expected);
});

test("reconcile rule 5 emits addBlocking repairs for CLOSED sources too (not filtered by state)", () => {
  const parsed = parseBoard(board);
  const result = planReconcile(parsed, LOOM_LABEL_NAMES);
  const addBlockingRepairs = result.repairs.filter(
    (r) => r.op === "addBlocking",
  );
  const closedSources = [19, 18, 10, 7, 6, 5, 4];
  const reportedSources = addBlockingRepairs.map((r) => r.number);
  for (const source of closedSources) {
    const ticket = parsed.byNumber.get(source);
    assert.equal(ticket.state, "closed");
    assert.ok(
      reportedSources.includes(source),
      `expected closed source #${source} to have an addBlocking repair`,
    );
  }
});

test("reconcile rule 5 is idempotent: applying the addBlocking repairs to a cloned board leaves 0 rule-5 repairs", () => {
  const parsed = parseBoard(board);
  const firstResult = planReconcile(parsed, LOOM_LABEL_NAMES);
  const addBlockingRepairs = firstResult.repairs.filter(
    (r) => r.op === "addBlocking",
  );
  assert.equal(addBlockingRepairs.length, 10);

  // Apply the repairs to a CLONE, in memory, without touching the live
  // board or any real gh call — the pure-unit proof of the 10 -> 0
  // transcript.
  const clonedBoard = parseBoard(board);
  for (const repair of addBlockingRepairs) {
    const ticket = clonedBoard.byNumber.get(repair.number);
    ticket.blocking.push(repair.target);
  }

  const secondResult = planReconcile(clonedBoard, LOOM_LABEL_NAMES);
  const secondAddBlockingRepairs = secondResult.repairs.filter(
    (r) => r.op === "addBlocking",
  );
  assert.equal(secondAddBlockingRepairs.length, 0);
});
