---
slug: /syntax
---

# Skel 语法参考

本文档以当前 skelc 仓库实现为准。

`.skel` 文件用来描述一个 domain 内的 actor、resource、枚举、数据结构、配置结构、事件、服务、Web 入口和任务定义。

## 1. 文件声明

每个 `.skel` 文件都必须以 `domain` 声明开头：

```skel
domain demo.user
```

可以先声明 `import`，再声明顶层条目：

```skel
domain demo.user

import app
import account.user as account

data User {
    id: int
}
```

当前规则：

- `domain` 必须出现在文件开头
- `import` 必须出现在顶层条目前
- 外部类型必须使用限定名，例如 `app.AppContext`
- `import account.user as account` 可以为外部 domain 指定别名

## 2. 顶层结构

当前顶层条目支持：

- `import`
- `actor`
- `resource`
- `enum`
- `data`
- `config`
- `event`
- `service`
- `web`
- `task`

示例：

```skel
@desc("用户领域")
domain demo.user

import user
import account.user as account

@desc("面向客户端应用的使用者")
actor ClientActor {
    via client {}

    auth {
        credential {
            subject: string
        }
        info {
            userId: int
        }
    }

    permission {}
}

pub resource User {
    check byExists {
        input {
            userId: int
        }
    }

    action read

    action update {
        check bySelf {
            input {
                userId: int
            }
        }
    }
}

enum UserStatus {
    ACTIVE
}

data User {
    id: int
}

config DemoConfig eternal {
    timeoutSec: int
}

event UserCreatedEvent {
    payload {
        userId: int
    }
}

pub service UserService {
    for ClientActor via client
    auth
    require User:read

    method getUser {
        require User:read:byExists(userId)

        input {
            userId: int
        }
        output User
    }
}

web UserPortalWeb {
    for ClientActor via client
}

task RebuildUserIndexTask {
    trigger atTime {
        input {
            startAt: timestamp
        }
    }
}
```

`import xxx` 声明 skel 层的逻辑依赖。外部类型必须使用限定名，例如 `user.UserSummary`；当默认别名冲突或希望改名时可以写 `import account.user as account`，然后使用 `account.UserSummary`。

同一个 domain 下，`actor`、`enum`、`data`、`config`、`event`、`service`、`web`、`task` 共享同一命名空间，名字不能重复。`resource` 使用单独命名空间；它通过权限码和 `require` 被 service / method 引用。

## 3. Domain

```skel
@desc("用户领域")
domain demo.user
```

规则：

- domain 是点分名称
- 只有 `domain.skel` 的 domain 上支持 `@desc`
- `@desc` 必须是字符串字面量

## 4. 注释与 decorator

支持：

- 行注释：`// ...`
- 块注释：`/* ... */`

`@desc` 支持：

- 普通字符串 `"hello"`
- 普通字符串中的转义换行，例如 `"第一行\n第二行"`
- 三引号字符串；三引号内容会自动裁掉所有非空行的共同前导缩进，空行不参与缩进计算

`@example` 的规则：

- 只要求有值，不要求一定是字符串
- 但必须和 `@desc` 一起使用

`@sensitive` 用于标记不应以明文进入日志或其他诊断输出的数据：

- 不接受参数，直接写成 `@sensitive`
- 支持 data / config 字段、event payload 字段、actor credential / info 字段、service input 参数、resource check 参数和 task trigger input 参数
- 支持整个 data / config、event 的 payload block、actor 的 credential / info block，以及整个 service method input / output、resource check input 和 task trigger input；event 和 auth 容器本身不能标记
- 不依赖 `@desc`，也可以与 `@desc`、`@example` 同时使用
- 不改变字段类型或 JSON / CBOR wire format
- Go 生成代码会为对应字段增加 `skel:"sensitive"` struct tag；Vine 的 `core/redact` 会识别该 tag
- 整个 data / config、event payload 或 actor credential / info 的生成类型会实现 `skel.Sensitive` interface 的 `SkelSensitive()` marker method；整个 method/check input 或 output 会写入生成的 Rpc `MethodSpec`，整个 task trigger input 会写入生成的 Task `TriggerSpec`
- 字段级和整体敏感属性也会写入生成的 Domain Schema，供 Portal 和其他契约工具读取
- `skelSensitive` 在这些结构化类型中是保留字段名，避免与生成的 marker method 冲突

