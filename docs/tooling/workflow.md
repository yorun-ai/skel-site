---
slug: /workflow
---

# Daily Workflow

Run these in order, both locally and in CI:

```bash
skelc format --skel-in ./skel
skelc check --skel-in ./skel
```

`format` normalizes source shape; `check` validates semantics. Formatting writes in place, so run it on a clean worktree or a reviewable branch.

## CI Example

```bash
skelc format --skel-in ./skel
git diff --exit-code -- ./skel
skelc check --skel-in ./skel
```

This keeps unformatted contracts out of the main branch. Generation CI should also regenerate and check the diff so source, compiler version, and derived artifacts stay aligned.

## Handling Failures

Prioritize the earliest diagnostic for each root cause, but use a single run to address multiple independent problems. See [diagnostics and automation](/docs/diagnostics) for machine-readable output.
