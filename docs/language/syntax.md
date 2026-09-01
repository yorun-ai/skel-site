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
| `actor NameActor { via client {} }` | At least one via | Yes | [Actors & Access](/docs/actors-and-access) |
| `resource Name { action read }` | At least one action | Yes | [Permission Model](/docs/permissions) |
| `service NameService { method get {} }` | At least one method | Yes | [Service Contracts](/docs/services) |
| `event NameEvent { payload { ... } }` | One payload | Yes | [Events & Tasks](/docs/events-and-tasks#events) |
| `web NameWeb { for NameActor }` | At least one actor | No | [Actors & Access](/docs/actors-and-access#declare-web-capabilities) |
| `task NameTask { trigger run {} }` | At least one trigger | No | [Events & Tasks](/docs/events-and-tasks#tasks-and-triggers) |

`pub` appears before a supported declaration:

```skel
pub data UserSummary {
    id: uuid
}
```

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
service OrderService {
    for CustomerActor via client
    auth
    require Order:read

    method get {
        noauth
        require Order:read:exists(orderId)
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

Service sections may include audiences, one auth marker, one service requirement, and methods. Method sections appear in this order: auth marker, requirement, input, output.

## Permission Expressions

```text
Resource:action
Resource:action:check(input.path)
all(item, item)
any(item, item)
```

Imported resources use a qualifier, such as `account.User:read`. Check arguments support field traversal and one list wildcard, like `orders[*].id`. See [Permission Model](/docs/permissions).

## Decorators

```skel
@desc("Human-readable meaning")
@example("Example value")
@sensitive
@deprecated("Use the replacement declaration instead")
```

`@deprecated` always requires a non-empty explanation string. Where you can place a decorator depends on the declaration. Unsupported placement is an error. See [Metadata & Docs](/docs/metadata) for the location matrix and generated behavior.

## Naming

| Kind | Form |
| --- | --- |
| Domain | dot-separated lower names, such as `commerce.order` |
| Top-level declaration and type parameter | `CamelCase` |
| Service, config, event, actor, web, task | matching suffix such as `Service` or `Actor` |
| Field, method, via, action, check, trigger | `lowerCamelCase` |
| Enum item | `SCREAMING_SNAKE_CASE` |

Identifiers can't begin with `_`. `UNSPECIFIED` is reserved for enum output,
and `skelSensitive` is reserved in generated sensitive structures. Data and
actor authentication fields can't be named `clone` or `cloneBy`; those names
are reserved for generated Go value-isolation methods.

Validate the current input after every contract change:

```bash
skelc check --skel-in ./skel
```

Command flags are listed in the [CLI Reference](/docs/cli).