例如：

```skel
@desc("用户名")
@example("zhangsan")
name: string

@sensitive
accessToken: string

@sensitive
data Credential {
    token: string
}

service AuthService {
    method exchange {
        @sensitive
        input {
            credential: Credential
        }

        @sensitive
        output string
    }
}

event CredentialIssuedEvent {
    @sensitive
    payload {
        credential: Credential
    }
}
```

多行说明推荐使用三引号字符串，内容行通常和 `@desc` 对齐：

```skel
service UserService {
    @desc("""
    根据用户ID查询用户
    未找到时返回 null
    """)
    method getUser {
        output User?
    }
}
```

上例解析出的说明为 `根据用户ID查询用户\n未找到时返回 null`，不会保留内容行前的 4 个空格。共同缩进不要求固定为 4 个空格；只要所有非空行都有相同前导缩进，就会统一裁掉。若各行缩进不同，只裁掉共同的最小缩进，保留相对缩进。

包含真实换行的 `@desc` 可以写成三引号格式：

```skel
@desc("""
第一行
第二行
""")
```

## 5. 命名规则

### 5.1 点分命名

- domain：`demo.user`

### 5.2 CamelCase

以下标识符要求 `CamelCase`：

- `enum` 名
- `data` 名
- `config` 名
- `event` 名
- `service` 名
- `web` 名
- `task` 名
- `actor` 名
- `resource` 名
- 引用类型名
- 泛型参数名

额外约束：

- `service` 名必须以 `Service` 结尾
- `config` 名必须以 `Config` 结尾
- `event` 名必须以 `Event` 结尾
- `web` 名必须以 `Web` 结尾
- `actor` 名必须以 `Actor` 结尾
- `resource` 名不需要以 `Resource` 结尾
- 泛型参数名必须以 `T` 开头，例如 `TItem`

### 5.3 lowerCamelCase

以下标识符要求 `lowerCamelCase`：

- `data` / `config` 字段名
- `service` 方法名
- `task` trigger 名
- 方法参数名
- actor via 名
- resource action 名
- resource check 名
- decorator 名

### 5.4 SCREAMING_SNAKE_CASE

枚举项要求使用 `SCREAMING_SNAKE_CASE`。

额外约束：

- 标识符不能以下划线开头
- `UNSPECIFIED` 是保留枚举项，源码里不能显式声明

## 6. enum

```skel
@desc("用户状态")
enum UserStatus {
    @desc("活跃")
    ACTIVE
}
```

规则：

- `enum` 至少有一个 item
- item 名不能重复
- 顶层和 item 上都只支持 `@desc`
- 编译器会保留内部项 `UNSPECIFIED`

## 7. actor

```skel
@desc("Portal 管理端使用者")
actor PortalAdminActor {
    via client {}
    via openapi {}

    auth {
        @sensitive
        credential {
            subject: string
            tenant: string
        }
        @sensitive
        info {
            userId: int
        }
    }

    permission {}
}
```

规则：

- `actor` 顶层只支持 `@desc`
- `actor` 至少要声明一个 `via`
- `actor` 可以在所有 `via` 后声明 `auth` block；`credential` 和 `info` 必须写在 `auth` block 内
- 声明 `auth` 时，`credential` 和 `info` 必须同时出现，且各自只能出现一次
- `credential` 会生成一个隐式 data，例如 `PortalAdminActorCredential`
- `credential` 可以声明多个字段，但字段类型必须是非 nullable 的 `string`
- `info` 会生成一个隐式 data，例如 `PortalAdminActorInfo`
- 隐式 data 只挂在 actor 上，不进入 domain 的普通 data 列表；它会参与 actor hash，并由 actor 相关生成逻辑消费
- `credential` 和 `info` 字段都支持 `@desc`、`@example` 和 `@sensitive`；两个 block 本身也支持 `@sensitive`
- `permission {}` 表示该 actor 启用权限服务；当前 block 必须为空，里面不能写任何内容
- 启用 permission 后会生成 actor permission service，用于运行时批量检查该 actor 是否拥有指定权限码
- 当前支持的 via 只有：
  - `client`
  - `agent`
  - `openapi`
- via 不能重复

## 8. resource

