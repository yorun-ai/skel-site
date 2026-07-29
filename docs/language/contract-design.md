---
slug: /contract-design
---

# Contract Boundaries

## Split by Ownership

A domain name should express stable business ownership, such as `account.user`, rather than a deployment unit or temporary project. Declarations inside one domain evolve together; a cross-domain reference introduces a compatibility obligation.

Split a domain when two groups of declarations have independent release decisions and consumers. Don't split just because the implementation runs in two processes: Vine can rearrange runtime topology without changing the Skel owner.

## Keep the Public Surface Small

`pub` is a dependency promise, not a visibility decoration. Local data, enums, actors, and resources referenced by a public service must also be public. Start with the smallest public surface and export only what another domain or client needs.

```skel
pub data UserSummary {
    id: uuid
    displayName: string
}

data UserRecord {
    id: uuid
    passwordHash: string
    migrationVersion: int
}
```

The public type is built for consumers. The internal type can follow storage and implementation needs.

## Share Contracts, Not Source Trees

A producer exports reduced Skel with `skelc gen skel --pub`. Consumers map that output through `--skel-import`. They shouldn't parse the producer's private contract directory or rely on a neighboring checkout.

This separation turns an accidental private-to-public reference into a compiler error and gives the exported contract its own versionable artifact.

## Make Compatibility Visible

These changes deserve deliberate consumer review:

- Removing or renaming a public declaration
- Changing a field or method type
- Making a nullable field required
- Changing an actor audience, auth marker, or permission requirement
- Renaming an enum item, action, check, method, or trigger
- Changing the generated package mapping

Adding a nullable field is often easier to adopt, but it still changes generated APIs. Regenerate each target and review the diff rather than inferring compatibility from the `.skel` edit alone.

## Keep Implementation Details Out

Database rows, cache layouts, internal state machines, retry policies, route paths, and broker configuration rarely belong in public contract data. Model the stable fact or capability that consumers use.

A good boundary tends to include:

- Names that describe business meaning
- Explicit caller and permission rules when access crosses an application boundary
- Contract-specific request, result, and event types
- Descriptions for units, constraints, and non-obvious edge cases
- A pinned compiler version and reproducible generation command

See [Public Contracts](/docs/generation/public-contracts) for export mechanics and [Compatibility](/docs/compatibility) for an upgrade checklist.
