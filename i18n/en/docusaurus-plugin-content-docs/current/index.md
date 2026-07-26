---
slug: /
---

# skelc Documentation

skelc is the compiler and toolchain for the Skel contract language. It turns domain contracts into validated, shareable, reproducible Go, TypeScript, and public Skel artifacts.

```text
.skel contracts ──→ format and validate ──┬──→ Go / Go module ──→ Vine runtime
                                          ├──→ TypeScript
                                          └──→ public Skel ─────→ other domains
```

## Read by Goal

| Goal | Start here |
| --- | --- |
| Use skelc for the first time | [Install](/docs/installation) → [Quick start](/docs/getting-started) |
| Design a domain | [Language overview](/docs/language) → [Contract design](/docs/contract-design) |
| Use skelc in development and CI | [Validation workflow](/docs/workflow) → [Diagnostics and automation](/docs/diagnostics) |
| Generate client or server code | [Code generation overview](/docs/generation) |
| Share contracts with other domains | [Public contracts](/docs/generation/public-contracts) |
| Integrate with Vine | [Vine integration](/docs/vine-integration) → [Runtime types](/docs/runtime-types) |
| Look up every command and rule | [CLI reference](/docs/cli) / [Syntax reference](/docs/syntax) |
| Resolve failures or upgrades | [Troubleshooting](/docs/troubleshooting) / [Compatibility](/docs/compatibility) |

## Documentation Boundary

This site covers the Skel language, the skelc toolchain, and generated contracts. The [Vine documentation](https://vine.yorun.ai/docs/) owns the application model, runtime, and deployment. Topics that cross this boundary live under “Vine Integration” so language rules and framework behavior remain distinct.
