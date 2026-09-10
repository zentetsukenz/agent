"use strict";

/**
 * parseBoard(rawIssues) — pure transform from raw `gh issue list --json` output
 * to a normalised board. Zero I/O: takes data in, returns data out.
 *
 * Returned shape:
 *   {
 *     tickets: Ticket[],           // one per raw issue, in input order
 *     byNumber: Map<number, Ticket>,
 *     maps: Ticket[],              // tickets with type === "map"
 *   }
 *
 * Ticket shape:
 *   {
 *     number: number,
 *     state: "open" | "closed",    // lowercased from gh's "OPEN" / "CLOSED"
 *     title: string,
 *     url: string,
 *     body: string,
 *     type: string | null,         // stripped "wayfinder:*" label, else null
 *     status: string | null,       // stripped "sdlc:*" label, else null
 *     assignees: object[],         // raw assignee objects, normalised to a plain array
 *     blockedBy: number[],         // issue numbers, normalised from {nodes,totalCount}
 *     blocking: number[],          // issue numbers, normalised from {nodes,totalCount}
 *     parent: number | null,       // raw parent issue number, carried through for
 *                                  // B5b's migration rule ONLY — do not use this for
 *                                  // membership (see D2 / ADR-029; that is B3's job).
 *   }
 *
 * No raw `labels` field is present on the ticket (ADR-025 §8 — read-side mirror of
 * hiding labels on the write side).
 */

// gh is inconsistent: `assignees` is a plain array but `blockedBy`/`blocking` are
// `{nodes, totalCount}`. Accept either shape so a future gh change (or a caller
// passing the wrong field) degrades to an empty list instead of `undefined`.
function toNodeArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.nodes)) return value.nodes;
  return [];
}

// Single helper for both "wayfinder:" (type) and "sdlc:" (status): find labels with
// the prefix, strip it, and throw if gh returned more than one — silently picking
// the first would hide real data corruption.
function parseSingleLabel(labels, prefix, issueNumber) {
  const matches = labels
    .filter((label) => label.name.startsWith(prefix))
    .map((label) => label.name.slice(prefix.length));
  if (matches.length > 1) {
    throw new Error(
      `issue #${issueNumber}: multiple "${prefix}*" labels found: ${matches.join(", ")}`,
    );
  }
  return matches.length === 1 ? matches[0] : null;
}

// Normalise a {nodes, totalCount} relationship field to an array of issue numbers.
// Throws if totalCount claims more nodes than were actually returned — a silent
// truncation would make membership/takeable computations (B3+) wrong without warning.
function normaliseEdge(field, issueNumber, fieldName) {
  const nodes = toNodeArray(field);
  const totalCount =
    field && typeof field.totalCount === "number"
      ? field.totalCount
      : nodes.length;
  if (totalCount > nodes.length) {
    throw new Error(
      `issue #${issueNumber}: ${fieldName} truncated — totalCount ${totalCount} > ${nodes.length} nodes returned`,
    );
  }
  return nodes.map((node) => node.number);
}

function parseTicket(raw) {
  const labels = Array.isArray(raw.labels) ? raw.labels : [];
  return {
    number: raw.number,
    state: typeof raw.state === "string" ? raw.state.toLowerCase() : raw.state,
    title: raw.title,
    url: raw.url,
    body: raw.body,
    type: parseSingleLabel(labels, "wayfinder:", raw.number),
    status: parseSingleLabel(labels, "sdlc:", raw.number),
    assignees: toNodeArray(raw.assignees),
    blockedBy: normaliseEdge(raw.blockedBy, raw.number, "blockedBy"),
    blocking: normaliseEdge(raw.blocking, raw.number, "blocking"),
    parent: raw.parent ? raw.parent.number : null,
  };
}

function parseBoard(rawIssues) {
  const tickets = rawIssues.map(parseTicket);
  const byNumber = new Map(tickets.map((ticket) => [ticket.number, ticket]));
  const maps = tickets.filter((ticket) => ticket.type === "map");
  return { tickets, byNumber, maps };
}

