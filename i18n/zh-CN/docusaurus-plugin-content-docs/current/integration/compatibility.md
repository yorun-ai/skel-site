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

## 按 domain 检查 schema

每个 domain 独立生成快照和执行 diff。当前 domain 的 schema 只把 import domain 中的符号
保存为不透明的完整名称，不会复制外部声明。schema 快照覆盖完整 domain，包括
公开和私有声明，同时保留每个声明的 `pub` 标记。这样，每项声明的兼容性都由
所属的 domain 负责，schema 检查不再依赖 import 的文件系统路径。

schema 命令不接受 import 路径映射。

diff 直接读取 baseline 和 candidate 的 Skel 源文件或目录，不接受 schema 快照
JSON 作为 diff 输入。

未显式指定 baseline 时，diff 会从 Git `HEAD` 读取 candidate 的同一路径；没有
可用历史的仓库必须传入 `--baseline-skel-in`。

Go 集成通过公开 facade `go.yorun.ai/skelc/schema` 解析这些命令输出。该 package
保持实现 internal，同时对外提供响应类型、嵌套 wire 类型、带类型的常量，
以及严格的 `schema.Decode`、`schema.Validate`、`schema.Encode` 函数。严格解码
会拒绝未知字段、尾随 JSON 值、不支持的格式版本、未知 wire 枚举值和格式错误的
规范化结构。根 package `go.yorun.ai/skelc` 仍专注于解析和生成。
