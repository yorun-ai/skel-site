---
slug: /cli
---

# CLI Reference

skelc validates, formats, inspects, and diffs `.skel` definitions and generates Go, TypeScript, and public Skel contracts.

The built-in help shows the flags your installed version supports:

```bash
skelc --help
skelc check --help
skelc format --help
skelc lsp --help
skelc schema --help
skelc gen --help
```

## Global output

Every non-LSP command writes exactly one pretty-printed JSON result to stdout.
Help remains text and LSP uses JSON-RPC. stderr is reserved for logs and
diagnostics, using JSONL by default. Select human-readable logs explicitly
with:

```bash
skelc --log-format text gen go-module --skel-in ./domain/user/skel --go-out ./domain/user/skeled/golang --go-module go.yorun.ai/app/demo/user
```

Ordinary logs carry `level` and `message`; structured diagnostics also include `code`, `severity`, and `range`, with optional `related` and `suggestion` fields:

```json
{"level":"warn","code":"loader.ignored-hidden-file","severity":"warning","range":{"start":{"file":"/path/.hidden.skel","line":1,"column":1},"end":{"file":"/path/.hidden.skel","line":1,"column":1}},"message":"/path/.hidden.skel ignored (HIDDEN_FILE)"}
```

Exit code `0` means the result was satisfied, `1` means `check` or
`format --check` completed with an unsatisfied result, and `2` means the command
failed. A failed command writes `{code,message}` to stdout. Public Go consumers
can use the result and error types in `go.yorun.ai/skel/cmd/skelc/output`.

## Strict mode

`--strict` is a global flag, disabled by default. The default mode, `--strict`, and `--strict=false` enforce the same language rules:

- Services must declare `pub`, `ext`, or `api`.
- Client admission rules (`for Actor`, service/method auth, and `require`) belong only to API services.
- API services must explicitly declare `auth required`, `auth optional`, or `auth anonymous` at service level. Methods may inherit that policy.
- Web declarations must explicitly declare `auth required`, `auth optional`, `auth anonymous`, or `auth off`.

Ordinary warnings, such as an ignored hidden file, remain warnings. A failed `check` returns exit code `1`; compilation failure in generation, schema, or formatting returns `2`. Formatting validates all inputs before rewriting files. `schema diff` applies the same language rules to candidate and baseline sources.

Go integrations retain `api.Input{SkelIn: "./skel", Strict: true}`.

## Input modes

`--skel-in` accepts either a single `.skel` file or a directory. Directory mode requires `domain.skel`. skelc ignores hidden files, subdirectories, and non-Skel files, and loads accepted files in filename order.

All accepted files must declare the same domain. `domain.skel` may contain only the domain declaration and its optional `@desc`; other files carry the domain declarations and contracts.

Generation resolves imported domains with repeatable mappings:

```bash
--skel-import demo.user=./domain/user/pub/skel
```

The mapping key is the full domain name declared by `import`; the value points
to that domain's public Skel input.

`schema dep` (all views) and `schema list --pub/--api` also accept these mappings to resolve dependencies. Other schema commands do not accept these mappings. Default schema queries and source-based
diffs preserve imported symbols as opaque, fully qualified references.

## Validate and transform

Validate a single file or directory:

```bash
skelc check --skel-in ./domain/user/skel
```

`check` returns `{valid,diagnostics}`. It reports independent syntax and semantic
diagnostics in one run, up to 50 per domain, and isolates an invalid declaration
so dependent errors do not cascade. An invalid input completes the
command with exit code `1`, not a command failure.

Format accepted files in place:

```bash
skelc format --skel-in ./domain/user/skel
```

Check formatting in CI without modifying files:

```bash
skelc format --check --skel-in ./domain/user/skel
```

`--check` exits with code `1` when any accepted file requires formatting. The
result always has a stable `changed` boolean and ordered `files` array:

```json
{
  "changed": true,
  "files": ["/workspace/domain/user/skel/domain.skel"]
}
```

