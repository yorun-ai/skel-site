---
slug: /generation/typescript
---

# TypeScript 输出

```bash
skelc gen ts \
  --skel-in ./skel \
  --ts-out ./generated/typescript
```

默认生成当前 domain 的 data、enum 和适用的 service client。service 必须面向具有 `via client` 的 actor 才会生成客户端。

## vRPC Binary 与 CBOR

TypeScript service client 会为含 `binary` 的 method 生成稀疏 vRPC wire schema，供 `@yorun-ai/vrpc` 自动选择 CBOR：

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

生成规则：

- service 没有 Binary method 时，不生成 `wire` 和 wire schema import。
- 普通 JSON method 仍只生成字符串 method name，不生成空配置。
- arguments 含 Binary 时只生成 `wire.<method>.arguments`。
- result 含 Binary 时只生成 `wire.<method>.result`。
- schema 支持嵌套 data、nullable、list、`map<int|string, T>`、泛型和递归引用。
- 生成的 schema 使用 `satisfies VrpcWireSchema` 保留字面量推导并执行类型校验。
- `binary` 的业务类型仍为 `Uint8Array`，map 的业务类型仍为 `Record`。

生成的 service wrapper 仅对 Binary method 注入 wire，并让生成 metadata 覆盖调用方的同名字段：

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

普通 method 继续直接透传 `options`。CBOR codec 由应用在创建 vRPC client 时提供，不由生成代码或 skelc 内置。

## 公开输出

增加 `--pub` 后，只生成公开 data、enum 和符合条件的公开 service client。

## Package 元数据

使用 `--ts-as-module` 并提供 `--ts-module` 或 `--ts-module-scope` 可输出 package 信息。跨 domain 引用通过 `--skel-import` 加载契约，通过 `--ts-import domain=package` 映射 import。

生成目录应由 skelc 独占。生成后运行项目自己的 typecheck、测试与打包流程。
