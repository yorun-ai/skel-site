---
slug: /language
---

# 语言模型

Skel 描述的是跨实现、生成语言和运行时装配都必须成立的边界。在任何 generator 跑起来之前，编译器就会把全部声明解析成一个 domain model。

## Domain 是所有权单元

domain 是一个稳定的业务命名空间，比如 `identity.user` 或 `commerce.order`。多个文件能给同一个 domain 提供声明，但它们会作为一个契约统一校验和版本化。

```skel
domain commerce.order
```

不要用仓库、进程、临时团队或当前部署方式来命名 domain——这些比业务边界变化得快。

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

这些关注点应该各司其职。调用者身份用 actor 表达就好，不要塞进随意的 string 参数里；权限词汇由 resource 拥有，不要散落成业务代码里的常量。

## Source、Model 与 Output

编译过程有三个清晰的边界：

1. **Source**：`.skel` 文件、import、decorator 和声明顺序。
2. **Semantic model**：解析后的类型、公共闭包、actor、权限表达式和兼容性 hash。
3. **Output**：Go 契约、TypeScript client、公共 Skel 与运行时 schema。

所有内置 generator 用的是同一个校验后的 model。不会出现两个模板各自解释源码，导致同一声明在 Go 和 TypeScript 里语义不一样的情况。

## 实际建模顺序

新增一个能力的时候：

1. 用 `data` 和 `enum` 把词汇定义好。
2. 只有存在真实的外部或跨应用调用者时，才增加 `actor`。
3. 需要具名权限时定义 `resource` action。
4. 增加 `service`、`event`、`task` 或 `web` 边界。
5. 只有其他 domain 或 client 真正需要时，才标记 `pub`。
6. 运行 `skelc format` 和 `skelc check`——generator 会拒绝无效输入，在这步发现问题的诊断信息比生成失败时更清晰。

业务算法、数据库表、缓存记录、route handler、queue 和部署拓扑仍然属于应用代码。Skel 是用来明确应用边界的，不是把整个实现变成配置。

接下来阅读[文件与导入](/docs/files-and-imports)；项目结构已经确定的，直接进[类型与数据](/docs/types-and-data)。
