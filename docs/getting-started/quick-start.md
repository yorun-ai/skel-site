---
slug: /getting-started
---

# skelc Guide

`skelc` compiles `.skel` contracts into Go, Go modules, TypeScript, or public-only Skel definitions. It also provides validation, formatting, and symbol inspection.

## Installation and Versioning

Install it with Go:

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version
```

The Vine runtime requires a minimum generator version. After installing or upgrading Vine, use these commands to inspect the requirement and upgrade `skelc`:

```bash
vine version
go install go.yorun.ai/skelc/cmd/skelc@latest
```

## Quick Workflow

The recommended structure for a domain is:

```text
user/
├── skel/
│   ├── domain.skel
│   └── user.skel
└── skeled/
```

First, create the domain declaration:

```skel title="skel/domain.skel"
domain demo.user
```

Then declare a contract:

```skel title="skel/user.skel"
domain demo.user

pub data User {
    id: int
    name: string
}

pub service UserService {
    method get {
        input {
            id: int
        }
        output User
    }
}
```

Format and validate it before generating code:

```bash
skelc format --skel-in ./skel
skelc check --skel-in ./skel
```

Generate a regular Go package:

```bash
skelc gen go \
  --skel-in ./skel \
  --go-out ./skeled
```

The generator tracks generated files in `.skelc-manifest.json` and does not delete untracked files in the same directory. Generated code is still derived output: edit the `.skel` source and regenerate instead of modifying generated files manually. Modified stale generated files are preserved for manual review.

## Input Directories and Cross-Domain References

`--skel-in` can point to one `.skel` file or a directory. Directory mode requires a `domain.skel` file. Valid `.skel` files in the directory are loaded in filename order, and they must all declare the same domain.

When a contract references an external domain, declare an `import` in the `.skel` file and provide a path mapping on the command line:

```skel
domain demo.order

import demo.user as user

data Order {
    owner: user.User
}
```

`check` validates the current input directly. When generating code that references an external domain, provide its public Skel path with repeatable `--skel-import domain=PATH` mappings. Import aliases only affect qualified type names in `.skel` files; they do not affect output directories.

## Common Commands

| Command | Purpose |
| --- | --- |
| `skelc check --skel-in PATH` | Validate syntax, references, naming, and type constraints. |
| `skelc format --skel-in PATH` | Format Skel files in place. |
| `skelc symbol list --skel-in PATH` | List top-level symbols in the current domain. |
| `skelc symbol get NAME --skel-in PATH` | Inspect a symbol by its Skel name. |
| `skelc gen go ...` | Generate Go code without a module. |
| `skelc gen go-module ...` | Generate regular and public Go modules with `go.mod`. |
| `skelc gen ts ...` | Generate TypeScript data, enums, and applicable service clients. |
| `skelc gen skel --pub ...` | Generate a reduced public `.skel` contract. |

`symbol` supports `--output-format json`, and `version` supports `--output-format json`. Set the global log format to JSONL when an upstream tool needs structured diagnostics:

```bash
skelc --log-format jsonl check --skel-in ./skel
```

## Go Module Generation

Module projects usually generate regular and public packages together:

```bash
skelc gen go-module \
  --skel-in ./skel \
  --go-out ./skeled/golang \
  --go-module example.com/demo/user/skeled \
  --go-pub-out ./pub/skeled/golang \
  --go-pub-module example.com/demo/user/skeledpub
```

- The regular package contains the complete contract, server interfaces, and facades for public symbols.
- The public package contains only contracts marked `pub` and their public dependencies. Other modules can safely import it.
- Data, enums, actors, or resources referenced by a public contract must also be marked `pub` explicitly.

Cross-domain Go module generation additionally requires Skel and Go import mappings:

```bash
skelc gen go-module \
  --skel-in ./order/skel \
  --skel-import demo.user=./user/pub/skel \
  --go-import demo.user=example.com/demo/user/skeledpub \
  --go-out ./order/skeled/golang \
  --go-module example.com/demo/order/skeled
```

When every external module follows the same path convention, use `--go-module-prefix` instead of multiple `--go-import` mappings.

## TypeScript and Public Skel Generation

Generate TypeScript with:

```bash
skelc gen ts \
  --skel-in ./skel \
  --ts-out ./pub/skel/typescript
```

With `--pub`, the output only includes public data, enums, and public service clients associated with an actor that has `via client`. To emit npm package metadata, use `--ts-as-module`, `--ts-module-scope`, and `--ts-module`.

Export the smallest contract set for other domains with:

```bash
skelc gen skel \
  --pub \
  --skel-in ./skel \
  --skel-out ./pub/skel
```

`gen skel` requires `--pub`. Its output only retains public contracts and the dependencies they require.

## Troubleshooting

If generation fails, check the following in order:

1. Run `skelc check --skel-in ...`, review multiple independent diagnostics, and prioritize the earliest error for each root cause.
2. Confirm that the directory contains exactly one `domain.skel` and that every file declares the same domain.
3. For cross-domain types, confirm that both the `import` and `--skel-import` mapping are present.
4. For public contracts, confirm that referenced declarations in the same domain are also marked `pub`.
5. Upgrade `skelc` so that it satisfies the minimum version displayed by `vine version`.

See the [Skel language reference](/docs/syntax) for detailed DSL rules.
