---
slug: /actors-and-access
---

# 调用者与入口

actor 代表一类调用者。它记录了调用者能通过哪些入口进入系统，以及认证时需要携带的 credential 和身份信息。

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
            @identifier
            customerId: uuid
            tenantId: string
        }
    }
}
```

`auth` 同时包含 `credential` 和 `info`：

- `credential` 是调用者提交的凭据，至少一个字段，每个字段是 `string` 或 `string?`，且至少有一个非 nullable 的 `string` 字段。
- `info` 是应用代码拿到的认证身份，能用普通的 Skel 字段类型。

skelc 会生成 actor 专属的 credential、info 数据类型和认证服务元数据。字段或 block 如果不想出现在明文日志里，加上 `@sensitive` 标记就行。

## Actor 标识符

用 `@identifier` 标记 `auth.info` 中用于标识调用者的字段，如上例的 `customerId`。
每个 actor 最多标记一个顶层字段，类型必须是非可空的 `string`、`uuid` 或 `int`。
该标记不接受参数，也不能用于 `credential` 或其他数据声明。
不需要提供调用者标识符时，可以省略标记。

`@identifier` 从 skelc v0.17.0 开始支持，生成的 Go 代码要求 Vine v0.15.1 或更高版本。
修改契约后，请重新生成代码。运行时如何读取身份信息，参见
[Vine 身份文档](https://vine.yorun.ai/zh-CN/docs/meta)。

## 启用权限查询

```skel
actor StaffActor {
    via client {}
    permission {}
}
```

`permission {}` 会启用生成的 actor 权限服务。它不定义权限本身；可用的权限码和检查由 `resource` 声明来管，详见[权限模型](/docs/permissions)。

## 将 Actor 绑定到 Service

```skel
api service OrderApiService {
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

每个 `for` 声明一种允许的 actor。想限定 actor 的某个入口时加上 `via`；不写就不限定入口。

只在应用内部使用的 service 可以不写 `for`。只有真实调用方需要生成入口契约时才声明 actor——不必为了画图好看去虚构公共 actor。

## 声明 Web 能力

```skel
web CustomerPortalWeb {
    for CustomerActor via client
}
```

web 名以 `Web` 结尾，至少声明一个 actor。它说明谁能进入一个 Web 能力，但不声明 HTTP method、path 或 handler。注意 web 是本地运行能力，不能标记 `pub`。

### 固定前端挂载路径

当前端构建需要固定不变的公开 URL 前缀时，加上 `mount`：

```skel
web ConsoleWeb {
    mount /console
    for ClientActor via client
}
```

mount 是入口及其静态资源的不可变前缀。当客户端、书签、CDN 规则或反向代理配置依赖该前缀时就应该声明它，并把取值视为已发布契约的一部分：修改它会改变 Web 哈希，`schema diff` 会以 `BREAKING` 报告 `web.mount-path.changed`。

mount 路径是字面绝对路径：必须以 `/` 开头，不能包含路由参数、query 或 fragment 分隔符、转义、空白、空段（`//`）以及 `.`、`..` 段；允许以 `/` 结尾。同一个 Web 最多声明一次 `mount`。

不写 `mount` 表示该 Web 不受已声明的挂载路径限制，而 `mount /` 显式声明根路径，两者并不等价：只有显式声明根路径才会把 Web 限制在 `/`。

生成的 `web.WebSpec` 与 runtime domain schema 都会以 `MountPath` 携带该值；Go 侧使用挂载能力需要 Vine v0.19.0 或更高版本。生成的 Web 产物见 [Go 生成](/docs/generation/go#web-生成)。

## 控制 Actor 粒度

当调用者在 credential、身份信息、入口或权限行为上确实不一样的时候，拆成不同的 actor。不建议按页面或 service method 去创建 actor；稳定的 actor 应该覆盖一组相关的功能。

接下来阅读[权限模型](/docs/permissions)或[服务契约](/docs/services)。
