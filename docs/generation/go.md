---
slug: /generation/go
---

# Go Generation

## Existing Module

```bash
skelc gen go \
  --skel-in ./skel \
  --go-out ./skeled
```

This mode writes Go source without creating a `go.mod`. Use it when the output lives inside the current module.

## Standalone Module

```bash
skelc gen go-module \
  --skel-in ./skel \
  --go-out ./skeled/golang \
  --go-module example.com/demo/user/skeled
```

Add `--go-pub-out` and `--go-pub-module` to produce a public module alongside the regular one. The regular module carries the full contract and server capabilities; the public module exposes public clients, listeners, and the types they depend on.

## Deprecation Output

`@deprecated` becomes a standard `Deprecated:` paragraph on generated Go declarations, methods, constants, and fields, so Go-aware editors can present the symbol as obsolete. The generated domain schema also carries `Deprecated` and `DeprecatedReason` for Vine tooling. Multiline explanations remain valid Go documentation.

## External Dependencies

```bash
--skel-import demo.account=../account/pub/skel \
--go-import demo.account=example.com/demo/account/skeledpub
```

When a shared naming convention can derive import paths, `--go-module-prefix` saves you from enumerating every mapping. After generation, run `gofmt` and `go test`, then review `go.mod` and any API diffs. The [CLI reference](/docs/cli) documents every flag.
