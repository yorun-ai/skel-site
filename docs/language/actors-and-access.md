---
slug: /actors-and-access
---

# Actors & Access

An actor names a kind of caller. It records how that caller can enter the system and, when needed, the credential and identity information carried by authentication.

## Declare Entry Transports

```skel
pub actor CustomerActor {
    via client {}
    via openapi {}
}
```

An actor name ends in `Actor` and declares at least one `via`. The supported transports:

| Via | Typical caller |
| --- | --- |
| `client` | A generated vRPC client |
| `agent` | An application or internal agent |
| `openapi` | An OpenAPI-facing caller |

The declaration states capability, not network policy. TLS, tokens, gateways, and endpoint exposure remain runtime concerns.

## Add Authentication Data

```skel
pub actor CustomerActor {
    via client {}

    auth {
        @sensitive
        credential {
            token: string
        }

        info {
            customerId: uuid
            tenantId: string
        }
    }
}
```

An `auth` block holds both `credential` and `info`:

- `credential` is what the caller presents. It needs at least one field; every field is a non-nullable `string`.
- `info` is the authenticated identity returned to application code. It can use normal Skel field types.

skelc generates actor-specific credential and info data models along with the authentication service metadata. Mark credentials or identity fields `@sensitive` when logs and schema consumers must treat them as confidential.

## Enable Permission Lookup

```skel
actor StaffActor {
    via client {}
    permission {}
}
```

`permission {}` enables the generated actor permission service. It doesn't define permissions; `resource` declarations control the available permission codes and checks. See [Permission Model](/docs/permissions).

## Bind Actors to Services

```skel
service OrderService {
    for CustomerActor via client
    for StaffActor

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

Each `for` line declares an allowed actor. Add `via` when the contract must pin a specific transport from the actor's options. Leave it off to keep the transport unspecified.

A service doesn't have to declare `for` at all when it's only used inside an application boundary. Don't add a public actor just to fill in a diagram — add one when a real caller needs a generated entry contract.

## Declare Web Capabilities

```skel
web CustomerPortalWeb {
    for CustomerActor via client
}
```

A `web` name ends in `Web` and declares at least one actor. It describes who may enter a web capability; it doesn't define HTTP methods, paths, or handler code. Web declarations are local runtime capabilities and can't be marked `pub`.

## Keep Actor Scope Deliberate

Create separate actors when callers have meaningfully different credentials, identity data, transports, or permission behavior. Don't spin up a new actor for every UI screen or service method. A stable actor represents a caller role that spans several capabilities.

Next: [Permission Model](/docs/permissions) or [Service Contracts](/docs/services).
