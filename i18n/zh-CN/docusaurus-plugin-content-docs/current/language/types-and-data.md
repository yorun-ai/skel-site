---
slug: /types-and-data
---

# 类型与数据

Skel 类型描述的是跨生成边界传递的值，不需要复刻应用里的每一种持久化结构或内存对象。

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
    labelsByUserId: map<uuid, string>
}
```

在任意类型后面加 `?` 就表示可为空。`list<T>` 是有序集合；`map<K, V>` 的 key 必须是非空的 `int`、`string`、`uuid` 或 enum。

一个结构有明确的业务含义时，应该声明为具名 `data`。`json` 适合刻意保持开放的边界，但校验责任会从 skelc 转到应用代码身上。

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

只有 `data` 能声明类型参数。参数名以 `T` 开头并用 `CamelCase`；参数声明不能标成 nullable。参数引用和泛型实参都可以 nullable，例如 `value: TItem?`。引用泛型 data 时必须提供准确数量的类型参数。

硬引用形成的循环会被拒绝，因为它没法构造有限值。nullable 或集合边能引入间接层：

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

enum 至少包含一个 item，item 用 `SCREAMING_SNAKE_CASE`。`UNSPECIFIED` 由生成器提供，源码里不要显式声明。

消费者必须处理一个封闭集合时用 enum；生产方有意允许当前消费者还不认识的新值时，用 string 就好。

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

config 字段支持普通值类型：包含 `binary` 的标量、enum、嵌套 `data`、泛型 data 实例、nullable 值以及 list/map。Map key 仍只允许 `int`、`string`、`uuid` 或 enum。Config 和 event 是 final 声明：都不能作为值类型引用，包括普通 data 成员和泛型实参。

```skel
data ConfigEntry<TValue> {
    value: TValue?
}

config AssetConfig eternal {
    content: binary
    entries: list<ConfigEntry<string>>
}
```

结构化 config 需要 skelc v0.23.0 或更高版本，运行时需要 Vine v0.25.0 或更高版本。

Vine runtime 会保留配置字符串的原始空白。JSON 或 YAML 中的 binary 值使用 base64 字符串；参见 [Vine 配置](https://vine.yorun.ai/zh-CN/docs/configuration)。

## 契约结构不等于存储结构

数据库行经常包含迁移字段、内部状态或反规范化数据，这些不该直接变成客户端的承诺。为边界单独定义 `data`，在应用层做映射，远比让存储演进牵动所有生成代码来得稳妥。

接下来阅读[调用者与入口](/docs/actors-and-access)或[服务契约](/docs/services)。
