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

Backend Go modules emit `descriptor.go` and use the public
`go.yorun.ai/skel/descriptor` types. Their registration call requires
`skel.RegisterDomainDescriptor(*descriptor.Domain)`, and the generated module
depends on Vine v0.28.0 or later. Go `--api` clients use vRPC and are unaffected.
Application code that needs its own copy of a generated bean uses
`vine/util/vbean.DeepClone`.

When reviewing a generated descriptor diff, compare keys rather than positions:
keyed fields can appear in any order.

## Domain Schema Checks

Diff each domain independently. References to imported domains remain opaque,
fully qualified names; their declarations are not copied into the current domain.
Diff covers all public and private declarations. `schema diff` and default
`schema list/get` do not accept import mappings; `schema dep` and selected
`schema list --pub/--api` views resolve dependencies with `--skel-import`.

A web that declares `mount` records it as `mountPath`, and changing that value
appears as `web.mount-path.changed` at `BREAKING` impact. Switching a service or
event between `pub` and `ext` changes which side implements or consumes it, and
appears as `service.ext.changed` or `event.ext.changed` at `BREAKING` impact.
Changing or tightening an authentication mode appears as `service.auth.changed`,
`service.auth.tightened`, `method.auth.changed`, or `method.auth.tightened` at
`BREAKING` impact; relaxing one appears as `service.auth.relaxed` or
`method.auth.relaxed` at `DANGEROUS` impact. Consumers of normalized query output should keep
`go.yorun.ai/skel/cmd/skelc/output` in step with the compiler.

Diff reads the baseline and candidate Skel source files or directories directly.

When no explicit baseline is supplied, diff reads the candidate source from Git
`HEAD`. Repositories without usable history must pass `--baseline-skel-in`.

Go integrations decode schema list/get outputs using the types in
`go.yorun.ai/skel/cmd/skelc/output`, and diff reports using
`go.yorun.ai/skel/schema/diff.Report`, with Go's `encoding/json`.
Programmatic tools can use `api.QuerySchema` to obtain a semantic `*schema.Domain`
and `diff.Compare` to compare two domains directly, without serializing them.

## Actor Identity

Regenerate actor registration, authentication data, services, and descriptors after changing an actor. Applications that read
schema query output with `go.yorun.ai/skel/cmd/skelc/output` update that dependency alongside the
compiler so both recognize `actor.auth.identifierField`. Actor authentication is
grouped under `auth`; an omitted `auth` means no authentication was declared. See
[Actors & Access](/docs/actors-and-access) for marker usage.
