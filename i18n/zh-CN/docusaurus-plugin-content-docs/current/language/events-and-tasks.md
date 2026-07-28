---
slug: /events-and-tasks
---

# 事件与任务

event 描述 domain 已经发布的事实，task 描述运行时可以触发的具名工作。二者沿用 service input 的字段与元数据规则，但承担不同职责。

## Event

```skel
pub event OrderPlacedEvent {
    payload {
        orderId: uuid
        customerId: uuid
        placedAt: timestamp
    }
}
```

event 名以 `Event` 结尾并包含一个 `payload` block，不声明 actor，也不支持类型参数。

event 应描述已经发生的事实。`OrderPlacedEvent` 给消费者一个稳定事实；`PlaceOrderEvent` 更像命令，通常应写成 service method 或 task trigger。

payload 应满足消费者需要，但不要复制整个内部模型。详情可以独立变化时，只携带标识符，由消费者向所属 domain 查询。

## 敏感 Payload

```skel
event CredentialIssuedEvent {
    @sensitive
    payload {
        credentialId: uuid
        token: string
    }
}
```

`@sensitive` 标记在 `payload` 上表示整个生成类型都敏感，也可以只标记个别字段。event 声明本身不接受 `@sensitive`。

## Task 与 Trigger

```skel
task RebuildOrderIndexTask {
    trigger manually {}

    trigger forTenant {
        input {
            tenantId: string
            requestedAt: timestamp
        }
    }
}
```

task 名以 `Task` 结尾，至少声明一个 trigger。trigger 使用 `lowerCamelCase`，可以有 input，但没有 output。

同一个任务存在不同调用参数时使用多个 trigger；所有权、失败处理、调度或实现不同时拆成多个 task。

task 不能标记 `pub`。它描述应用边界内部的运行工作，不是跨 domain client API。

## Skel 不负责调度

task 声明不选择 cron、queue、重试次数、并发度或 worker 位置，只为 Vine 提供类型化 trigger 契约，触发方式由应用和部署决定。

同样，event 声明也不选择 broker 或投递保证，这些属于运行时和基础设施。

## 如何选择

| 需求 | 声明 |
| --- | --- |
| 立即请求结果 | `service` method |
| 发布已完成的事实 | `event` |
| 启动具名后台工作 | `task` trigger |
| 暴露 Web 能力 | `web` |

接下来阅读[描述与标记](/docs/metadata)或 [Vine 集成](/docs/vine-integration)。
