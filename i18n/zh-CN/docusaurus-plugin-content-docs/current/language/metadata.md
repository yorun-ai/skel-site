---
slug: /metadata
---

# 描述与标记

decorator 为契约附加文档和处理规则，不改变类型语法。skelc 当前支持 `@desc`、`@example` 和 `@sensitive`。

## 描述

```skel
@desc("客户可见的订单编号")
reference: string
```

长文本使用三引号：

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

开始和结束的 `"""` 各占一行。skelc 会移除非空内容行共有的缩进，因此说明可以跟随周围源码缩进。

描述会进入生成元数据与 schema。应写清消费者真正需要知道的含义、单位、约束和边界情况，不要只是重复字段名。

## 示例

```skel
@desc("ISO 4217 货币代码")
@example("SGD")
currency: string
```

`@example` 必须有值，并且同一位置要有 `@desc`。data-like 字段、service input、service output、resource check input、task trigger input 以及 actor credential/info 字段支持示例。

示例只是文档值，不是校验表达式。除非应用代码增加规则，否则字段仍接受类型允许的所有值。

## 敏感值

```skel
@sensitive
data AccessCredential {
    token: string
}
```

`@sensitive` 不接受参数。它表示值不应以明文进入日志或诊断，不负责加密，也不改变 JSON/CBOR 表示。

支持位置包括：

- `data`、`config` 整体及其字段
- event `payload` block 或字段
- actor `credential`、`info` block 或字段
- service method `input`、`output` 或 input 字段
- resource check `input` 或字段
- task trigger `input` 或字段

生成的 Go 字段带有 `skel:"sensitive"` tag；整体生成值会实现或携带对应敏感元数据，domain schema 也会向 Vine 工具暴露该标记。`skelSensitive` 是这些生成结构中的保留字段名。

敏感标记是处理要求，不是访问规则。谁能得到该值仍由 actor、认证和权限控制。

## 支持位置

| 契约位置 | `@desc` | `@example` | `@sensitive` |
| --- | :---: | :---: | :---: |
| Domain 与顶层声明 | 支持 | 不支持 | 仅 data/config |
| Enum item | 支持 | 不支持 | 不支持 |
| Data-like 字段或 input 参数 | 支持 | 支持 | 支持 |
| Service method | 支持 | 不支持 | 不支持 |
| Method input/output block | 支持 | 仅 output | 支持 |
| Event payload block | 不支持 | 不支持 | 支持 |
| Actor credential/info block | 不支持 | 不支持 | 支持 |
| Resource action/check 或 task trigger | 支持 | 不支持 | 不支持 |

移动 decorator 后应运行 `skelc check`。不支持的位置会报错，不会被静默忽略。

接下来阅读[契约边界](/docs/contract-design)，或使用[语法速查](/docs/syntax)快速定位声明。