Formatting validates all input and either replaces every changed file or restores
the files it already replaced. Formatting normalizes whitespace without reordering declarations or changing multiline comment indentation or triple-quoted string values.

## Run the language server

Editors and other development tools can start the Skel language server over standard input and output:

```bash
skelc lsp
```

The language server reports multiple syntax and semantic issues as you edit. It also provides quick fixes, related diagnostic locations, document symbols, cross-file Go to Definition, Find All References, and schema compatibility CodeLens actions. Clients can enable live compatibility diagnostics and invoke the `skel.schema.diff` execute command to retrieve the complete structured report for the current in-memory domain.

Compatibility analysis uses the same impact rules as `skelc schema diff`. By default it compares the domain's source file or directory with Git `HEAD`; clients may provide an explicit baseline source path. `BREAKING`, `DANGEROUS`, and optionally `COMPATIBLE` changes are reported as warning, information, and hint diagnostics.

Clients configure the feature through `initializationOptions.schemaCompatibility` or `workspace/didChangeConfiguration`: `diagnostics` and `codeLens` enable the corresponding live features, `includeCompatible` reports `COMPATIBLE` changes as hints, and `baseline` selects a source file or directory relative to the domain source directory. An empty baseline uses Git `HEAD`. The server advertises `skel.schema.diff` through `executeCommandProvider`; invoke it with one document URI argument to receive the same complete report shape returned by the CLI. If Git history is unavailable, live compatibility diagnostics stay silent and an explicit command returns an actionable error.

Analysis includes unsaved changes. A directory containing `domain.skel` is a directory input: files declaring the same domain in that directory are analyzed together. Without `domain.skel`, each file is an independent input, so standalone files in the same directory may declare the same domain and types without conflict. This matches `check`: imports remain unresolved during validation, while generation commands validate the complete import graph from explicit `--skel-import` mappings.

LSP clients may set `initializationOptions.strict` or send `workspace/didChangeConfiguration` with `{ "strict": true }` (or `{ "skelc": { "strict": true } }`). An explicit initialization value overrides the `skelc --strict lsp` startup flag. Both values currently produce the same diagnostics.

LSP traffic has exclusive use of standard input and output. Integrations must not write logs to the server's stdout.

## Scan source imports

List the domain imports declared directly in the input:

```bash
skelc scan imports --skel-in ./domain/user/skel
```

The result is a JSON array of import declarations, with `domain`, optional explicit
`alias`, `file`, and one-based `line` and `column` fields. No imports produces
`[]`. Repeated imports in different source files remain separate entries,
sorted by file and source position. Comments and descriptions are not imports.

This query validates the target input without loading imported domains. It
requires no `--skel-import` mappings and does not include transitive dependencies.
The existing `--strict` option also applies.

## Inspect and diff schemas

Query selected declarations and their external dependencies in the complete domain, public contract, or API view:

```bash
skelc schema dep --skel-in ./domain/user/skel --skel-import common=./domain/common/skel
skelc schema dep --pub --skel-in ./domain/user/skel --skel-import common=./domain/common/skel
skelc schema dep --api --skel-in ./domain/user/skel --skel-import common=./domain/common/skel
skelc schema dep --api --prune --actor demo.user.UserActor \
  --skel-in ./domain/user/skel --skel-import common=./domain/common/skel
skelc schema dep --api --prune --name common.Money \
  --skel-in ./domain/common/skel
```

Without a view flag, query the complete domain; `--pub` selects the same backend public contract as `schema list --pub`; `--api` selects the API view. `--pub` and `--api` are mutually exclusive. `--actor`, `--prune`, and `--name` require `--api`. `--prune` is optional and uses the same rules as API generation: without it, retain public data/enums and services matched by the optional `--actor`; with it, at least one `--actor` or `--name` is required. Both flags can repeat and their roots are combined. `--name` requires `--prune` and names a data/enum declared in the current input domain. Type-only selection includes no services. Short names, aliases and unknown roots are errors. This command parses the full import graph, so provide all required transitive `--skel-import domain=PATH` mappings. `--strict` applies.