`resource` 用来声明权限资源、action、权限码以及可选的 check 方法。权限码格式为：

```text
<resourceSkelName>:<actionName>
```

例如 domain `app` 下的 `User` resource，其 `read` action 的权限码是 `app.User:read`。

```skel
@desc("user")
pub resource User {
    @desc("lookup user")
    check byExists {
        input {
            @sensitive
            accessToken: string
            userId: int
        }
    }

    @desc("read user")
    action read

    @desc("update user")
    action update {
        check bySelf {
            input {
                userId: int
            }
        }
    }
}
```

规则：

- `resource` 可以标 `pub`；默认非 pub
- `resource` 名要求 `CamelCase`，但不要求以 `Resource` 结尾
- `resource` 与其它顶层元素不共享命名空间
- `check byXxx { input { ... } }` 可以声明在 resource 级，所有 action 都可以引用
- `action` 内也可以声明自己的 `check byXxx { input { ... } }`
- action 级 check 名不能和 resource 级 check 名重复
- check 自身支持 `@desc`，它的 `input` 支持 `@desc` 和 `@sensitive`
- resource 级 check 生成方法名如 `checkByExists`
- action 级 check 生成方法名会带 action 名，例如 `update` 的 `bySelf` 生成 `checkUpdateBySelf`
- check 的 `input` 与 service method、task trigger 使用相同的字段语法和类型规则
- check input 字段支持 `@desc`、`@example` 和 `@sensitive`
- 无用户参数的 check 写成 `check enabled {}`；`PermissionCode` 参数由 skelc 隐式注入
- resource 会生成 `<ResourceName><ActionName>Permission` 常量和 `<ResourceName>PermissionCodes()` 方法；pub resource 在 regular 包中也会生成 facade

## 9. data

```skel
@desc("用户实体")
data User {
    id: int
    @desc("邮箱")
    @example("a@b.com")
    email: string?
}
```

规则：

- 顶层只支持 `@desc`
- 字段支持 `@desc` 和 `@example`
- 字段名不能重复
- `data` 可以没有字段

### 9.1 泛型 data

当前只有 `data` 支持定义类型参数：

```skel
data Page<TItem> {
    items: list<TItem>
    nextToken: string?
}
```

规则：

- 类型参数名必须是 `CamelCase`
- 必须以 `T` 开头
- 不能写成可空类型，例如 `TItem?`
- 类型参数不能重复

引用规则：

- 非泛型 data 不能带类型参数
- 泛型 data 必须传足类型参数数量

## 10. config

当前语法支持：

```skel
config DemoConfig eternal {
    timeoutSec: int
    tags: list<string>
}
```

生命周期 qualifier 只支持：

- `eternal`
- `instant`

限制：

- `config` 不支持泛型
- `config` 不能引用 data / config 结构体
- `config` 可以直接使用 scalar 或 enum，但不能使用 binary
- `config` 的 `list` 成员值类型必须是 scalar 或 enum，且不能是 binary
- `config` 的 `map` key 必须是 `int`、`string` 或 enum，value 必须是非 binary scalar

同时，`data` 也不能反向引用 `config`。

## 11. event

```skel
@desc("用户已创建事件")
event UserCreatedEvent {
    payload {
        @desc("用户ID")
        userId: int
    }
}
```

规则：

- `event` 顶层只支持 `@desc`
- `event` 必须声明 `payload`
- `payload` 是事件携带的数据结构，字段规则与 `data` 字段一致
- `event` 字段支持 `@desc` 和 `@example`
- `event` 不支持泛型
- `event` 不支持 qualifier
- `event` 不支持 actor

## 12. service

示例：

```skel
@desc("用户服务")
pub service UserService {
    for ClientActor via client
    for OpenAPIActor

    auth

    @desc("根据ID查询用户")
    method getUser {
        noauth

        input {
            @desc("用户ID")
            @example("10001")
            userId: int
        }
        @desc("用户信息")
        @example({"id":10001})
        output User?
    }
}
```

### 12.1 actor

`service` 可以省略 actor：

```skel
service UserInnerService {
    method ping {}
}
```

未声明 actor 时，表示这份契约没有显式标注最终使用者。

声明 actor 时，`for` 后面必须引用已定义的 actor 名，也可以用 `via` 限定 actor via：

