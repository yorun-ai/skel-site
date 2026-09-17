---
slug: /overview
---

# 认识 Skel

skelc 解决的核心问题是“契约先于实现”：在 `.skel` 文件里把 domain 的类型、调用者、权限和能力描述清楚，交给 skelc 统一校验，最后生成各语言需要的接口。

## 编译流程

skelc 加载 `.skel` 输入，校验整个 domain，再生成你要求的产物。format 与 schema 命令用于
日常维护。

## 适合用 Skel 表达的内容

- 跨进程或跨语言传递的数据形状
- RPC 服务、Event 与 Task 契约
- Actor、认证信息和权限资源
- Vine Web 入口能力
- 可共享的 domain 公开边界

路由实现、数据库模型、业务算法和部署配置还是交给应用代码负责——没必要为了“全部声明化”把什么都塞进 Skel。

## 下一步

先[安装 skelc](/docs/installation)，再完成[快速开始](/docs/getting-started)。如果已经有项目了，直接看[输入与目录](/docs/input-layout)。