The JSON result contains `domain`, sorted fully qualified local declaration arrays `services`, `data`, `enums`, `actors`, `configs`, `events`, `resources`, `webs`, and `tasks`, plus a sorted, deduplicated `dependencies` array of `{ "domain": "common", "name": "Money", "kind": "data" }` objects. Complete and public views include external data/enum, Actor, and permission-resource references, including types in config, event, authentication, resource-check, and task declarations. API queries preserve their existing JSON fields (`domain`, `services`, `data`, `enums`, `dependencies`) and external data/enum dependency semantics; categories outside the API view are omitted. Complete/public views retain empty category arrays as `[]`.

Dependencies describe references from the selected local declarations, not the transitive import graph. Nested collections and generic arguments are traversed; foreign declaration members are not. Generic definitions and their external type arguments are reported independently. Query each dependency's owning domain to continue traversal. Empty lists are `[]`; an empty domain or a valid API selection with no matching services succeeds. No output directory or target-language parameters are used.

List top-level declarations in the normalized semantic schema:

```bash
skelc schema list --skel-in ./domain/user/skel
skelc schema list data --skel-in ./domain/user/skel
```

The optional positional `TYPE` filters the list. Supported kinds are `actor`,
`config`, `data`, `enum`, `event`, `resource`, `service`, `task`, and `web`.

Select the backend public or API generation view:

```bash
skelc schema list --pub --skel-in ./domain/user/skel
skelc schema list --api --actor demo.user.UserActor --skel-in ./domain/user/skel
skelc schema list --api --prune --actor demo.user.UserActor \
  --name demo.user.Extra --skel-in ./domain/user/skel data
```

`--pub` and `--api` are mutually exclusive. Public selection includes public contracts and their local type dependencies; API selection uses the same rules as API generation and `schema dep --api`. `--actor` can repeat and requires `--api`, but not `--prune`. `--name` can repeat, requires `--api --prune`, and selects current-domain data/enum roots. Pruning requires at least one actor or name. The positional `TYPE` filters declarations after the view has been built.

Both generation views load and validate the full import graph; supply required transitive `--skel-import domain=PATH` mappings. Without a view flag, `list` retains shallow inspection and rejects dependency mappings. Results contain only declarations owned by the current domain, including local types required by selected roots. Foreign dependencies are queried using `schema dep` with the corresponding view flag.

All modes return the same JSON array of `{ "pub": false, "name": "Result", "type": "data", "skelName": "demo.user.Result" }` entries. `pub` is the original backend public attribute, not a selection marker: an API service or a private referenced type can appear with `pub: false`. Empty views or kind filters return `[]`; invalid input or selection fails instead of returning an empty result. `--strict` applies to all modes.

Get one complete declaration by type and fully qualified Skel name:

```bash
skelc schema get data demo.user.User --skel-in ./domain/user/skel
skelc schema get resource demo.user.User --skel-in ./domain/user/skel
```

Some declaration kinds have independent namespaces, so `data` and `resource`
can share one fully qualified Skel name. `TYPE` is therefore required and is part of
the declaration identity. `get` returns one complete normalized JSON declaration
including its type-specific data, enum, resource, service, or other body:

```json
{
  "pub": true,
  "name": "User",
  "type": "data",
  "skelName": "demo.user.User",
  "data": {
    "members": [
      {
        "name": "id",
        "type": {
          "kind": "scalar",
          "name": "uuid"
        }
      }
    ]
  }
}
```

If the requested declaration does not exist, `get` returns JSON `null` with
exit code `0` — absence is a normal query result, not a command failure.

Default `schema list` and `schema get` inspect the complete current domain without
resolving external domain definitions. External references use canonical fully
qualified names, independent of the local import alias. Generation-view lists
resolve imports but return only the selected current-domain declarations. Each
declaration retains its original `pub` marker.

Services and web declarations expose authentication modes as `authMode`.
Service methods retain declared `authMode` and `require` and also include
`effectiveAuthMode` and optional `effectiveRequire`. `effectiveAuthMode` applies the
service default to inherited method authentication. `effectiveRequire` combines
service and method requirements with `all`, preserving expression order and check
arguments; it is omitted when neither declares a requirement. Default inspection
computes these policies without loading imports, so external check targets and
argument types can remain unresolved.

