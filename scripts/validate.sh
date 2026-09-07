#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="${BASH_SOURCE[0]%/*}"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

shopt -s nullglob

failures=0
skills_validated=0
wiki_validated=0
mirai_validated=0
opencode_validated=0
hermes_validated=0
links_checked=0
anchors_checked=0
orphans_flagged=0
registry_checked=0
mirai_present=0
opencode_present=0
hermes_present=0

report_error() {
  local file="$1"
  local message="$2"

  printf 'ERROR: %s: %s\n' "$file" "$message" >&2
  ((failures += 1))
}

strip_yaml_scalar() {
  local value="$1"

  value="${value#${value%%[![:space:]]*}}"
  value="${value%${value##*[![:space:]]}}"

  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value#\"}"
    value="${value%\"}"
  elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
    value="${value#\'}"
    value="${value%\'}"
  fi

  printf '%s' "$value"
}

frontmatter_value() {
  local file="$1"
  local key="$2"
  local output
  local status

  set +e
  output="$(awk -v key="$key" '
    NR == 1 {
      if ($0 != "---") {
        status = 2
        exit
      }
      in_frontmatter = 1
      next
    }

    in_frontmatter && $0 == "---" {
      closed = 1
      exit
    }

    in_frontmatter {
      line = $0
      pattern = "^[[:space:]]*" key ":[[:space:]]*"
      if (line ~ pattern) {
        sub(pattern, "", line)
        print line
        found = 1
      }
    }

    END {
      if (status) {
        exit status
      }
      if (NR == 0) {
        exit 2
      }
      if (!closed) {
        exit 3
      }
      if (!found) {
        exit 4
      }
    }
  ' "$file")"
  status=$?

  FRONTMATTER_VALUE="$output"
  return "$status"
}

frontmatter_error() {
  local status="$1"
  local key="$2"

  case "$status" in
    2) printf 'missing opening YAML frontmatter fence --- on first line' ;;
    3) printf 'missing closing YAML frontmatter fence ---' ;;
    4) printf 'missing required frontmatter key %s' "$key" ;;
    *) printf 'could not parse YAML frontmatter key %s' "$key" ;;
  esac
}

validate_skill() {
  local file="$1"
  local name
  local description
  local status

  printf 'validating skill: %s\n' "$file"

  set +e
  frontmatter_value "$file" "name"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "name")"
  else
    name="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$name" ]]; then
      report_error "$file" "frontmatter name is empty"
    elif ((${#name} > 64)); then
      report_error "$file" "frontmatter name exceeds 64 chars (${#name})"
    elif [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
      report_error "$file" "frontmatter name must be kebab-case with no leading/trailing hyphen: $name"
    fi
  fi

  set +e
  frontmatter_value "$file" "description"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "description")"
  else
    description="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$description" ]]; then
      report_error "$file" "frontmatter description is empty"
    elif ((${#description} > 1024)); then
      report_error "$file" "frontmatter description exceeds 1024 chars (${#description})"
    fi
  fi

  ((skills_validated += 1))
}

validate_wiki_file() {
  local file="$1"
  local status

  printf 'validating wiki: %s\n' "$file"

  set +e
  frontmatter_value "$file" "type"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "type")"
  fi

  ((wiki_validated += 1))
}

validate_mirai_skill() {
  local file="$1"
  local expected_name
  local name
  local description
  local status

  printf 'validating .mirai skill: %s\n' "$file"

  expected_name="${file%/SKILL.md}"
  expected_name="${expected_name##*/}"

  set +e
  frontmatter_value "$file" "name"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "name")"
  else
    name="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$name" ]]; then
      report_error "$file" "frontmatter name is empty"
    elif ((${#name} > 64)); then
      report_error "$file" "frontmatter name exceeds 64 chars (${#name})"
    elif [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
      report_error "$file" "frontmatter name must be kebab-case with no leading/trailing hyphen: $name"
    elif [[ "$name" != "$expected_name" ]]; then
      report_error "$file" "frontmatter name '$name' must match folder name '$expected_name' (Mirai requirement)"
    fi
  fi

  set +e
  frontmatter_value "$file" "description"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "description")"
  else
    description="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$description" ]]; then
      report_error "$file" "frontmatter description is empty"
    elif ((${#description} > 1024)); then
      report_error "$file" "frontmatter description exceeds 1024 chars (${#description})"
    fi
  fi

  ((mirai_validated += 1))
}

validate_mirai_agent_or_prompt() {
  local file="$1"
  local description
  local status

  printf 'validating .mirai agent/prompt: %s\n' "$file"

  set +e
  frontmatter_value "$file" "description"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "description")"
  else
    description="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$description" ]]; then
      report_error "$file" "frontmatter description is empty"
    fi
  fi

  ((mirai_validated += 1))
}

