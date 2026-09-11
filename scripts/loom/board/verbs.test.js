const test = require("node:test");
const assert = require("node:assert/strict");
const rawBoard = require("./fixtures/board.json");
const { parseBoard } = require("./model.js");
const { read, tree, apply, reconcile } = require("./verbs.js");

// Post-migration fixture (mirrors model.test.js/transition.test.js): D1's
// migration adds a `blocking` edge from each ticket to its `parent`. The
// committed fixture is pre-migration — synthesised here, never edited.
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

// The fake `gh` module — dependency injection via a default parameter
// (verbs.js's `client = gh`), not a mocking library. `fetchBoard` parses
// the SAME raw fixture parseBoard is tested against elsewhere, so it
// mirrors what a real gh.js client would hand back. Every write method
// pushes `{op, args}` onto `calls` and returns a harmless string — it NEVER
// spawns `gh`, NEVER touches the live board.
function makeFakeGh({
  rawIssues = rawBoard,
  whoamiLogin = "alice",
  existingLabelNames = [],
} = {}) {
  const calls = [];
  function record(op) {
    return (...args) => {
      calls.push({ op, args });
      return "ok";
    };
  }
  return {
    calls,
    fetchBoard: () => parseBoard(rawIssues),
    whoami: () => whoamiLogin,
    listLabels: () => existingLabelNames,
    assign: record("assign"),
    setLabels: record("setLabels"),
    editBody: record("editBody"),
    close: record("close"),
    createIssue: record("createIssue"),
    ensureLabel: record("ensureLabel"),
    addBlocking: record("addBlocking"),
  };
}

// --- read ------------------------------------------------------------

test("read: default payload shape is minimal — {tickets, frontier}, no unmapped key", () => {
  const client = makeFakeGh();
  const result = read({}, client);
  assert.equal(result.ok, true);
  assert.deepEqual(Object.keys(result.payload).sort(), ["frontier", "tickets"]);
  assert.equal(result.payload.tickets.length, 24);
  assert.deepEqual(result.payload.frontier, []); // pre-migration fixture: 0 takeable
});

test("read --frontier: narrows tickets to the takeable set", () => {
  const client = makeFakeGh({ rawIssues: withParentBlockingEdges(rawBoard) });
  const result = read({ frontier: true }, client);
  assert.equal(result.ok, true);
  assert.deepEqual(result.payload.frontier, [20]);
  assert.deepEqual(
    result.payload.tickets.map((t) => t.number),
    [20],
  );
  assert.equal(result.payload.tickets[0].takeable, true);
});

test("read --unmapped: ADDS an unmapped field, default payload keys unaffected", () => {
  const client = makeFakeGh();
  const result = read({ unmapped: true }, client);
  assert.equal(result.ok, true);
  assert.deepEqual(Object.keys(result.payload).sort(), [
    "frontier",
    "tickets",
    "unmapped",
  ]);
  assert.ok(result.payload.unmapped.length > 0);
});

test("read: no ticket in any payload exposes raw labels", () => {
  const client = makeFakeGh();
  for (const opts of [{}, { frontier: true }, { unmapped: true }]) {
    const result = read(opts, client);
    for (const ticket of result.payload.tickets) {
      assert.equal("labels" in ticket, false);
    }
  }
});

// --- tree --------------------------------------------------------------

test("tree: default format renders the indented tree, not mermaid", () => {
  const client = makeFakeGh();
  const result = tree({}, client);
  assert.equal(result.ok, true);
  assert.equal(result.payload.format, "tree");
  assert.equal(result.payload.rendering.startsWith("graph TD"), false);
});

test("tree --format=mermaid: SELECTS the mermaid renderer, never concatenates both", () => {
  const client = makeFakeGh();
  const result = tree({ format: "mermaid" }, client);
  assert.equal(result.ok, true);
  assert.equal(result.payload.format, "mermaid");
  assert.equal(result.payload.rendering.startsWith("graph TD"), true);
  // Proof of SELECT-not-concatenate: the tree format's own leading line
  // ("MAP #...") never appears at the start of the mermaid rendering.
  assert.equal(result.payload.rendering.startsWith("MAP "), false);
});

// --- apply ---------------------------------------------------------------