An actor's `auth` field describes its authentication capability object.

Every successfully completed schema command writes exactly one JSON result to
stdout and exits with code `0`. Any failure of the command, input, compilation,
Git history, or schema exits nonzero and writes one JSON error object to stdout:

```json
{
  "code": "COMPILATION_FAILED",
  "message": "failed to compile schema source"
}
```

Programs must branch on `code`, not parse `message`. Current stable codes are

- `INVALID_ARGUMENT`: command arguments or flag combinations are invalid.
- `COMPILATION_FAILED`: Skel source loading, parsing, or semantic analysis failed.
- `GIT_HISTORY_NOT_FOUND`: an implicit Git baseline could not be found.
- `COMMAND_FAILED`: output, projection, encoding, or another command operation failed.

stderr is reserved for zero or more JSONL logs and diagnostics and is never
part of the command result. `--log-format text` selects human-readable stderr.

Imported member, argument, and result types use the explicit
`"kind": "importedReference"` representation:

```json
{
  "kind": "importedReference",
  "name": "identity.user.UserSummary"
}
```

Resolved references owned by the current domain retain their declaration kind:
`enum`, `data`, `config`, or `event`.

List every schema change between baseline and candidate Skel source files or directories:

```bash
skelc schema diff \
  --skel-in ./domain/user/skel

skelc schema diff \
  --baseline-skel-in ./previous/user/skel \
  --skel-in ./domain/user/skel
```

Source imports remain opaque and do not use filesystem mappings. The schema
diff command does not accept import mappings. Diff always covers the complete
domain, including both public and private declarations. It accepts only original
Skel source and does not read schema snapshot files.

`--baseline-skel-in` is optional. When it is omitted, skelc discovers the Git
repository containing `--skel-in` and extracts the same file or directory from
`HEAD`. This compares the latest committed source with the current working tree.
Baseline source positions use the stable `HEAD:<repo-relative-path>` form. If no
Git repository, commit history, or matching path at `HEAD` exists, the command
fails and prompts you to pass `--baseline-skel-in` explicitly.

Changes are assigned stable codes and one of three SCREAMING_CASE `impact`
values:

Compatibility describes existing interactions, not whether regenerated code compiles
without implementation changes. New service methods (including `ext` methods)
and resource checks remain compatible; using them requires support from the peer.

- `BREAKING`: removes an existing capability, rejects previously admitted callers,
  or makes an existing request or response incompatible. Examples include adding
  a required input, tightening authentication, adding a permission requirement,
  and removing actor authentication or permission support.
- `DANGEROUS`: may change security or business interpretation, or cannot be proved
  compatible. Examples include relaxing authentication, replacing a permission
  expression, changing config lifecycle, and adding an enum item.
- `COMPATIBLE`: preserves existing interactions, including adding independent
  capabilities and changing documentation or deprecation metadata.

Method authentication is compared after resolving service inheritance. Equivalent
explicit and inherited equivalent modes are compatible. Adding a duplicate permission
requirement already enforced at service or method scope is also compatible.
Changing web authentication from `off` to `required`, `optional`, or `anonymous`
is breaking: supplied credentials are validated instead of passed through.
Permission conjunctions are compared across service and method scope; adding a
new required condition (`P` to `P && Q`) is breaking. Reordering, duplicating, or
moving the same conditions between those scopes is compatible. Other logical
rewrites, including non-equivalent disjunctions, remain dangerous.
For locally traceable data used only in responses, adding fields is compatible.
Allowing null in an input or removing null from an output is compatible when the
rest of the type is unchanged. Nullable credential fields may be added without
requiring old callers to supply them. Shared input/output types, independently
public types, generic uses, and unknown uses retain conservative classification.
Field order alone is compatible; argument order remains breaking because
positional invocation is supported. `compatible: true` means no `BREAKING` changes;
it does not exclude `DANGEROUS` changes or guarantee deployment/version selection.