// member ≡ type = map ∨ ∃ blocking-chain from this ticket to a map (ADR-029 D1).
// `onPath` tracks the current DFS stack (added on entry, removed on backtrack) so
// a cycle is detected as "this path doesn't reach a map" — not a throw, not a hang
// — while a node visited on one branch and later revisited via a *different*
// branch (a diamond, not a cycle) is still explored correctly.
// ponytail: no cross-ticket memo. A false returned because a cycle guard tripped
// is only valid for that path, not for the node overall (a node can be unreachable
// via one branch but reachable via a sibling branch), so caching it would be wrong.
// The board is a few dozen tickets — a fresh O(V) walk per ticket costs nothing
// here; add real memoisation only if board size stops being small.
function reachesMap(ticket, byNumber, onPath) {
  if (ticket.type === "map") return true;
  if (onPath.has(ticket.number)) return false;
  onPath.add(ticket.number);
  const result = ticket.blocking.some((num) => {
    const target = byNumber.get(num);
    return target ? reachesMap(target, byNumber, onPath) : false;
  });
  onPath.delete(ticket.number);
  return result;
}

function isMember(ticket, byNumber) {
  return reachesMap(ticket, byNumber, new Set());
}

// A blocker only blocks if ITS OWN current state is open — resolved through
// byNumber, since blockedBy/blocking are already just issue numbers (B2 strips
// any embedded node fields), so there is no snapshot state to accidentally read.
function hasOpenBlocker(ticket, byNumber) {
  return ticket.blockedBy.some((num) => {
    const blocker = byNumber.get(num);
    return blocker ? blocker.state === "open" : false;
  });
}

// takeable ≡ member ∧ type ≠ map ∧ state = open ∧ no OPEN blocker ∧ unassigned
// (ADR-029 D1/D2 — 5 conjuncts). `type !== "map"` stays explicit belt-and-braces:
// pre-migration a map has no incoming blocking edges yet, so nothing else would
// exclude it.
function takeable(ticket, board) {
  return (
    isMember(ticket, board.byNumber) &&
    ticket.type !== "map" &&
    ticket.state === "open" &&
    !hasOpenBlocker(ticket, board.byNumber) &&
    ticket.assignees.length === 0
  );
}

// frontier(board) — every takeable ticket number, sorted for deterministic output.
function frontier(board) {
  return board.tickets
    .filter((ticket) => takeable(ticket, board))
    .map((ticket) => ticket.number)
    .sort((a, b) => a - b);
}

// unmapped ≡ state = open ∧ ¬member — open tickets no map's blocking chain reaches.
function unmapped(board) {
  return board.tickets
    .filter(
      (ticket) => ticket.state === "open" && !isMember(ticket, board.byNumber),
    )
    .map((ticket) => ticket.number)
    .sort((a, b) => a - b);
}

// --- B4a/B4b: planTransition — the precondition core (claim, dispatch, close) ---
//
// planTransition(board, number, transition, {actor, pointer}) never executes
// anything: it RETURNS a description of the mutation (or a refusal). Only the
// caller (verbs.js, task C2) turns `calls[]` into real `gh` invocations
// (gh.js, task C1) — this file stays zero-I/O.
//
// `calls[]` descriptor schema — the caller-facing contract for C1/verbs.js.
// This is the entire vocabulary this task emits; a later task EXTENDS this
// comment (adds `op` values), never silently changes an existing shape:
//   { op: "assign", number: number, login: string }
//     — assign `login` to issue `number`. (gh.js: assign(number, login))
//   { op: "addLabel", number: number, name: string }
//     — add label `name` to issue `number`. (gh.js: setLabels(number, {add:[name]}))
//   { op: "editBody", number: number, body: string }
//     — replace issue `number`'s body with the full new `body` (B4b/close:
//       carries the map's body with the pointer line appended).
//   { op: "close", number: number }
//     — close issue `number`. (gh.js: close(number))
//   { op: "createIssue", title: string, body: string, labels: string[] }
//     — create a brand-new issue (open-clarification/B4c: the surfaced
//       wayfinder:grilling ticket). No `number` — the issue doesn't exist
//       yet; `changed[]` stays empty for a pure creation, there being no
//       existing ticket whose field changed.
//
// `changed[]` is the audit trail of RESULTING state, computed before any of
// `calls[]` runs (design-decisions §Seam 2 — so the trail can never drift
// from what actually happened): { number: number, field: string, to: string }.
//
// Exit tiers (ADR-025 §8): 0 success (incl. noop), 1 generic, 2 conflict/
// drift (the board moved underneath — NOT used by claim/dispatch, which are
// pure preconditions), 3 precondition violation (the caller asked for
// something invalid given the board's current state).

