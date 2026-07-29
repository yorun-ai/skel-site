---
slug: /getting-started
---

# First Contract

This walkthrough creates one domain, validates it, and generates Go and TypeScript. It assumes [skelc is installed](/docs/installation).

## Create the Input

```text
demo/
└── skel/
    ├── domain.skel
    └── order.skel
```

```skel title="skel/domain.skel"
@desc("Order contracts")
domain demo.order
```

```skel title="skel/order.skel"
domain demo.order

pub actor CustomerActor {
    via client {}

    auth {
        @sensitive
        credential {
            token: string
        }
        info {
            customerId: uuid
        }
    }

    permission {}
}

pub enum OrderStatus {
    PENDING
    PAID
}

pub data Order {
    id: uuid
    status: OrderStatus
}

pub resource Order {
    action read
}

pub service OrderService {
    for CustomerActor via client
    auth
    require Order:read

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

The contract says more than "call a method":

- `CustomerActor` identifies the caller and its client entry point.
- The credential is marked for sensitive-value handling.
- `Order:read` is a named permission the service requires.
- The result is either one generated `Order` value or null.
- Every declaration a client needs is explicitly `pub`.

## Format and Check

```bash
skelc format --skel-in ./demo/skel
skelc check --skel-in ./demo/skel
```

`format` rewrites the source in canonical form. `check` resolves names and types, validates the actor and permission boundary, and verifies that the public contract is closed.

A generator won't fix an invalid contract — `check` catches problems with clearer diagnostics than a failed generation.

## Generate Go

When the code lives inside an existing Go module:

```bash
skelc gen go \
  --skel-in ./demo/skel \
  --go-out ./demo/skeled
```

The output covers data and enum types, actor metadata, permission codes, the service interface, and Vine registration helpers. Implement the generated interface in handwritten application code; edit `.skel` and regenerate when the boundary changes.

Use `gen go-module` instead when publishing the generated contract as an independent module. See [Go Generation](/docs/generation/go).

## Generate TypeScript

```bash
skelc gen ts \
  --pub \
  --skel-in ./demo/skel \
  --ts-out ./demo/client
```

The output contains public data and enums, a service specification, and a client factory backed by `@yorun-ai/vrpc`. `--pub` keeps private declarations out of the client package.

See [TypeScript Output](/docs/generation/typescript) for package metadata, cross-domain imports, and binary wire schemas.

## Review What Changed

skelc records managed files in `.skelc-manifest.json`. It preserves untracked files and removes a stale generated file only when the file still matches the previous manifest. A handwritten file that shares a path with a current generated file can still be overwritten, so keep generated output paths reserved.

Commit the `.skel` source, the pinned skelc version the project uses, and whichever generated artifacts your repository policy requires. In CI, regenerate and fail on an unexpected diff.

Next:

- [Language Model](/docs/language) explains the declaration roles.
- [Project Layout](/docs/input-layout) covers multi-domain repositories and imports.
- [Vine Integration](/docs/vine-integration) connects the Go output to an application.
