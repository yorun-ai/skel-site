---
slug: /compatibility
---

# 版本兼容

以下内容都属于兼容性边界：Skel 语法、CLI 参数与退出码、JSON/JSONL 字段、生成文件名、公开 API、module 元数据。

## 升级检查表

1. 固定并记录新旧 skelc 版本。
2. 在干净分支重新 format、check 和 generate。
3. 审查 Skel 源码与所有生成语言的 diff。
4. 检查 Vine、Go module 和 npm package 版本。
5. 运行生产方与消费者测试。
6. 对需要人工修改的变化，提供迁移说明。

## 可重复生成

CI 和开发环境要用同一个 skelc 版本。输入、import 映射和输出目录配置都纳入版本管理，这样每次生成结果才一致。不要依赖未声明的本地 `replace`、相邻仓库依赖或全局环境，这些会降低可重复性。

历史文档版本用于了解旧行为，但修复当前契约时，以当前文档和对应的 release note 为准。

## 生成产物契约

后端 Go module 生成 `descriptor.go`，直接使用 `go.yorun.ai/skel/descriptor` 类型，并要求运行时提供 `skel.RegisterDomainDescriptor(*descriptor.Domain)`；生成的 module 依赖 Vine v0.28.0 或更高版本。Go `--api` 客户端使用 vRPC，不受影响。应用代码需要自己的生成 bean 副本时使用 `vine/util/vbean.DeepClone`。

review 生成的 descriptor 差异时，应比较 key 而不是位置：带 key 的字段可以出现在任意顺序。

## 按 domain 检查 schema

每个 domain 独立执行 diff。外部引用保留为不透明的完整名称，不复制依赖 domain
的声明。diff 覆盖全部公开和私有声明。`schema diff` 和默认 `schema list/get`
不接受 import 映射；`schema dep` 与 `schema list --pub/--api` 视图通过
`--skel-import` 解析依赖。

声明了 `mount` 的 web 会在 schema 中记录 `mountPath`，修改该值会以 `BREAKING` 影响级别
报告 `web.mount-path.changed`。在 `pub` 与 `ext` 之间切换 service 或 event 会改变由哪一侧
实现或消费，会以 `BREAKING` 影响级别报告 `service.ext.changed` 或 `event.ext.changed`。
修改或收紧认证模式会以 `BREAKING` 影响级别报告 `service.auth.changed`、
`service.auth.tightened`、`method.auth.changed` 或 `method.auth.tightened`；
放宽认证模式会以 `DANGEROUS` 影响级别报告 `service.auth.relaxed` 或
`method.auth.relaxed`。规范化查询结果的消费者应让 `go.yorun.ai/skel/cmd/skelc/output`
与编译器保持同一版本。

diff 直接读取 baseline 和 candidate 的 Skel 源文件或目录。

未显式指定 baseline 时，diff 会从 Git `HEAD` 读取 candidate 的同一路径；没有
可用历史的仓库必须传入 `--baseline-skel-in`。

Go 集成使用 `encoding/json`，将 schema list/get 输出解码为
`go.yorun.ai/skel/cmd/skelc/output` 中的类型，将 diff 报告解码为
`go.yorun.ai/skel/schema/diff.Report`。程序化工具可通过 `api.QuerySchema`
取得语义 `*schema.Domain`，并用 `diff.Compare` 直接比较两个 domain，无需序列化。

## Actor 身份

修改 actor 后请重新生成 actor 注册、认证数据、服务和 descriptor。如果程序使用 `go.yorun.ai/skel/cmd/skelc/output`
读取 schema 输出，应与编译器一起升级该依赖，使两者都能识别 `actor.auth.identifierField`。
Actor 的认证信息统一放在 `auth` 下；省略 `auth` 表示未声明认证能力。
标记的用法参见 [Actor 与访问入口](/docs/actors-and-access)。
