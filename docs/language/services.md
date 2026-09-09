---
slug: /services
---

# Service Contracts

A service defines callable methods independently of their Go implementation or TypeScript client. skelc generates both sides from the same method names and types.

API service names must end with `ApiService`, such as `OrderApiService`; other services still end with `Service`.

## Service Boundaries

Use `pub service` for backend calls between domains and `api service` for entry points that clients call through Portal. The two modifiers are mutually exclusive, and service names are unique across both kinds within a domain. An API service is reached through Portal, so it is not invoked through a backend Rpc client.

Declare `for Actor`, `auth`/`noauth`, or `require` only on API services, including at the method level. Authentication defaults to `auth` when it is not declared; audience and transport are still chosen explicitly, not inferred from that default. Services that perform authentication, permission, and resource checks are backend services, not client entry points.

During migration an unmodified `service` keeps its old backend behavior and warns you to declare `pub` or `api`. A non-API service that declares client rules also warns and stays reachable by backend and API callers for now; explicitly declared API services do not get this compatibility.

### Open Server Contracts

skelc v0.19.0 adds `open service` for services that other domains need to implement. It is as public as `pub service`, and its Go public package also contains the Server/ERServer interfaces, default implementations, and server registration. When you generate split regular and public packages, the regular package reuses these server types through aliases.

```skel
open service StorageService {
    method get {
        input { key: string }
        output binary
    }
}
```

`open` is valid only on services and is mutually exclusive with `pub` and `api`. Names still end with `Service`. It does not disable authentication or expose a Portal API. To implement the exported server interface, embed the generated default server type and override the methods you need.

## Declare a Service

```skel
api service OrderApiService {
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

A service name ends in `Service`, or in `ApiService` for API services, and contains at least one method. Method names and input fields use `lowerCamelCase`.

Sections inside a method must appear in this order: `auth`/`noauth`, `require`, `input`, then `output`. Both input and output are optional:

```skel
api service HealthApiService {
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
api service OrderApiService {
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