A domain-name change replaces the schema identity rather than renaming one
nested symbol. Diff emits a single `domain.name.changed` item with
`change: "MODIFIED"` and `impact: "BREAKING"`, then stops without expanding
declaration, member, or metadata changes beneath the replaced domain.

Each item also has an independent SCREAMING_CASE `change` value:

- `ADDED`: a declaration, member, item, method, or capability was added.
- `REMOVED`: an existing element was removed.
- `MODIFIED`: an existing element changed type, order, visibility, metadata,
  authentication, authorization, sensitivity, or another property.

For example, adding an enum item produces `change: "ADDED"` with
`impact: "DANGEROUS"`, while adding a required input member produces the same
`change` with `impact: "BREAKING"`.

The command always emits every detected change in a structured JSON report,
including the compatibility result, summary counts, stable change codes,
symbols, and available baseline or candidate source positions. A completed
diff returns exit code `0` regardless of its compatibility result;
command, input, compilation, and schema format errors return `2`. CI can read
the report and apply its own failure policy instead of configuring the diff
command.

## Go library integration

Go tools can use `go.yorun.ai/skel/api` directly for `Check`, `ScanImports`,
`FormatSource`, `FormatFiles`, `QuerySchema`, `DiffSchemaSources`, and dependency
queries. `Check` allows unresolved imports and returns source errors as diagnostics
with `Valid: false`; loading failures return an error. Formatting returns source
bytes or a validated replacement plan and does not write files.

`QuerySchema` defaults to unresolved inspection, matching schema list/get;
`Pub`, `Api`, or `ResolveImports` selects a resolved view and requires the complete
import mappings. Its `Domain` result is a `*schema.Domain`; use
`domain.Declarations()` and `domain.Find(kind, skelName)` to inspect declarations.
`go.yorun.ai/skel/schema/diff` provides `Compare(baseline, candidate)` for semantic
domains. `DiffSchemaSources` compares explicit
source inputs or defaults to Git HEAD for filesystem candidates. Historical
baselines must satisfy the same language rules as candidates.

