#!/usr/bin/env bash
# loom's third gate. validate.sh gates prose, quality.sh gates code, this gates CONTEXT —
# the committed knowledge graph that AGENTS.md tells every agent to bootstrap from.
#
# It exists because nothing else catches a wrong graph. graphify's own health check is explicitly
# non-aborting ("do not abort — the graph is still usable"), and `graph.json` is a post-build
# serialization whose own diagnose notes say it "cannot recover raw producer edges" — so a clean
# diagnose is not evidence of a clean build. Every check here compares the graph to the corpus.
#
# The failure this was built for: ADR-013's canonical node sat at degree 0 while a phantom minted
# by a citing file collected all its edges. "What references ADR-013?" answered nothing, with
# complete confidence. That is worse than having no graph at all.

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR" || exit 1

exec node scripts/graph/check.js "$@"
