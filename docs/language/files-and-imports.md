---
slug: /files-and-imports
---

# Files & Imports

A Skel input is either one `.skel` file or one directory representing a domain. The directory form scales better because declarations can be split without changing the domain contract.

## Start Every File with the Domain

```skel
domain commerce.order
```

All files loaded for one input must declare the same domain. In directory mode, `domain.skel` is required and may contain only the domain declaration and its optional `@desc`:

```skel title="skel/domain.skel"
@desc("Ordering contracts")
domain commerce.order
```

Put declarations in the remaining files:

```text
skel/
├── domain.skel
├── model.skel
├── permissions.skel
└── service.skel
```

skelc reads visible `.skel` files in filename order. It ignores hidden files, subdirectories, and other extensions. File order keeps diagnostics and formatted output deterministic; it doesn't create visibility between files.

## Import a Domain

Imports follow the domain declaration and precede top-level declarations:

```skel
domain commerce.order

import identity.user
import commerce.catalog as catalog

data Order {
    buyer: user.UserSummary
    items: list<catalog.ProductRef>
}
```

Without `as`, the final segment becomes the qualifier: `identity.user` is referenced as `user`. An explicit alias helps when two domains end with the same segment or when a shorter name improves a frequently used type.

An import is a logical dependency. The source file doesn't contain a filesystem path. `skelc check` and the language server validate the current input while leaving imported symbols unresolved, so checking needs only the source input:

```bash
skelc check --skel-in ./order/skel
```

Generation validates the complete import graph. Supply physical paths with repeatable `--skel-import` mappings, as shown below. Each mapping must identify a contract whose declared domain matches the key. Provide the complete transitive import graph; cyclic domain imports are rejected.

## Keep Language Imports Separate

Skel paths resolve contract types. Generated Go and TypeScript need their own package mappings:

```bash
skelc gen go-module \
  --skel-in ./order/skel \
  --skel-import identity.user=./user/pub/skel \
  --go-import identity.user=example.com/contracts/user \
  --go-out ./order/skeled \
  --go-module example.com/contracts/order
```

The three names serve different purposes:

| Name | Example | Used by |
| --- | --- | --- |
| Domain | `identity.user` | Skel identity and compatibility |
| Source mapping | `identity.user=./user/pub/skel` | skelc input loading |
| Package mapping | `identity.user=example.com/contracts/user` | Generated language imports |

Don't encode repository layout into a domain name. A domain should remain stable when files move or build environments change.

## Import Public Contracts

Consumers should read a producer's generated public Skel rather than its complete internal source. Cross-domain references are checked against the producer's public boundary, and private declarations can't leak into another domain by accident.

Continue with [Types & Data](/docs/types-and-data), or see [Public Contracts](/docs/generation/public-contracts) for producing importable contracts.
