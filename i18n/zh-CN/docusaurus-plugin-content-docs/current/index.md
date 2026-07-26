---
slug: /
---

# skelc 文档

skelc 是 Skel 契约语言的编译器和工具链。它把 domain 契约转换为可校验、可共享、可重复生成的 Go、TypeScript 与公开 Skel 产物。

```text
.skel 契约 ──→ 格式化与校验 ──┬──→ Go / Go module ──→ Vine 运行时
                              ├──→ TypeScript
                              └──→ 公开 Skel ───────→ 其他 domain
```

## 按目标阅读

| 目标 | 推荐入口 |
| --- | --- |
| 第一次使用 skelc | [安装](/docs/installation) → [快速开始](/docs/getting-started) |
| 设计一个 domain | [语言概览](/docs/language) → [契约设计](/docs/contract-design) |
| 在日常开发和 CI 中使用 | [校验工作流](/docs/workflow) → [诊断与自动化](/docs/diagnostics) |
| 生成客户端或服务端代码 | [代码生成概览](/docs/generation) |
| 与其他 domain 分享契约 | [公开契约](/docs/generation/public-contracts) |
| 接入 Vine | [Vine 集成](/docs/vine-integration) → [运行时类型](/docs/runtime-types) |
| 查询所有命令和规则 | [CLI 参考](/docs/cli) / [语法参考](/docs/syntax) |
| 处理失败或升级问题 | [排障](/docs/troubleshooting) / [兼容性](/docs/compatibility) |

## 文档边界

本站解释 Skel 语言、skelc 工具链和生成契约。Vine 的应用模型、运行时与部署由 [Vine 文档](https://vine.yorun.ai/docs/) 维护。两者交叉的内容集中在“Vine 集成”分组，避免语言规则和框架行为混在一起。
