---
slug: /actors-and-access
---

# Actors & Access

An actor names a kind of caller. When authentication is needed, it declares the credential and identity information for that caller.

## Declare a Caller

```skel
pub actor CustomerActor {}
```

An actor name uses the `Actor` suffix with an optional version, such as `CustomerActorV2`. An actor without authentication or permission declarations can have an empty body. TLS, tokens, gateways, and endpoint exposure remain runtime concerns.

## Add Authentication Data

```skel
pub actor CustomerActor {
    auth {
        @sensitive
        credential {
            token: string
        }

        info {
            @identifier
            customerId: uuid
            tenantId: string
        }
    }
}
```

An `auth` block holds both `credential` and `info`:

- `credential` is what the caller presents. It needs at least one field; every field is `string` or `string?`, and at least one field must be a non-nullable `string`.
- `info` is the authenticated identity returned to application code. It can use normal Skel field types.

skelc generates actor-specific credential and info data models along with the authentication service metadata. Mark credentials or identity fields `@sensitive` when logs and schema consumers must treat them as confidential.

## Actor Identifier

Use `@identifier` on the `auth.info` field that identifies the caller, such as
`customerId` in the example above. Each actor may mark at most one top-level
field, whose type must be a non-nullable `string`, `uuid`, or `int`. The marker
takes no arguments and cannot be used in `credential` or other data declarations.
Omit it when the actor does not need a caller identifier.

Regenerate code after changing the contract. For reading
identity information at runtime, see the
[Vine identity documentation](https://vine.yorun.ai/docs/meta).

## Enable Permission Lookup

```skel
actor StaffActor {
    permission {}
}
```

`permission {}` enables the generated actor permission service. It doesn't define permissions; `resource` declarations control the available permission codes and checks. See [Permission Model](/docs/permissions).

## Bind Actors to Services

```skel
api service OrderApiService {
    for CustomerActor, StaffActor
    auth required

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

An API service or web declaration lists every allowed actor in one `for` clause, separated by commas; the list may wrap across lines. A single actor uses `for CustomerActor`. Listing the same actor twice is an error.

A backend service that is only called inside the application boundary doesn't need `for`. Declare an actor when a real caller needs a generated entry contract.

## Declare web Capabilities

```skel
web CustomerPortalWeb {
    for CustomerActor
    auth required
}
```

A `web` name uses the `Web` suffix with an optional version, such as `CustomerPortalWebV2`, and declares at least one actor. It describes who may enter a web capability; it doesn't define HTTP methods, paths, or handler code. A web declaration is a local runtime capability and can't be marked `pub`.

### web Authentication

A web declaration accepts one auth mode: `auth required`, `auth optional`, `auth anonymous`, or `auth off`. The first three use portal authentication and remove `Authorization` before forwarding; `off` skips portal authentication and leaves the header for the web handler. The auth mode must be declared explicitly.

### Pin a Frontend Mount Path

Add `mount` when a frontend build must answer on a fixed public URL prefix:

```skel
web ConsoleWeb {
    mount /console
    for ClientActor
}
```

The mount is an immutable prefix for the entry point and its static assets. Declare
it when clients, bookmarks, CDN rules, or reverse-proxy configuration depend on that
prefix, and treat the value as part of the published contract: changing it makes
`schema diff` report `web.mount-path.changed` as `BREAKING`.

A mount path is a literal absolute path. It must start with `/`, and it cannot contain
route parameters, query or fragment delimiters, escapes, whitespace, empty segments
(`//`), or `.` and `..` segments. A trailing slash is allowed. Include `mount` at most
once per web.

Omitting `mount` leaves the web unrestricted by a declared mount path, while `mount /`
declares the root path explicitly. The two are not interchangeable: only the declared
root restricts the web to `/`.

See [Vine Integration](/docs/vine-integration#declared-web-mount-paths) for how the
value reaches generated code, and
[Go Generation](/docs/generation/go#web-generation) for the generated web surface.

## Keep Actor Scope Deliberate

Create separate actors when callers have meaningfully different credentials, identity data, or permission behavior. Avoid one actor per UI screen or service method; a stable actor represents a caller role that spans several capabilities.

Next: [Permission Model](/docs/permissions) or [Service Contracts](/docs/services).
