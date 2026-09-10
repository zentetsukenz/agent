"use strict";

// gh.js — the single process boundary. The ONLY module in this codebase
// allowed to reference `child_process`. Every other module (model.js,
// render.js, ...) works on plain data; this file is where intent (assign,
// close, editBody, ...) turns into a `gh` invocation and `gh` failure turns
// into a typed error.

const { execFileSync } = require("node:child_process");
const { parseBoard } = require("./model.js");

// --- pure argv construction (requirement #6 — testable without spawning) --
//
// buildArgv(repo) returns one function per op; each returns
// `{ argv, input }`. `argv` is ALWAYS a plain array of strings — never a
// shell string, never joined with spaces — so execFileSync (requirement #1)
// never sees anything it could reinterpret. `input`, when present, is the
// stdin payload for the two ops whose body can be multi-KB with embedded
// quotes/backticks/newlines (requirement #2): the body never appears as an
// argv element.
//
// `repo`, once resolved by the caller (createGh, below), is injected into
// every call EXCEPT whoami/version — `gh api` and `gh --version` both
// reject -R/--repo outright ("unknown flag: --repo", verified against gh
// 2.98.0's own error), so those two let `gh` resolve repo from cwd/GH_REPO
// on its own.
function withRepo(argv, repo) {
  return repo ? [...argv, "--repo", repo] : argv;
}

function buildArgv(repo) {
  return {
    fetchBoard: () => ({
      argv: withRepo(
        [
          "issue",
          "list",
          "--state",
          "all",
          "--limit",
          "200",
          "--json",
          "number,state,title,body,url,labels,assignees,blockedBy,blocking,parent",
        ],
        repo,
      ),
    }),

    setLabels: (n, { add = [], remove = [] } = {}) => {
      const argv = ["issue", "edit", String(n)];
      if (add.length) argv.push("--add-label", add.join(","));
      if (remove.length) argv.push("--remove-label", remove.join(","));
      return { argv: withRepo(argv, repo) };
    },

    assign: (n, login) => ({
      argv: withRepo(
        ["issue", "edit", String(n), "--add-assignee", login],
        repo,
      ),
    }),

    close: (n) => ({
      argv: withRepo(["issue", "close", String(n)], repo),
    }),

    // Body via stdin (--body-file -), never as an argv element.
    editBody: (n, body) => ({
      argv: withRepo(
        ["issue", "edit", String(n), "--body-file", "-"],
        repo,
      ),
      input: body,
    }),

    addBlocking: (n, targets) => ({
      argv: withRepo(
        ["issue", "edit", String(n), "--add-blocking", targets.join(",")],
        repo,
      ),
    }),

    removeBlocking: (n, targets) => ({
      argv: withRepo(
        ["issue", "edit", String(n), "--remove-blocking", targets.join(",")],
        repo,
      ),
    }),

    // Body via stdin, same reasoning as editBody.
    createIssue: ({ title, body, labels = [] }) => {
      const argv = ["issue", "create", "--title", title, "--body-file", "-"];
      if (labels.length) argv.push("--label", labels.join(","));
      return { argv: withRepo(argv, repo), input: body };
    },

    // --force UPDATES an existing label instead of exiting 1, which is why
    // this layer needs no stderr parsing to detect "already exists".
    ensureLabel: (name) => ({
      argv: withRepo(["label", "create", name, "--force"], repo),
    }),

    // reconcile rule 3 (verbs.js) needs the repo's live label DEFINITIONS —
    // distinct from an issue's labels — to know which loom vocabulary names
    // are missing. `--limit 200` mirrors fetchBoard's own cap; a repo with
    // more than 200 labels is out of scope for now (YAGNI).
    listLabels: () => ({
      argv: withRepo(["label", "list", "--json", "name", "--limit", "200"], repo),
    }),

    // `gh api` doesn't accept -R/--repo — it resolves repo from cwd/GH_REPO.
    whoami: () => ({ argv: ["api", "user", "--jq", ".login"] }),

    // `gh --version` doesn't accept -R/--repo either.
    version: () => ({ argv: ["--version"] }),
  };
}

// --- typed errors ---------------------------------------------------------
//
// Error-class taxonomy: `gh`'s own exit codes (`gh help exit-codes` — 0 ok,
// 1 generic failure, 2 cancelled, 4 needs auth) expose no signal for "the
// board moved underneath you" distinct from plain failure. Per this task's
// decision authority we therefore never guess exitClass 2 here — every
// transport/auth/not-found/spawn failure this file sees classifies as
// exitClass 1. `gh` also enforces no state preconditions (a label edit on a
// closed issue exits 0), so this layer only reports transport failure; it
// never itself detects "board drift" — a future caller that re-fetches and
// diffs is the only legitimate place exitClass 2 could come from, and that
// isn't this file's job.
class GhError extends Error {
  constructor(message, { exitClass = 1, cause } = {}) {
    super(message);
    this.name = "GhError";
    this.exitClass = exitClass;
    this.cause = cause;
  }
}

function run({ argv, input }) {
  try {
    return execFileSync("gh", argv, {
      encoding: "utf8",
      input,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err) {
    throw new GhError(`gh ${argv.join(" ")} failed: ${err.message}`, {
      exitClass: 1,
      cause: err,
    });
  }
}

// --- the live client -------------------------------------------------------
//
// createGh(repo) resolves --repo ONCE (requirement #3) and returns the
// fixed interface bound to it. `repo` is an explicit "owner/name" override;
// when omitted, every builder that supports -R lets `gh` inherit the repo
// from its own cwd context instead.
//
// fetchBoard does NOT catch anything parseBoard throws — the truncation
// guard in model.js (totalCount > nodes.length) must propagate, never be
// swallowed here (requirement #4).
function createGh(repo) {
  const argv = buildArgv(repo);
  return {
    fetchBoard: () => parseBoard(JSON.parse(run(argv.fetchBoard()))),
    setLabels: (n, opts) => run(argv.setLabels(n, opts)),
    assign: (n, login) => run(argv.assign(n, login)),
    close: (n) => run(argv.close(n)),
    editBody: (n, body) => run(argv.editBody(n, body)),
    addBlocking: (n, targets) => run(argv.addBlocking(n, targets)),
    removeBlocking: (n, targets) => run(argv.removeBlocking(n, targets)),
    createIssue: (opts) => run(argv.createIssue(opts)),
    ensureLabel: (name) => run(argv.ensureLabel(name)),
    listLabels: () => JSON.parse(run(argv.listLabels())).map((l) => l.name),
    whoami: () => run(argv.whoami()).trim(),
    version: () => run(argv.version()).trim(),
  };
}

const defaultClient = createGh();

module.exports = {
  ...defaultClient,
  createGh,
  buildArgv,
  GhError,
};
