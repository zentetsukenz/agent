const test = require("node:test");
const assert = require("node:assert/strict");
const { buildArgv, createGh, GhError } = require("./gh.js");

// Pure argv-construction tests only. None of these spawn `gh` for a
// mutating verb — buildArgv() returns plain data, never touches
// child_process.

test("fetchBoard: exact argv, no --repo when unconfigured", () => {
  const { argv } = buildArgv().fetchBoard();
  assert.deepEqual(argv, [
    "issue",
    "list",
    "--state",
    "all",
    "--limit",
    "200",
    "--json",
    "number,state,title,body,url,labels,assignees,blockedBy,blocking,parent",
  ]);
});

test("fetchBoard: --repo injected when configured", () => {
  const { argv } = buildArgv("owner/repo").fetchBoard();
  assert.deepEqual(argv, [
    "issue",
    "list",
    "--state",
    "all",
    "--limit",
    "200",
    "--json",
    "number,state,title,body,url,labels,assignees,blockedBy,blocking,parent",
    "--repo",
    "owner/repo",
  ]);
});

test("setLabels: add and remove both mapped to --add-label/--remove-label", () => {
  const { argv } = buildArgv("o/r").setLabels(42, {
    add: ["a", "b"],
    remove: ["c"],
  });
  assert.deepEqual(argv, [
    "issue",
    "edit",
    "42",
    "--add-label",
    "a,b",
    "--remove-label",
    "c",
    "--repo",
    "o/r",
  ]);
});

test("setLabels: add-only omits --remove-label entirely", () => {
  const { argv } = buildArgv("o/r").setLabels(42, { add: ["a"] });
  assert.deepEqual(argv, [
    "issue",
    "edit",
    "42",
    "--add-label",
    "a",
    "--repo",
    "o/r",
  ]);
});

test("assign: --add-assignee <login>", () => {
  const { argv } = buildArgv("o/r").assign(7, "zentetsukenz");
  assert.deepEqual(argv, [
    "issue",
    "edit",
    "7",
    "--add-assignee",
    "zentetsukenz",
    "--repo",
    "o/r",
  ]);
});

test("close: issue close <n>", () => {
  const { argv } = buildArgv("o/r").close(9);
  assert.deepEqual(argv, ["issue", "close", "9", "--repo", "o/r"]);
});

test("editBody: --body-file - and body passed via stdin, never in argv", () => {
  const secretBody = "line one\n`backtick` and \"quote\"";
  const { argv, input } = buildArgv("o/r").editBody(5, secretBody);
  assert.deepEqual(argv, [
    "issue",
    "edit",
    "5",
    "--body-file",
    "-",
    "--repo",
    "o/r",
  ]);
  assert.equal(input, secretBody);
  assert.equal(argv.includes(secretBody), false);
  assert.equal(
    argv.some((el) => el.includes(secretBody)),
    false,
  );
});

test("addBlocking: --add-blocking <csv>", () => {
  const { argv } = buildArgv("o/r").addBlocking(1, [2, 3]);
  assert.deepEqual(argv, [
    "issue",
    "edit",
    "1",
    "--add-blocking",
    "2,3",
    "--repo",
    "o/r",
  ]);
});

test("removeBlocking: --remove-blocking <csv>", () => {
  const { argv } = buildArgv("o/r").removeBlocking(1, [2, 3]);
  assert.deepEqual(argv, [
    "issue",
    "edit",
    "1",
    "--remove-blocking",
    "2,3",
    "--repo",
    "o/r",
  ]);
});

test("createIssue: --body-file - and body via stdin, labels joined as csv", () => {
  const secretBody = "multi\nline\nbody with `stuff`";
  const { argv, input } = buildArgv("o/r").createIssue({
    title: "New ticket",
    body: secretBody,
    labels: ["wayfinder:task", "sdlc:doing"],
  });
  assert.deepEqual(argv, [
    "issue",
    "create",
    "--title",
    "New ticket",
    "--body-file",
    "-",
    "--label",
    "wayfinder:task,sdlc:doing",
    "--repo",
    "o/r",
  ]);
  assert.equal(input, secretBody);
  assert.equal(
    argv.some((el) => el.includes(secretBody)),
    false,
  );
});

test("createIssue: no labels omits --label entirely", () => {
  const { argv } = buildArgv("o/r").createIssue({
    title: "t",
    body: "b",
  });
  assert.deepEqual(argv, [
    "issue",
    "create",
    "--title",
    "t",
    "--body-file",
    "-",
    "--repo",
    "o/r",
  ]);
});

test("ensureLabel: label create <name> --force", () => {
  const { argv } = buildArgv("o/r").ensureLabel("wayfinder:map");
  assert.deepEqual(argv, [
    "label",
    "create",
    "wayfinder:map",
    "--force",
    "--repo",
    "o/r",
  ]);
});

test("whoami: api user --jq .login, never --repo (gh api rejects it)", () => {
  const { argv } = buildArgv("o/r").whoami();
  assert.deepEqual(argv, ["api", "user", "--jq", ".login"]);
});

test("version: --version, never --repo (gh --version rejects it)", () => {
  const { argv } = buildArgv("o/r").version();
  assert.deepEqual(argv, ["--version"]);
});

test("no argv element is a shell string joining flag+value with a space", () => {
  const allCalls = [
    buildArgv("o/r").fetchBoard(),
    buildArgv("o/r").setLabels(1, { add: ["x"], remove: ["y"] }),
    buildArgv("o/r").assign(1, "me"),
    buildArgv("o/r").close(1),
    buildArgv("o/r").editBody(1, "body"),
    buildArgv("o/r").addBlocking(1, [2]),
    buildArgv("o/r").removeBlocking(1, [2]),
    buildArgv("o/r").createIssue({ title: "t", body: "b", labels: ["l"] }),
    buildArgv("o/r").ensureLabel("l"),
  ];
  for (const { argv } of allCalls) {
    for (const el of argv) {
      // Flags themselves never contain a space; csv/title values legitimately
      // may (e.g. "New ticket") — the invariant under test is that a FLAG
      // token is never fused with its value by a space.
      if (el.startsWith("-")) {
        assert.equal(el.includes(" "), false, `flag token "${el}" has a space`);
      }
    }
  }
});

test("GhError carries an exitClass, defaulting to 1 (never guessing 2)", () => {
  const err = new GhError("boom");
  assert.equal(err.exitClass, 1);
  assert.equal(err.name, "GhError");
});

test("createGh() exposes the fixed interface", () => {
  const client = createGh("o/r");
  for (const fn of [
    "fetchBoard",
    "setLabels",
    "assign",
    "close",
    "editBody",
    "addBlocking",
    "removeBlocking",
    "createIssue",
    "ensureLabel",
    "whoami",
    "version",
  ]) {
    assert.equal(typeof client[fn], "function", `${fn} missing`);
  }
});

// --- live smoke: read-only ops only (per task spec) ------------------------

test("version() is read-only and safe to run live", () => {
  const out = createGh().version();
  assert.equal(typeof out, "string");
  assert.ok(out.length > 0);
});