validate_mirai_instruction() {
  local file="$1"
  local description
  local status

  printf 'validating .mirai instruction: %s\n' "$file"

  set +e
  frontmatter_value "$file" "description"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "description")"
  else
    description="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$description" ]]; then
      report_error "$file" "frontmatter description is empty"
    fi
  fi

  ((mirai_validated += 1))
}

validate_mirai_config() {
  local root=".mirai"
  local file
  local base
  local has_agents_md
  local has_mirai_instructions

  [[ -d "$root" ]] || return 0
  mirai_present=1

  for file in "$root"/skills/*/SKILL.md; do
    [[ -f "$file" ]] && validate_mirai_skill "$file"
  done

  for file in "$root"/agents/*.agent.md "$root"/prompts/*.prompt.md; do
    [[ -f "$file" ]] && validate_mirai_agent_or_prompt "$file"
  done

  for file in "$root"/instructions/*.instructions.md; do
    [[ -f "$file" ]] && validate_mirai_instruction "$file"
  done

  has_agents_md=0
  has_mirai_instructions=0
  [[ -f "AGENTS.md" ]] && has_agents_md=1
  [[ -f "$root/mirai-instructions.md" ]] && has_mirai_instructions=1
  if ((has_agents_md == 1 && has_mirai_instructions == 1)); then
    report_error "AGENTS.md / $root/mirai-instructions.md" "both agent-instruction files exist — Mirai requires exactly one (AGENTS.md OR mirai-instructions.md, never both)"
  fi

  for file in "$root"/hooks/*.json; do
    [[ -f "$file" ]] || continue
    base="${file##*/}"
    printf 'validating .mirai hook: %s\n' "$file"
    if ! python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$file" >/dev/null 2>&1; then
      if ! node -e "JSON.parse(require('fs').readFileSync(process.argv[1]))" "$file" >/dev/null 2>&1; then
        report_error "$file" "hook file is not valid JSON"
      fi
    fi
    ((mirai_validated += 1))
  done
}

validate_opencode_skill() {
  local file="$1"
  local expected_name
  local name
  local description
  local status

  printf 'validating .opencode skill: %s\n' "$file"

  expected_name="${file%/SKILL.md}"
  expected_name="${expected_name##*/}"

  set +e
  frontmatter_value "$file" "name"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "name")"
  else
    name="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$name" ]]; then
      report_error "$file" "frontmatter name is empty"
    elif ((${#name} > 64)); then
      report_error "$file" "frontmatter name exceeds 64 chars (${#name})"
    elif [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
      report_error "$file" "frontmatter name must be kebab-case with no leading/trailing hyphen: $name"
    elif [[ "$name" != "$expected_name" ]]; then
      report_error "$file" "frontmatter name '$name' must match folder name '$expected_name' (OpenCode requirement)"
    fi
  fi

  set +e
  frontmatter_value "$file" "description"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "description")"
  else
    description="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$description" ]]; then
      report_error "$file" "frontmatter description is empty"
    elif ((${#description} > 1024)); then
      report_error "$file" "frontmatter description exceeds 1024 chars (${#description})"
    fi
  fi

  ((opencode_validated += 1))
}

validate_opencode_agent_or_command() {
  local file="$1"
  local description
  local status

  printf 'validating .opencode agent/command: %s\n' "$file"

  set +e
  frontmatter_value "$file" "description"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "description")"
  else
    description="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$description" ]]; then
      report_error "$file" "frontmatter description is empty"
    fi
  fi

  ((opencode_validated += 1))
}

