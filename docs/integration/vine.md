---
slug: /vine-integration
---

# Vine Integration

Generated Go code uses Vine public packages as its runtime contract. Output includes data types, service/client/server specs, Event/Task/Web specs, actor and permission helpers, and domain schema metadata.

## Version Relationship

`skelc version` reports both the minimum supported and default Vine versions. Generated Go modules write the default version to `go.mod`; `--go-vine-version` may select another version as long as it is not older than the minimum. The current generated Go contract requires Vine v0.13.1 or newer for typed in-process Rpc value isolation.

## Recommended Workflow

1. Change `.skel`.
2. Run format and check.
3. Regenerate with the project-pinned skelc version.
4. Review generated APIs, module dependencies, and schema diffs.
5. Run Vine application tests.

Generated files are derived artifacts -- don't patch them directly or add
unmanaged Go files to their packages. skelc and Vine only support the generated
package as a generator-owned unit. See the [Vine documentation](https://vine.yorun.ai/docs/)
for application lifecycle and Rpc/Web/Event/Task implementation.
