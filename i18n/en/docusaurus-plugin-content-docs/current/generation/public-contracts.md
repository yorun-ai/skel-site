---
slug: /generation/public-contracts
---

# Public Contracts and Cross-Domain Dependencies

A public contract is the smallest promise a domain makes to consumers. Mark declarations with `pub`, then export reduced Skel:

```bash
skelc gen skel \
  --pub \
  --skel-in ./skel \
  --skel-out ./pub/skel
```

## Closure Rules

Local data, enums, actors, and resources referenced by a public declaration must also be explicitly `pub`. skelc never silently widens the public surface; missing markers are errors.

## Consumption

A consumer declares the domain with `import` and maps `--skel-import domain=PATH` to the public Skel output during generation. Consumers should not read a producer's complete private contract directory.

## Evolution Rules

- Adding optional fields is generally safer than changing or removing fields.
- Renaming symbols, fields, methods, or permission codes is a compatibility change.
- Regenerate every language output and notify consumers after public changes.
- Distribute public contracts through versioned modules/packages, not accidental neighboring paths.
