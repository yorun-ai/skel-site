---
slug: /syntax
---

# Skel Syntax Reference

`.skel` is Vine's contract description language. A domain can declare data models, configuration, actors, permission resources, services, Web entry capabilities, events, and tasks. `skelc` generates the corresponding language runtimes from these declarations.

## File Structure

Every file starts with a domain declaration. When the input is a directory, `domain.skel` may only contain the domain and an optional description; every other file must declare the same domain.

```skel
@desc("User domain")
domain demo.user

import demo.account as account
```

Use `pub` to mark a top-level declaration as a public contract:

```skel
pub data User {
    id: int
}
```

The supported top-level declarations are:

| Declaration | Purpose | Supports `pub` |
| --- | --- | --- |
| `enum` | Enumeration | Yes |
| `data` | Data model | Yes |
| `config` | Application configuration model | Yes |
| `actor` | Caller and authentication model | Yes |
| `resource` | Permission resource, action, and check | Yes |
| `event` | Asynchronous event | Yes |
| `service` | Rpc service | Yes |
| `web` | Web entry capability | No |
| `task` | Task and triggers | No |

Within one domain, all top-level names except `resource` share a namespace and must be unique. Resources use a separate namespace.

## Comments and Descriptions

Use `//` or `/* ... */` for comments. `@desc` adds a description to a declaration. Fields, methods, and similar elements can also use `@example`. An `@example` must be accompanied by an `@desc` at the same location.

```skel
@desc("Email")
@example("hello@example.com")
email: string?
```

Use `@sensitive` on data that must not appear as plaintext in logs or other diagnostic output:

- It takes no argument and is written as `@sensitive`.
- It is supported on data and config fields, Event payload fields, Actor credential and info fields, Service input arguments, Resource check arguments, and Task trigger input arguments.
- It is also supported on an entire data or config declaration, an Event `payload` block, Actor `credential` and `info` blocks, a Service method input or output, a Resource check input, and a Task trigger input. Event declarations and the enclosing Actor `auth` block cannot be marked.
- It does not require `@desc` and may be combined with `@desc` and `@example`.
- It does not change the field type or its JSON/CBOR wire format.
- Generated Go fields receive the `skel:"sensitive"` struct tag, which Vine's `core/redact` package recognizes.
- Generated types for whole sensitive data/config, Event payloads, and Actor credential/info implement the `SkelSensitive()` marker method from the `skel.Sensitive` interface; whole method/check input and output metadata is written to the generated Rpc `MethodSpec`, while whole Task trigger input metadata is written to the generated Task `TriggerSpec`.
- Field-level and whole-value sensitivity is also written to the generated Domain Schema for Portal and other contract tooling.
- `skelSensitive` is reserved as a field name in those structured types to avoid colliding with the generated marker method.

```skel
@sensitive
accessToken: string

@sensitive
data Credential {
    token: string
}

service AuthService {
    method exchange {
        @sensitive
        input {
            credential: Credential
        }

        @sensitive
        output string
    }
}

event CredentialIssuedEvent {
    @sensitive
    payload {
        credential: Credential
    }
}
```

Use triple quotes for multiline descriptions:

```skel
@desc("""
Creates a user.
The email must be unique within the current tenant.
""")
```

## Types

Built-in scalars are `int`, `float`, `bool`, `string`, `decimal`, `binary`, `timestamp`, `duration`, `localdate`, `localtime`, `localdatetime`, `uuid`, and `json`.

Composite types use `list<T>` and `map<K, V>`. A map key can only be `int`, `string`, or an enum. Append `?` to any type to make it nullable.

```skel
data UserProfile {
    id: uuid
    tags: list<string>
    attributes: map<string, string>
    email: string?
}
```

`data` supports generics. Type parameter names must begin with `T`:

```skel
data Page<TItem> {
    items: list<TItem>
    nextToken: string?
}
```

Direct data references cannot form cycles. An indirect reference through a nullable, list, or map type can break the cycle.

## data, enum, and config

```skel
enum UserStatus {
    ACTIVE
    DISABLED
}

data User {
    id: int
    status: UserStatus
}

config UserConfig eternal {
    defaultStatus: UserStatus
    maxPageSize: int
}
```

