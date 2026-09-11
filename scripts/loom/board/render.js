"use strict";

/**
 * renderTree(board) / renderMermaid(board) — read-only board renderers.
 * Both RETURN a string; neither does any I/O (no fs, no console, no process).
 *
 * Both root at each ticket with type === "map" and descend through the
 * incoming membership edge: a ticket `blocks` its map, so a map's children
 * are the tickets whose `blocking` array contains the map's number (D1/D2,
 * ADR-029 — same edge model.js's isMember/reachesMap walk, just inverted).
 *
 * Cycle guard follows model.js's `onPath` pattern: a set of numbers on the
 * current DFS stack, added on entry and removed on backtrack, so a cycle
 * just stops descending rather than hanging or throwing.
 */

// Build parentNumber -> [child tickets whose blocking includes parentNumber].
function buildChildIndex(board) {
  const index = new Map();
  for (const ticket of board.tickets) {
    for (const target of ticket.blocking) {
      if (!index.has(target)) index.set(target, []);
      index.get(target).push(ticket);
    }
  }
  return index;
}

function childrenOf(index, parentNumber) {
  return (index.get(parentNumber) || [])
    .slice()
    .sort((a, b) => a.number - b.number);
}

function formatLine(ticket, isMap) {
  const marker = ticket.state === "closed" ? "[CLOSED]" : "[OPEN]";
  const prefix = isMap ? "MAP " : "";
  return `${prefix}#${ticket.number} ${marker} ${ticket.title}`;
}

function walkTree(parent, index, depth, onPath, lines) {
  for (const child of childrenOf(index, parent.number)) {
    if (onPath.has(child.number)) continue; // cycle guard
    lines.push("  ".repeat(depth) + formatLine(child, false));
    onPath.add(child.number);
    walkTree(child, index, depth + 1, onPath, lines);
    onPath.delete(child.number);
  }
}

function renderTree(board) {
  const index = buildChildIndex(board);
  const maps = board.maps.slice().sort((a, b) => a.number - b.number);
  const lines = [];
  for (const map of maps) {
    lines.push(formatLine(map, true));
    walkTree(map, index, 1, new Set([map.number]), lines);
  }
  return lines.join("\n");
}

// Mermaid quoted labels break on an embedded `"` — replace with the `#quot;`
// entity mermaid recognises inside quoted node text. Everything else
// (`/`, `(`, `)`, `+`, em-dash) is safe once the label is quoted.
function escapeLabel(text) {
  return String(text).replace(/"/g, "#quot;");
}

function nodeId(number) {
  return `N${number}`;
}

function renderMermaid(board) {
  const index = buildChildIndex(board);
  const maps = board.maps.slice().sort((a, b) => a.number - b.number);
  const nodeLines = [];
  const edgeLines = [];
  const seenNodes = new Set();
  const closedNumbers = new Set();

  function addNode(ticket) {
    if (seenNodes.has(ticket.number)) return;
    seenNodes.add(ticket.number);
    nodeLines.push(`${nodeId(ticket.number)}["${escapeLabel(ticket.title)}"]`);
    if (ticket.state === "closed") closedNumbers.add(ticket.number);
  }

  function walk(parent, onPath) {
    for (const child of childrenOf(index, parent.number)) {
      if (onPath.has(child.number)) continue; // cycle guard
      addNode(child);
      edgeLines.push(`${nodeId(child.number)} --> ${nodeId(parent.number)}`);
      onPath.add(child.number);
      walk(child, onPath);
      onPath.delete(child.number);
    }
  }

  for (const map of maps) {
    addNode(map);
    walk(map, new Set([map.number]));
  }

  const lines = ["graph TD", ...nodeLines, ...edgeLines];
  if (closedNumbers.size > 0) {
    const closedIds = [...closedNumbers].sort((a, b) => a - b).map(nodeId);
    lines.push("classDef closed fill:#eee,stroke:#999,stroke-dasharray: 5 5;");
    lines.push(`class ${closedIds.join(",")} closed;`);
  }
  return lines.join("\n");
}

module.exports = { renderTree, renderMermaid };
