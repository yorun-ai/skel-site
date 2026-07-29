---
slug: /troubleshooting
---

# Troubleshooting

## `domain.skel` Not Found

Directory mode requires `domain.skel` directly inside the input directory. skelc doesn't recurse into subdirectories.

## Domain or Import Mismatch

Make sure every file declares the same domain, imports come before top-level declarations, and each `--skel-import` key is the full domain name.

## Public Dependency Error

Local data, enums, actors, or resources referenced by a public service or event also need `pub`. Either reduce the reference or explicitly publish the dependency -- do not bypass the check.

## A Generated File Was Not Removed

skelc automatically removes only files recorded in `.skelc-manifest.json` that are no longer generated and whose contents haven't changed. Untracked files and modified stale generated files are preserved; you can delete them manually when they're no longer needed. A handwritten file at the same path as a current generated file is still overwritten.

## Generated Go Version Mismatch

Compare `skelc version`, the generated `go.mod`, and the application's Vine version. Regenerate after upgrading instead of editing requirements by hand.

## Still Blocked

Capture complete JSONL diagnostics plus a minimal input, the command, skelc version, and platform before opening an issue.
