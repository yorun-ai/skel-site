---
slug: /generation/typescript
---

# Generate TypeScript

```bash
skelc gen ts \
  --skel-in ./skel \
  --ts-out ./generated/typescript
```

By default, skelc generates data, enums, and eligible service clients for the current domain. A service needs an actor with `via client` to produce a client.

## vRPC Binary and CBOR

For methods containing `binary`, the TypeScript service client emits sparse vRPC wire schemas that let `@yorun-ai/vrpc` select CBOR automatically:

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

export const FileServiceSpec = {
  serviceName: 'demo.file.FileService',
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

Generation rules:

- A service without Binary methods has no `wire` property or wire-schema import.
- Normal JSON methods still emit only string method names and no empty configuration.
- Binary arguments emit only `wire.<method>.arguments`.
- Binary results emit only `wire.<method>.result`.
- Schemas support nested data, nullable values, lists, `map<int|string, T>`, generics, and recursive references.
- Generated schemas use `satisfies VrpcWireSchema` to preserve literal inference and enforce type checking.
- The business-facing type of `binary` remains `Uint8Array`, and map types remain `Record`.

The generated service wrapper injects wire metadata only for Binary methods, with generated metadata taking precedence over a caller-provided field of the same name:

```ts
return client.invoke({
  serviceName: FileServiceSpec.serviceName,
  methodName: FileServiceSpec.methods.upload,
  params,
  options: {
    ...options,
    wire: FileServiceSpec.wire.upload,
  },
});
```

Normal methods continue to pass `options` directly. The application provides the CBOR codec when creating its vRPC client; neither generated code nor skelc bundles one.

## Public Output

With `--pub`, only public data, enums, and eligible public service clients are emitted.

## Package Metadata

Use `--ts-as-module` with `--ts-module` or `--ts-module-scope` to emit package metadata. Cross-domain contracts load through `--skel-import`; `--ts-import domain=package` maps language imports.

The output directory should be exclusively owned by skelc. Run the consuming project's typecheck, tests, and package build after generation.
