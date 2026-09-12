#!/usr/bin/env bash
set -euo pipefail

# Only repository maintenance files are excluded. Site Markdown is build input.
classify_changes() {
  jq -Rse '
    split("\u0000") | map(select(length > 0)) |
    any(.[]; (test("^(README(\\.[^/]+)?|AGENTS\\.md|CONTRIBUTING(\\.[^/]+)?|CHANGELOG\\.md|LICENSE(\\.[^/]+)?|\\.github/CI\\.md|\\.github/pull_request_template\\.md)$|^\\.github/ISSUE_TEMPLATE/") | not))'
}

verify_results() {
  jq -e '
    .changes.result == "success" and
    ((.changes.outputs.site == "true" and .build.result == "success") or
     (.changes.outputs.site == "false" and .build.result == "skipped"))'
}

ci_main() {
  case "${1:-}" in
    changes)
      [[ "$CHANGE_BASE" =~ ^[0-9a-f]{40}$ && "$CHANGE_HEAD" =~ ^[0-9a-f]{40}$ ]] || {
        echo "Invalid PR change range" >&2; return 1;
      }
      local selected
      selected=$(git diff --name-only --no-renames -z "$CHANGE_BASE...$CHANGE_HEAD" | classify_changes)
      echo "site=$selected" | tee -a "$GITHUB_OUTPUT"
      ;;
    verify) verify_results <<< "$NEEDS" ;;
    *) echo "Usage: ci.sh changes|verify" >&2; return 1 ;;
  esac
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then ci_main "$@"; fi
