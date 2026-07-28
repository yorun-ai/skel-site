---
slug: /metadata
---

# Metadata & Docs

Decorators attach documentation and handling rules to a contract without changing its type syntax. skelc currently supports `@desc`, `@example`, and `@sensitive`.

## Descriptions

```skel
@desc("Customer-facing order number")
reference: string
```

Use a triple-quoted string for longer text:

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

The opening and closing `"""` use standalone lines. skelc removes the common indentation from non-empty content lines, so descriptions can follow the surrounding source indentation.

Descriptions are part of generated metadata and schemas. Write what a consumer needs to understand the contract: meaning, units, constraints, and edge cases. Avoid repeating the field name in prose.

## Examples

```skel
@desc("ISO 4217 currency code")
@example("SGD")
currency: string
```

`@example` requires a value and must accompany `@desc` at the same location. It is supported on data-like fields, service inputs, service output, resource-check inputs, task-trigger inputs, and actor credential/info fields.

Examples are documentation values, not validation expressions. A field still accepts every value allowed by its type unless application code enforces a narrower rule.

## Sensitive Values

```skel
@sensitive
data AccessCredential {
    token: string
}
```

`@sensitive` takes no argument. It records that a value must not appear as plaintext in logs or diagnostics. It does not encrypt the value and does not change its JSON or CBOR representation.

The marker can apply to:

- A `data` or `config` declaration and their fields
- An event `payload` block or payload field
- Actor `credential` and `info` blocks or their fields
- A service method `input`, `output`, or input field
- A resource-check `input` or input field
- A task-trigger `input` or input field

Generated Go fields receive the `skel:"sensitive"` tag. Whole generated values implement or carry the matching sensitivity metadata, and the generated domain schema exposes the marker to Vine tooling. `skelSensitive` is reserved as a field name in these generated structures.

Sensitivity is a handling instruction, not an access rule. Use actors, authentication, and permissions to control who may receive the value.

## Supported Locations

| Contract location | `@desc` | `@example` | `@sensitive` |
| --- | :---: | :---: | :---: |
| Domain and top-level declaration | Yes | No | Data/config only |
| Enum item | Yes | No | No |
| Data-like field or input argument | Yes | Yes | Yes |
| Service method | Yes | No | No |
| Method input/output block | Yes | Output only | Yes |
| Event payload block | No | No | Yes |
| Actor credential/info block | No | No | Yes |
| Resource action/check or task trigger | Yes | No | No |

Run `skelc check` after moving a decorator. Unsupported placement is an error rather than silently ignored metadata.

Continue with [Contract Boundaries](/docs/contract-design) or use the [Syntax Index](/docs/syntax) for a compact declaration reference.
