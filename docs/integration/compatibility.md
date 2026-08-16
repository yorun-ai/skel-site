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

## Domain Schema Checks

Snapshot and diff each domain independently. References to imported domains are
stored as opaque, fully qualified names; their declarations are not copied into
the current domain's schema. A schema snapshot covers the complete domain,
including public and private declarations, while retaining each declaration's
`pub` marker. This keeps compatibility ownership aligned with the domain that
owns each declaration and makes import paths unnecessary for schema checks.
Schema commands do not accept import-path mappings.
Diff reads the baseline and candidate Skel source files or directories directly;
schema snapshot JSON is not accepted as diff input.
When no explicit baseline is supplied, diff reads the candidate path from Git
`HEAD`. Repositories without usable history must pass `--baseline-skel-in`.

Go integrations can decode these command outputs through the root
`go.yorun.ai/skelc` facade. Use `SchemaEntry`, `SchemaDeclaration`,
`SchemaSnapshot`, or `SchemaDiffReport` for the corresponding schema
subcommand; nested schema types and classification constants are exported from
the same package.
