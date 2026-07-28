---
slug: /permissions
---

# 权限模型

Skel 把权限词汇与使用权限的 service method 分开：`resource` 定义 action 和 check，`require` 在服务边界组合这些规则。

## 定义 Action

```skel
pub resource Order {
    action read
    action cancel
}
```

resource 至少包含一个 action。对于 domain `commerce.order`，生成的权限码为：

```text
commerce.order.Order:read
commerce.order.Order:cancel
```

resource 使用 `CamelCase`，action 使用 `lowerCamelCase`。resource 有独立命名空间，因此 `data Order` 和 `resource Order` 可以同时存在。

## 增加参数化 Check

```skel
pub resource Order {
    check exists {
        input {
            orderId: uuid
        }
    }

    action read

    action cancel {
        check ownedByCaller {
            input {
                orderId: uuid
            }
        }
    }
}
```

resource 级 check 可用于任意 action；嵌套在 action 内的 check 只属于该 action。skelc 会生成需要认证的 check service method，并注入当前 `PermissionCode`。没有用户参数时写成 `check enabled {}`。

check 用来回答“订单是否存在”“订单是否属于当前调用者”等应用问题。契约声明输入，应用实现生成的 check interface。

## 使用 Require

```skel
service OrderService {
    require Order:read

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

service 级 require 作用于全部 method，method 级 require 是附加条件：

```skel
method cancel {
    require all(
        Order:cancel,
        Order:cancel:ownedByCaller(orderId)
    )

    input {
        orderId: uuid
    }
}
```

`all(...)` 要求全部通过，`any(...)` 要求至少一个通过；两者可以嵌套，但不能为空。普通权限码可以写在 service 或 method 上；参数化 check 只能用于 method，因为它需要读取 method input。

## 将 Input 路径传给 Check

```skel
method updateMany {
    require Order:cancel:ownedByCaller(orders[*].id)

    input {
        orders: list<OrderRef>
    }
}
```

- 字段级联使用点号：`request.orderId`。
- 支持一个 list wildcard：`orders[*].id`。
- 路径不能以 `[*]` 结尾；check 需要整个 list 时直接传 list 字段。
- 不支持索引、过滤器、slice 或递归 JSONPath。

skelc 会解析路径并检查参数类型。字段改名或类型变化会在契约校验阶段失败，而不是变成运行时权限问题。

## 发布完整权限边界

公共 service 引用了本地 actor 或 resource 时，这些声明也必须标记 `pub`。skelc 不会静默扩大公共输出，授权表面因此能在 review 中被直接看到。

接下来阅读[服务契约](/docs/services)或[公共契约](/docs/generation/public-contracts)。
