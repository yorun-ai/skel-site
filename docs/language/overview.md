---
slug: /language
---

# Language Model

A Skel file describes a boundary that must remain true across implementations, generated languages, and runtime wiring. The compiler resolves every declaration into one domain model before any generator runs.

## The Domain Is the Unit of Ownership

A domain is a stable business namespace such as `identity.user` or `commerce.order`. Several files can contribute declarations to the same domain, but they are validated and versioned as one contract.

```skel
domain commerce.order
```

Do not name a domain after a repository, process, team sprint, or current deployment shape. Those change more often than the boundary they own.

## Declarations Answer Different Questions

| Question | Declarations |
| --- | --- |
| What values cross the boundary? | `enum`, `data`, `config` |
| Who is calling? | `actor` |
| What may they do? | `resource`, `require` |
| What can be called? | `service` |
| What happened asynchronously? | `event` |
| What background work can run? | `task` |
| Which Web capability may be entered? | `web` |

Keeping these concerns separate matters. A service method should not encode caller identity into an arbitrary string argument when an actor owns that identity. Permission names should not live as ad-hoc constants when a resource owns them.

## Source, Model, and Output

The compiler pipeline has three useful boundaries:

1. **Source** — `.skel` files, imports, decorators, and declaration order.
2. **Semantic model** — resolved types, public closure, actors, permission expressions, and compatibility hashes.
3. **Output** — Go contracts, TypeScript clients, public Skel, and runtime schema.

All built-in generators consume the same validated model. A declaration cannot mean one thing to Go and another to TypeScript merely because two templates interpreted the source differently.

## A Practical Modeling Order

For a new capability:

1. Define the vocabulary with `data` and `enum`.
2. Add an `actor` only when a real external or cross-application caller exists.
3. Define `resource` actions if access needs named permissions.
4. Add the `service`, `event`, `task`, or `web` boundary.
5. Mark declarations `pub` only when another domain or client needs them.
6. Run `skelc format` and `skelc check` before generation.

Business algorithms, database tables, cache records, route handlers, queues, and deployment topology stay in application code. Skel should make an application boundary explicit, not turn the whole implementation into configuration.

Continue with [Files & Imports](/docs/files-and-imports), or go to [Types & Data](/docs/types-and-data) when the project structure already exists.
