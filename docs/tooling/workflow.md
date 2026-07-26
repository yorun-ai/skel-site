---
slug: /workflow
---

# Format and Validate

Use this order locally and in CI:

```bash
skelc format --skel-in ./skel
skelc check --skel-in ./skel
```

`format` normalizes source shape, and `check` validates semantics. Formatting writes in place, so run it on a clean worktree or reviewable branch.

## CI Example

```bash
skelc format --skel-in ./skel
git diff --exit-code -- ./skel
skelc check --skel-in ./skel
```

This prevents unformatted contracts from entering the main branch. Generation CI should also regenerate and check the diff so source, compiler version, and derived artifacts remain aligned.

## Handling Failures

Prioritize the earliest diagnostic for each root cause, while using one run to address multiple independent problems. See [diagnostics and automation](/docs/diagnostics) for machine-readable output.
