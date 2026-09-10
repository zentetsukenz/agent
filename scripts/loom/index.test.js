"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { parseArgv } = require("./index.js");

test("board read: namespace board, verb read, no flags", () => {
  const result = parseArgv(["board", "read"]);
  assert.equal(result.mode, "run");
  assert.equal(result.namespace, "board");
  assert.equal(result.verb, "read");
  assert.deepEqual(result.flags, {});
});

test("--frontier parses", () => {
  const result = parseArgv(["board", "read", "--frontier"]);
  assert.equal(result.flags.frontier, true);
});

test("--unmapped parses", () => {
  const result = parseArgv(["board", "read", "--unmapped"]);
  assert.equal(result.flags.unmapped, true);
});

test("--format=mermaid parses", () => {
  const result = parseArgv(["board", "tree", "--format=mermaid"]);
  assert.equal(result.flags.format, "mermaid");
});

test("--dry-run parses", () => {
  const result = parseArgv(["board", "reconcile", "--dry-run"]);
  assert.equal(result.flags.dryRun, true);
});

test("--repo owner/name parses (global passthrough)", () => {
  const result = parseArgv(["board", "read", "--repo", "acme/widgets"]);
  assert.equal(result.repo, "acme/widgets");
});

test("unknown namespace is flagged as an error with exit class 1", () => {
  const result = parseArgv(["bogus", "read"]);
  assert.equal(result.mode, "error");
  assert.equal(result.exitCode, 1);
});

test("unknown verb is flagged as an error with exit class 1", () => {
  const result = parseArgv(["board", "bogus"]);
  assert.equal(result.mode, "error");
  assert.equal(result.exitCode, 1);
});

test("--help parses as its own mode", () => {
  const result = parseArgv(["--help"]);
  assert.equal(result.mode, "help");
});

test("--version parses as its own mode", () => {
  const result = parseArgv(["--version"]);
  assert.equal(result.mode, "version");
});

// --frontier + --unmapped together: defined to COMPOSE (both apply) —
// documented in HELP as "both apply, neither overrides the other".
test("--frontier + --unmapped together: both flags resolve true (they compose)", () => {
  const result = parseArgv(["board", "read", "--frontier", "--unmapped"]);
  assert.equal(result.flags.frontier, true);
  assert.equal(result.flags.unmapped, true);
});
