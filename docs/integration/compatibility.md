---
slug: /compatibility
---

# Versions and Compatibility

Skel syntax, CLI flags and exit codes, JSON/JSONL fields, generated filenames, public APIs, and module metadata are compatibility boundaries.

## Upgrade Checklist

1. Pin and record both old and new skelc versions.
2. Re-run format, check, and generation on a clean branch.
3. Review source and every generated-language diff.
4. Inspect Vine, Go module, and npm package versions.
5. Run producer and consumer tests.
6. Document changes that require manual migration.

## Reproducible Generation

CI and developer environments use the same skelc version. Version input paths, import mappings, and output configuration. Do not depend on undeclared local replacements, neighboring repositories, or global state.

Versioned documentation explains historical behavior; use current docs and the relevant release notes when fixing current contracts.
