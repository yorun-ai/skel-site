---
slug: /metadata
---

# 描述与标记

decorator 给契约附加文档和处理规则，不影响类型语法。skelc 目前支持 `@desc`、`@example`、`@sensitive` 和 `@deprecated`。

## 描述

```skel
@desc("客户可见的订单编号")
reference: string
```

长文本用三引号：

```skel
@desc("""
取消尚未进入履约阶段的订单。
该操作是幂等的。
""")
method cancel {
    input {
        orderId: uuid
    }
}
```

开始和结束的 `"""` 各占一行。skelc 会移除非空内容行共有的缩进，所以说明文字能跟随周围源码一起缩进。

描述会进入生成的元数据与 schema。不要只是重复字段名——应该写清楚消费者真正需要知道的含义、单位、约束和边界情况。

## 示例

```skel
@desc("ISO 4217 货币代码")
@example("SGD")
currency: string
```

`@example` 必须有值，而且同一位置必须有 `@desc`。data-like 字段、service input、service output、resource check input、task trigger input 以及 actor credential/info 字段支持示例。

示例只是文档值，不是校验表达式。除非应用代码加了规则，否则字段仍然接受类型允许的所有值。

## 敏感值

```skel
@sensitive
data AccessCredential {
    token: string
}
```

`@sensitive` 不接受参数。它表示这些值不该以明文形式进入日志或诊断，但不负责加密，也不改变 JSON/CBOR 表示。

支持的位置包括：

- `data`、`config` 整体及其字段
- event `payload` block 或字段
- actor `credential`、`info` block 或字段
- service method `input`、`output` 或 input 字段
- resource check `input` 或字段
- task trigger `input` 或字段

生成的 Go 字段带有 `skel:"sensitive"` tag；整体生成值会实现或携带对应的敏感元数据，domain schema 也会向 Vine 工具暴露该标记。注意 `skelSensitive` 是这些生成结构中的保留字段名。

敏感标记是处理要求，不是访问规则。谁能拿到这个值仍然由 actor、认证和权限来控制。

## 弃用

```skel
@deprecated("请改用 Profile")
data User {
    @deprecated("请改用 id")
    legacyId: string
}
```

`@deprecated` 必须带一个非空字符串，说明消费者应该改用什么或如何迁移。它可以标记顶层的 enum、data、config、event、actor、resource、service、task 和 web，也可以标记 enum item、data-like 字段、resource action/check、service method、task trigger，以及 resource check、service method、task trigger 的 input 参数。

弃用只作用于被标记的元素，不会向子元素传递。domain 以及 `input`、`output`、`payload`、`credential`、`info` 等结构 block 不能被弃用。

生成的 Go 声明会使用标准的 `Deprecated:` 文档段落，生成的 TypeScript 会使用 `@deprecated` JSDoc tag，公开 Skel 输出会保留 decorator；生成的 domain schema 同时携带布尔标记和解释文本。skelc 会记录并暴露这些元数据，但目前不会在其他声明引用弃用元素时发出警告。

生成的 TypeScript 会把 Skel enum 表示为字符串联合类型。enum item 的弃用说明会保留在对应联合分支旁边，但该分支不是独立的具名符号，因此 TypeScript 无法给出 item 级弃用警告。

## 支持位置

| 契约位置 | `@desc` | `@example` | `@sensitive` | `@deprecated` |
| --- | :---: | :---: | :---: | :---: |
| Domain | 支持 | 不支持 | 不支持 | 不支持 |
| 顶层声明 | 支持 | 不支持 | 仅 data/config | 支持 |
| Enum item | 支持 | 不支持 | 不支持 | 支持 |
| Data-like 字段或 input 参数 | 支持 | 支持 | 支持 | 支持 |
| Service method | 支持 | 不支持 | 不支持 | 支持 |
| Method input/output block | 支持 | 仅 output | 支持 | 不支持 |
| Event payload block | 不支持 | 不支持 | 支持 | 不支持 |
| Actor credential/info block | 不支持 | 不支持 | 支持 | 不支持 |
| Resource action/check 或 task trigger | 支持 | 不支持 | 不支持 | 支持 |

移动 decorator 后记得运行 `skelc check`。不支持的位置会报错，不会被静默忽略。

接下来阅读[契约边界](/docs/contract-design)，或者用[语法速查](/docs/syntax)快速定位声明。
