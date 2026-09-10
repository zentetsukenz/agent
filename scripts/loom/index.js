"use strict";

/**
 * index.js — the sole `console.log` + `process.exit` site in this codebase
 * (ADR-025 §7, ADR-027). Dispatches
 * `node scripts/loom/index.js <namespace> <verb> [flags]`. Namespace is
 * parsed as its own level even though `board` is the only one today —
 * ADR-027 mandates a single namespaced distributable, so `size`/`check`
 * land beside it later without restructuring this file.
 *
 * Every verb in board/verbs.js returns `{ok, payload, exitCode}` and never
 * prints or exits — this file is the ONLY place that turns an envelope into
 * stdout/stderr and a process exit.
 */

const gh = require("./board/gh.js");
const verbs = require("./board/verbs.js");

const VERSION = "0.1.0"; // hard-coded; a semver/pinning policy is deferred

const NAMESPACES = { board: ["read", "tree", "apply", "reconcile"] };

// Exit tiers (ADR-025 §8) — the class lives in the exit code, the cause in
// the JSON `error`. Reproduced here as the one literal lookup table.
const EXIT = Object.freeze({
  OK: 0, // success, INCLUDING an idempotent no-op (`noop: true` in payload)
  GENERIC: 1, // generic failure/bug, unknown namespace/verb
  CONFLICT: 2, // conflict/drift — the board moved underneath the caller
  PRECONDITION: 3, // precondition violation (blocked/closed/not-yours)
});

const HELP = `loom board <verb> [flags]

Verbs:
  read [--frontier] [--unmapped]   list tickets ({tickets, frontier})
  tree [--format=tree|mermaid]     render the map tree (RAW stdout, not JSON)
  apply <number> <transition>      run a transition (claim|dispatch|close|...)
  reconcile [--dry-run]            report/repair drift against the four rules

Global flags:
  --repo owner/name   override the repo gh resolves from cwd

--frontier + --unmapped together: both apply — tickets narrows to the
takeable set AND the unmapped field is still added (they compose, neither
flag overrides the other).

Exit codes: 0 ok (incl. no-op) / 1 generic / 2 conflict-drift / 3 precondition`;

// Pure argv parser — no fs, no process — the testability seam (requirement
// #7). `argv` is `process.argv.slice(2)`.
function parseArgv(argv) {
  if (argv[0] === "--help" || argv[0] === "-h") return { mode: "help" };
  if (argv[0] === "--version") return { mode: "version" };

  const namespace = argv[0];
  if (!Object.prototype.hasOwnProperty.call(NAMESPACES, namespace)) {
    return {
      mode: "error",
      message: `unknown namespace: "${namespace}"`,
      exitCode: EXIT.GENERIC,
    };
  }
  const verb = argv[1];
  if (!NAMESPACES[namespace].includes(verb)) {
    return {
      mode: "error",
      message: `unknown verb: "${verb}"`,
      exitCode: EXIT.GENERIC,
    };
  }

  const flags = {};
  const positional = [];
  let repo = null;
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--frontier") flags.frontier = true;
    else if (arg === "--unmapped") flags.unmapped = true;
    else if (arg === "--dry-run") flags.dryRun = true;
    else if (arg.startsWith("--format=")) flags.format = arg.slice("--format=".length);
    else if (arg === "--repo") repo = rest[++i];
    else if (arg.startsWith("--repo=")) repo = arg.slice("--repo=".length);
    else if (arg === "--pointer") flags.pointer = rest[++i];
    else if (arg === "--question") flags.question = rest[++i];
    else positional.push(arg);
  }

  return { mode: "run", namespace, verb, flags, positional, repo };
}

// verb name -> the opts shape verbs.js expects, built from parsed flags.
const VERB_OPTS = {
  read: (flags) => ({ frontier: flags.frontier, unmapped: flags.unmapped }),
  tree: (flags) => ({ format: flags.format }),
  reconcile: (flags) => ({ dryRun: flags.dryRun }),
  apply: (flags, positional) => ({
    number: Number(positional[0]),
    transition: positional[1],
    transitionOpts: { pointer: flags.pointer, question: flags.question },
  }),
};

function main(argv) {
  const parsed = parseArgv(argv);

  if (parsed.mode === "help") {
    console.log(HELP);
    process.exit(EXIT.OK);
  }
  if (parsed.mode === "version") {
    console.log(VERSION);
    process.exit(EXIT.OK);
  }
  if (parsed.mode === "error") {
    console.error(parsed.message);
    console.error(HELP);
    process.exit(parsed.exitCode);
  }

  const client = parsed.repo ? gh.createGh(parsed.repo) : gh;
  const opts = VERB_OPTS[parsed.verb](parsed.flags, parsed.positional);
  const result = verbs[parsed.verb](opts, client);

  // tree is the ONLY non-JSON stdout (requirement #4) — but only on
  // success, since an error envelope has no `rendering` to print raw.
  if (parsed.verb === "tree" && result.ok) {
    console.log(result.payload.rendering);
  } else {
    console.log(JSON.stringify(result));
  }
  process.exit(result.exitCode);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { parseArgv };
