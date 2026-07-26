---
slug: /generation
---

# 代码生成概览

同一份 domain 模型可以生成不同消费者需要的产物：

| 目标 | 命令 | 典型消费者 |
| --- | --- | --- |
| Go 源码 | `gen go` | 已有 Go module 内部 |
| Go module | `gen go-module` | 独立 regular/pub module |
| TypeScript | `gen ts` | Web 或 Node 客户端 |
| 公开 Skel | `gen skel --pub` | 其他 domain 的编译输入 |

## 共同规则

所有生成命令都要求 `--skel-in` 和至少一个输出目录。skelc 使用输出目录中的 `.skelc-manifest.json` 跟踪自己生成的文件：不会删除未纳入清单的手写文件，只会清理内容未被修改的过期生成文件；与本次生成文件同路径的内容仍会被覆盖。外部 domain 需要 `--skel-import`，语言生成器还需要对应语言的 import 映射。

## 选择路径

- 服务端实现位于现有 Go module：使用 [Go 生成](/docs/generation/go) 的 `gen go`。
- 契约需要独立依赖和发布：使用 `gen go-module`。
- 浏览器/Node 消费：使用 [TypeScript 生成](/docs/generation/typescript)。
- domain 之间只共享必要声明：先生成[公开契约](/docs/generation/public-contracts)。
