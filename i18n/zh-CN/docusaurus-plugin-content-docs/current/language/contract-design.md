---
slug: /contract-design
---

# 契约边界

## 按所有权拆分

domain 名应该体现稳定的业务所有权，比如 `account.user`，而不是部署单元或临时项目名。同一个 domain 内的声明能一起演进；跨 domain 引用则意味着需要管理兼容性。

当两组声明能独立发布、独立决定兼容性的时候再拆 domain。不要仅仅因为实现跑在两个进程里就拆开：Vine 能改变运行拓扑，而这不会影响 Skel 的所有者。

## 保持小而明确的公共表面

`pub` 是依赖承诺，不是可见性装饰。公开 service 引用了本地的 data、enum、actor 或 resource 时，这些也得跟着公开。推荐从最小的公开面起步，只导出其他 domain 或客户端真正需要的东西。

```skel
pub data UserSummary {
    id: uuid
    displayName: string
}

data UserRecord {
    id: uuid
    passwordHash: string
    migrationVersion: int
}
```

公共类型为消费者设计，内部类型则继续跟随存储和实现演进。

## 共享契约，不共享源码目录

生产方通过 `skelc gen skel --pub` 导出精简 Skel，消费方通过 `--skel-import` 映射这个产物。消费方不应该去读生产方的私有契约目录，也不该依赖相邻 checkout。

这样一来，意外的私有到公共引用会直接变成编译错误，导出契约也能作为独立产物版本化。

## 让兼容性变化清晰可见

以下变化需要消费方 review：

- 删除或重命名公共声明
- 改变字段或 method 类型
- 把 nullable 字段改成必填
- 改变 actor、auth 标记或权限要求
- 重命名 enum item、action、check、method 或 trigger
- 改变生成包映射

新增 nullable 字段更容易采用，但依然会改变生成 API。建议重新生成全部目标并 review diff，而不是光凭 `.skel` 修改就推断兼容性。

## 实现细节不要写进契约

数据库行、缓存布局、内部状态机、重试策略、route path 和 broker 配置，都不该出现在公共契约里。契约只描述消费者依赖的稳定事实或能力。

一个健康的边界具备：

- 表达业务含义的名称
- 跨应用访问时明确的调用者和权限规则
- 契约专用的 request、result 和 event 类型
- 对单位、约束和边界情况的说明
- 固定的 compiler 版本和可复现的生成命令

导出机制见[公共契约](/docs/generation/public-contracts)，升级步骤见[版本兼容](/docs/compatibility)。
