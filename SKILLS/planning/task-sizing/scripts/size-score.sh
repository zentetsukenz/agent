#!/usr/bin/env bash
# size-score.sh — mechanical half of SKILLS/planning/task-sizing/SKILL.md.
#
# Encodes ONLY what's mechanical: sum the 5 dimension scores, band lookup,
# context-budget formula, confidence rule, and a self-consistency check on
# the band table. Mapping a task's real-world "files to read: 3-5" etc. to a
# 1/2/3 score stays human/agent judgment — this script never guesses that.
#
# Band table and threshold are sourced from SKILL.md's "### 3. Categorize"
# and "### 4. Estimate Context Budget" sections — do not edit the VALUES
# here without updating the SKILL first (this script is a mirror, not the
# source of truth).
#
# Bash 3.2 compatible (macOS default): no mapfile, no associative arrays.

set -euo pipefail

SELF="${BASH_SOURCE[0]##*/}"

usage() {
  cat <<EOF
Usage:
  $SELF <files_read> <files_write> <code_volume> <commands> <uncertainty> [--guessed N]
  $SELF --self-test
  $SELF --help

Dimension args (1=Low, 2=Medium, 3=High), in the SKILL's table order:
  files_read    Files to read     (1-2 / 3-5 / 6+)
  files_write   Files to write    (1 / 2-3 / 4+)
  code_volume   Code volume       (<50 / 50-200 / 200+ lines)
  commands      Commands to run   (0-1 / 2-4 / 5+)
  uncertainty   Uncertainty       (well-defined / some unknowns / exploratory)

--guessed N   Optional: how many of the 5 dimension scores above were
              estimated/guessed rather than known with certainty. Needed
              for the SKILL's confidence rule ("1-2 dimensions estimated"
              / "≥2 dimensions guessed"), which isn't derivable from the
              scores alone. Defaults to 0 (assume all certain).

--self-test   Verify the band table is self-consistent over s in [5,15]:
              coverage/disjoint, reachability, and no-straddle against the
              s > 8 split threshold. Exits 1 on any failure.

Output: a sizing summary (base_score, size, context_budget, confidence,
action) as YAML-ish lines, then a one-line human summary.
EOF
}

# --- band table (mirrors SKILL.md "### 3. Categorize") -------------------
# 5-6 Small · 7-8 Medium · 9+ Large. Threshold: split when score > 8.
band_for() {
  local s="$1"
  if ((s >= 5 && s <= 6)); then
    echo "Small"
  elif ((s >= 7 && s <= 8)); then
    echo "Medium"
  elif ((s >= 9)); then
    echo "Large"
  else
    echo "Invalid"
  fi
}

action_for() {
  case "$1" in
    Small) echo "direct" ;;
    Medium) echo "dispatch-preferred" ;;
    Large) echo "must-split" ;;
    *) echo "unknown" ;;
  esac
}

# --- self-consistency test (a2-decision.md "Self-consistency assertion") -
self_test() {
  local s
  local band
  local straddle
  local failures=0
  local small_seen=0 medium_seen=0 large_seen=0
  local small_true=0 small_false=0 medium_true=0 medium_false=0 large_true=0 large_false=0

  echo "Self-test over s in [5,15]:"

  for s in 5 6 7 8 9 10 11 12 13 14 15; do
    band="$(band_for "$s")"

    # (i) coverage/disjoint — band_for is an if/elif chain so it structurally
    # returns exactly one label per s; the only way coverage fails is a gap,
    # surfaced here as "Invalid".
    if [[ "$band" == "Invalid" ]]; then
      echo "  FAIL coverage: s=$s matched no band"
      ((failures += 1))
    fi

    if ((s > 8)); then straddle=1; else straddle=0; fi

    case "$band" in
      Small)
        small_seen=1
        if ((straddle)); then small_true=1; else small_false=1; fi
        ;;
      Medium)
        medium_seen=1
        if ((straddle)); then medium_true=1; else medium_false=1; fi
        ;;
      Large)
        large_seen=1
        if ((straddle)); then large_true=1; else large_false=1; fi
        ;;
    esac
  done

  # (ii) reachability — each band must be hit at least once over [5,15].
  if ((!small_seen)); then
    echo "  FAIL reachability: Small is unreachable over s in [5,15]"
    ((failures += 1))
  fi
  if ((!medium_seen)); then
    echo "  FAIL reachability: Medium is unreachable over s in [5,15]"
    ((failures += 1))
  fi
  if ((!large_seen)); then
    echo "  FAIL reachability: Large is unreachable over s in [5,15]"
    ((failures += 1))
  fi

  # (iii) no-straddle — s > 8 must be constant within every band that IS
  # reachable (a band that's empty can't straddle; that's reachability's job).
  if ((small_true && small_false)); then
    echo "  FAIL no-straddle: Small contains both s>8 and s<=8"
    ((failures += 1))
  fi
  if ((medium_true && medium_false)); then
    echo "  FAIL no-straddle: Medium contains both s>8 and s<=8"
    ((failures += 1))
  fi
  if ((large_true && large_false)); then
    echo "  FAIL no-straddle: Large contains both s>8 and s<=8"
    ((failures += 1))
  fi

  if ((failures == 0)); then
    echo "  PASS: coverage/disjoint, reachability, no-straddle all hold"
    return 0
  else
    echo "  $failures assertion(s) failed"
    return 1
  fi
}

# --- arg parsing -----------------------------------------------------------

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" || $# -eq 0 ]]; then
  usage
  exit 0
fi

if [[ "${1:-}" == "--self-test" ]]; then
  self_test
  exit $?
fi

if [[ $# -lt 5 ]]; then
  echo "ERROR: expected 5 dimension scores, got $#" >&2
  usage >&2
  exit 1
fi

files_read="$1"
files_write="$2"
code_volume="$3"
commands="$4"
uncertainty="$5"
shift 5

guessed=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --guessed)
      guessed="${2:?--guessed requires a number}"
      shift 2
      ;;
    *)
      echo "ERROR: unrecognized argument: $1" >&2
      exit 1
      ;;
  esac
done

for dim in "$files_read" "$files_write" "$code_volume" "$commands" "$uncertainty"; do
  if [[ ! "$dim" =~ ^[1-3]$ ]]; then
    echo "ERROR: dimension scores must be 1, 2, or 3 (got: $dim)" >&2
    exit 1
  fi
done

# --- sum / band / budget / confidence ---------------------------------------

base_score=$((files_read + files_write + code_volume + commands + uncertainty))
size="$(band_for "$base_score")"
action="$(action_for "$size")"

# Formula (SKILL.md "### 4. Estimate Context Budget"):
#   (files_read × 2%) + (files_write × 3%) + (commands × 1%)
context_budget=$((files_read * 2 + files_write * 3 + commands * 1))

# Confidence (SKILL.md "### 5. Assess Confidence"):
#   High: all dimensions certain, no unknowns
#   Medium: 1-2 dimensions estimated
#   Low: uncertainty == 3 OR >= 2 dimensions guessed
if ((uncertainty == 3 || guessed >= 2)); then
  confidence="Low"
elif ((guessed >= 1)); then
  confidence="Medium"
else
  confidence="High"
fi

cat <<EOF
sizing:
  dimensions:
    files_read: $files_read
    files_write: $files_write
    code_volume: $code_volume
    commands: $commands
    uncertainty: $uncertainty
  base_score: $base_score
  size: $size
  context_budget: ~${context_budget}%
  confidence: $confidence
  action: $action
EOF

echo "$size ($base_score) — $action, ~${context_budget}% context"
