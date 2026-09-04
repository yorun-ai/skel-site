---
slug: /installation
---

# Install skelc

## Prerequisites

skelc v0.15.0 and generated Go modules need Go 1.27.0 or later. Generated Go modules require Vine `v0.14.0` or later and default to `v0.14.0`. When generating into an existing Go module, update its dependencies yourself.

## Install

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version
```

Make sure the Go binary directory is on `PATH`. If the shell can't find skelc, check `go env GOBIN` and `go env GOPATH`.

## Pin a Version

CI and reproducible generation environments should pin an exact version:

```bash
go install go.yorun.ai/skelc/cmd/skelc@v0.15.0
```

After upgrading skelc, regenerate contracts and review the diff. For v0.15.0, follow the [Go collection migration notes](/docs/generation/go#collection-nullability-and-validation) before regenerating. Keep developer machines and CI on the same compiler version.

## Inspect Version Information

```bash
skelc version
```

JSON output works well in build scripts and reports the minimum and default Vine versions. `--go-vine-version` selects the target Vine version during Go generation, but it cannot be lower than skelc's minimum supported version.

## Add Editor Support

For authoring `.skel` files in VS Code, install [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton). The extension starts `skelc lsp` with the skelc executable on your `PATH` and requires skelc v0.14.0 or newer.

For documentation sites, code viewers, and browser editors, install [`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight) together with the highlighter used by your application.

Continue with the [VS Code Extension](/docs/editor) or [Syntax Highlighting Package](/docs/syntax-highlighting) guide.

Next: [create your first contract](/docs/getting-started).
