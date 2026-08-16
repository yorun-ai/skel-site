---
slug: /syntax
---

# 语法速查

先用下表定位声明或规则；校验行为跟上下文有关的时候，再翻对应的语言指南。

## 文件结构

```skel
@desc("订单领域契约")
domain commerce.order

import identity.user
import commerce.catalog as catalog

// 后续为顶层声明
```

每个文件都声明 domain。import 放在 domain 之后、顶层声明之前。目录输入必须包含 `domain.skel`，详见[文件与导入](/docs/files-and-imports)。

## 顶层声明

| 形式 | 必需内容 | `pub` | 详细说明 |
| --- | --- | :---: | --- |
| `enum Name { ITEM }` | 至少一个 item | 支持 | [类型与数据](/docs/types-and-data#enum) |
| `data Name { field: Type }` | 字段可为空 | 支持 | [类型与数据](/docs/types-and-data#data-与泛型) |
| `config NameConfig eternal { ... }` | `eternal` 或 `instant` | 支持 | [类型与数据](/docs/types-and-data#config) |
| `actor NameActor { via client {} }` | 至少一个 via | 支持 | [调用者与入口](/docs/actors-and-access) |
| `resource Name { action read }` | 至少一个 action | 支持 | [权限模型](/docs/permissions) |
| `service NameService { method get {} }` | 至少一个 method | 支持 | [服务契约](/docs/services) |
| `event NameEvent { payload { ... } }` | 一个 payload | 支持 | [事件与任务](/docs/events-and-tasks#event) |
| `web NameWeb { for NameActor }` | 至少一个 actor | 不支持 | [调用者与入口](/docs/actors-and-access#声明-web-能力) |
| `task NameTask { trigger run {} }` | 至少一个 trigger | 不支持 | [事件与任务](/docs/events-and-tasks#task-与-trigger) |

支持的声明在关键字前写 `pub`：

```skel
pub data UserSummary {
    id: uuid
}
```

## 类型形式

```text
int  float  bool  string
decimal  binary
timestamp  duration
localdate  localtime  localdatetime
uuid  json

list<T>
map<int|string|uuid|Enum, T>
Qualified.Type
Generic<T>
T?
```

`?` 能加在任意类型上。只有 `data` 能声明泛型参数。map key 必须是非 nullable 的 `int`、`string`、`uuid` 或 enum。详见[类型与数据](/docs/types-and-data)。

## Service Method 形式

```skel
service OrderService {
    for CustomerActor via client
    auth
    require Order:read

    method get {
        noauth
        require Order:read:exists(orderId)
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

service 可包含 audience、一个 auth 标记、一个 service require 和若干 method。method 内顺序为 auth 标记、require、input、output。

## 权限表达式

```text
Resource:action
Resource:action:check(input.path)
all(item, item)
any(item, item)
```

外部 resource 使用限定名，例如 `account.User:read`。check 参数支持字段级联和一个 list wildcard，例如 `orders[*].id`。详见[权限模型](/docs/permissions)。

## Decorator

```skel
@desc("供人阅读的含义")
@example("示例值")
@sensitive
@deprecated("请改用替代声明")
```

`@deprecated` 必须带有非空的解释文本。decorator 能不能用取决于所在位置，不支持的位置会报错。位置表和生成行为见[描述与标记](/docs/metadata)。

## 命名

| 类别 | 形式 |
| --- | --- |
| Domain | 点分小写名称，例如 `commerce.order` |
| 顶层声明与类型参数 | `CamelCase` |
| Service、config、event、actor、web、task | 使用对应 `Service`、`Actor` 等后缀 |
| 字段、method、via、action、check、trigger | `lowerCamelCase` |
| Enum item | `SCREAMING_SNAKE_CASE` |

标识符不能以 `_` 开头。`UNSPECIFIED` 预留给 enum 输出，`skelSensitive` 预留给生成的敏感结构。data 和 actor 认证字段不能命名为 `clone` 或 `cloneBy`；这些名称预留给生成的 Go 值隔离方法。

每次修改契约后都运行一下：

```bash
skelc check --skel-in ./skel
```

命令参数见 [CLI 参考](/docs/cli)。
