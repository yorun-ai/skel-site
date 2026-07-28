---
slug: /getting-started
---

# 第一个契约

本节创建一个 domain，完成校验，并生成 Go 与 TypeScript。开始前请先[安装 skelc](/docs/installation)。

## 创建输入目录

```text
demo/
└── skel/
    ├── domain.skel
    └── order.skel
```

```skel title="skel/domain.skel"
@desc("订单领域契约")
domain demo.order
```

```skel title="skel/order.skel"
domain demo.order

pub actor CustomerActor {
    via client {}

    auth {
        @sensitive
        credential {
            token: string
        }
        info {
            customerId: uuid
        }
    }

    permission {}
}

pub enum OrderStatus {
    PENDING
    PAID
}

pub data Order {
    id: uuid
    status: OrderStatus
}

pub resource Order {
    action read
}

pub service OrderService {
    for CustomerActor via client
    auth
    require Order:read

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

这份契约不只是“调用一个 method”：

- `CustomerActor` 明确调用者及其 client 入口。
- credential 被标记为敏感值。
- service 要求具名权限 `Order:read`。
- 结果是一个生成的 `Order` 或 null。
- client 需要的声明全部显式标记为 `pub`。

## 格式化并校验

```bash
skelc format --skel-in ./demo/skel
skelc check --skel-in ./demo/skel
```

`format` 把源码改写为标准格式；`check` 解析名称和类型，校验 actor、权限边界与公共契约闭包。

应先通过校验再生成，generator 不会修复无效契约。

## 生成 Go

向已有 Go module 生成源码：

```bash
skelc gen go \
  --skel-in ./demo/skel \
  --go-out ./demo/skeled
```

输出包含 data 与 enum 类型、actor 元数据、权限码、service interface 和 Vine 注册辅助代码。业务代码实现生成的 interface；边界变化时修改 `.skel` 并重新生成，不直接修改生成文件。

生成独立 module 时使用 `gen go-module`，详见 [Go 生成](/docs/generation/go)。

## 生成 TypeScript

```bash
skelc gen ts \
  --pub \
  --skel-in ./demo/skel \
  --ts-out ./demo/client
```

输出包含公共 data、enum、service spec 和基于 `@yorun-ai/vrpc` 的 client factory。`--pub` 防止私有声明进入 client package。

package metadata、跨 domain import 和 binary wire schema 见 [TypeScript 输出](/docs/generation/typescript)。

## Review 生成变化

skelc 使用 `.skelc-manifest.json` 记录受管理文件。未跟踪文件会被保留；过期生成文件只有在内容仍与上次 manifest 一致时才会删除。但手写文件如果占用了当前生成路径，仍可能被覆盖，因此应为生成输出保留独立路径。

仓库应记录 `.skel` 源码、项目固定的 skelc 版本，以及仓库策略要求提交的生成产物。CI 中重新生成，并在出现意外 diff 时失败。

下一步：

- [语言模型](/docs/language)解释各类声明的职责。
- [项目目录](/docs/input-layout)说明多 domain 仓库和 import。
- [Vine 集成](/docs/vine-integration)把 Go 输出接入应用。
