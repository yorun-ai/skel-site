---
slug: /cli
---

# CLI Reference

skelc validates, formats, inspects, snapshots, and diffs `.skel` definitions and generates Go, TypeScript, and public Skel contracts.

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
can use the result and error types in `go.yorun.ai/skelc/command`.

## Input modes

`--skel-in` accepts either a single `.skel` file or a directory. Directory mode requires `domain.skel`. skelc ignores hidden files, subdirectories, and non-Skel files, and loads accepted files in filename order.

All accepted files must declare the same domain. `domain.skel` may contain only the domain declaration and its optional `@desc`; other files carry the domain declarations and contracts.

Generation resolves imported domains with repeatable mappings:

```bash
--skel-import demo.user=./domain/user/pub/skel
```

The mapping key is the full domain name declared by `import`; the value points
to that domain's public Skel input.

Schema commands do not accept these mappings. Schema snapshots and source-based
diffs preserve imported symbols as opaque, fully qualified references.

## Validate and transform

Validate a single file or directory:

```bash
skelc check --skel-in ./domain/user/skel
```

`check` returns `{valid,diagnostics}`. It recovers at declaration, block-member,
closing-brace, and decorator boundaries and reports up to 50 independent syntax
and semantic diagnostics per domain in one run. An invalid input completes the
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

Formatting validates all input and stages every changed file before writing. It preserves ownership, mode, and supported extended metadata, then synchronizes parent directories before reporting success. If a later write or durability sync fails, files already replaced by the command are restored. Formatting normalizes whitespace without reordering declarations or changing multiline comment indentation or triple-quoted string values.

## Run the language server

Editors and other development tools can start the Skel language server over standard input and output:

```bash
skelc lsp
```

The language server reports multiple syntax and semantic issues as you edit. It also provides quick fixes, related diagnostic locations, document symbols, cross-file Go to Definition, Find All References, and schema compatibility CodeLens actions. Clients can enable live compatibility diagnostics and invoke the `skel.schema.diff` execute command to retrieve the complete structured report for the current in-memory domain.

Compatibility analysis uses the same normalized projection and impact rules as `skelc schema diff`. By default it compares the domain's source directory with Git `HEAD`; clients may provide an explicit baseline source path. `BREAKING`, `DANGEROUS`, and optionally `COMPATIBLE` changes are reported as warning, information, and hint diagnostics.

Clients configure the feature through `initializationOptions.schemaCompatibility` or `workspace/didChangeConfiguration`: `diagnostics` and `codeLens` enable the corresponding live features, `includeCompatible` reports `COMPATIBLE` changes as hints, and `baseline` selects a source file or directory relative to the domain source directory. An empty baseline uses Git `HEAD`. The server advertises `skel.schema.diff` through `executeCommandProvider`; invoke it with one document URI argument to receive the same complete report shape returned by the CLI. If Git history is unavailable, live compatibility diagnostics stay silent and an explicit command returns an actionable error.

Analysis includes unsaved changes but treats each source directory as an independent input. Files that declare the same domain are merged only when they are in the same directory, so the same domain name can appear in separate directories without conflict. This matches `check`: imports remain unresolved during validation, while generation commands validate the complete import graph from explicit `--skel-import` mappings.

LSP traffic has exclusive use of standard input and output. Integrations must not write logs to the server's stdout.

## Inspect, snapshot, and diff schemas

List top-level declarations in the normalized semantic schema:

```bash
skelc schema list --skel-in ./domain/user/skel
skelc schema list data --skel-in ./domain/user/skel
```

The optional positional `TYPE` filters the list. Supported types are `actor`,
`config`, `data`, `enum`, `event`, `resource`, `service`, `task`, and `web`.

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
exit code `0`. Absence is a normal query result rather than a command failure.

Schema inspection covers declarations in the current input and does not resolve
external domain definitions. External references use their canonical fully
qualified names, independent of the local import alias. Inspection always covers
the complete domain, and each declaration retains its `pub` marker.

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

Create a deterministic, versioned JSON schema snapshot:

```bash
skelc schema snapshot \
  --skel-in ./domain/user/skel \
  > ./dist/user.schema.json
```

`schema snapshot` always captures the complete domain and preserves each
declaration's `pub` marker. It writes the JSON document to stdout; use shell
redirection to persist a snapshot. The artifact records `format`,
`formatVersion`, domain, documentation, and normalized declarations. Source
positions are intentionally omitted so moving a source tree does not change the
artifact.

Imported domains are intentionally not embedded in this artifact. Their symbols
are recorded as opaque, fully qualified references. `schema snapshot` does not
accept `--skel-import`. Snapshot and diff each imported domain separately to
verify its own compatibility.

Imported member, argument, and result types use the explicit
`"kind": "importedReference"` representation:

```json
{
  "kind": "importedReference",
  "name": "identity.user.UserSummary"
}
```

Resolved references owned by the current domain retain their declaration kind:
`enum`, `data`, `config`, or `event`. This distinction is part of the normalized
schema and is shared with generated Vine runtime schema metadata.

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

- `BREAKING`: removes or structurally changes an existing contract, adds a
  required member or argument, or otherwise forces existing users to change
  their code or data.
- `DANGEROUS`: preserves structural compatibility but can change runtime,
  security, or interpretation semantics, such as changing authentication or
  permission requirements, changing config lifecycle, or adding an enum item.
- `COMPATIBLE`: adds an independently callable declaration or method, or changes
  documentation and deprecation metadata.

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
`impact: "DANGEROUS"`, while adding a required data member produces the same
`change` with `impact: "BREAKING"`.

The command always emits every detected change in a structured JSON report,
including the compatibility result, summary counts, stable change codes,
symbols, and available baseline or candidate source positions. A completed
diff returns exit code `0` regardless of its compatibility result;
command, input, compilation, and schema format errors return `2`. CI can read
the report and apply its own failure policy instead of configuring the diff
command.

## Generate Go source

Generate Go files inside an existing module:

```bash
skelc gen go \
  --skel-in ./domain/user/skel \
  --go-out ./domain/user/src/server/skeled
```

`--go-vine-version` overrides the Vine requirement written into generated module output. The value must be a `v`-prefixed semantic version no lower than skelc's built-in default.

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

## Generate TypeScript

Generate TypeScript source:

```bash
skelc gen ts \
  --skel-in ./domain/user/skel \
  --ts-out ./domain/user/pub/skel/typescript
```

`--pub` emits only public data and enums plus eligible public service clients. A service client is generated when the service is available to an actor with `via client`.

To generate package metadata, add `--ts-as-module` and identify the package with `--ts-module` or `--ts-module-scope`. Map external domains with repeatable `--ts-import domain=package` flags.

## Generate public Skel

Export the public contract surface for other domains:

```bash
skelc gen skel \
  --pub \
  --skel-in ./domain/user/skel \
  --skel-out ./domain/user/pub/skel
```

`gen skel` requires `--pub`. It retains public data, enums, configuration, actors, resources, services, events, and the public dependencies they require.

## Version information

Display compiler, platform, Go, and default Vine version information:

```bash
skelc version
```

For language rules referenced by these commands, see the [Skel syntax reference](/docs/syntax).
