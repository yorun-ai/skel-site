---
slug: /generation/typescript
---

# TypeScript Output

```bash
skelc gen ts --api \
  --skel-in ./skel \
  --ts-out ./generated/typescript
```

`--api` is required; omitting it or passing `--pub` is an error. skelc generates API service clients, their data dependencies, and explicitly public data and enums.

## Deprecation Output

Generated declarations, fields, services, methods, and parameters use the `@deprecated` JSDoc tag. A Skel enum is generated as a string union, so an enum item's explanation remains beside its union branch but cannot produce an item-level TypeScript warning.

## Description Comments

A single-line description renders as an inline `/** ... */` comment above the declaration. A longer description keeps the multi-line comment block.

## vRPC Binary and CBOR

When methods contain `binary`, the TypeScript service client emits sparse vRPC wire schemas so `@yorun-ai/vrpc` can select CBOR automatically:

```ts
import type { VrpcWireSchema } from '@yorun-ai/vrpc';

function createFileResultWireSchema(): VrpcWireSchema {
  return {
    kind: 'object',
    fields: () => ({
      content: { kind: 'binary' },
    }),
  };
}

export const FileApiServiceSpec = {
  serviceName: 'demo.file.FileApiService',
  methods: {
    ping: 'ping',
    upload: 'upload',
    download: 'download',
  },
  wire: {
    upload: {
      arguments: {
        kind: 'object',
        fields: () => ({
          content: { kind: 'binary' },
        }),
      } satisfies VrpcWireSchema,
    },
    download: {
      result: createFileResultWireSchema() satisfies VrpcWireSchema,
    },
  },
} as const;
```

How generation works:

- A service without Binary methods gets no `wire` property or wire-schema import.
- Normal JSON methods still emit string method names without any empty configuration.
- Binary arguments emit only `wire.<method>.arguments`.
- Binary results emit only `wire.<method>.result`.
- Schemas support nested data, nullable values, lists, every legal map key, generics, and recursive references. UUID and enum keys use the string-key wire shape.
- The business-facing type of `binary` stays `Uint8Array`, and map types stay `Record`.

A Binary method carries its wire metadata automatically, so you never pass it
yourself; normal methods pass `options` straight through. The application supplies
the CBOR codec when creating its vRPC client -- neither generated code nor skelc
bundles one.

## Shared Types

A domain without API services can still generate a types-only API package. Cross-domain imports reference the other domain’s API package, including its explicitly public data and enums. Local data dependencies are included without requiring `pub`.

## Package Metadata

Pass `--ts-as-module` with `--ts-module` or `--ts-module-scope` to emit package metadata. Cross-domain contracts load through `--skel-import`; `--ts-import domain=package` maps language imports.

The output directory should be exclusively owned by skelc. Run the consuming project's typecheck, tests, and package build after generation.
