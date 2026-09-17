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

## Generated Output Contract

Generated Go modules depend on Vine v0.20.2 or later, which is the version written
to the module's `go.mod`. Application code that needs its own copy of a generated
bean uses `vine/util/vbean.DeepClone`.

When reviewing a generated schema diff, compare keys rather than positions:
keyed fields can appear in any order.

## Domain Schema Checks

Snapshot and diff each domain independently. References to imported domains are
stored as opaque, fully qualified names; their declarations are not copied into
the current domain's schema. A schema snapshot covers the complete domain,
including public and private declarations, while retaining each declaration's
`pub` marker. This keeps compatibility ownership aligned with the domain that
owns each declaration and makes import paths unnecessary for schema checks.

Schema commands do not accept import-path mappings.

A Web that declares `mount` records it as `mountPath`, and changing that value
appears as `web.mount-path.changed` at `BREAKING` impact. Consumers that decode
snapshots strictly must recognize the field, so keep `go.yorun.ai/skelc/schema` in
step with the compiler that produced the snapshot.

Diff reads the baseline and candidate Skel source files or directories directly;
schema snapshot JSON is not accepted as diff input.

When no explicit baseline is supplied, diff reads the candidate source from Git
`HEAD`. Repositories without usable history must pass `--baseline-skel-in`.

Go integrations consume these command outputs through the public facade
`go.yorun.ai/skelc/schema`. It exposes the response and nested wire types,
typed constants, and strict `schema.Decode`, `schema.Validate`, and
`schema.Encode` functions, keeping the implementation internal. Strict
decoding rejects unknown fields, trailing JSON values, unsupported format
versions, unknown wire enum values, and malformed normalized structures. The
root `go.yorun.ai/skelc` package remains focused on parsing and generation.

## Actor Identity

Regenerate actor types and schemas after changing an actor. Applications that read
schema output with `go.yorun.ai/skelc/schema` update that dependency alongside the
compiler so both recognize `identifierField`. See
[Actors & Access](/docs/actors-and-access) for marker usage.
