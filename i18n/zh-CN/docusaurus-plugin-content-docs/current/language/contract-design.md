---
slug: /contract-design
---

# 契约边界

## 按所有权拆分

domain 名应表达稳定的业务所有权，例如 `account.user`，而不是部署单元或临时项目名。一个 domain 内的声明可以共同演进；跨 domain 引用则意味着需要兼容性管理。

当两组声明可以独立发布、独立决定兼容性时再拆 domain。不要仅因为实现运行在两个进程就拆分：Vine 可以改变运行拓扑，而不改变 Skel 的所有者。

## 保持小而明确的公共表面

`pub` 是依赖承诺，不是可见性装饰。公开 service 引用的本地 data、enum、actor 或 resource 也必须公开。推荐从最小公开面开始，只导出其他 domain 或客户端确实需要的内容。

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

公共类型为消费者设计，内部类型可以继续跟随存储和实现演进。

## 共享契约，不共享源码目录

生产方通过 `skelc gen skel --pub` 导出精简 Skel，消费方通过 `--skel-import` 映射该产物。消费方不应读取生产方的私有契约目录，也不应依赖相邻 checkout。

这样，意外的私有到公共引用会直接成为编译错误，导出契约也能作为独立产物版本化。

## 让兼容性变化清晰可见

以下变化需要消费方 review：

- 删除或重命名公共声明
- 改变字段或 method 类型
- 把 nullable 字段改为必填
- 改变 actor、auth 标记或权限要求
- 重命名 enum item、action、check、method 或 trigger
- 改变生成包映射

新增 nullable 字段通常更容易采用，但仍会改变生成 API。应重新生成全部目标并 review diff，而不是仅根据 `.skel` 修改推断兼容性。

## 不把实现细节写进契约

数据库行、缓存布局、内部状态机、重试策略、route path 和 broker 配置通常不应出现在公共契约中。契约描述消费者依赖的稳定事实或能力。

一个健康的边界通常具有：

- 表达业务含义的名称
- 跨应用访问时明确的调用者和权限规则
- 契约专用的 request、result 和 event 类型
- 对单位、约束和边界情况的说明
- 固定的 compiler 版本和可复现生成命令

导出机制见[公共契约](/docs/generation/public-contracts)，升级步骤见[版本兼容](/docs/compatibility)。
