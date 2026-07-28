---
slug: /language
---

# 语言模型

Skel 描述的是跨实现、生成语言和运行时装配都必须成立的边界。任何 generator 运行之前，编译器都会把全部声明解析成一个 domain model。

## Domain 是所有权单元

domain 是稳定的业务命名空间，例如 `identity.user` 或 `commerce.order`。多个文件可以向同一个 domain 提供声明，但它们作为一个契约统一校验和版本化。

```skel
domain commerce.order
```

不要用仓库、进程、临时团队或当前部署方式命名 domain，这些通常比业务边界变化得更快。

## 不同声明回答不同问题

| 问题 | 声明 |
| --- | --- |
| 哪些值跨越边界？ | `enum`、`data`、`config` |
| 谁在调用？ | `actor` |
| 调用者可以做什么？ | `resource`、`require` |
| 哪些能力可以被调用？ | `service` |
| 异步发生了什么？ | `event` |
| 可以启动哪些后台工作？ | `task` |
| 哪个 Web 能力可以进入？ | `web` |

这些关注点不应混在一起。调用者身份由 actor 表达，不应塞进随意的 string 参数；权限词汇由 resource 拥有，不应散落为业务代码常量。

## Source、Model 与 Output

编译过程有三个清晰边界：

1. **Source**：`.skel` 文件、import、decorator 和声明顺序。
2. **Semantic model**：解析后的类型、公共闭包、actor、权限表达式和兼容性 hash。
3. **Output**：Go 契约、TypeScript client、公共 Skel 与运行时 schema。

所有内置 generator 使用同一个校验后的 model。不会因为两个模板各自解释源码，让同一声明在 Go 和 TypeScript 中产生不同语义。

## 实际建模顺序

新增一个能力时：

1. 用 `data` 和 `enum` 定义词汇。
2. 只有存在真实的外部或跨应用调用者时才增加 `actor`。
3. 需要具名权限时定义 `resource` action。
4. 增加 `service`、`event`、`task` 或 `web` 边界。
5. 只有其他 domain 或 client 需要时才标记 `pub`。
6. 生成前运行 `skelc format` 和 `skelc check`。

业务算法、数据库表、缓存记录、route handler、queue 和部署拓扑仍属于应用代码。Skel 用来明确应用边界，不是把整个实现变成配置。

接下来阅读[文件与导入](/docs/files-and-imports)；项目结构已经确定时，可以直接进入[类型与数据](/docs/types-and-data)。
