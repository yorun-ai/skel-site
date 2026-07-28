---
slug: /actors-and-access
---

# 调用者与入口

actor 表示一类调用者。它记录调用者可以从哪些入口进入系统，以及认证时携带的 credential 和身份信息。

## 声明入口类型

```skel
pub actor CustomerActor {
    via client {}
    via openapi {}
}
```

actor 名以 `Actor` 结尾，至少声明一个 `via`：

| Via | 常见调用方 |
| --- | --- |
| `client` | 生成的 vRPC client |
| `agent` | 应用或内部 agent |
| `openapi` | 面向 OpenAPI 的调用方 |

这里声明的是能力，不是网络安全策略。TLS、token、网关和端点暴露仍由运行时负责。

## 增加认证数据

```skel
pub actor CustomerActor {
    via client {}

    auth {
        @sensitive
        credential {
            token: string
        }

        info {
            customerId: uuid
            tenantId: string
        }
    }
}
```

`auth` 同时包含 `credential` 和 `info`：

- `credential` 是调用者提交的凭据，至少一个字段，且每个字段都是非 nullable 的 `string`。
- `info` 是应用代码得到的认证身份，可以使用普通 Skel 字段类型。

skelc 会生成 actor 专属的 credential、info 数据类型和认证服务元数据。需要避免进入明文日志的字段或 block 应标记 `@sensitive`。

## 启用权限查询

```skel
actor StaffActor {
    via client {}
    permission {}
}
```

`permission {}` 启用生成的 actor 权限服务。它不定义权限；可用权限码和检查由 `resource` 声明，详见[权限模型](/docs/permissions)。

## 将 Actor 绑定到 Service

```skel
service OrderService {
    for CustomerActor via client
    for StaffActor

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

每个 `for` 声明一种允许的 actor。需要限定 actor 的某个入口时加 `via`；省略时不限定入口。

仅在应用内部使用的 service 可以不写 `for`。不要为了图表完整而虚构公共 actor，只有真实调用方需要生成入口契约时才声明。

## 声明 Web 能力

```skel
web CustomerPortalWeb {
    for CustomerActor via client
}
```

web 名以 `Web` 结尾，至少声明一个 actor。它说明谁能进入一个 Web 能力，不声明 HTTP method、path 或 handler。web 是本地运行能力，不能标记 `pub`。

## 控制 Actor 粒度

当调用者在 credential、身份信息、入口或权限行为上确实不同时，拆成不同 actor。不要按页面或 service method 创建 actor；稳定的 actor 应覆盖一组相关能力。

接下来阅读[权限模型](/docs/permissions)或[服务契约](/docs/services)。
