---
slug: /getting-started
---

# 第一个契约

这一节我们创建一个 domain，完成校验，然后生成 Go 和 TypeScript。开始前请先[安装 skelc](/docs/installation)。

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

这份契约可不止是“调用一个 method”那么简单：

- `CustomerActor` 明确声明了调用者以及它的 client 入口。
- credential 被标记为敏感值。
- service 要求具名权限 `Order:read`。
- 结果返回生成的 `Order` 或者 null。
- client 需要的声明全部显式标记了 `pub`。

## 格式化并校验

```bash
skelc format --skel-in ./demo/skel
skelc check --skel-in ./demo/skel
```

`format` 把源码整理成标准格式；`check` 解析名称和类型，校验 actor、权限边界与公共契约闭包。

生成前先运行 `format` 和 `check`——generator 不会修复无效契约，但 `check` 的诊断信息比生成失败时的报错更清晰。

## 生成 Go

往已有 Go module 中生成源码：

```bash
skelc gen go \
  --skel-in ./demo/skel \
  --go-out ./demo/skeled
```

输出内容包含 data 与 enum 类型、actor 元数据、权限码、service interface 以及 Vine 注册辅助代码。业务代码实现生成的 interface 即可；边界有变化时，改 `.skel` 重新生成，不要直接修改生成文件。

生成独立 module 的话用 `gen go-module`，详见 [Go 生成](/docs/generation/go)。

## 生成 TypeScript

```bash
skelc gen ts \
  --pub \
  --skel-in ./demo/skel \
  --ts-out ./demo/client
```

输出包含公共 data、enum、service spec 和基于 `@yorun-ai/vrpc` 的 client factory。`--pub` 会防止私有声明进入 client package。

package metadata、跨 domain import 和 binary wire schema 见 [TypeScript 输出](/docs/generation/typescript)。

## 审查生成变化

请将生成产物放在独立的输出目录中，并在每次生成后检查变更。不要在生成目录中维护手写文件，以免被后续生成覆盖。

仓库应提交 `.skel` 源码和生成产物，以便后续开发基于生成的类型和接口实现应用代码。

下一步：

- [语言模型](/docs/language)解释各类声明的职责。
- [项目目录](/docs/input-layout)说明多 domain 仓库和 import。
- [Vine 集成](/docs/vine-integration)把 Go 输出接入应用。
