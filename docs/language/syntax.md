---
slug: /syntax
---

# Syntax Index

Use the tables below to locate a declaration or rule. Follow the linked language guide when validation behavior depends on context.

## File Form

```skel
@desc("Order contracts")
domain commerce.order

import identity.user
import commerce.catalog as catalog

// top-level declarations follow
```

Every file declares a domain. Imports follow the domain and precede declarations. Directory inputs require `domain.skel`; see [Files & Imports](/docs/files-and-imports).

## Top-Level Declarations

| Form | Required content | `pub` | Guide |
| --- | --- | :---: | --- |
| `enum Name { ITEM }` | At least one item | Yes | [Types & Data](/docs/types-and-data#enums) |
| `data Name { field: Type }` | Fields are optional | Yes | [Types & Data](/docs/types-and-data#data-and-generics) |
| `config NameConfig eternal { ... }` | `eternal` or `instant` | Yes | [Types & Data](/docs/types-and-data#configuration) |
| `actor NameActor {}` | Optional auth and permission | Yes | [Actors & Access](/docs/actors-and-access) |
| `resource Name { action read }` | At least one action | Yes | [Permission Model](/docs/permissions) |
| `service NameService { method get {} }` | At least one method | Yes | [Service Contracts](/docs/services) |
| `event NameEvent { payload { ... } }` | One payload | Yes | [Events & Tasks](/docs/events-and-tasks#events) |
| `web NameWeb { for NameActor }` | At least one actor; `mount /path` is optional | No | [Actors & Access](/docs/actors-and-access#declare-web-capabilities) |
| `task NameTask { trigger run {} }` | At least one trigger | No | [Events & Tasks](/docs/events-and-tasks#tasks-and-triggers) |

`pub` appears before a supported declaration:

```skel
pub data UserSummary {
    id: uuid
}
```

`api` is supported only on services and is mutually exclusive with `pub`. `ext service` exports the server contract for other domains to implement; `ext event` exports the Emitter contract for other domains to publish. `ext` applies to services and events and is mutually exclusive with `pub` and `api`.

API service names use the `ApiService` suffix with an optional version, such as `OrderApiService` or `OrderApiServiceV2`. Every API service must declare at least one `for Actor`; omission is a compilation error. Anonymous APIs also declare an actor and use `auth optional` to allow unauthenticated calls. Use `pub service` for backend calls and `api service` for portal clients.

For multiple actors on an API service or web, use `for AActor, BActor`; comma lists may wrap across lines. Listing the same actor twice is an error. See [Actors & Access](/docs/actors-and-access).

Every service must declare `pub`, `ext`, or `api`. Client admission rules are allowed only on API services.

## Type Forms

```text
int  float  bool  string
decimal  binary
timestamp  duration
localdate  localtime  localdatetime
uuid  json

list<T>
map<int|string|uuid|Enum, T>
Qualified.Type
Generic<T>
T?
```

`?` applies to any type. Only `data` declares generic parameters. Map keys are non-nullable `int`, `string`, `uuid`, or enum values. See [Types & Data](/docs/types-and-data).

## Service Method Form

```skel
api service OrderApiService {
    for CustomerActor
    auth required
    require Order:read

    method get {
        auth optional
        require Order:read:exists(orderId)
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

API services support `auth required`, `auth optional`, and `auth anonymous`; web also supports `auth off`. API service-level and web auth modes are required. See [Service Contracts](/docs/services) for mode semantics.

Service sections may include audiences, one auth marker, one service requirement, and methods. Method sections appear in this order: auth marker, requirement, input, output.

## Permission Expressions

```text
Resource:action
Resource:action:check(input.path)
all(item, item)
any(item, item)
```

An imported resource is referenced by its full domain name, such as `commerce.account.User:read`, or by the alias an `import ... as ...` declares. Check arguments support field traversal and one list wildcard, like `orders[*].id`. See [Permission Model](/docs/permissions).

## Decorators

```skel
@desc("Human-readable meaning")
@example("Example value")
@sensitive
@identifier
@deprecated("Use the replacement declaration instead")
```

`@deprecated` always requires a non-empty explanation string. Where you can place a decorator depends on the declaration. Unsupported placement is an error. See [Metadata & Docs](/docs/metadata) for the location matrix and generated behavior.

## Naming

| Kind | Form |
| --- | --- |
| Domain | dot-separated lower names, such as `commerce.order` |
| Top-level declaration and type parameter | `CamelCase` |
| Service, config, event, actor, web, task | matching suffix such as `Service` or `Actor`, optionally followed by `V1`, `V2`, etc. |
| Field, method, action, check, trigger | `lowerCamelCase` |
| Enum item | `SCREAMING_SNAKE_CASE` |

The optional version suffix is an uppercase `V` followed by a positive decimal
integer without leading zeroes: `V1`, `V2`, and `V10` are valid; `V0`, `V01`, and
`v2` are not. A versioned name is an independent declaration: references and
generated code retain the full name, and each version keeps its own fields,
methods, and hash. `OrderApiServiceV2` may reference the same `Order` data type
and `CustomerActor` as `OrderApiService`.

A declaration name cannot consist only of its kind suffix and version: `Event`,
`EventV2`, `Config`, and `ConfigV2` are rejected.

Identifiers can't begin with `_`. `UNSPECIFIED` is reserved for enum output.
`skelc check` accepts the field name `skelSensitive`; Go generation rejects it
when it conflicts with the generated `SkelSensitive()` method on a sensitive structure.

Validate the current input after every contract change:

```bash
skelc check --skel-in ./skel
```

Command flags are listed in the [CLI Reference](/docs/cli).
