---
slug: /cli
---

# CLI Reference

skelc validates, formats, inspects, exports, and compares `.skel` definitions and generates Go, TypeScript, and public Skel contracts.

The built-in help shows the flags your installed version supports:

```bash
skelc --help
skelc check --help
skelc format --help
skelc lsp --help
skelc schema --help
skelc symbol --help
skelc gen --help
```

## Global output

Diagnostics default to text. Tooling can request one JSON object per line with JSONL:

```bash
skelc --log-format jsonl check --skel-in ./domain/user/skel
```

Ordinary logs carry `level` and `message`; structured diagnostics also include `code`, `severity`, and `range`, with optional `related` and `suggestion` fields:

```json
{"level":"warn","code":"loader.ignored-hidden-file","severity":"warning","range":{"start":{"file":"/path/.hidden.skel","line":1,"column":1},"end":{"file":"/path/.hidden.skel","line":1,"column":1}},"message":"/path/.hidden.skel ignored (HIDDEN_FILE)"}
```

Commands that expose structured result data use `--output-format json`.

## Input modes

`--skel-in` accepts either a single `.skel` file or a directory. Directory mode requires `domain.skel`. skelc ignores hidden files, subdirectories, and non-Skel files, and loads accepted files in filename order.

All accepted files must declare the same domain. `domain.skel` may contain only the domain declaration and its optional `@desc`; other files carry the domain declarations and contracts.

Generation, schema export, and source-based schema comparison resolve imported domains with repeatable mappings:

```bash
--skel-import demo.user=./domain/user/pub/skel
```

The mapping key is the full domain name declared by `import`; the value points to that domain's public Skel input.

## Validate and transform

Validate a single file or directory:

```bash
skelc check --skel-in ./domain/user/skel
```

`check` recovers at declaration, block-member, closing-brace, and decorator boundaries and reports up to 50 independent syntax and semantic diagnostics per domain in one run. With `--log-format jsonl`, each diagnostic is emitted separately with its code, severity, range, related locations, and optional suggestion.

Format accepted files in place:

```bash
skelc format --skel-in ./domain/user/skel
```

Check formatting in CI without modifying files:

```bash
skelc format --check --skel-in ./domain/user/skel
skelc format --check --output-format json --skel-in ./domain/user/skel
```

`--check` exits nonzero and lists absolute paths when any accepted file requires formatting. JSON output has a stable `changed` boolean and ordered `files` array:

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

The language server reports multiple syntax and semantic issues as you edit. It also provides quick fixes, related diagnostic locations, document symbols, cross-file Go to Definition, and Find All References.

Analysis includes unsaved changes but treats each source directory as an independent input. Files that declare the same domain are merged only when they are in the same directory, so the same domain name can appear in separate directories without conflict. This matches `check`: imports remain unresolved during validation, while generation commands validate the complete import graph from explicit `--skel-import` mappings.

LSP traffic has exclusive use of standard input and output. Integrations must not write logs to the server's stdout.

## Inspect, export, and compare schemas

List top-level declarations in the normalized semantic schema:

```bash
skelc schema list --skel-in ./domain/user/skel
skelc schema list data --skel-in ./domain/user/skel
skelc schema list --output-format json --skel-in ./domain/user/skel
```

The optional positional `TYPE` filters the list. Supported types are `actor`,
`config`, `data`, `enum`, `event`, `resource`, `service`, `task`, and `web`.

Get one complete declaration by type and fully qualified Skel name:

```bash
skelc schema get data demo.user.User --skel-in ./domain/user/skel
skelc schema get resource demo.user.User --skel-in ./domain/user/skel
skelc schema get data demo.user.User --output-format json --skel-in ./domain/user/skel
```

Some declaration kinds have independent namespaces, so a data and resource can
share one fully qualified Skel name. `TYPE` is therefore required and is part of
the declaration identity. `get` returns one complete normalized declaration
including its type-specific data, enum, resource, service, or other body. Text
output is a deterministic human-readable detail tree:

```text
pub data demo.user.User
  name: User
  members:
    - id: uuid
    - displayName: string?
```

Use `--output-format json` for the lossless declaration object consumed by tools.

Schema inspection covers declarations in the current input and does not resolve
external domain definitions. It defaults to `--scope all`; use `--scope public`
to inspect only declarations in the public contract. The older `symbol list`
and `symbol get` commands remain available as deprecated compatibility entry
points that preserve their historical summary output.

Export a deterministic, versioned JSON schema document:

```bash
skelc schema export \
  --skel-in ./domain/user/skel \
  --schema-out ./dist/user.schema.json
```

`schema export` defaults to `--scope public`; pass `--scope all` for the complete
domain. When `--schema-out` is omitted, the JSON document is written to stdout.
The artifact records `format`, `formatVersion`, domain, scope, documentation,
and normalized declarations. Source positions are intentionally omitted so
moving a source tree does not change the artifact.

Compare a released schema with current source:

```bash
skelc schema compare \
  --against ./released/user.schema.json \
  --skel-in ./domain/user/skel
```

Source-to-source and artifact-to-artifact comparison are also supported:

```bash
skelc schema compare \
  --against-skel-in ./previous/user/skel \
  --skel-in ./domain/user/skel

skelc schema compare \
  --against ./previous.schema.json \
  --schema-in ./current.schema.json
```

Use `--against-skel-import domain=PATH` for baseline source imports and
`--skel-import domain=PATH` for candidate source imports. Both inputs must use
the same scope; comparison defaults to `public`.

Changes are assigned stable codes and one of three impact levels:

- `breaking`: removes or changes an existing contract, adds a required member
  or argument, tightens authentication, or otherwise breaks existing users.
- `dangerous`: can change behavior without being an unconditional source break,
  such as adding an enum item or relaxing an authorization boundary.
- `compatible`: adds an independently callable declaration or method, or changes
  documentation and deprecation metadata.

The default `--fail-on breaking` returns exit code `2` when breaking changes are
found. Exit code `1` is reserved for command, input, compilation, or schema
format errors. CI can select `--fail-on dangerous`, `--fail-on any-change`, or
`--fail-on none`. Add `--output-format json` for a structured report containing
the compatibility result, summary counts, stable change codes, symbols, and
available baseline or candidate source positions.

## Generate Go source

Generate Go files inside an existing module:

```bash
skelc gen go \
  --skel-in ./domain/user/skel \
  --go-out ./domain/user/src/server/skeled
```

`--go-vine-version` overrides the Vine requirement written into generated module output. The value must be a `v`-prefixed semantic version no lower than skelc's built-in default.

Generation marks ownership near the top of every output with
`Code generated by skelc. DO NOT EDIT.`. Unmarked files are preserved, stale
marked files are removed, and files at paths generated by the current run are
overwritten. The first generation after upgrading from v0.9.3 through v0.11.0
migrates and removes the old `.skelc-manifest.json` sidecar.

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
skelc version --output-format json
```

For language rules referenced by these commands, see the [Skel syntax reference](/docs/syntax).
