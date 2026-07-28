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

An actor name ends in `Actor` and declares at least one `via`. The supported transports are:

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

An `auth` block contains both `credential` and `info`:

- `credential` is what the caller presents. It has at least one field; every field is a non-nullable `string`.
- `info` is the authenticated identity returned to application code. It can use normal Skel field types.

skelc generates actor-specific credential and info data models together with the authentication service metadata. Mark credentials or identity fields `@sensitive` when logs and schema consumers must treat them as confidential.

## Enable Permission Lookup

```skel
actor StaffActor {
    via client {}
    permission {}
}
```

`permission {}` enables the generated actor permission service. It does not define permissions; `resource` declarations define the available permission codes and checks. See [Permission Model](/docs/permissions).

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

Each `for` line declares an allowed actor. Add `via` when the contract must select one of the actor's transports. Omitting it leaves the transport unspecified.

Services may omit `for` when they are only used inside an application boundary. Do not add a public actor merely to satisfy a diagram; add one when a real caller needs a generated entry contract.

## Declare Web Capabilities

```skel
web CustomerPortalWeb {
    for CustomerActor via client
}
```

A `web` name ends in `Web` and declares at least one actor. It describes who may enter a web capability; it does not define HTTP methods, paths, or handler code. Web declarations are local runtime capabilities and cannot be marked `pub`.

## Keep Actor Scope Deliberate

Use separate actors when callers have meaningfully different credentials, identity data, transports, or permission behavior. Do not create a new actor for every UI screen or service method. A stable actor represents a caller role across several capabilities.

Next: [Permission Model](/docs/permissions) or [Service Contracts](/docs/services).