validate_opencode_config() {
  local root=".opencode"
  local file

  [[ -d "$root" ]] || return 0
  opencode_present=1

  for file in "$root"/skills/*/SKILL.md; do
    [[ -f "$file" ]] && validate_opencode_skill "$file"
  done

  for file in "$root"/agents/*.md "$root"/commands/*.md; do
    [[ -f "$file" ]] && validate_opencode_agent_or_command "$file"
  done

  for file in "opencode.json" "opencode.jsonc"; do
    [[ -f "$file" ]] || continue
    printf 'validating opencode config: %s\n' "$file"
    if ! python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$file" >/dev/null 2>&1; then
      if ! node -e "JSON.parse(require('fs').readFileSync(process.argv[1]))" "$file" >/dev/null 2>&1; then
        report_error "$file" "opencode config file is not valid JSON"
      fi
    fi
    ((opencode_validated += 1))
  done
}

validate_hermes_skill() {
  local file="$1"
  local expected_name
  local name
  local description
  local status

  printf 'validating .hermes skill: %s\n' "$file"

  expected_name="${file%/SKILL.md}"
  expected_name="${expected_name##*/}"

  set +e
  frontmatter_value "$file" "name"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "name")"
  else
    name="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$name" ]]; then
      report_error "$file" "frontmatter name is empty"
    elif ((${#name} > 64)); then
      report_error "$file" "frontmatter name exceeds 64 chars (${#name})"
    elif [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
      report_error "$file" "frontmatter name must be kebab-case with no leading/trailing hyphen: $name"
    elif [[ "$name" != "$expected_name" ]]; then
      report_error "$file" "frontmatter name '$name' must match folder name '$expected_name' (Hermes requirement)"
    fi
  fi

  set +e
  frontmatter_value "$file" "description"
  status=$?
  set -e
  if ((status != 0)); then
    report_error "$file" "$(frontmatter_error "$status" "description")"
  else
    description="$(strip_yaml_scalar "$FRONTMATTER_VALUE")"
    if [[ -z "$description" ]]; then
      report_error "$file" "frontmatter description is empty"
    elif ((${#description} > 1024)); then
      report_error "$file" "frontmatter description exceeds 1024 chars (${#description})"
    fi
  fi

  ((hermes_validated += 1))
}

validate_hermes_soul() {
  local file="$1"

  printf 'validating .hermes SOUL: %s\n' "$file"

  if [[ ! -s "$file" ]]; then
    report_error "$file" "SOUL.md is empty (a profile persona must be non-empty)"
  fi

  ((hermes_validated += 1))
}

validate_hermes_config() {
  local root=".hermes"
  local file
  local profile_dir

  [[ -d "$root" ]] || return 0
  hermes_present=1

  # Skills may live globally or per-profile; validate both shapes.
  for file in "$root"/skills/*/SKILL.md "$root"/profiles/*/skills/*/SKILL.md; do
    [[ -f "$file" ]] && validate_hermes_skill "$file"
  done

  # Each profile carries a config.yaml (valid YAML) + a non-empty SOUL.md.
  for profile_dir in "$root"/profiles/*; do
    [[ -d "$profile_dir" ]] || continue

    file="$profile_dir/config.yaml"
    if [[ -f "$file" ]]; then
      printf 'validating .hermes config: %s\n' "$file"
      if ! python3 -c "import sys,yaml; yaml.safe_load(open(sys.argv[1]))" "$file" >/dev/null 2>&1; then
        if command -v python3 >/dev/null 2>&1 && python3 -c "import yaml" >/dev/null 2>&1; then
          report_error "$file" "hermes profile config.yaml is not valid YAML"
        fi
        # If PyYAML is unavailable, skip the parse gracefully (do not fail the run).
      fi
      ((hermes_validated += 1))
    fi

    file="$profile_dir/SOUL.md"
    [[ -f "$file" ]] && validate_hermes_soul "$file"
  done
}

collect_markdown_files() {
  local root="$1"
  local dir
  local child
  local -a queue=()

  [[ -d "$root" ]] || return 0
  queue=("$root")

  while ((${#queue[@]} > 0)); do
    dir="${queue[0]}"
    queue=("${queue[@]:1}")

    for child in "$dir"/*.md; do
      [[ -f "$child" ]] && printf '%s\n' "$child"
    done

    for child in "$dir"/*; do
      [[ -d "$child" ]] && queue+=("$child")
    done
  done
}

is_relative_markdown_target() {
  local target="$1"

  [[ -n "$target" ]] || return 1
  [[ "$target" == \#* ]] && return 1
  [[ "$target" == /* ]] && return 1
  [[ "$target" =~ ^[A-Za-z][A-Za-z0-9+.-]*: ]] && return 1
  return 0
}

resolve_markdown_target() {
  local source_file="$1"
  local target="$2"
  local base_dir="${source_file%/*}"
  local clean_target="$target"
  local candidate
  local skill_bucket_dir

  clean_target="${clean_target%%#*}"
  clean_target="${clean_target%%\?*}"

  [[ -n "$clean_target" ]] || return 0

  candidate="$base_dir/$clean_target"
  if [[ -f "$candidate" ]]; then
    printf '%s' "$candidate"
    return 0
  fi
  if [[ -f "$candidate.md" ]]; then
    printf '%s' "$candidate.md"
    return 0
  fi
  if [[ -d "$candidate" && -f "$candidate/index.md" ]]; then
    printf '%s' "$candidate/index.md"
    return 0
  fi

  case "$source_file" in
    SKILLS/*/*)
      skill_bucket_dir="SKILLS/${source_file#SKILLS/}"
      skill_bucket_dir="SKILLS/${skill_bucket_dir%%/*}"
      candidate="$skill_bucket_dir/$clean_target"
      if [[ -f "$candidate" ]]; then
        printf '%s' "$candidate"
        return 0
      fi

      ;;
  esac

  return 1
}

# Emit every valid anchor for a markdown file, one per line: the GitHub-style slug of each
# ATX heading PLUS any explicit {#custom-id}. Run under LC_ALL=C so awk treats bytes as bytes
# — multibyte glyphs (em-dash, arrows) are dropped rather than crashing tolower()/per-char
# scanning, matching GitHub's slugifier which drops non [a-z0-9_-] characters (spaces -> '-').
file_anchors() {
  local file="$1"

  LC_ALL=C awk '
    function slugify(s,   out, i, c) {
      s = tolower(s)
      out = ""
      for (i = 1; i <= length(s); i++) {
        c = substr(s, i, 1)
        if (c ~ /[a-z0-9_-]/) {
          out = out c
        } else if (c == " ") {
          out = out "-"
        }
      }
      return out
    }

    {
      if ($0 ~ /^[[:space:]]*(```|~~~)/) {
        in_fence = !in_fence
        next
      }
      if (in_fence) {
        next
      }

      if (match($0, /^#+[[:space:]]+/)) {
        heading = substr($0, RLENGTH + 1)
        sub(/[[:space:]]+#*[[:space:]]*$/, "", heading)

        if (match(heading, /\{#[^}]+\}/)) {
          explicit = substr(heading, RSTART + 2, RLENGTH - 3)
          print explicit
          sub(/[[:space:]]*\{#[^}]+\}[[:space:]]*$/, "", heading)
        }

        print slugify(heading)
      }
    }
  ' "$file"
}

# Verify a #anchor exists in a resolved target file. First hypothesis on any miss is a
# slugifier bug, not repo rot — validated against contract/PORTS.md#port-5--mechanisminstall,
# wiki/glossary/index.md#form-slop, and every '&'/{#id} heading before shipping.
check_markdown_anchor() {
  local source_file="$1"
  local line_number="$2"
  local target="$3"
  local target_file="$4"
  local anchor="${target#*#}"

  [[ -n "$anchor" ]] || return 0

  ((anchors_checked += 1))
  if ! file_anchors "$target_file" | grep -qxF "$anchor"; then
    report_error "$source_file" "line $line_number anchor #$anchor has no matching heading in $target_file"
  fi
}

# Emit every markdown link/reference-definition target in a file as "line_number<TAB>target".
# Shared by link resolution, anchor validation, and orphan reachability so all three see the
# exact same link set. Skips fenced code blocks; handles inline [t](u), <angle> targets, and
# [ref]: definitions.
extract_link_targets() {
  local file="$1"

  awk '
    {
      if ($0 ~ /^[[:space:]]*(```|~~~)/) {
        in_fence = !in_fence
        next
      }
      if (in_fence) {
        next
      }

      line = $0
      while (match(line, /!?\[[^]]*\]\([^)]+\)/)) {
        target = substr(line, RSTART, RLENGTH)
        sub(/^!?\[[^]]*\]\(/, "", target)
        sub(/\)$/, "", target)
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", target)
        if (target ~ /^</) {
          sub(/^</, "", target)
          sub(/>.*/, "", target)
        } else {
          sub(/[[:space:]].*/, "", target)
        }
        print FNR "\t" target
        line = substr(line, RSTART + RLENGTH)
      }

      if (match($0, /^[[:space:]]*\[[^]]+\]:[[:space:]]*[^[:space:]]+/)) {
        target = $0
        sub(/^[[:space:]]*\[[^]]+\]:[[:space:]]*/, "", target)
        sub(/[[:space:]].*/, "", target)
        print FNR "\t" target
      }
    }
  ' "$file"
}

