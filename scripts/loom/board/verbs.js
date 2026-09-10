"use strict";

/**
 * verbs.js — the four `loom board` verbs (ADR-025 §8): read, tree, apply,
 * reconcile. Composes model.js (pure planning) with gh.js (the only I/O
 * boundary). Every verb RETURNS `{ok, payload, exitCode}` or
 * `{ok:false, error, exitCode}` — none of them print or terminate the
 * process; index.js (a later task) owns turning the envelope into a
 * printed result and a matching exit status.
 *
 * `gh` is a parameter with a default (`= require("./gh.js")`), never a
 * hardcoded import used directly — that default IS the injection seam: a
 * test passes a fake recording object instead, so no verb here ever spawns
 * a real process.
 */

const gh = require("./gh.js");
const {
  takeable,
  frontier,
  unmapped,
  planTransition,
  planReconcile,
} = require("./model.js");
const { renderTree, renderMermaid } = require("./render.js");

// Any throw from a verb body (a GhError from gh.js, or parseBoard's
// truncation guard) lands here rather than escaping — every verb always
// returns an envelope, never throws.
function guard(fn) {
  try {
    return fn();
  } catch (err) {
    return {
      ok: false,
      error: { message: err.message, name: err.name || "Error" },
      exitCode: err.exitClass || 1,
    };
  }
}

// The read-side ticket mirror (ADR-025 §8): number, title, url, type,
// status, assignee, blockedBy, state, takeable. No raw `labels` — the
// read-side mirror of hiding labels on the write side. `assignee` is
// singular (the envelope's own vocabulary), taken as the first assignee's
// login or null; model.js's `assignees` (plural, raw objects) never
// escapes this function.
function toTicketPayload(ticket, board) {
  return {
    number: ticket.number,
    title: ticket.title,
    url: ticket.url,
    type: ticket.type,
    status: ticket.status,
    assignee: ticket.assignees.length > 0 ? ticket.assignees[0].login : null,
    blockedBy: ticket.blockedBy,
    state: ticket.state,
    takeable: takeable(ticket, board),
  };
}

// read [--frontier] [--unmapped] — default payload stays minimal:
// {tickets, frontier}. `--frontier` narrows `tickets` to the takeable set
// (still full mirrors, just fewer of them). `--unmapped` ADDS an
// `unmapped` field; it is a flag on `read`, never a fifth verb.
function read(opts = {}, client = gh) {
  return guard(() => {
    const board = client.fetchBoard();
    const allTickets = board.tickets.map((ticket) =>
      toTicketPayload(ticket, board),
    );
    const frontierNumbers = frontier(board);
    const takeableNumbers = new Set(frontierNumbers);
    const tickets = opts.frontier
      ? allTickets.filter((t) => takeableNumbers.has(t.number))
      : allTickets;
    const payload = { tickets, frontier: frontierNumbers };
    if (opts.unmapped) payload.unmapped = unmapped(board);
    return { ok: true, payload, exitCode: 0 };
  });
}

// tree [--format=tree|mermaid] — SELECTS one renderer, never concatenates.
function tree(opts = {}, client = gh) {
  return guard(() => {
    const board = client.fetchBoard();
    const format = opts.format === "mermaid" ? "mermaid" : "tree";
    const rendering =
      format === "mermaid" ? renderMermaid(board) : renderTree(board);
    return { ok: true, payload: { format, rendering }, exitCode: 0 };
  });
}

// planTransition's calls[] op -> the gh.js method that executes it.
const CALL_HANDLERS = {
  assign: (client, call) => client.assign(call.number, call.login),
  addLabel: (client, call) =>
    client.setLabels(call.number, { add: [call.name] }),
  editBody: (client, call) => client.editBody(call.number, call.body),
  close: (client, call) => client.close(call.number),
  createIssue: (client, call) =>
    client.createIssue({
      title: call.title,
      body: call.body,
      labels: call.labels,
    }),
};

// apply <number> <transition> [transitionOpts] — `actor` comes from
// `gh.whoami()` HERE, never from model.js (which stays zero-I/O). On a
// refusal (`result.error` set), returns it verbatim WITHOUT executing
// anything — the `for` loop below is only reached when planTransition did
// NOT refuse, so a refused plan structurally cannot touch `calls[]`.
function apply(opts = {}, client = gh) {
  return guard(() => {
    const actor = client.whoami();
    const board = client.fetchBoard();
    const result = planTransition(board, opts.number, opts.transition, {
      ...opts.transitionOpts,
      actor,
    });
    if (result.error !== undefined) {
      return { ok: false, error: { message: result.error }, exitCode: result.exitCode };
    }
    for (const call of result.calls) {
      CALL_HANDLERS[call.op](client, call);
    }
    return {
      ok: true,
      payload: { changed: result.changed, noop: result.noop },
      exitCode: 0,
    };
  });
}

// planReconcile's repairs[] op -> the gh.js method that executes it.
const REPAIR_HANDLERS = {
  close: (client, repair) => client.close(repair.number),
  ensureLabel: (client, repair) => client.ensureLabel(repair.name),
  addBlocking: (client, repair) =>
    client.addBlocking(repair.number, [repair.target]),
};

// reconcile [--dry-run] — reports EVERY repair, always. `--dry-run` is
// enforced STRUCTURALLY: the write loop lives inside `if (!dryRun)`, so
// there is no code path in this function that executes a repair when
// dryRun is true — a caller cannot get writes by passing a truthy-ish
// value through some other channel, because there IS no other channel.
function reconcile(opts = {}, client = gh) {
  return guard(() => {
    const board = client.fetchBoard();
    const existingLabelNames = client.listLabels();
    const { repairs } = planReconcile(board, existingLabelNames);
    const dryRun = !!opts.dryRun;
    if (!dryRun) {
      for (const repair of repairs) {
        REPAIR_HANDLERS[repair.op](client, repair);
      }
    }
    return { ok: true, payload: { repairs, dryRun }, exitCode: 0 };
  });
}

module.exports = { read, tree, apply, reconcile };
