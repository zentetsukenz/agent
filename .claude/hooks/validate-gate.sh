#!/usr/bin/env bash
# loom → Claude Code harness gate.
#
# Runs scripts/validate.sh and blocks on NEW violations only. Violations recorded in
# validate-baseline.txt are known, ticketed breaks: tolerated so the gate stays usable,
# but never silently — `/validate` prints them every run.
#
# Modes:
#   post-edit  (PostToolUse) — only fires when the edited file is Markdown
#   stop       (Stop)        — always fires, catches deletes/renames/Bash-authored changes
#
# Exit 2 = blocking; stderr is fed back to the model.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BASELINE="$REPO_ROOT/.claude/hooks/validate-baseline.txt"
MODE="${1:-post-edit}"

payload="$(cat 2>/dev/null || true)"

# Never fight the harness: if Claude is already being blocked by this same Stop hook,
# let it through rather than looping.
if [[ "$MODE" == "stop" ]]; then
  active="$(printf '%s' "$payload" | jq -r '.stop_hook_active // false' 2>/dev/null)"
  [[ "$active" == "true" ]] && exit 0
fi

# A Write/Edit carries a file_path: skip the run unless it is Markdown. A Bash call carries
# no file_path but can still author Markdown via heredoc/sed/mv — so it always runs the gate.
# At ~200ms a full sweep, the unconditional run is cheaper than the class of miss it prevents.
if [[ "$MODE" == "post-edit" ]]; then
  file_path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
  if [[ -n "$file_path" ]]; then
    case "$file_path" in
      *.md) ;;
      *) exit 0 ;;
    esac
  fi
fi

cd "$REPO_ROOT" || exit 0

errors="$(bash scripts/validate.sh 2>&1 | grep '^ERROR:' || true)"

if [[ -f "$BASELINE" ]]; then
  known="$(grep -v '^[[:space:]]*#' "$BASELINE" | sed '/^[[:space:]]*$/d' | sort -u)"
else
  known=""
fi

new_errors="$(comm -23 \
  <(printf '%s\n' "$errors" | sed '/^[[:space:]]*$/d' | sort -u) \
  <(printf '%s\n' "$known" | sed '/^[[:space:]]*$/d' | sort -u))"

if [[ -n "$new_errors" ]]; then
  {
    printf 'loom gate FAILED — scripts/validate.sh reports violation(s) not in the baseline:\n\n'
    printf '%s\n' "$new_errors"
    printf '\nFix these before finishing. Full run: bash scripts/validate.sh\n'
    printf 'If a violation is genuinely accepted, it belongs in .claude/hooks/validate-baseline.txt WITH a tracking issue — never dropped silently.\n'
  } >&2
  exit 2
fi

exit 0
