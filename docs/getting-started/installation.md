---
slug: /installation
---

# Install skelc

## Prerequisites

skelc currently requires Go 1.26 or later. Generated Go modules use skelc's built-in default Vine requirement, which is currently `v0.10.0`.

## Install

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version
```

Ensure the Go binary directory is on `PATH`. If the shell cannot find skelc, inspect `go env GOBIN` and `go env GOPATH`.

## Pin a Version

CI and reproducible generation environments should pin a version:

```bash
go install go.yorun.ai/skelc/cmd/skelc@v0.10.0
```

After upgrading skelc, regenerate contracts and review the diff. Do not let developer machines and CI silently use different compiler versions.

## Inspect Version Information

```bash
skelc version
skelc version --output-format json
```

JSON output is suitable for build scripts. `--go-vine-version` can raise the target Vine version during Go generation, but it cannot select a version below skelc's built-in default.

Next: [create your first contract](/docs/getting-started).
