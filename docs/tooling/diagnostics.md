---
slug: /diagnostics
---

# Diagnostics & CI

## Result and Log Formats

Command results are always pretty-printed JSON on stdout. `check` returns every
diagnostic in one `{valid,diagnostics}` result. stderr is reserved for logs and
uses JSONL by default. For human-readable output, select text formatting with:

```bash
skelc --log-format text gen go --skel-in ./skel --go-out ./generated/domain
```

Each diagnostic carries a stable `code`, `severity`, exact `range`, and
`message`, with optional `related` or `suggestion`. Exit codes are `0` for a
satisfied result, `1` for a check that completed unsatisfied, and `2` for a
command failure.

`check` recovers syntax analysis at top-level declarations, block members, closing braces, and decorator boundaries, then collects up to 50 independent syntax and semantic diagnostics per domain in one run. Invalid declarations are isolated so dependent errors don't cascade. Warnings use the same structured model without causing a non-zero exit code.

## Inspect Schemas

```bash
skelc schema list --skel-in ./skel
skelc schema get data demo.user.User --skel-in ./skel
```

Schema commands inspect top-level declarations in the current input and do not
resolve external domain definitions.

## Integration Rules

- Pin the skelc version.
- Preserve stdout/stderr boundaries and exit codes.
- Treat JSON/JSONL fields as a protocol; never depend on human-readable spacing.
- Record input paths and compiler versions so generation problems are reproducible.

See the [CLI reference](/docs/cli) for all flags.