// All six ADR-025 §8 transition names. `switch` below implements only
// `claim`/`dispatch` (this task) — the rest fall through to "not yet
// implemented" (exitCode 1) until B4b lands, same as a truly unknown name.
const KNOWN_TRANSITIONS = new Set([
  "claim",
  "dispatch",
  "close",
  "graduate-recharter",
  "open-clarification",
  "seed-regression-map",
]);

function planClaim(ticket, opts) {
  const actor = opts.actor;
  const assignedLogins = ticket.assignees.map((assignee) => assignee.login);
  if (assignedLogins.length > 0) {
    if (assignedLogins.includes(actor)) {
      return { changed: [], noop: true, calls: [] };
    }
    return {
      error: `#${ticket.number} is already assigned to ${assignedLogins.join(", ")}`,
      exitCode: 3,
    };
  }
  return {
    changed: [{ number: ticket.number, field: "assignee", to: actor }],
    noop: false,
    calls: [{ op: "assign", number: ticket.number, login: actor }],
  };
}

function planDispatch(ticket, byNumber) {
  if (ticket.state === "closed") {
    return { error: `#${ticket.number} is closed`, exitCode: 3 };
  }
  if (hasOpenBlocker(ticket, byNumber)) {
    return { error: `#${ticket.number} is blocked`, exitCode: 3 };
  }
  return {
    changed: [{ number: ticket.number, field: "status", to: "in-progress" }],
    noop: false,
    calls: [
      { op: "addLabel", number: ticket.number, name: "sdlc:in-progress" },
    ],
  };
}

// findMap walks the child→parent membership edge (`ticket.blocking`, same
// edge `reachesMap`/`isMember` use — ADR-029 D1) to the map this ticket
// belongs to, returning the map ticket itself or null if no `blocking` chain
// reaches one. Same cycle guard as `reachesMap`: a path that revisits a node
// it's already on returns null for that path, not a hang/throw.
function findMap(ticket, byNumber, onPath) {
  if (ticket.type === "map") return ticket;
  if (onPath.has(ticket.number)) return null;
  onPath.add(ticket.number);
  let found = null;
  for (const num of ticket.blocking) {
    const target = byNumber.get(num);
    if (target) {
      found = findMap(target, byNumber, onPath);
      if (found) break;
    }
  }
  onPath.delete(ticket.number);
  return found;
}

const DECISIONS_HEADING = "## Decisions so far";

// Insert `pointerLine` as the last bullet of the `## Decisions so far`
// section (immediately before the next `## ` heading, or end of body if it's
// the last section) — matching the fixture's existing bullet-list style
// (bullets separated by a single newline, one blank line before the next
// heading).
function appendPointerLine(body, headingIndex, pointerLine) {
  const searchFrom = headingIndex + DECISIONS_HEADING.length;
  const nextHeadingIndex = body.indexOf("\n## ", searchFrom);
  const cutAt = nextHeadingIndex === -1 ? body.length : nextHeadingIndex;
  const before = body.slice(0, cutAt).replace(/\n+$/, "");
  const after = body.slice(cutAt);
  return `${before}\n${pointerLine}\n${after}`;
}

// planClose — B4b. Resolves the ticket's map via the child→parent membership
// edge (`opts.pointer` supplies the gist for the appended line, since a
// ticket's own title/url are already on hand from `ticket`), appends a
// pointer line under the map's `## Decisions so far` heading, and plans a
// body rewrite + close. No map, or a map body missing that heading, is a
// precondition violation (exitCode 3) — never invented or silently dropped.
function planClose(ticket, byNumber, opts) {
  if (ticket.state === "closed") {
    return { changed: [], noop: true, calls: [] };
  }
  const map = findMap(ticket, byNumber, new Set());
  if (!map) {
    return {
      error: `#${ticket.number} has no map (no child→parent membership edge)`,
      exitCode: 3,
    };
  }
  const headingIndex = map.body.indexOf(DECISIONS_HEADING);
  if (headingIndex === -1) {
    return {
      error: `map #${map.number} body has no "${DECISIONS_HEADING}" heading`,
      exitCode: 3,
    };
  }
  const gist = opts && opts.pointer;
  if (!gist) {
    return { error: "close requires opts.pointer (a gist)", exitCode: 1 };
  }
  const pointerLine = `- [${ticket.title}](${ticket.url}) — ${gist}`;
  if (map.body.includes(pointerLine)) {
    return { changed: [], noop: true, calls: [] };
  }
  const newBody = appendPointerLine(map.body, headingIndex, pointerLine);
  return {
    changed: [
      { number: ticket.number, field: "state", to: "closed" },
      { number: map.number, field: "body", to: newBody },
    ],
    noop: false,
    calls: [
      { op: "editBody", number: map.number, body: newBody },
      { op: "close", number: ticket.number },
    ],
  };
}

