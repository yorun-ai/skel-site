---
slug: /contract-design
---

# Domains and Contract Design

## Split by Business Ownership

A domain name should express stable business ownership, such as `account.user`, rather than a deployment unit or temporary project. Declarations inside one domain evolve together; a cross-domain reference introduces a compatibility obligation.

## Control the Public Surface

`pub` is a dependency promise, not a visibility decoration. Local data, enums, actors, and resources referenced by a public service must also be public. Start with the smallest public surface and export only what another domain or client needs.

## Do Not Share Internal Models

Database rows, cache layouts, and internal state machines should rarely become public data directly. Create contract-specific models so storage evolution does not accidentally break consumers.

## Preserve Determinism

- Names express business meaning, not the current implementation.
- Imports use full domain names; aliases only improve readability or resolve conflicts.
- Generated artifacts come from a pinned skelc version and enter a reviewable workflow.
- One output directory has one generator owner and no handwritten files.

See [public contracts](/docs/generation/public-contracts) for generation details.
