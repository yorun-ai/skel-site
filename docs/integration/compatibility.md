---
slug: /compatibility
---

# Compatibility

Skel syntax, CLI flags and exit codes, JSON/JSONL fields, generated filenames, public APIs, and module metadata are all compatibility boundaries -- treat them accordingly.

## Upgrade Checklist

1. Pin and record both the old and new skelc versions.
2. Re-run format, check, and generation on a clean branch.
3. Review the source diff and every generated-language diff.
4. Inspect Vine, Go module, and npm package versions.
5. Run producer and consumer tests.
6. Document any changes that need manual migration.

## Reproducible Generation

CI and developer environments should use the same skelc version. Version your input paths, import mappings, and output configuration. Never depend on undeclared local replacements, neighboring repositories, or global state.

Versioned documentation explains historical behavior; when fixing current contracts, consult the current docs and the relevant release notes.
