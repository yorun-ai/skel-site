---
slug: /overview
---

# 认识 Skel

skelc 解决的核心问题是“契约先于实现”：在 `.skel` 文件里把 domain 的类型、调用者、权限和能力描述清楚，交给编译器统一校验，最后生成各语言需要的接口。

## 编译流程

1. loader 发现单文件或目录里的 Skel 输入。
2. parser 解析语法，建立 domain 语义模型。
3. compiler 检查命名、类型、引用、权限和公开边界。
4. generator 输出 Go、TypeScript 或者精简后的公开 Skel。
5. formatter 和 symbol 命令负责日常维护。

## 适合用 Skel 表达的内容

- 跨进程或跨语言传递的数据形状
- Rpc service、Event 和 Task 契约
- Actor、认证信息和权限资源
- Vine Web 入口能力
- 可共享的 domain 公开边界

路由实现、数据库模型、业务算法和部署配置还是交给应用代码负责——没必要为了“全部声明化”把什么都塞进 Skel。

## 下一步

先[安装 skelc](/docs/installation)，再完成[快速开始](/docs/getting-started)。如果已经有项目了，直接看[输入与目录](/docs/input-layout)。
