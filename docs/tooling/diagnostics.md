---
slug: /diagnostics
---

# Diagnostics, Symbols, and Automation

## Log Formats

Text output is for terminals; integrations should use JSONL:

```bash
skelc --log-format jsonl check --skel-in ./skel
```

Each line independently contains `level`, `severity`, a stable `code`, an exact `range`, and `message`. Diagnostics also include `related` or `suggestion` when a related declaration or automatic fix is available. Failed commands return a non-zero exit code; automation should not infer success from text alone.

`check` recovers syntax analysis at top-level declarations, block members, closing braces, and decorator boundaries, then collects up to 50 independent syntax and semantic diagnostics per domain in one run. Invalid declarations are isolated so dependent errors are not reported as cascades. Warnings use the same structured model without causing a non-zero exit code.

## Inspect Symbols

```bash
skelc symbol list --skel-in ./skel
skelc symbol get demo.user.User --skel-in ./skel
```

Add `--output-format json` for structured results. Symbol commands inspect top-level declarations in the current input and do not resolve external domain definitions.

## Integration Rules

- Pin the skelc version.
- Preserve stdout/stderr boundaries and exit codes.
- Treat JSON/JSONL fields as a protocol; do not depend on human-readable spacing.
- Record input paths and compiler versions so generation problems are reproducible.

See the [CLI reference](/docs/cli) for all flags.
