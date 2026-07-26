---
slug: /troubleshooting
---

# Troubleshooting

## `domain.skel` Not Found

Directory mode requires `domain.skel` directly under the input directory. skelc does not recurse into subdirectories.

## Domain or Import Mismatch

Confirm every file declares the same domain, imports precede top-level declarations, and each `--skel-import` key is the full domain name.

## Public Dependency Error

Local data, enums, actors, or resources referenced by a public service/event also need `pub`. Reduce the reference or explicitly publish the dependency; do not bypass the check.

## A Generated File Was Not Removed

skelc automatically removes only files recorded in `.skelc-manifest.json` that are no longer generated and whose contents have not changed. Untracked files and modified stale generated files are preserved and can be removed manually when no longer needed. A handwritten file at the same path as a current generated file is still overwritten.

## Generated Go Version Mismatch

Compare `skelc version`, generated `go.mod`, and the application's Vine version. Regenerate after upgrading instead of editing requirements manually.

## Still Blocked

Capture complete JSONL diagnostics plus a minimal input, command, skelc version, and platform before opening an issue.
