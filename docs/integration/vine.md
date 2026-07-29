---
slug: /vine-integration
---

# Vine Integration

Generated Go code uses Vine public packages as its runtime contract. Output includes data types, service/client/server specs, Event/Task/Web specs, actor and permission helpers, and domain schema metadata.

## Version Relationship

`skelc version` reports the default Vine version. Generated Go modules write that version to `go.mod`; `--go-vine-version` can only select a version at least as new as the default.

## Recommended Workflow

1. Change `.skel`.
2. Run format and check.
3. Regenerate with the project-pinned skelc version.
4. Review generated APIs, module dependencies, and schema diffs.
5. Run Vine application tests.

Generated files are derived artifacts -- don't patch them directly. See the [Vine documentation](https://vine.yorun.ai/docs/) for application lifecycle and Rpc/Web/Event/Task implementation.
