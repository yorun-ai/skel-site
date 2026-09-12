#!/usr/bin/env bash
set -euo pipefail
script="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ci.sh"
# shellcheck source=.github/scripts/ci.sh
source "$script"

check_paths() {
  local expected="$1"
  shift
  [[ "$(printf '%s\0' "$@" | classify_changes)" == "$expected" ]]
}
check_paths false README.md README.zh-CN.md AGENTS.md CONTRIBUTING.md LICENSE .github/CI.md .github/ISSUE_TEMPLATE/bug.yml
check_paths false
for path in docs/intro.md i18n/zh-CN/intro.md versioned_docs/version-1/intro.md src/pages/index.mdx static/README.md public/logo.png package.json pnpm-lock.yaml wrangler.jsonc .github/workflows/ci.yml .github/scripts/ci.sh unknown-file; do
  check_paths true "$path" README.md
done
check_paths true 'docs/a b.md' $'src/new\npage.tsx'

for selected in true false; do
  for classification in success failure cancelled skipped; do
    for build in success failure cancelled skipped; do
      needs=$(jq -n --arg selected "$selected" --arg classification "$classification" --arg build "$build" '{changes:{result:$classification,outputs:{site:$selected}},build:{result:$build}}')
      expected=false
      if [[ "$classification" == success ]] && { [[ "$selected" == true && "$build" == success ]] || [[ "$selected" == false && "$build" == skipped ]]; }; then expected=true; fi
      actual=false
      if verify_results <<< "$needs" >/dev/null; then actual=true; fi
      [[ "$actual" == "$expected" ]]
    done
  done
done
for outputs in '{}' '{"site":"invalid"}'; do
  needs=$(jq -n --argjson outputs "$outputs" '{changes:{result:"success",outputs:$outputs},build:{result:"skipped"}}')
  if verify_results <<< "$needs" >/dev/null; then echo 'Invalid outputs passed' >&2; exit 1; fi
done

fixture=$(mktemp -d)
trap 'rm -r "$fixture"' EXIT
(
  cd "$fixture"
  git init -q
  git config user.name 'CI test'
  git config user.email 'ci@example.invalid'
  mkdir docs
  echo content > docs/intro.md
  git add .
  git commit -qm initial
  base=$(git rev-parse HEAD)
  git mv docs/intro.md README.md
  git commit -qm rename
  head=$(git rev-parse HEAD)
  CHANGE_BASE="$base" CHANGE_HEAD="$head" GITHUB_OUTPUT="$fixture/output" bash "$script" changes > "$fixture/actual"
  [[ "$(cat "$fixture/actual")" == site=true ]]
  if CHANGE_BASE=invalid CHANGE_HEAD="$head" GITHUB_OUTPUT="$fixture/output" bash "$script" changes >/dev/null 2>&1; then exit 1; fi
)
echo 'CI policy tests passed'