// planOpenClarification — SKILL.md `open-clarification`: "The run hit spec
// ambiguity. Open a wayfinder:grilling ticket and surface it to the human."
// Plainly settled: create a wayfinder:grilling issue. `opts.question` is the
// ambiguity to surface (the ticket's title/body) — a missing question is a
// generic-usage error (exitCode 1), not a board precondition (ticket's own
// state is irrelevant to opening an unrelated new issue).
function planOpenClarification(ticket, opts) {
  const question = opts && opts.question;
  if (!question) {
    return {
      error:
        "open-clarification requires opts.question (the ambiguity to surface)",
      exitCode: 1,
    };
  }
  const title = `Clarify: ${question}`;
  const body = `Raised while working #${ticket.number} ("${ticket.title}").\n\n${question}`;
  return {
    changed: [],
    noop: false,
    calls: [
      {
        op: "createIssue",
        title,
        body,
        labels: ["wayfinder:grilling"],
      },
    ],
  };
}

// planGraduateRecharter — SKILL.md `graduate-recharter`: "Graduate it to a
// sub-map (see nesting) and re-chart." The nesting rule says a ticket "may
// graduate into its own sub-map... The parent ticket links its sub-map" —
// but never says WHO creates the sub-map (the transition itself, vs. only
// flagging the leaf for a human to re-chart), nor whether the new sub-map
// needs a `blocking` edge back to become a member (ADR-029 membership) even
// though the text implies "linking". Both are listed unsettled candidates —
// not plainly settled, so this returns a gap rather than inventing either.
function planGraduateRecharter(ticket) {
  return {
    error: `transition "graduate-recharter" for #${ticket.number}: doctrine does not settle whether this transition creates the sub-map itself or only flags the leaf for a human to re-chart, nor whether a created sub-map needs a blocking edge to become a member (ADR-029) — not implemented`,
    exitCode: 1,
  };
}

// planSeedRegressionMap — SKILL.md `seed-regression-map`: fully specified in
// prose ("Seed a fresh root map... link the CI evidence, and open its first
// frontier ticket as a wayfinder:grilling triage... Then close the
// qa:regression-failed ticket"), BUT two inputs are not sourced anywhere in
// the doctrine: (1) `<X>`, the failing check's name/CI evidence, and (2)
// whether the new frontier ticket needs a `blocking` edge to the new map to
// count as a member (ADR-029) — the same unsettled candidate as
// graduate-recharter. Even if opts supplied `<X>`, (2) still isn't settled,
// so this is a doctrine gap, not an opts gap — checked first regardless of
// opts.
function planSeedRegressionMap(ticket) {
  return {
    error: `transition "seed-regression-map" for #${ticket.number}: doctrine does not settle whether the new frontier ticket needs a blocking edge to the new map to become a member (ADR-029), nor where <X> (the failing check name/CI evidence) is sourced from if not opts — not implemented`,
    exitCode: 1,
  };
}

