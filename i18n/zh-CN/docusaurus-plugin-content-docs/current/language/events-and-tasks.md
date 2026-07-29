---
slug: /events-and-tasks
---

# 事件与任务

event 描述 domain 已经发布的事实，task 描述运行时能触发的具名工作。两者都沿用 service input 的字段与元数据规则，但各司其职。

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

event 名以 `Event` 结尾，包含一个 `payload` block，不声明 actor，也不支持类型参数。

event 应该描述已经发生的事实。`OrderPlacedEvent` 给消费者一个稳定的既成事实；`PlaceOrderEvent` 听起来更像命令，应该写成 service method 或 task trigger。

payload 满足消费者需要就好，不必把整个内部模型复制过来。如果详情会独立变化，只带标识符，让消费者向所属 domain 查询就行。

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

`@sensitive` 标在 `payload` 上表示整个生成类型都敏感，或者只标个别字段。注意 event 声明本身不接受 `@sensitive`。

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

task 名以 `Task` 结尾，至少声明一个 trigger。trigger 用 `lowerCamelCase`，能带 input，但没有 output。

同一个任务存在不同调用参数时用多个 trigger；所有权、失败处理、调度或实现不一样的时候拆成多个 task。

task 不能标记 `pub`。它描述的是应用边界内部的运行工作，不是跨 domain 的 client API。

## Skel 不负责调度

task 声明不管你用的是 cron、queue、重试次数、并发度还是 worker 位置，它只给 Vine 提供类型化的 trigger 契约。触发方式由应用和部署决定。

同样，event 声明也不管 broker 或投递保证，那些属于运行时和基础设施的范畴。

## 如何选择

| 需求 | 声明 |
| --- | --- |
| 立即请求结果 | `service` method |
| 发布已完成的事实 | `event` |
| 启动具名后台工作 | `task` trigger |
| 暴露 Web 能力 | `web` |

接下来阅读[描述与标记](/docs/metadata)或 [Vine 集成](/docs/vine-integration)。
