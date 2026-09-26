"use strict";

// Copies graphify's own extraction stamps into loom's committed record, after graphify's
// `--update` flow has run.
//
// graphify stamps a file's content hash in graphify-out/manifest.json only when that file's
// extraction actually produced output (upstream #2015), and its manifest keys are repo-relative
// (#1417). That is exactly the record the freshness check needs — but this repo does not commit
// the manifest (its mtime/seen fields churn on every run). So this copies the semantic hashes, and
// nothing else, into graphify-out/extracted.json, which is committed and which graphify never
// writes. loom's own chunk path stamps the same record from merge-extraction.js.

const fs = require("node:fs");
const path = require("node:path");
const { loadStamps, writeStamps } = require("./lib.js");

// The stamps graphify vouches for: files with a non-empty semantic hash, i.e. a document whose
// extraction produced output. Code files carry only an AST hash and are rebuilt by graphify's
// post-commit hook; freshness is checked for Markdown.
function stampsFromManifest(manifest) {
  const out = {};
  for (const [file, entry] of Object.entries(manifest || {})) {
    if (!entry || typeof entry !== "object") continue;
    if (path.isAbsolute(file)) continue;
    if (typeof entry.semantic_hash === "string" && entry.semantic_hash) out[file] = entry.semantic_hash;
  }
  return out;
}

function main() {
  const rootDir = path.resolve(__dirname, "..", "..");
  const manifestPath = path.join(rootDir, "graphify-out", "manifest.json");
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (err) {
    process.stderr.write(`stamp: cannot read ${manifestPath} — run graphify's --update first (${err.message})\n`);
    process.exit(1);
  }

  const fromGraphify = stampsFromManifest(manifest);
  const stamps = { ...(loadStamps(rootDir) || {}), ...fromGraphify };
  writeStamps(rootDir, stamps);
  process.stdout.write(`stamp: ${Object.keys(fromGraphify).length} file(s) stamped from graphify's manifest\n`);
}

if (require.main === module) main();

module.exports = { stampsFromManifest };
