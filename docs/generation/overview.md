---
slug: /generation
---

# Generation Guide

One domain model can produce artifacts for different consumers:

| Target | Command | Typical consumer |
| --- | --- | --- |
| Go source | `gen go` | An existing Go module |
| Go module | `gen go-module` | Independent regular/public modules |
| TypeScript | `gen ts` | Web or Node clients |
| Public Skel | `gen skel --pub` | Compiler input for another domain |

## Shared Rules

Every generation command requires `--skel-in` and an output directory. skelc tracks its files in `.skelc-manifest.json`: it never deletes untracked handwritten files and removes stale generated files only when their contents are unchanged. A handwritten file at the same path as a current generated file is still overwritten. External domains need `--skel-import`, plus language-specific import mappings.

## Choose a Path

- Server implementation inside an existing Go module: use `gen go` in [Go generation](/docs/generation/go).
- Independently versioned contracts: use `gen go-module`.
- Browser or Node consumer: use [TypeScript generation](/docs/generation/typescript).
- Minimal sharing between domains: generate a [public contract](/docs/generation/public-contracts) first.
