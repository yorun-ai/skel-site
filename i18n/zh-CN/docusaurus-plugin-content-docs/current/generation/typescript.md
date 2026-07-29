---
slug: /generation/typescript
---

# TypeScript 输出

```bash
skelc gen ts \
  --skel-in ./skel \
  --ts-out ./generated/typescript
```

默认会生成当前 domain 的 data、enum，以及符合条件的 service client。注意：只有面向 `via client` actor 的 service，才会生成客户端代码。

## 弃用输出

生成的声明、字段、service、method 和参数会使用 `@deprecated` JSDoc tag。Skel enum 会生成字符串联合类型，因此 enum item 的解释会保留在对应联合分支旁边，但无法触发 item 级 TypeScript 弃用警告。

## vRPC Binary 与 CBOR

TypeScript service client 会为包含 `binary` 的 method 生成稀疏的 vRPC wire schema，方便 `@yorun-ai/vrpc` 自动选择 CBOR：

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

具体规则：

- service 没有 Binary method 时，不生成 `wire` 和 wire schema import。
- 普通 JSON method 仍然只生成字符串形式的 method name，不会有多余的空配置。
- arguments 包含 Binary 时，只生成 `wire.<method>.arguments`。
- result 包含 Binary 时，只生成 `wire.<method>.result`。
- schema 支持嵌套 data、nullable、list、所有合法 map key、泛型和递归引用；UUID 与 enum key 使用 string-key wire shape。
- 生成的 schema 用 `satisfies VrpcWireSchema` 保留字面量推导，同时执行类型校验。
- `binary` 的业务类型仍然是 `Uint8Array`，map 的业务类型仍然是 `Record`。

生成的 service wrapper 只会对 Binary method 注入 wire，并让生成的 metadata 覆盖调用方的同名字段：

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

普通 method 继续直接透传 `options`。CBOR codec 由应用在创建 vRPC client 时自己提供，生成代码和 skelc 不会内置它。

## 公开输出

加上 `--pub`，只生成公开的 data、enum 和符合条件的公开 service client。

## Package 元数据

使用 `--ts-as-module` 并配合 `--ts-module` 或 `--ts-module-scope`，能输出 package 信息。跨 domain 引用通过 `--skel-import` 加载契约，通过 `--ts-import domain=package` 映射 import。

生成目录建议由 skelc 独占。生成完后，运行项目自己的 typecheck、测试和打包流程。
