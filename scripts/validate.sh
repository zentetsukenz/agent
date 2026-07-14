#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="${BASH_SOURCE[0]%/*}"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

shopt -s nullglob

failures=0
skills_validated=0
wiki_validated=0
links_checked=0

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
    return 0
  fi
  if [[ -f "$candidate.md" ]]; then
    return 0
  fi
  if [[ -d "$candidate" && -f "$candidate/index.md" ]]; then
    return 0
  fi

  case "$source_file" in
    agent/skills/*/*)
      skill_bucket_dir="agent/skills/${source_file#agent/skills/}"
      skill_bucket_dir="agent/skills/${skill_bucket_dir%%/*}"
      candidate="$skill_bucket_dir/$clean_target"
      if [[ -f "$candidate" ]]; then
        return 0
      fi

      ;;
  esac

  return 1
}

check_markdown_links() {
  local file="$1"
  local base_dir="${file%/*}"
  local line_number
  local target

  printf 'checking links: %s\n' "$file"

  if [[ "${file%/*}" == "agent/skills" ]]; then
    printf 'skipping legacy loose skill source links: %s\n' "$file"
    return 0
  fi

  while IFS=$'\t' read -r line_number target; do
    [[ -n "${target:-}" ]] || continue

    if ! is_relative_markdown_target "$target"; then
      continue
    fi

    ((links_checked += 1))
    if ! resolve_markdown_target "$file" "$target"; then
      report_error "$file" "line $line_number relative link does not resolve: $target (from $base_dir)"
    fi
  done < <(awk '
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
  ' "$file")
}

printf 'Starting agent framework validation...\n'

for skill_file in agent/skills/*/*/SKILL.md; do
  [[ -f "$skill_file" ]] || continue
  validate_skill "$skill_file"
done

while IFS= read -r wiki_file; do
  validate_wiki_file "$wiki_file"
done < <(collect_markdown_files "agent/wiki")

for link_root in agent/skills agent/workflows agent/wiki agent/agents agent/commands; do
  while IFS= read -r markdown_file; do
    check_markdown_links "$markdown_file"
  done < <(collect_markdown_files "$link_root")
done

if ((failures > 0)); then
  printf 'validation failed: %d violation(s); skills: %d validated, wiki: %d validated, links: %d checked\n' \
    "$failures" "$skills_validated" "$wiki_validated" "$links_checked" >&2
  exit 1
fi

printf 'skills: %d validated, wiki: %d validated, links: %d checked, all OK\n' \
  "$skills_validated" "$wiki_validated" "$links_checked"