// --- planReconcile — repo-wide drift detection (rules 2 and 3 only) ---
//
// planReconcile(board, existingLabelNames) never executes anything: it
// RETURNS a description of repairs (mirrors planTransition). Only the
// caller (task C2) turns `repairs[]` into real `gh` invocations.
//
// `repairs[]` descriptor schema — the caller-facing contract for C2.
// Reuses `calls[]`'s `op` names where they fit (`close`), plus one new op
// this task introduces (`ensureLabel`). A later task EXTENDS this comment
// (adds more `op` values for rules 1/4 if they are ever un-dropped), never
// silently changes an existing shape:
//   { op: "close", number: number, reason: string }
//     — issue `number` has status "done" but is still open (rule 2).
//   { op: "ensureLabel", name: string, reason: string }
//     — repo-level label `name` (a loom vocabulary name) has no definition
//       on the repo (rule 3). This is a repo label DEFINITION repair — it
//       never touches any issue's labels.
//   { op: "addBlocking", number: number, target: number, reason: string }
//     — issue `number` has a legacy `parent` edge to `target` but its
//       `blocking` array does not yet contain `target` (rule 5, the
//       parent -> blocking migration). Adds the `blocking` edge; the
//       `parent` field itself is left untouched (out of scope) and no
//       ticket state is considered — closed sources are repaired too
//       (ADR-029 membership must survive closure).
//
// Every repair carries a human-readable `reason` — reconcile reports every
// repair, never silent.
//
// Rules 1 (parse "Blocked by:" prose for edges) and 4 (detach closed
// tickets from maps) are DROPPED (design decision D3) and MUST NOT be
// reintroduced here: rule 1 would invent edges from ordinary paragraph text
// (issues #17/#18/#19 contain "Blocked by:" in prose, not real edges); rule
// 4 would detach closed tickets from their maps under ADR-029 membership.

// The loom vocabulary: the exact 10 label names reconcile checks for
// (rule 3). NOT GitHub's default label set — that's unrelated (a prior
// finding conflated the two, counting 19 defaults instead of this list).
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

// Rule 2 — status "done" but still open: emit a close repair.
function planReconcileDone(board) {
  return board.tickets
    .filter((ticket) => ticket.status === "done" && ticket.state === "open")
    .map((ticket) => ({
      op: "close",
      number: ticket.number,
      reason: `#${ticket.number} has status "done" but is still open`,
    }));
}

// Rule 3 — missing repo-level label definitions: emit an ensureLabel repair
// per loom vocabulary name absent from `existingLabelNames`. Takes the
// existing names as an argument (not fetched here) to keep this function
// pure/zero-I/O.
function planReconcileLabels(existingLabelNames) {
  const existing = new Set(existingLabelNames || []);
  return LOOM_LABEL_NAMES.filter((name) => !existing.has(name)).map(
    (name) => ({
      op: "ensureLabel",
      name,
      reason: `repo has no label definition for "${name}"`,
    }),
  );
}

// Rule 5 — parent -> blocking migration: for every ticket with a legacy
// `parent`, emit an addBlocking repair if `blocking` doesn't already carry
// the equivalent edge. No state filter — closed sources are repaired too
// (ADR-029 membership must survive closure). Sorted by source number for
// deterministic output (D1's transcript must be reproducible).
function planReconcileParentMigration(board) {
  return board.tickets
    .filter(
      (ticket) =>
        ticket.parent != null && !ticket.blocking.includes(ticket.parent),
    )
    .map((ticket) => ({
      op: "addBlocking",
      number: ticket.number,
      target: ticket.parent,
      reason: `#${ticket.number} has legacy parent #${ticket.parent} not yet reflected in blocking`,
    }))
    .sort((a, b) => a.number - b.number);
}

function planReconcile(board, existingLabelNames) {
  return {
    repairs: [
      ...planReconcileDone(board),
      ...planReconcileLabels(existingLabelNames),
      ...planReconcileParentMigration(board),
    ],
  };
}

function planTransition(board, number, transition, opts) {
  if (!KNOWN_TRANSITIONS.has(transition)) {
    return { error: `unknown transition: "${transition}"`, exitCode: 1 };
  }
  const ticket = board.byNumber.get(number);
  if (!ticket) {
    return { error: `unknown issue number: #${number}`, exitCode: 3 };
  }
  switch (transition) {
    case "claim":
      return planClaim(ticket, opts || {});
    case "dispatch":
      return planDispatch(ticket, board.byNumber);
    case "close":
      return planClose(ticket, board.byNumber, opts || {});
    case "open-clarification":
      return planOpenClarification(ticket, opts || {});
    case "graduate-recharter":
      return planGraduateRecharter(ticket);
    case "seed-regression-map":
      return planSeedRegressionMap(ticket);
    default:
      return {
        error: `transition "${transition}" not yet implemented`,
        exitCode: 1,
      };
  }
}

module.exports = {
  parseBoard,
  takeable,
  frontier,
  unmapped,
  planTransition,
  planReconcile,
};