`Input.Sources` and inspection options accept a complete `map[string][]byte`
snapshot keyed by logical file paths. Relative paths resolve against the working
directory; directory inputs follow the usual `domain.skel` layout. Nil reads
from disk; a non-nil snapshot never falls back to disk. Imported domains must
also be present in that snapshot and mapped by `SkelImports`. Frozen source diffs
require an explicit baseline. Read APIs have cancellation-aware `Context`
variants. See the [Go API examples](https://github.com/yorun-ai/skel#programmatic-api).

Custom language bindings are written in Go with `go.yorun.ai/skel/codegen`.
Parse once with `api.Parse`, then call `codegen.Prepare` to select the full, public,
or API surface. `codegen.Input` references the same `schema` declarations and adds
selection, declaration lookup, external dependencies, type traversal and generic
substitution. Treat the prepared schema as read-only; target import paths and names
belong to the binding.

Implement `codegen.Generator` to return `[]codegen.File`. Use `codegen.Generate` to
inspect the file set without writing, or `codegen.Run` to publish it with managed
cleanup and rollback. Files have relative paths and named output targets; target
directories must not overlap. Existing files at generated paths are replaced,
stale marked files are removed, and unrelated unmarked files are retained. For
another source format, set `File.CommentPrefix`, such as `#` for Python.

`api.NewGolangGenerator`, `api.NewTypeScriptGenerator` and `api.NewSkeletonGenerator`
use the same interface. They select the surface configured in their options;
`Out` supplies naming context and `codegen.Run` supplies actual destinations.
The primary target is `""`; split Go output also uses `"pub"`.
See the [runnable binding example](https://github.com/yorun-ai/skel/blob/main/codegen/example_test.go).

## Generate Go source

Generate Go files inside an existing module:

```bash
skelc gen go \
  --skel-in ./domain/user/skel \
  --go-out ./domain/user/src/server/skeled
```

`--go-vine-version` overrides the Vine requirement written into generated module output. The value must be a complete `v`-prefixed semantic version, such as `v0.28.0`, that is compatible with the Go module path and no lower than skelc's minimum supported Vine version. `skelc version` reports that minimum and the default it writes when the flag is omitted.

Generation marks ownership near the top of every output with
`Code generated by skelc. DO NOT EDIT.`. Unmarked files are preserved.
Regeneration removes previously generated files that still carry the marker but
are no longer needed, and overwrites files at paths produced by the current
generation.

Every generation command returns `{generated}` after committing its outputs.
Non-fatal compiler diagnostics are written as JSONL logs to stderr by default;
use `--log-format text` for human-readable log entries.

## Generate Go modules

Generate a standalone module:

```bash
skelc gen go-module \
  --skel-in ./domain/user/skel \
  --go-out ./domain/user/skeled/golang \
  --go-module example.com/demo/user/skeled
```

Generate regular and public modules together:

```bash
skelc gen go-module \
  --skel-in ./domain/user/skel \
  --go-out ./domain/user/skeled/golang \
  --go-module example.com/demo/user/skeled \
  --go-pub-out ./domain/user/pub/skeled/golang \
  --go-pub-module example.com/demo/user/skeledpub
```

For external domains, supply both Skel and generated Go import mappings:

```bash
skelc gen go-module \
  --skel-in ./domain/order/skel \
  --skel-import demo.user=./domain/user/pub/skel \
  --go-import demo.user=example.com/demo/user/skeledpub \
  --go-out ./domain/order/skeled/golang \
  --go-module example.com/demo/order/skeled
```

`--go-module-prefix` can derive external public module paths when every domain follows a shared naming convention. Explicit `--go-import domain=module` mappings take precedence.

Generation validates the module metadata it writes. Main and public module identities, including paths derived from a prefix, must be valid Go module paths, and Go import versions must be complete `v`-prefixed semantic versions compatible with their module paths. Mappings that name the same Go module must agree on its version; a conflict, including one that overrides the selected runtime dependency, fails generation.

Both `gen go` and `gen go-module` accept `--api` for portal clients or `--pub` for backend public contracts. The flags are mutually exclusive and cannot be combined with `--go-pub-out` or `--go-pub-module`. Both commands support `--skel-import` and `--go-import`.

With `--api`, use `--go-vrpc-version` to override vRPC v0.13.0; `--go-vine-version` does not apply. A module prefix derives `example.com/gen/shop/orderapi` for domain `shop.order`, and foreign domains use their corresponding API modules. Backend Go output requires Vine v0.28.0 or later for `RegisterDomainDescriptor` and defaults to that version; see [compatibility](/docs/compatibility#generated-output-contract).

`gen go --api`, `gen go-module --api`, and `gen ts --api` accept repeatable `--actor domain.NameActor` flags. Only services whose `for` declarations match a selected fully qualified actor name are generated. Multiple actors select the union; without `--prune`, omitting the flag selects all API services. Selected services retain all methods, regardless of authentication, permissions, or actor transport. Unknown names, short names, and import aliases are errors. Without `--prune`, explicitly public data and enums remain available; other data and external type dependencies are collected only from selected services.

```bash
skelc gen ts --api \
  --actor demo.user.UserActor \
  --skel-in ./skel \
  --ts-out ./generated/user-api
```

### Prune API types

API generators accept `--prune` with repeatable `--actor` and/or `--name` roots:

```bash
skelc gen go --api --prune --name demo.user.User \
  --skel-in ./skel --go-out ./generated/userapi
skelc gen ts --api --prune --actor demo.user.UserActor --name demo.user.Extra \
  --skel-in ./skel --ts-out ./generated/user-api
```

Pruning retains only selected services/types and their local type dependencies, including recursive types and generic arguments. Unreferenced public data/enums are omitted. Only `--name` roots means no services; actor and type roots together select their union. `--prune` requires `--api` and at least one root; `--name` requires `--prune` and must name a current-domain data or enum. Foreign type roots must be generated in their owning domain. This applies to `gen go`, `gen go-module`, and `gen ts` (including `--ts-as-module`). Without `--prune`, public types are preserved. `schema dep --api` shares the generation selection logic; language imports and package dependencies follow the resulting view.

### Module parameters

- `--skel-import domain=PATH`: external Skel domain path; repeat for transitive imports
- `--go-module MODULE`: explicit module path for the current output
- `--go-pub-out PATH`: public Go module output directory; requires `--go-out`
- `--go-pub-module MODULE`: explicit public output module; defaults to the current module plus `pub`
- `--go-import domain=PACKAGE`: Go import path for an external domain; repeatable
- `--go-module-prefix PREFIX`: derives Go module and import paths

`--go-module-prefix`, `--go-module`, and `--go-pub-module` must not end with `/`.

### Generation behavior

- `gen go` writes into an existing module and never creates `go.mod`.
- Without `--go-pub-out`, a Go module contains the full data, enum, config, actor, resource, service, event, web, and task surface.
- With `--go-pub-out`, skelc writes a public and a regular module together and registers each non-full schema on only one side.
- A `pub` service produces a client spec in the public module and a server spec in the regular module.
- A `pub` event produces a listener spec in the public module and an emitter spec in the regular module.
- A `pub` actor's auth service produces a server spec in the public module, and its credential, info, and actor permission services follow the actor.
- A `pub` resource produces permission code constants, its check service server, and its schema in the public module; the regular module exposes a facade for them.
- The regular module requires the public module and exposes the public module's symbols, so the regular package is a symbol superset.
- When a `pub` service or method `require` references a local resource, that resource must be `pub`.
- Local data and enum dependencies of a public contract are collected automatically and do not need `pub`; actors and resources still require public visibility.
- `web` does not support `pub`, and ordinary Go generation produces a web spec for every `web`.
- A `web` server interface is named like `UserPortalWebServer`, and its default implementation like `DefaultUserPortalWebServer`.
- The default `web` implementation is only a shell; Go code supplies routing by implementing `Routes(*web.Router)`.
- A declared `web` mount path reaches the generated spec and the runtime schema; see [Vine Integration](/docs/vine-integration#declared-web-mount-paths).
- `--go-module-prefix` derives a public import path as `<prefix>/<domain parts except last>/<last-domain>pub`, for example `example.com/demo/skeled/userpub`.

## Generate TypeScript

Generate TypeScript source:

```bash
skelc gen ts --api \
  --skel-in ./domain/user/skel \
  --ts-out ./domain/user/pub/skel/typescript
```

`gen ts` requires `--api` and rejects `--pub`. By default it emits API clients, their data dependencies, and explicitly public data and enums; a domain without API services can still produce a types-only API package.

To generate package metadata, add `--ts-as-module` and identify the package with `--ts-module` or `--ts-module-scope`. Map external domains with repeatable `--ts-import domain=package` flags:

```bash
skelc gen ts --api \
  --skel-in ./domain/user/skel \
  --ts-out ./domain/user/pub/skel/typescript \
  --skel-import demo.user=./domain/user/pub/skel
```

Generated package names and dependency package names must be valid lowercase npm names, such as `@example/client`. Explicit version constraints for the same npm package must agree, and conflicting constraints fail generation. Inferred wildcard versions do not override explicit constraints.

## Generate public Skel

Export the public contract surface for other domains:

```bash
skelc gen skel \
  --pub \
  --skel-in ./domain/user/skel \
  --skel-out ./domain/user/pub/skel
```

`gen skel` requires `--pub`. It retains public data, enums, configuration, actors, resources, services, events, and the public dependencies they require; implicit data dependencies keep their original visibility markers. An actor's `auth { credential / info }` is rendered back inside the actor rather than as extra top-level data. When a `pub` service or method `require` references a local resource, that resource must be `pub`.

## Version information

Display compiler, platform, Go, and default Vine version information:

```bash
skelc version
```

Compare the `version` field returned by `skelc version` against the minimum your integration requires.

For language rules referenced by these commands, see the [Skel syntax reference](/docs/syntax).
