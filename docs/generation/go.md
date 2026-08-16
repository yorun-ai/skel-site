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

## In-Process Rpc Value Isolation

Generated non-generic data types expose `Clone()`. Generic data types expose
`CloneBy(...)`, accepting one typed clone callback for each type parameter.
Generated Rpc method specs compose these methods into type-safe request and
result clone hooks. Vine uses these hooks to prevent mutable arguments and
results from leaking across the in-process caller/handler boundary.

This contract guarantees value isolation only. JSON or CBOR encoding, transport
normalization, custom marshal/unmarshal methods, and codec failures are not part
of the in-process contract and may differ by generated spec. Soft-recursive data
uses the same generated clone methods.

skelc v0.12.x and v0.13.x support rolling upgrades with Go packages generated
by v0.11.x. Regenerate imported packages incrementally, and complete the
migration before upgrading to v0.14.0, when imported generated data must provide
`Clone()` or `CloneBy(...)`.

## Generated Package Ownership

Generated Go packages are fully managed by skelc. Do not edit generated files
or add handwritten `.go` files to the same package. skelc and Vine compatibility
covers only generated declarations; compilation and runtime behavior are not
guaranteed when unmanaged files add declarations, methods, or custom codec
behavior. Keep business implementations and adapters in separate packages.

## Deprecation Output

`@deprecated` becomes a standard `Deprecated:` paragraph on generated Go declarations, methods, constants, and fields, so Go-aware editors can present the symbol as obsolete. The generated domain schema also carries `Deprecated` and `DeprecatedReason` for Vine tooling. Multiline explanations remain valid Go documentation.

## External Dependencies

```bash
--skel-import demo.account=../account/pub/skel \
--go-import demo.account=example.com/demo/account/skeledpub
```

When a shared naming convention can derive import paths, `--go-module-prefix` saves you from enumerating every mapping. After generation, run `gofmt` and `go test`, then review `go.mod` and any API diffs. The [CLI reference](/docs/cli) documents every flag.
