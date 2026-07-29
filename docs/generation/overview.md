---
slug: /generation
---

# Generation Guide

A single domain model produces artifacts for different consumers:

| Target | Command | Typical consumer |
| --- | --- | --- |
| Go source | `gen go` | An existing Go module |
| Go module | `gen go-module` | Independent regular/public modules |
| TypeScript | `gen ts` | Web or Node clients |
| Public Skel | `gen skel --pub` | Compiler input for another domain |

## Shared Rules

Every generation command needs `--skel-in` and an output directory. skelc tracks the files it owns in `.skelc-manifest.json`: it never touches untracked handwritten files, and it removes stale generated files only when their contents haven't changed since the last generation. A handwritten file at the same path as a current generated file is still overwritten. External domains need `--skel-import`, plus language-specific import mappings.

## Choose a Path

- Implementing a server inside an existing Go module? Use `gen go` -- see [Go generation](/docs/generation/go).
- Independently versioned contracts? Use `gen go-module`.
- A browser or Node consumer? Head to [TypeScript generation](/docs/generation/typescript).
- Minimal sharing between domains? Generate a [public contract](/docs/generation/public-contracts) first.
