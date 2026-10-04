---
slug: /services
---

# 服务契约

service 独立于 Go 实现和 TypeScript client，描述可调用的 method。skelc 从同一组名称和类型生成两侧的接口。

API 服务名必须以 `ApiService` 结尾，例如 `OrderApiService`；其他 service 仍以 `Service` 结尾。

API 服务必须至少声明一条 `for Actor`，缺失时编译报错；匿名 API 也需要声明 actor，并通过 `noauth` 允许匿名调用。

## 服务边界

`pub service` 用于跨领域后端调用，`api service` 用于客户端经 Portal 访问的入口。两修饰符互斥，同一领域的服务名在两种类型间统一判重。API 服务经 Portal 访问，不通过后端 Rpc 客户端调用。

只有 API 服务应声明 `for Actor`、`auth/noauth` 或 `require`，包括方法级规则。未声明认证时默认 `auth`；audience 和 transport 仍按显式声明处理，不由默认值推导。执行认证、权限和资源检查的服务属于后端服务，不作为客户端入口。

### 扩展契约

`ext service` 声明由当前领域定义、其他领域提供实现的扩展契约。Go pub 包只生成 Server/ERServer 接口、默认实现和服务端注册，不生成 Client。分包生成时，regular 包生成供定义方使用的 Client，并转发 pub 包的服务端类型。定义方通过生成的 Client 调用契约，实现方注册生成的 Server，调用由 runtime 路由。

```skel
ext service StorageService {
    method get {
        input { key: string }
        output binary
    }
}
```

service 的 `ext`、`pub`、`api` 修饰符互斥，名称仍以 `Service` 结尾。`ext service` 是服务端契约，不是 Portal 入口，因此 `for Actor`、`auth` 等客户端规则在 `--strict` 下会报错。要实现公开的服务端接口，可嵌入生成的默认 Server 类型，并覆盖所需方法。

## 声明 Service

```skel
api service OrderApiService {
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

service 名以 `Service` 结尾（API 服务为 `ApiService`），至少包含一个 method。method 和 input 字段用 `lowerCamelCase`。

method 内部顺序为：`auth`/`noauth`、`require`、`input`、`output`。input 和 output 都可省略：

```skel
api service HealthApiService {
    for ClientActor via client
    noauth

    method ping {}

    method status {
        output string
    }
}
```

## 认证与调用方

`for Actor [via name]` 记录契约服务的调用者。`auth` 要求已认证 actor，`noauth` 显式允许未认证调用。method 标记会覆盖 service 标记；都没设置的话，行为由外层 service 或运行时上下文决定。

外部可达的 service 最好显式写出 `auth` 或 `noauth`，不要将安全意图藏在外围默认值里。

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

有字段的时候，input 会成为生成的 arguments data。output 是单个 Skel 类型；结果包含多个字段时应该声明具名 `data`。

没必要给每个结果都套一层通用 response。传输状态、结构化错误和 trace 属于运行协议，Skel output 应该描述业务结果。

## 组合 Method 与权限规则

```skel
api service OrderApiService {
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

`binary` 可直接出现，也能嵌套在 data、nullable、list、map 和泛型中。只有包含 binary input 或 output 的 method，TypeScript 生成器才会输出稀疏 vRPC wire schema。业务侧类型仍是 `Uint8Array`，CBOR codec 由应用提供。

生成的传输元数据见 [TypeScript 输出](/docs/generation/typescript)。

## 谨慎演进 Method

method 名、input 字段、output 类型、actor、auth 标记或 require 的变化都会改变契约。新增 nullable 字段比替换必填字段更容易兼容，但任何公共变更仍然应该重新生成全部目标并跑消费方测试。

接下来阅读[事件与任务](/docs/events-and-tasks)，或前往 [Go 生成](/docs/generation/go)实现生成的服务接口。
