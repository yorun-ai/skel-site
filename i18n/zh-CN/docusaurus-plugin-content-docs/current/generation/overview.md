---
slug: /generation
---

# 生成指南

同一份 domain 模型，能生成不同消费者需要的东西：

| 目标 | 命令 | 典型消费者 |
| --- | --- | --- |
| Go 源码 | `gen go` | 已有 Go module 内部 |
| Go module | `gen go-module` | 独立 regular/pub module |
| TypeScript | `gen ts` | Web 或 Node 客户端 |
| 公开 Skel | `gen skel --pub` | 其他 domain 的编译输入 |

## 共同规则

所有生成命令都需要 `--skel-in` 和至少一个输出目录。skelc 通过输出目录中的 `.skelc-manifest.json` 来追踪自己生成过哪些文件，处理逻辑如下：

- 手写文件（不在 manifest 里的）不会被删除。
- 过期的生成文件，只有内容没被动过的才会被自动清理。
- 和本次生成文件路径相同的内容，无论之前是什么都会被覆盖。

外部 domain 需要传 `--skel-import`，语言生成器还需要对应语言的 import 映射。

## 选择路径

- 服务端实现在现有 Go module 里：用 [Go 生成](/docs/generation/go) 的 `gen go`。
- 契约需要独立依赖和发包：用 `gen go-module`。
- 浏览器 / Node 消费方：用 [TypeScript 生成](/docs/generation/typescript)。
- domain 之间只共享必要声明：先生成[公开契约](/docs/generation/public-contracts)。
