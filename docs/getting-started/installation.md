---
slug: /installation
---

# Install skelc

## Prerequisites

skelc and generated Go modules need Go 1.27.0 or later. Generated Go modules pick up skelc's built-in Vine default, which is `v0.13.1` at the time of writing.

## Install

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version
```

Make sure the Go binary directory is on `PATH`. If the shell can't find skelc, check `go env GOBIN` and `go env GOPATH`.

## Pin a Version

CI and reproducible generation environments should pin an exact version:

```bash
go install go.yorun.ai/skelc/cmd/skelc@v0.10.3
```

After upgrading skelc, regenerate contracts and review the diff. Don't let developer machines and CI run different compiler versions without noticing.

## Inspect Version Information

```bash
skelc version
```

JSON output works well in build scripts. `--go-vine-version` can raise the target Vine version during Go generation, but it won't go below skelc's built-in default.

## Add Editor Support

For authoring `.skel` files in VS Code, install [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton). The extension starts `skelc lsp` with the skelc executable on your `PATH` and requires skelc v0.14.0 or newer.

For documentation sites, code viewers, and browser editors, install [`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight) together with the highlighter used by your application.

Continue with the [VS Code Extension](/docs/editor) or [Syntax Highlighting Package](/docs/syntax-highlighting) guide.

Next: [create your first contract](/docs/getting-started).
