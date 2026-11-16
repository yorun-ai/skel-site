---
slug: /actors-and-access
---

# 调用者与入口

actor 代表一类调用者。需要认证时，它声明调用者的 credential 和身份信息。

## 声明调用者

```skel
pub actor CustomerActor {}
```

actor 名使用 `Actor` 后缀，可追加版本号，例如 `CustomerActorV2`。不需要认证和权限声明时，可以使用空的 actor 定义。TLS、token、网关和端点暴露仍由运行时负责。

## 增加认证数据

```skel
pub actor CustomerActor {
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
- `info` 是应用代码拿到的认证身份，必须至少声明一个字段，能用普通的 Skel 字段类型；`@identifier` 仍然可选。空的 `info {}` 会被拒绝。

skelc 会生成 actor 专属的 credential、info、auth-result 数据类型和认证服务元数据。生成的 `auth` 方法返回 `<ActorName>AuthResult`，其中必填的 `info` 字段包含 `<ActorName>Info`。字段或 block 如果不想出现在明文日志里，加上 `@sensitive` 标记就行。

## 声明代操作身份

在 auth block 中显式声明可随有效身份返回的操作者类型：

```skel
pub actor UserActor {
    auth {
        impersonator OpsActor, AdminActor
        credential { session: string }
        info {
            @identifier
            userId: int
        }
    }
}
```

`OpsActor` 和 `AdminActor` 必须是声明了认证 info 的 actor。导入的 actor 必须公开；公开 actor 只能引用公开操作者。支持带 import 限定符的名称，也支持引用当前 actor 自身。使用一条逗号分隔的 `impersonator` 声明；重复 actor 或派生字段名冲突会报错。

上例生成的结果结构如下（这些 Data 由编译器生成，无需在源文件中另行声明）：

```skel
data UserActorAuthResult {
    info: UserActorInfo
    impersonatorInfo: UserActorImpersonatorInfo?
}

data UserActorImpersonatorInfo {
    opsActorInfo: OpsActorInfo?
    adminActorInfo: AdminActorInfo?
}
```

`impersonatorInfo` 为空表示普通认证；非空时，内部必须恰好一个候选 info 字段非空。该规则由认证结果消费方校验，生成的 Go 结构体本身不执行互斥检查。未声明 `impersonator` 时，结果只有 `info`。

该声明描述支持的身份信息，不授予代登录权限。凭据、session 及是否代登录仍由业务认证服务决定。此结构记录直接操作者，不表示递归认证链。

所有生成的 auth 方法都返回 `<ActorName>AuthResult`，未声明操作者的 actor 也一样；业务实现填写 `info`。Vine v0.33.0 在 Portal 接受该契约。

## Actor 标识符

用 `@identifier` 标记 `auth.info` 中用于标识调用者的字段，如上例的 `customerId`。
每个 actor 最多标记一个顶层字段，类型必须是非可空的 `string`、`uuid` 或 `int`。
该标记不接受参数，也不能用于 `credential` 或其他数据声明。
不需要提供调用者标识符时，可以省略标记。

修改契约后，请重新生成代码。运行时如何读取身份信息，参见
[Vine 身份文档](https://vine.yorun.ai/zh-CN/docs/meta)。

## 启用权限查询

```skel
actor StaffActor {
    permission {}
}
```

`permission {}` 会启用生成的 actor 权限服务。它不定义权限本身；可用的权限码和检查由 `resource` 声明来管，详见[权限模型](/docs/permissions)。

## 将 Actor 绑定到 Service

```skel
api service OrderApiService {
    for CustomerActor, StaffActor
    auth required

    method get {
        input {
            orderId: uuid
        }
        output Order?
    }
}
```

API service 和 web 都用一条 `for` 声明列出全部允许的 actor，多个 actor 用逗号分隔；列表可以换行。单个 actor 写成 `for CustomerActor`。同一个 actor 重复出现会报错。

只在应用边界内部调用的后端 service 不需要 `for`。只有真实调用方需要入口契约时才声明 actor。

## 声明 web 能力

```skel
web CustomerPortalWeb {
    for CustomerActor
    auth required
}
```

web 名使用 `Web` 后缀，可追加版本号，例如 `CustomerPortalWebV2`；至少声明一个 actor。它说明谁能进入一个 web 能力，但不声明 HTTP method、path 或 handler。web 声明是本地运行能力，不能标记 `pub`。

### web 认证

web 声明只接受一种 auth 模式：`auth required`、`auth optional`、`auth anonymous` 或 `auth off`。前三种使用 portal 认证，并在转发前移除 `Authorization`；`off` 跳过 portal 认证，把 header 留给 web handler。必须显式声明认证模式。

### 固定前端挂载路径

当前端构建需要固定不变的公开 URL 前缀时，加上 `mount`：

```skel
web ConsoleWeb {
    mount /console
    for ClientActor
}
```

mount 是入口及其静态资源的不可变前缀。当客户端、书签、CDN 规则或反向代理配置依赖该前缀时就应该声明它，并把取值视为已发布契约的一部分：修改它会让 `schema diff` 以 `BREAKING` 报告 `web.mount-path.changed`。

mount 路径是字面绝对路径：必须以 `/` 开头，不能包含路由参数、query 或 fragment 分隔符、转义、空白、空段（`//`）以及 `.`、`..` 段；允许以 `/` 结尾。同一个 web 最多声明一次 `mount`。

不写 `mount` 表示该 web 不受已声明的挂载路径限制，而 `mount /` 显式声明根路径，两者并不等价：只有显式声明根路径才会把 web 限制在 `/`。

该值如何进入生成代码见 [Vine 集成](/docs/vine-integration#声明的-web-挂载路径)，生成的 web 产物见 [Go 生成](/docs/generation/go#web-生成)。

## 控制 Actor 粒度

当调用者在 credential、身份信息或权限行为上确实不一样的时候，拆成不同的 actor。避免为每个页面或 service method 各建一个 actor；稳定的 actor 应该覆盖一组相关的功能。

接下来阅读[权限模型](/docs/permissions)或[服务契约](/docs/services)。
