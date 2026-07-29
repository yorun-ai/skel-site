---
slug: /types-and-data
---

# Types & Data

Skel types describe values that cross a generated boundary. They aren't meant to mirror every persistence or in-memory type in an application.

## Scalar Types

| Type | Use |
| --- | --- |
| `int`, `float`, `bool`, `string` | Basic values |
| `decimal` | Exact decimal values such as money |
| `binary` | Byte content |
| `timestamp`, `duration` | An instant and an elapsed time |
| `localdate`, `localtime`, `localdatetime` | Calendar values without a time zone |
| `uuid` | UUID identifiers |
| `json` | JSON text when a fixed data shape isn't available |

The generated Go and TypeScript representations, including JSON and CBOR behavior, are documented in [Runtime Types](/docs/runtime-types).

## Collections and Nullability

```skel
data UserProfile {
    id: uuid
    displayName: string
    email: string?
    roles: list<string>
    attributes: map<string, string>
    labelsByUserId: map<uuid, string>
}
```

Append `?` to any type to make the value nullable. `list<T>` describes an ordered collection. `map<K, V>` accepts `int`, `string`, `uuid`, or an enum as its non-nullable key type.

Prefer a named `data` declaration when a structure carries business meaning. `json` works at an intentionally open boundary, but it shifts validation from skelc into application code.

## Data and Generics

```skel
data Page<TItem> {
    items: list<TItem>
    nextToken: string?
}

data User {
    id: uuid
}

data UserPage {
    page: Page<User>
}
```

Only `data` can declare type parameters. Parameter names begin with `T`, use `CamelCase`, and can't be nullable. Every reference to generic data supplies the exact number of type arguments.

Hard reference cycles are rejected because they can't produce a finite value. A nullable or collection edge introduces indirection:

```skel
data Category {
    name: string
    children: list<Category>
}
```

## Enums

```skel
enum OrderStatus {
    PENDING
    PAID
    CANCELLED
}
```

An enum needs at least one item. Item names use `SCREAMING_SNAKE_CASE`. `UNSPECIFIED` is reserved because generators provide it as the zero or unknown value.

Choose an enum when consumers must handle a closed set. Use a string when the producer intentionally allows values the current consumer doesn't know about.

## Configuration

```skel
config CheckoutConfig eternal {
    timeout: duration
    supportedCurrencies: list<string>
    retryLimitByRegion: map<string, int>
}
```

A config name ends in `Config` and declares one lifecycle:

- `eternal` stays stable for the application lifetime.
- `instant` can change while the application runs.

Config fields are deliberately restricted. They can use scalars, enums, and supported list/map combinations, but not `data`, another `config`, or `binary`. This keeps generated configuration values portable and observable.

## Model Contract Shapes, Not Storage

A database row often contains migration fields, internal state, or denormalized data that shouldn't become a client promise. Define a contract-specific `data` shape and map it at the application boundary. The extra mapping is cheaper than coupling storage evolution to every generated consumer.

Next: [Actors & Access](/docs/actors-and-access) for caller identity, or [Service Contracts](/docs/services) for callable methods.
