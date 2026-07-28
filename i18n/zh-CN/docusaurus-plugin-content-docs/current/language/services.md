---
slug: /services
---

# 服务契约

service 独立于 Go 实现和 TypeScript client 描述可调用 method。skelc 从同一组名称和类型生成两侧接口。

## 声明 Service

```skel
pub service OrderService {
    for CustomerActor via client
    auth

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

service 名以 `Service` 结尾，至少包含一个 method。method 和 input 字段使用 `lowerCamelCase`。

method 内部顺序为：`auth`/`noauth`、`require`、`input`、`output`。input 和 output 都可以省略：

```skel
service HealthService {
    noauth

    method ping {}

    method status {
        output string
    }
}
```

## 认证与调用方

`for Actor [via name]` 记录契约服务的调用者。`auth` 要求已认证 actor，`noauth` 显式允许未认证调用。method 标记覆盖 service 标记；都未设置时，行为由外层 service 或运行时上下文决定。

外部可达的 service 最好显式写出 `auth` 或 `noauth`，不要把安全意图藏在外围默认值里。

## Input 与 Output

```skel
method create {
    @desc("下单时接受的字段")
    input {
        @desc("客户可见的订单编号")
        @example("ORD-2026-0042")
        reference: string
        lines: list<OrderLine>
    }

    @desc("创建后的订单")
    output Order
}
```

有字段时，input 会成为生成的 arguments data。output 是单个 Skel 类型；结果包含多个字段时应声明具名 `data`。

不要给每个结果套一层通用 response。传输状态、结构化错误和 trace 属于运行协议，Skel output 应描述业务结果。

## 组合 Method 与权限规则

```skel
pub service OrderService {
    for StaffActor via client
    auth
    require Order:read

    method cancel {
        require Order:cancel:ownedByCaller(orderId)

        input {
            orderId: uuid
        }
        output Order
    }
}
```

service 和 method 的 require 必须同时通过。表达式和 check 参数见[权限模型](/docs/permissions)。

## Binary Method

`binary` 可以直接出现，也可以嵌套在 data、nullable、list、map 和泛型中。只有包含 binary input 或 output 的 method，TypeScript 生成器才会输出稀疏 vRPC wire schema。业务侧类型仍是 `Uint8Array`，CBOR codec 由应用提供。

生成的传输元数据见 [TypeScript 输出](/docs/generation/typescript)。

## 谨慎演进 Method

method 名、input 字段、output 类型、actor、auth 标记或 require 的变化都会改变契约。新增 nullable 字段通常比替换必填字段更容易兼容，但任何公共变更仍应重新生成全部目标并运行消费方测试。

接下来阅读[事件与任务](/docs/events-and-tasks)，或前往 [Go 生成](/docs/generation/go)实现生成的服务接口。
