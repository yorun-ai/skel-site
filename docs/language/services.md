---
slug: /services
---

# Service Contracts

A service defines callable methods independently of their Go implementation or TypeScript client. skelc generates both sides from the same method names and types.

## Declare a Service

```skel
pub service OrderService {
    for CustomerActor via client
    auth

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

A service name ends in `Service` and contains at least one method. Method names and input fields use `lowerCamelCase`.

Sections inside a method must appear in this order: `auth`/`noauth`, `require`, `input`, then `output`. Both input and output are optional:

```skel
service HealthService {
    noauth

    method ping {}

    method status {
        output string
    }
}
```

## Authentication and Audiences

`for Actor [via name]` records the callers this contract serves. `auth` requires an authenticated actor; `noauth` explicitly allows an unauthenticated call. A method marker overrides the service marker; when neither is present, the behavior falls back to the enclosing service or runtime context.

Be explicit with `auth` or `noauth` on externally reachable services. It puts security intent in the contract instead of relying on a surrounding default.

## Inputs and Outputs

```skel
method create {
    @desc("Values accepted when placing an order")
    input {
        @desc("Customer-visible order reference")
        @example("ORD-2026-0042")
        reference: string
        lines: list<OrderLine>
    }

    @desc("The created order")
    output Order
}
```

Inputs with fields become a generated arguments data type. Output is one Skel type rather than a named block. Reach for a `data` declaration when a result needs several fields.

Don't wrap every result in a generic response envelope. Transport status, structured errors, and tracing belong to the runtime protocol; the Skel output should describe the business result.

## Combine Method and Permission Rules

```skel
pub service OrderService {
    for StaffActor via client
    auth
    require Order:read

    method cancel {
        require Order:cancel:ownedByCaller(orderId)

        input {
            orderId: uuid
        }
        output Order
    }
}
```

The service and method requirements must both pass. See [Permission Model](/docs/permissions) for expressions and check arguments.

## Binary Methods

`binary` can appear directly or inside nested data, nullable, list, map, and generic types. The TypeScript generator emits sparse vRPC wire schemas only for methods that contain binary input or output. Business-facing TypeScript types remain `Uint8Array`; the application supplies its CBOR codec.

See [TypeScript Output](/docs/generation/typescript) for the generated transport metadata.

## Evolve Methods Carefully

Changing a method name, input field, output type, actor audience, auth marker, or requirement changes the contract. Adding a nullable field is easier for consumers than replacing a required field, but every public change should still regenerate all targets and run consumer tests.

Next: [Events & Tasks](/docs/events-and-tasks) for asynchronous boundaries or [Go Generation](/docs/generation/go) to implement the generated server interface.