- Enum items use `SCREAMING_SNAKE_CASE`. `UNSPECIFIED` is reserved and cannot be declared explicitly.
- Data and config fields, method arguments, and trigger names use `lowerCamelCase`.
- A `config` name ends with `Config`, and its lifecycle must be either `eternal` or `instant`.
- Config fields can only use scalars, enums, and their restricted list and map forms. A config cannot reference data, another config, or `binary`.

## Actor and Resource

An actor represents a caller and its authentication methods:

```skel
pub actor ClientActor {
    via client {}

    auth {
        @sensitive
        credential {
            token: string
        }
        @sensitive
        info {
            userId: int
        }
    }

    permission {}
}
```

An actor name ends with `Actor` and contains at least one `via`. The available via types are `client`, `agent`, and `openapi`. An `auth` block must define both `credential` and `info`; credential fields must be non-nullable strings. The `credential` and `info` blocks may each be marked `@sensitive`, while the enclosing `auth` block may not. `permission {}` enables the actor permission service.

A resource defines permission codes, actions, and parameterized checks:

```skel
pub resource User {
    @desc("Look up a user")
    check byExists {
        input {
            @sensitive
            accessToken: string
            userId: int
        }
    }

    action read

    action update {
        check bySelf {
            input {
                userId: int
            }
        }
    }
}
```

A permission code has the form `<domain>.<Resource>:<action>`, for example `demo.user.User:read`. Every action can use a resource-level check, while an action-level check only belongs to that action.
Checks use the same `input` field syntax as Service methods and Task triggers. A check supports `@desc`; its `input` supports `@desc` and `@sensitive`; input fields support `@desc`, `@example`, and `@sensitive`. Write a check without user arguments as `check enabled {}`; skelc injects its `PermissionCode` argument internally.

## Service and Permission Requirements

```skel
pub service UserService {
    for ClientActor via client
    auth
    require User:read

    method get {
        require User:read:byExists(userId)

        input {
            userId: int
        }
        output User?
    }
}
```

- A service name ends with `Service`, and method names use `lowerCamelCase`.
- `for Actor [via name]` declares the actors a service serves.
- A service requires authentication by default. `noauth` disables it, and a method-level `auth` or `noauth` overrides the service setting.
- Both method `input` and `output` are optional. When both are present, input precedes output.
- `require` constrains access. Service-level and method-level requirements must both be satisfied.

A method-level requirement supports resource actions, checks, `all(...)`, and `any(...)`:

```skel
method update {
    require all(
        User:update:byExists(userId),
        User:update:bySelf(userId)
    )

    input {
        userId: int
    }
}
```

Check arguments can reference input field paths such as `update.userId` or `users[*].id`. At most one non-terminal `[*]` is allowed. Array indexes, filters, slices, and recursive JSONPath are not supported.

## Event, Web, and Task

```skel
pub event UserCreatedEvent {
    payload {
        userId: int
    }
}

web UserPortalWeb {
    for ClientActor via client
}

task RebuildIndexTask {
    trigger manually {}

    trigger atTime {
        @sensitive
        input {
            startedAt: timestamp
        }
    }
}
```

- An event name ends with `Event` and must contain a `payload`. Events do not support actors or generics.
- A web name ends with `Web` and must declare at least one `for Actor`. It describes an entry capability; it does not declare HTTP routes.
- A task name ends with `Task` and contains at least one `trigger`. A trigger has no output, and its input is optional. A trigger `input` supports `@sensitive`; whole-input metadata is written to the generated Task `TriggerSpec`.

## Naming and Public Contract Rules

- A domain is a dot-separated name such as `demo.user`.
- Top-level types, referenced types, and generic parameters use `CamelCase`.
- Identifiers cannot begin with an underscore.
- When a `pub` contract references data, an enum, an actor, or a resource from the same domain, the referenced declaration must also be marked `pub`.
- External types require an `import` and are referenced with a qualified name or alias, such as `account.Profile`.

After editing, validate the contracts with:

```bash
skelc check --skel-in ./skel
```

See the [skelc guide](/docs/getting-started) for code-generation commands and project organization.
