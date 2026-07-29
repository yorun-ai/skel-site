---
slug: /events-and-tasks
---

# Events & Tasks

Events describe facts published by a domain. Tasks describe named work that the runtime can trigger. Both follow the same field and metadata rules as service input, but they have different ownership.

## Events

```skel
pub event OrderPlacedEvent {
    payload {
        orderId: uuid
        customerId: uuid
        placedAt: timestamp
    }
}
```

An event name ends in `Event` and contains one `payload` block. Events don't declare actors or type parameters.

Model an event as something that has already happened. `OrderPlacedEvent` gives consumers a stable fact; `PlaceOrderEvent` reads like a command and works better as a service method or task trigger.

Keep the payload sufficient for its consumers without copying the domain's entire internal model. If consumers need details that can change independently, include an identifier and let them query the owning domain.

## Sensitive Event Payloads

```skel
event CredentialIssuedEvent {
    @sensitive
    payload {
        credentialId: uuid
        token: string
    }
}
```

`@sensitive` on `payload` marks the generated payload as a whole. You can also place it on individual fields. The event declaration itself doesn't accept `@sensitive`.

## Tasks and Triggers

```skel
task RebuildOrderIndexTask {
    trigger manually {}

    trigger forTenant {
        input {
            tenantId: string
            requestedAt: timestamp
        }
    }
}
```

A task name ends in `Task` and declares at least one trigger. Trigger names use `lowerCamelCase`; each trigger has optional input and no output.

Create separate triggers when the same task has distinct invocation shapes. Create separate tasks when ownership, failure handling, scheduling, or implementation differs.

Tasks can't be marked `pub`. They describe runtime work inside the application boundary, not a cross-domain client API.

## What Skel Does Not Schedule

A task declaration doesn't pick cron syntax, a queue, retry count, concurrency, or worker placement. The declaration gives Vine a typed trigger contract. The application and deployment decide how and when the trigger fires.

Likewise, an event declaration doesn't choose a broker or delivery guarantee. Those are runtime and infrastructure decisions.

## Choosing the Boundary

| Need | Declaration |
| --- | --- |
| Request a result now | `service` method |
| Announce a completed fact | `event` |
| Start named background work | `task` trigger |
| Expose a web capability | `web` |

Next: [Metadata & Docs](/docs/metadata) for descriptions and sensitive values, or [Vine Integration](/docs/vine-integration) for runtime wiring.
