---
slug: /types-and-data
---

# 类型与数据

Skel 类型描述跨生成边界传递的值，不需要复刻应用中的每一种持久化结构或内存对象。

## 标量类型

| 类型 | 用途 |
| --- | --- |
| `int`、`float`、`bool`、`string` | 基础值 |
| `decimal` | 金额等精确小数 |
| `binary` | 字节内容 |
| `timestamp`、`duration` | 时间点与时间跨度 |
| `localdate`、`localtime`、`localdatetime` | 不带时区的日历时间 |
| `uuid` | UUID 标识符 |
| `json` | 没有固定结构时的 JSON 文本 |

Go、TypeScript 生成类型以及 JSON/CBOR 行为见[运行时类型](/docs/runtime-types)。

## 集合与可空类型

```skel
data UserProfile {
    id: uuid
    displayName: string
    email: string?
    roles: list<string>
    attributes: map<string, string>
}
```

在任意类型后加 `?` 表示可空。`list<T>` 是有序集合；`map<K, V>` 的 key 必须是非空的 `int`、`string` 或 enum。

一个结构具有业务含义时，应声明为具名 `data`。`json` 适合刻意保持开放的边界，但校验责任会从 skelc 转移到应用代码。

## Data 与泛型

```skel
data Page<TItem> {
    items: list<TItem>
    nextToken: string?
}

data User {
    id: uuid
}

data UserPage {
    page: Page<User>
}
```

只有 `data` 能声明类型参数。参数名以 `T` 开头并使用 `CamelCase`，不能标记为 nullable。引用泛型 data 时必须提供数量准确的类型参数。

硬引用形成的循环会被拒绝，因为它无法构造有限值。nullable 或集合边可以引入间接层：

```skel
data Category {
    name: string
    children: list<Category>
}
```

## Enum

```skel
enum OrderStatus {
    PENDING
    PAID
    CANCELLED
}
```

enum 至少包含一个 item，item 使用 `SCREAMING_SNAKE_CASE`。`UNSPECIFIED` 由生成器提供，源码中不能显式声明。

当消费者必须处理一个封闭集合时使用 enum；如果生产方有意允许当前消费者尚未知晓的值，则使用 string。

## Config

```skel
config CheckoutConfig eternal {
    timeout: duration
    supportedCurrencies: list<string>
    retryLimitByRegion: map<string, int>
}
```

config 名以 `Config` 结尾，并声明一种生命周期：

- `eternal`：应用生命周期内保持稳定。
- `instant`：应用运行中可能发生变化。

config 字段有意受限：可以使用标量、enum 以及允许的 list/map 组合，但不能引用 `data`、另一个 `config` 或 `binary`。这样生成的配置值更容易跨环境传递和观测。

## 契约结构不等于存储结构

数据库行经常包含迁移字段、内部状态或反规范化数据，不应直接成为客户端承诺。为边界单独定义 `data` 并在应用层映射，远比让存储演进牵动所有生成代码更稳妥。

接下来阅读[调用者与入口](/docs/actors-and-access)或[服务契约](/docs/services)。
