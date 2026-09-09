---
slug: /generation/public-contracts
---

# Public Contracts

A public contract is the smallest promise a domain makes to consumers. Mark declarations `pub`, then export the reduced Skel:

```bash
skelc gen skel \
  --pub \
  --skel-in ./skel \
  --skel-out ./pub/skel
```

## Closure Rules

Local data and enum dependencies are included automatically, including nested and generic dependencies. They do not need `pub`. Explicit `pub data/enum` also exports a type independently, allowing direct cross-domain Skel references; inclusion as a dependency alone does not grant that visibility. Referenced actors and resources retain their existing public visibility requirements.

## Consumption

A consumer declares the domain with `import` and maps `--skel-import domain=PATH` to the public Skel output during generation. Consumers should never read a producer's complete private contract directory.

## Evolution Rules

- Adding optional fields is safer than changing or removing existing ones.
- Renaming a symbol, field, method, or permission code is a compatibility change.
- Regenerate every language output and notify consumers after public changes land.
- Distribute public contracts through versioned modules or packages, not through accidental neighboring paths.