```skel
actor ClientActor {
    via client {}
}

pub service UserService {
    for ClientActor via client

    method ping {}
}
```

规则：

- service 可以省略 actor
- `for` 可以写多行；同一个 actor 可以按不同 `via` 分开声明
- `via` 必须引用该 actor 已定义的 via
- `service` 块里的 `for`、`auth` / `noauth`、`require`、`method` 顺序不固定

`for` 声明 service 的 audience，即该契约面向哪些 actor / via。Hub 使用 audience 选择 Portal Site 可暴露的 service；Portal 请求期鉴权由 `auth` / `noauth` 和 `require` 决定。

### 12.2 auth / noauth

`service` 和 `method` 都可以声明 `auth` 或 `noauth`：

```skel
service UserService {
    for ClientActor

    noauth

    method list {
    }

    method update {
        auth
    }
}
```

规则：

- `service` 不声明时默认为 `auth`
- `method` 不声明时继承 service 的认证模式
- `method` 声明 `auth` 或 `noauth` 时覆盖 service 级配置
- schema 会在 service 和 method 上记录 skel 原始声明；未声明时记录为 `unset`，最终认证模式由运行时按 service / method 规则计算

### 12.3 method / input / output

`service` 的方法使用 `method` 声明，方法体里可以声明 `input` 和 `output`：

```skel
method getUser {
    input {
        userId: int
    }
    output User
}
```

规则：

- `method` 名要求 `lowerCamelCase`
- `input` section 可省略；省略时表示无入参
- `output` section 可省略；省略时表示无返回值
- 如果声明 method 级 `auth` / `noauth`，必须写在 `input` / `output` 前面
- `input` 必须写在 `output` 前面
- `input` 字段规则与 `data` 字段一致，支持 `@desc` 和 `@example`
- `output` 是单个类型，不使用字段名

### 12.4 require

`service` 和 `method` 都可以声明 `require`。service 级 require 与 method 级 require 是“且”的关系；运行时会先检查 service 级要求，再检查 method 级要求。

```skel
pub service UserService {
    for app.UserActor
    auth
    require app.User:read

    method getUser {
        require app.User:read:byExists(userId)

        input {
            userId: int
        }
        output User?
    }

    method updateProfile {
        require all(
            app.User:update:byExists(userId),
            app.User:update:bySelf(userId)
        )

        input {
            userId: int
            profile: UserProfile
        }
        output User
    }
}
```

require 表达式支持：

- 权限码：`app.User:read`
- 带 check 的权限要求：`app.User:read:byExists(userId)`
- `all(...)`
- `any(...)`
- `all` / `any` 可以嵌套

规则：

- service 级 `require` 只能写权限码，不支持 check 调用
- method 级 `require` 可以写权限码、check 调用、`all`、`any`
- check 调用格式为 `<resource>:<action>:<check>(args...)`
- resource/action/check 必须存在
- check 参数来自 method input，支持受限 JSONPath 字段路径；生成 schema 时会记录该路径
- check 参数类型必须与 resource check 定义匹配
- pub service 的 require 引用本 domain 的 resource 时，该 resource 也必须标 `pub`

check 参数路径支持的是一个受限 JSONPath 子集，不是完整 JSONPath：

- 支持字段级联，多层字段都可以，例如 `userId`、`update.userId`、`update.profile.account.tenantId`
- 支持最多一个 `[*]`，且 `[*]` 只能出现在非末尾字段段上，例如 `users[*].id`、`users[*].profile.tenantId`
- `users[*].id` 要求 `users` 是 `list<Data>`，提取结果类型是 `list<idType>`；因此 check 参数需要声明为 `list<idType>`
- 不支持末尾 `[*]`，例如 `users[*]`；这与直接写 `users` 语义重复
- 不支持多个 `[*]`，例如 `orders[*].items[*].id`
- 不支持数组下标、filter、slice、递归查找、quoted field，例如 `users[0].id`、`users[?(@.id==1)]`、`users[1:3]`、`..id`、`user["id"]`

示例：

```skel
data User {
    id: int
}

resource User {
    action update {
        check byIds {
            input {
                ids: list<int>
            }
        }
    }
}

service UserService {
    method update {
        require User:update:byIds(users[*].id)

        input {
            users: list<User>
        }
    }
}
```

### 12.5 pub

