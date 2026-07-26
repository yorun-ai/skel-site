---
slug: /generation/go
---

# Generate Go

## Existing Module

```bash
skelc gen go \
  --skel-in ./skel \
  --go-out ./skeled
```

This mode writes source without creating `go.mod`. Use it when the output already belongs to the current module.

## Standalone Module

```bash
skelc gen go-module \
  --skel-in ./skel \
  --go-out ./skeled/golang \
  --go-module example.com/demo/user/skeled
```

Add `--go-pub-out` and `--go-pub-module` for a public module. The regular module contains the full contract and server capabilities; the public module exposes public clients/listeners and required types.

## External Dependencies

```bash
--skel-import demo.account=../account/pub/skel \
--go-import demo.account=example.com/demo/account/skeledpub
```

Use `--go-module-prefix` when a common naming convention can derive paths. After generation, run `gofmt` and `go test`, then review `go.mod` and API diffs. See the [CLI reference](/docs/cli) for every flag.