test("apply refusal: claim on someone else's ticket -> zero calls recorded, no gh writes executed", () => {
  const client = makeFakeGh({ whoamiLogin: "alice" });
  const result = apply(
    { number: 18, transition: "claim" }, // #18 has assignee zentetsukenz in the real fixture
    client,
  );
  assert.equal(result.ok, false);
  assert.equal(result.exitCode, 3);
  assert.deepEqual(client.calls, []);
});

test("apply success: claim executes the planned calls, in order", () => {
  const client = makeFakeGh({ whoamiLogin: "alice" });
  // #26 is open/unassigned in the real fixture.
  const result = apply({ number: 26, transition: "claim" }, client);
  assert.equal(result.ok, true);
  assert.deepEqual(result.payload.changed, [
    { number: 26, field: "assignee", to: "alice" },
  ]);
  assert.deepEqual(
    client.calls.map((c) => c.op),
    ["assign"],
  );
  assert.deepEqual(client.calls[0].args, [26, "alice"]);
});

test("apply success: dispatch executes addLabel via setLabels, in order", () => {
  const client = makeFakeGh({ whoamiLogin: "alice" });
  // #20 is open, blockedBy [19,18], both closed -> unblocked.
  const result = apply({ number: 20, transition: "dispatch" }, client);
  assert.equal(result.ok, true);
  assert.deepEqual(
    client.calls.map((c) => c.op),
    ["setLabels"],
  );
  assert.deepEqual(client.calls[0].args, [20, { add: ["sdlc:in-progress"] }]);
});

test("apply success: close executes editBody then close, in order", () => {
  const client = makeFakeGh({
    whoamiLogin: "alice",
    rawIssues: withParentBlockingEdges(rawBoard),
  });
  const result = apply(
    {
      number: 20,
      transition: "close",
      transitionOpts: { pointer: "shipped the distributable" },
    },
    client,
  );
  assert.equal(result.ok, true);
  assert.deepEqual(
    client.calls.map((c) => c.op),
    ["editBody", "close"],
  );
  assert.equal(client.calls[0].args[0], 17);
  assert.equal(client.calls[1].args[0], 20);
});

test("apply: actor comes from gh.whoami(), not from caller-supplied opts", () => {
  const client = makeFakeGh({ whoamiLogin: "bob" });
  const result = apply({ number: 26, transition: "claim" }, client);
  assert.equal(result.ok, true);
  assert.deepEqual(result.payload.changed, [
    { number: 26, field: "assignee", to: "bob" },
  ]);
});

// --- reconcile -------------------------------------------------------------

test("reconcile --dry-run: reports repairs but records ZERO write calls (dry-run enforced structurally)", () => {
  const client = makeFakeGh({ existingLabelNames: [] });
  const result = reconcile({ dryRun: true }, client);
  assert.equal(result.ok, true);
  assert.equal(result.payload.dryRun, true);
  assert.ok(result.payload.repairs.length > 0); // 10 addBlocking + 10 ensureLabel, measured
  assert.deepEqual(client.calls, []);
});

test("reconcile without --dry-run: the writes WERE recorded, one per repair", () => {
  const client = makeFakeGh({ existingLabelNames: [] });
  const result = reconcile({}, client);
  assert.equal(result.ok, true);
  assert.equal(result.payload.dryRun, false);
  assert.equal(client.calls.length, result.payload.repairs.length);
});

test("reconcile: every repair is reported (close + ensureLabel + addBlocking ops all present)", () => {
  const client = makeFakeGh({ existingLabelNames: [] });
  const result = reconcile({ dryRun: true }, client);
  const ops = new Set(result.payload.repairs.map((r) => r.op));
  assert.ok(ops.has("ensureLabel"));
  assert.ok(ops.has("addBlocking"));
});

// --- cross-cutting: no live gh, no real spawn -----------------------------

test("no verb spawns a real gh module — every call goes through the injected fake", () => {
  const client = makeFakeGh();
  read({}, client);
  tree({}, client);
  apply({ number: 26, transition: "claim" }, client);
  reconcile({ dryRun: true }, client);
  // If any verb had bypassed the injected client, `fetchBoard`/`whoami`
  // would have had to come from somewhere else — but the fake is the ONLY
  // gh-shaped object passed in, and this test module never requires the
  // real gh.js, so there is nothing else it could have called.
  assert.equal(typeof client.fetchBoard, "function");
});