`pub` 可用于 `data`、`enum`、`config`、`actor`、`resource`、`service` 和 `event`：

```skel
pub data User {
    id: int
}

pub enum UserStatus {
    ACTIVE
}

pub config UserConfig eternal {
    defaultStatus: UserStatus
}

pub actor ClientActor {
    via client {}
}

pub resource User {
    action read
}

pub service UserService {
    for ClientActor

    method ping {}
}
```

不写 `pub` 时，条目是 internal 契约；写了 `pub` 时，条目是公开契约。公开契约引用到的 data / enum / actor / resource 也必须显式标 `pub`，不会隐式带出依赖。

### 12.6 decorator 规则

- service 顶层支持 `@desc`
- service 顶层不支持 `@example`
- 方法只支持 `@desc`
- `input` section 只支持 `@desc`
- `output` section 支持 `@desc` 和 `@example`
- 输入参数支持 `@desc` 和 `@example`
- 所有 `@example` 都必须和同位置的 `@desc` 一起出现

## 13. web

`web` 用来声明一个 Web 入口能力。它目前只描述“这个 domain 暴露了一个 Web 入口，以及这个入口面向哪些 actor”，不描述具体 HTTP route、静态文件目录或前端构建产物。

示例：

```skel
@desc("用户门户")
web UserPortalWeb {
    for ClientActor via client
}
```

可以绑定多个 actor：

```skel
web UserPortalWeb {
    for ClientActor
    for AdminActor
}
```

也可以引用外部 domain 的 actor：

```skel
import app

web DashboardWeb {
    for app.UserActor
}
```

规则：

- `web` 名必须以 `Web` 结尾
- `web` 顶层只支持 `@desc`
- `web` 不支持 `@example`
- `web` 不支持 `pub`
- `web` 必须声明至少一个 actor
- `for` 后面引用的是已定义的 actor 名
- `for` 可以写多行；同一个 actor 可以按不同 `via` 分开声明
- `via` 必须引用该 actor 已定义的 via
- 当前 `web` 语法块内部只支持 `for`

当前 `web` 不区分静态文件入口和动态 REST 入口。若需要表达这类差异，当前推荐在 Go 实现或上层工具中处理；skel 语法层暂时不承载 `static`、`route`、`handler` 等子语法。

## 14. task

示例：

```skel
@desc("重建用户索引")
task RebuildUserIndexTask {
    trigger manually {}

    @desc("按时间触发")
    trigger atTime {
        @desc("触发参数")
        @sensitive
        input {
            @desc("开始时间")
            startAt: timestamp
        }
    }
}
```

规则：

- `task` 顶层只支持 `@desc`
- `task` 不支持 `@example`
- `task` 至少要有一个 trigger
- trigger 名要求 `lowerCamelCase`
- trigger 支持 `@desc`，不支持 `@example`
- trigger 的 `input` section 可省略；省略时表示无入参
- trigger 没有 `output`，不返回值
- trigger 的 `input` section 支持 `@desc` 和 `@sensitive`；整体标记会写入生成的 Task `TriggerSpec`
- trigger 的 `input` 字段规则与 `data` 字段一致，支持 `@desc` 和 `@example`
- `task` 不支持 actor

## 15. 类型系统

### 15.1 scalar

当前内建标量类型：

- `int`
- `float`
- `bool`
- `string`
- `decimal`
- `binary`
- `timestamp`
- `duration`
- `localdate`
- `localtime`
- `localdatetime`
- `uuid`
- `json`

其中：

- `binary` 表示原始二进制数据
- `json` 表示 JSON 值

### 15.2 list / map / 引用类型

示例：

```skel
data Sample {
    ids: list<int>
    labels: map<string, string>
    owner: User
}
```

map 约束：

- key 类型只能是 `int`、`string` 或 enum

### 15.3 可空

任意普通类型都可以追加 `?` 表示可空，例如：

```skel
email: string?
profile: User?
```

## 16. 引用与循环依赖

当前引用解析支持：

- enum
- data
- config
- 当前 data 的泛型参数
- service / web 的 actor 引用
- service / method `require` 中的 resource、action 和 check 引用

同时会检查 `data` 之间的硬循环引用。

如果形成“纯直接引用”的闭环，会报错；如果经过 nullable / list / map 打断，则可以通过。
