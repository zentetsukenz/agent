#!/usr/bin/env bash
# loom quality baseline — the committed floor for scripts/loom/, loom's only distributable.
#
# This script IS the baseline. Per wiki/patterns/quality-baseline.md the preferred home for a
# project's floor is its own committed tooling, with loom recording only a pointer to the command
# that runs it — never a second copy in prose that can drift from the commands it describes.
#
# Ratchet: these floors may be raised, never lowered (ADR-017).
#
#   lint          0 syntax errors
#   code-quality  none — no complexity/duplication tool; the distributable is small, reviewed by hand
#   security      none — zero third-party dependencies (Node built-ins + `gh`), no scan surface
#   coverage      123/123 tests passing, no regression below 123
#
# Two command shapes below are load-bearing. Do not "simplify" them:
#   * `node --check` validates only its FIRST argument, so a bare `**/*.js` would leave every file
#     after the first unchecked. Lint runs it once per file via `xargs -0 -n1`.
#   * `node --test <dir>` executes an `index.js` in that directory instead of scanning for
#     `*.test.js`, so coverage passes a QUOTED glob and lets Node do test-file discovery.
# Both verified on Node v26.

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR" || exit 1

COVERAGE_FLOOR=123
failed=0

printf '== lint ==\n'
if find scripts/loom scripts/graph -name '*.js' -print0 | xargs -0 -n1 node --check; then
  printf 'lint: 0 syntax errors\n\n'
else
  printf 'lint: FAILED — syntax errors above\n\n' >&2
  failed=1
fi

printf '== coverage ==\n'
test_output="$(node --test 'scripts/**/*.test.js' 2>&1)"
test_status=$?
printf '%s\n' "$test_output" | tail -20

passing="$(printf '%s\n' "$test_output" | sed -n 's/^# pass \([0-9][0-9]*\)$/\1/p' | tail -1)"
: "${passing:=0}"

if [[ "$test_status" -ne 0 ]]; then
  printf 'coverage: FAILED — see output above\n' >&2
  failed=1
elif [[ "$passing" -lt "$COVERAGE_FLOOR" ]]; then
  printf 'coverage: RATCHET BROKEN — %s passing, floor is %s\n' "$passing" "$COVERAGE_FLOOR" >&2
  failed=1
else
  printf 'coverage: %s passing (floor %s)\n' "$passing" "$COVERAGE_FLOOR"
  if [[ "$passing" -gt "$COVERAGE_FLOOR" ]]; then
    printf 'coverage: floor may be raised to %s — the ratchet only turns one way\n' "$passing"
  fi
fi

printf '\n'
if [[ "$failed" -ne 0 ]]; then
  printf 'quality baseline: FAILED\n' >&2
  exit 1
fi
printf 'quality baseline: all floors met\n'
