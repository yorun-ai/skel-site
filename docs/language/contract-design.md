---
slug: /contract-design
---

# Domain 与契约设计

## 用业务边界划分 domain

domain 名应表达稳定的业务所有权，例如 `account.user`，而不是部署单元或临时项目名。一个 domain 内的声明可以共同演进；跨 domain 引用则意味着需要兼容性管理。

## 控制公开面

`pub` 是依赖承诺，不是可见性装饰。公开 service 引用的本地 data、enum、actor 或 resource 也必须公开。推荐从最小公开面开始，只导出其他 domain 或客户端确实需要的内容。

## 避免共享内部模型

数据库行、缓存结构和内部状态机通常不应直接成为公开 data。为契约建立专用模型，使存储演进不会无意破坏消费者。

## 保持确定性

- 名称表达业务含义，不编码当前技术实现。
- import 使用完整 domain 名，别名只解决可读性和冲突。
- 生成产物由固定版本 skelc 创建并纳入可审查流程。
- 不在同一输出目录混放多个生成任务或手写文件。

公开边界的具体生成方式见[公开契约](/docs/generation/public-contracts)。
