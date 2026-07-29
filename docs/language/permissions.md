---
slug: /permissions
---

# Permission Model

Skel separates permission vocabulary from the service methods that require it. A `resource` defines actions and checks; `require` composes those rules at a service boundary.

## Define Actions

```skel
pub resource Order {
    action read
    action cancel
}
```

A resource needs at least one action. For domain `commerce.order`, the generated permission codes are:

```text
commerce.order.Order:read
commerce.order.Order:cancel
```

Resource names use `CamelCase`; action names use `lowerCamelCase`. Resources have their own namespace, so a `data Order` and `resource Order` can coexist.

## Add Parameterized Checks

```skel
pub resource Order {
    check exists {
        input {
            orderId: uuid
        }
    }

    action read

    action cancel {
        check ownedByCaller {
            input {
                orderId: uuid
            }
        }
    }
}
```

A resource-level check works with any action. A check nested under an action belongs only to that action. skelc generates authenticated check-service methods and injects the current `PermissionCode`; write a check without user arguments as `check enabled {}`.

Checks answer application-specific questions like "does this order exist?" or "does this order belong to the caller?" The contract declares the required inputs; the application implements the generated check interface.

## Require Permissions

```skel
service OrderService {
    require Order:read

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

A service-level requirement applies to every method. A method-level requirement adds on top:

```skel
method cancel {
    require all(
        Order:cancel,
        Order:cancel:ownedByCaller(orderId)
    )

    input {
        orderId: uuid
    }
}
```

`all(...)` demands that every item passes; `any(...)` is satisfied when one does. These expressions can be nested and must contain at least one item. A plain permission code may appear at service or method scope; a parameterized check is method-only because it reads method input.

## Pass Input Paths to Checks

```skel
method updateMany {
    require Order:cancel:ownedByCaller(orders[*].id)

    input {
        orders: list<OrderRef>
    }
}
```

Check arguments select method input fields:

- Field traversal uses dots: `request.orderId`.
- One list wildcard is supported: `orders[*].id`.
- A path can't end in `[*]`; pass the list field itself when the check expects a list.
- Indexes, filters, slices, and recursive JSONPath are not supported.

skelc resolves each path and verifies that its type matches the check argument. A renamed field or changed type fails during contract validation instead of turning into a runtime permission bug.

## Publish the Whole Permission Boundary

When a public service refers to a local actor or resource, those declarations must also be `pub`. skelc doesn't silently expand public output. This makes the authorization surface visible in review.

Continue with [Service Contracts](/docs/services), or see [Public Contracts](/docs/generation/public-contracts) for export rules.
