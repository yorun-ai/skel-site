---
slug: /metadata
---

# Metadata & Docs

Decorators attach documentation and handling rules to a contract without changing its type syntax. skelc supports `@desc`, `@example`, `@sensitive`, and `@deprecated`.

## Descriptions

```skel
@desc("Customer-facing order number")
reference: string
```

Reach for a triple-quoted string when you need more room:

```skel
@desc("""
Cancels an order that has not entered fulfillment.
The operation is idempotent.
""")
method cancel {
    input {
        orderId: uuid
    }
}
```

The opening and closing `"""` sit on their own lines. skelc strips the common indentation from non-empty content lines, so descriptions follow the surrounding source indentation naturally.

Descriptions flow into generated metadata and schemas. Write what a consumer needs to understand the contract: meaning, units, constraints, and edge cases. Skip restating the field name in prose.

## Examples

```skel
@desc("ISO 4217 currency code")
@example("SGD")
currency: string
```

`@example` needs a value and must appear alongside `@desc` at the same location. You can use it on data-like fields, service inputs, service output, resource-check inputs, task-trigger inputs, and actor credential/info fields.

Examples are documentation values, not validation expressions. A field still accepts every value its type allows unless application code enforces a narrower rule.

## Sensitive Values

```skel
@sensitive
data AccessCredential {
    token: string
}
```

`@sensitive` takes no argument. It records that a value must not appear as plaintext in logs or diagnostics. It doesn't encrypt the value and doesn't change its JSON or CBOR representation.

The marker can apply to:

- A `data` or `config` declaration and their fields
- An event `payload` block or payload field
- Actor `credential` and `info` blocks or their fields
- A service method `input`, `output`, or input field
- A resource-check `input` or input field
- A task-trigger `input` or input field

Generated Go fields receive the `skel:"sensitive"` tag. Whole generated values implement or carry the matching sensitivity metadata, and the generated domain schema exposes the marker to Vine tooling. `skelSensitive` is reserved as a field name in these generated structures.

Sensitivity is a handling instruction, not an access rule. Use actors, authentication, and permissions to control who may receive the value.

## Deprecation

```skel
@deprecated("Use Profile instead")
data User {
    @deprecated("Use id instead")
    legacyId: string
}
```

`@deprecated` requires one non-empty string that explains what consumers should use or do instead. It can mark top-level enum, data, config, event, actor, resource, service, task, and web declarations. It can also mark enum items, data-like fields, resource actions and checks, service methods, task triggers, and the input arguments of resource checks, service methods, and task triggers.

Deprecation applies only to the decorated element; it does not cascade to children. A domain and structural blocks such as `input`, `output`, `payload`, `credential`, and `info` cannot be deprecated.

Generated Go declarations use the standard `Deprecated:` doc paragraph, generated TypeScript uses the `@deprecated` JSDoc tag, public Skel output preserves the decorator, and the generated domain schema carries both the boolean marker and explanation. skelc records and exposes the metadata but does not currently warn when another declaration references a deprecated element.

Generated TypeScript represents a Skel enum as a string union. An enum item's deprecation remains visible beside its union branch, but TypeScript cannot issue an item-level deprecation warning because that branch is not a separately named symbol.

## Supported Locations

| Contract location | `@desc` | `@example` | `@sensitive` | `@deprecated` |
| --- | :---: | :---: | :---: | :---: |
| Domain | Yes | No | No | No |
| Top-level declaration | Yes | No | Data/config only | Yes |
| Enum item | Yes | No | No | Yes |
| Data-like field or input argument | Yes | Yes | Yes | Yes |
| Service method | Yes | No | No | Yes |
| Method input/output block | Yes | Output only | Yes | No |
| Event payload block | No | No | Yes | No |
| Actor credential/info block | No | No | Yes | No |
| Resource action/check or task trigger | Yes | No | No | Yes |

Run `skelc check` after moving a decorator. Unsupported placement is an error — metadata is never silently ignored.

Continue with [Contract Boundaries](/docs/contract-design) or use the [Syntax Index](/docs/syntax) for a compact declaration reference.
