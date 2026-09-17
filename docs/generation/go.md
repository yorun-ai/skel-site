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

## Collection Encoding and Validation

Generated Go code uses pointers for nullable collections, and generated modules
need Go 1.27.0 or later. Update the dependencies yourself when generating into an
existing module.

| Skel type | Generated Go type |
| --- | --- |
| `list<T>` | `[]T` |
| `list<T>?` | `*[]T` |
| `map<K, V>` | `map[K]V` |
| `map<K, V>?` | `*map[K]V` |

A nil pointer represents `null`. A non-nil pointer represents a collection,
including when the underlying slice or map is nil. With the v0.15 encoding
contract, nil slices and maps encode as empty arrays and maps in JSON and CBOR.
A non-nullable collection therefore needs no nil check: input `null` is accepted
without a generated validation error and encodes back as an empty collection.

Regenerate the packages together with the application when the generator or the
runtime changes, and test consumers with both JSON and CBOR where they are used.
Build the generated packages and the runtime that loads them with the same skelc
version.

## In-Process Rpc Value Isolation

A generated package needs no code for in-process isolation: Vine keeps arguments
and results of an in-process call apart from the caller and the handler, covering
the generated scalars, lists, maps, nullable values, and beans a Skel contract can
carry. Application code that needs its own copy of a generated bean uses
[`vbean.DeepClone`](https://pkg.go.dev/go.yorun.ai/vine/util/vbean).

The guarantee covers value isolation only. JSON or CBOR encoding, transport
normalization, custom marshal/unmarshal methods, and codec failures are outside
the in-process contract. Imported generated packages behave the same way, so
regenerate them together to keep their schemas on one compiler version.

## Generated Package Ownership

Generated Go packages are fully managed by skelc. Do not edit generated files
or add handwritten `.go` files to the same package. skelc and Vine compatibility
covers only generated declarations; compilation and runtime behavior are not
guaranteed when unmanaged files add declarations, methods, or custom codec
behavior. Keep business implementations and adapters in separate packages.

## Deprecation Output

`@deprecated` becomes a standard `Deprecated:` paragraph on generated Go declarations, methods, constants, and fields, so Go-aware editors can present the symbol as obsolete. Multiline explanations remain valid Go documentation.

## External Dependencies

```bash
--skel-import demo.account=../account/pub/skel \
--go-import demo.account=example.com/demo/account/skeledpub
```

When a shared naming convention can derive import paths, `--go-module-prefix` saves you from enumerating every mapping. After generation, run `gofmt` and `go test`, then review `go.mod` and any API diffs. The [CLI reference](/docs/cli) documents every flag.

Backend Go output requires Vine v0.20.2 or later and defaults to v0.20.2. Update the dependency yourself when generating into an existing module.

## Web Generation

Ordinary Go generation registers one Web spec for each `web` declaration. Web
capabilities cannot be `pub`, so a public-contract module has no Web output.

The server interface is named `<WebName>Server` and the default implementation
`Default<WebName>Server`. An implementation in another package embeds the default
type and overrides the routes it needs. That default type is only a shell: its
`Routes(*web.Router)` panics until Go code supplies routing.

A declared `mount` reaches the `WebSpec` and the runtime domain schema as
`MountPath`. Mounted output needs Vine v0.19.0 or later; the current dependency
for all backend Go output is v0.20.2.

## Portal API Clients

```bash
skelc gen go-module --api \
  --skel-in ./skel \
  --go-out ./generated/orderapi \
  --go-module-prefix example.com/gen
```

For domain `shop.order`, this derives module `example.com/gen/shop/orderapi` and package `orderapi`. `--go-module` overrides the module path. Use `gen go --api` to generate into an existing module. `--api` and `--pub` are mutually exclusive; default Go generation supplies backend implementations, while `--pub` selects backend public contracts.

API clients depend on `go.yorun.ai/vrpc` v0.12.0 or later, configurable with `--go-vrpc-version`. Scalar types come from `go.yorun.ai/vrpc/skel`. Cross-domain types are imported from the corresponding `xxxapi` package, and API clients never depend on Vine.

Construct a client with `NewOrderApiServiceClient(client)`, passing a `*vrpc.Client` you configure for the Portal endpoint. The constructor returns the `OrderApiServiceClient` interface, so you can supply your own implementation or mock in tests. Each method takes `context.Context`, the declared business parameters, and any optional `vrpc.InvokeOption` values, and returns the business result with `error`, or just `error` when the method has no result.

`--api` clients use vRPC and do not require Vine.

For `open service`, skelc generates clients plus the Server/ERServer interfaces and their default implementations in the public package. The regular package reuses these server types through aliases, avoiding duplicate registration. Ordinary `pub service` output stays client-only in public packages.