check_markdown_links() {
  local file="$1"
  local base_dir="${file%/*}"
  local line_number
  local target
  local resolved

  printf 'checking links: %s\n' "$file"

  if [[ "${file%/*}" == "SKILLS" ]]; then
    printf 'skipping legacy loose skill source links: %s\n' "$file"
    return 0
  fi

  while IFS=$'\t' read -r line_number target; do
    [[ -n "${target:-}" ]] || continue

    # Same-file anchor link (#foo): not a relative FILE target, but its anchor is checkable
    # against this very file.
    if [[ "$target" == \#* ]]; then
      check_markdown_anchor "$file" "$line_number" "$target" "$file"
      continue
    fi

    if ! is_relative_markdown_target "$target"; then
      continue
    fi

    ((links_checked += 1))
    if resolved="$(resolve_markdown_target "$file" "$target")"; then
      if [[ "$target" == *#* && -n "$resolved" ]]; then
        check_markdown_anchor "$file" "$line_number" "$target" "$resolved"
      fi
    else
      report_error "$file" "line $line_number relative link does not resolve: $target (from $base_dir)"
    fi
  done < <(extract_link_targets "$file")
}

render_adapter_count() {
  local present="$1"
  local count="$2"

  if ((present == 0)); then
    printf 'skipped (not installed)'
  else
    printf '%d validated' "$count"
  fi
}

# Orphan detection: a markdown file is discoverable if ANY tracked markdown file links to it
# (whole-graph reachability, not just index.md — a SKILL sub-doc reached from its sibling
# SKILL.md, or an adapter reference reached from setup.md, is NOT orphaned). Exemptions:
#   - index.md  — the navigation spine itself; it is the referrer, need not be a referent.
#   - log.md    — append-only per-subtree changelogs, entered by convention not by link.
# A genuine orphan is a content file no page routes to — unreachable, so effectively dead.
check_orphans() {
  local roots="$1"
  local link_root file base target clean cand dir leaf resolved_dir rel _line
  local ref_file source_file base_dir

  ref_file="$(mktemp)"

  # Reference set: normalize every resolvable relative link target (across ALL tracked md)
  # to a repo-relative path, one per line.
  for link_root in $roots; do
    while IFS= read -r source_file; do
      base_dir="${source_file%/*}"
      while IFS=$'\t' read -r _line target; do
        [[ -n "$target" ]] || continue
        [[ "$target" == \#* ]] && continue
        [[ "$target" == /* ]] && continue
        [[ "$target" =~ ^[A-Za-z][A-Za-z0-9+.-]*: ]] && continue
        clean="${target%%#*}"
        clean="${clean%%\?*}"
        [[ -n "$clean" ]] || continue
        cand="$base_dir/$clean"
        dir="${cand%/*}"
        leaf="${cand##*/}"
        resolved_dir="$(cd "$dir" 2>/dev/null && pwd)" || continue
        rel="${resolved_dir#"$ROOT_DIR"/}"
        rel="${rel#"$ROOT_DIR"}"
        if [[ -n "$rel" ]]; then
          printf '%s/%s\n' "$rel" "$leaf" >> "$ref_file"
        else
          printf '%s\n' "$leaf" >> "$ref_file"
        fi
        # A bare directory link resolves to that directory's index.md.
        if [[ -d "$cand" ]]; then
          if [[ -n "$rel" ]]; then
            printf '%s/%s/index.md\n' "$rel" "$leaf" >> "$ref_file"
          else
            printf '%s/index.md\n' "$leaf" >> "$ref_file"
          fi
        fi
      done < <(extract_link_targets "$source_file")
    done < <(collect_markdown_files "$link_root")
  done

  sort -u "$ref_file" > "$ref_file.sorted"

  for link_root in $roots; do
    while IFS= read -r file; do
      base="${file##*/}"
      [[ "$base" == "index.md" || "$base" == "log.md" ]] && continue
      if ! grep -qxF "$file" "$ref_file.sorted"; then
        report_error "$file" "orphan: no tracked markdown file links to it (unreachable)"
        ((orphans_flagged += 1))
      fi
    done < <(collect_markdown_files "$link_root")
  done

  rm -f "$ref_file" "$ref_file.sorted"
}

# Decision 9 invariant: "a mechanism grounding no criterion is dead code; a criterion with no
# mechanism is unenforced." Joins REGISTRY.md's `grounds` column against GATE.md's `id`
# column. A registry row MAY legitimately ground a non-executable criterion (e.g. the loom
# size score mechanism grounds the `judgment`-typed planning.right-sized-tasks — it only
# covers the arithmetic, not the human dimension scores) — so only check (2) is type-sensitive:
# executable rows need a grounding mechanism, never the converse.
check_gate_registry_join() {
  local gate_file="GATE.md"
  local registry_file="REGISTRY.md"
  local gate_ids="" gate_executable_ids="" registry_grounds=""
  local id type grounds

  [[ -f "$gate_file" ]] || { report_error "$gate_file" "file not found"; return 0; }
  [[ -f "$registry_file" ]] || { report_error "$registry_file" "file not found"; return 0; }

  while IFS=$'\t' read -r id type; do
    [[ -n "$id" ]] || continue
    gate_ids="$gate_ids"$'\n'"$id"
    [[ "$type" == "executable" ]] && gate_executable_ids="$gate_executable_ids"$'\n'"$id"
  done < <(awk -F'|' 'NR>2 {
    id=$2; type=$3
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", id)
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", type)
    if (id != "") print id "\t" type
  }' "$gate_file")

  while IFS= read -r grounds; do
    [[ -n "$grounds" ]] || continue
    registry_grounds="$registry_grounds"$'\n'"$grounds"
    ((registry_checked += 1))
    if ! printf '%s\n' "$gate_ids" | grep -qxF "$grounds"; then
      report_error "$registry_file" "grounds '$grounds' has no matching GATE.md id (dead/orphaned registry row)"
    fi
  done < <(awk -F'|' 'NR>2 {
    grounds=$4
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", grounds)
    if (grounds != "") print grounds
  }' "$registry_file")

  # Fail-closed (B2's discipline): both files are always-expected committed files now — a
  # zero-row parse must FAIL, not silently report "0 checked, all OK".
  if [[ -z "$gate_ids" ]]; then
    report_error "$gate_file" "zero parseable id rows (fail-closed)"
  fi
  if [[ -z "$registry_grounds" ]]; then
    report_error "$registry_file" "zero parseable grounds rows (fail-closed)"
  fi

  while IFS= read -r id; do
    [[ -n "$id" ]] || continue
    if ! printf '%s\n' "$registry_grounds" | grep -qxF "$id"; then
      report_error "$gate_file" "executable criterion '$id' has no REGISTRY.md row grounding it (unenforced)"
    fi
  done <<< "$gate_executable_ids"
}

printf 'Starting agent framework validation...\n'

for skill_file in SKILLS/*/*/SKILL.md; do
  [[ -f "$skill_file" ]] || continue
  validate_skill "$skill_file"
done

while IFS= read -r wiki_file; do
  validate_wiki_file "$wiki_file"
done < <(collect_markdown_files "wiki")

validate_mirai_config
validate_opencode_config
validate_hermes_config

# `docs` is included so the link/anchor/orphan checks cover the framework meta-docs too —
# A2 found the link loop omitted it, which is how the dead links in docs/context-engineering.md
# stayed invisible.
LINK_ROOTS="SKILLS workflows wiki agents commands adapters contract docs"

for link_root in $LINK_ROOTS; do
  while IFS= read -r markdown_file; do
    check_markdown_links "$markdown_file"
  done < <(collect_markdown_files "$link_root")
done

check_orphans "$LINK_ROOTS"

check_gate_registry_join

# Mandatory groups: fail unconditionally on zero. Deliberately NO directory-existence
# guard here — a guard would re-mask a case-sensitivity bug (a lowercase glob legitimately
# finding nothing on a case-sensitive filesystem).
((skills_validated > 0)) || report_error "SKILLS" "zero skills validated"
((wiki_validated > 0)) || report_error "wiki" "zero wiki files validated"
((links_checked > 0)) || report_error "(links)" "zero links checked"
((anchors_checked > 0)) || report_error "(anchors)" "zero anchors checked"

# Conditional adapter groups: skip when the adapter's root directory is absent, fail when
# present but zero (installed-but-broken).
if ((mirai_present == 1)); then
  ((mirai_validated > 0)) || report_error ".mirai" "adapter directory present but zero items validated"
fi
if ((opencode_present == 1)); then
  ((opencode_validated > 0)) || report_error ".opencode" "adapter directory present but zero items validated"
fi
if ((hermes_present == 1)); then
  ((hermes_validated > 0)) || report_error ".hermes" "adapter directory present but zero items validated"
fi

if ((failures > 0)); then
  printf 'validation failed: %d violation(s); skills: %d validated, wiki: %d validated, .mirai: %s, .opencode: %s, .hermes: %s, links: %d checked, anchors: %d checked, orphans: %d flagged, registry: %d checked\n' \
    "$failures" "$skills_validated" "$wiki_validated" \
    "$(render_adapter_count "$mirai_present" "$mirai_validated")" \
    "$(render_adapter_count "$opencode_present" "$opencode_validated")" \
    "$(render_adapter_count "$hermes_present" "$hermes_validated")" \
    "$links_checked" "$anchors_checked" "$orphans_flagged" "$registry_checked" >&2
  exit 1
fi

printf 'skills: %d validated, wiki: %d validated, .mirai: %s, .opencode: %s, .hermes: %s, links: %d checked, anchors: %d checked, orphans: %d flagged, registry: %d checked, all OK\n' \
  "$skills_validated" "$wiki_validated" \
  "$(render_adapter_count "$mirai_present" "$mirai_validated")" \
  "$(render_adapter_count "$opencode_present" "$opencode_validated")" \
  "$(render_adapter_count "$hermes_present" "$hermes_validated")" \
  "$links_checked" "$anchors_checked" "$orphans_flagged" "$registry_checked"
