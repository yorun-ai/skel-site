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

CI 和开发环境要用同一个 skelc 版本。输入、import 映射和输出目录配置都纳入版本管理，这样每次生成结果才一致。记得把本地 `replace`、相邻仓库依赖、全局环境这些隐性因素排除掉——它们会让可重复性打折扣。

历史文档版本用于了解旧行为，但修复当前契约时，以当前文档和对应的 release note 为准。

## 按 domain 检查 schema

每个 domain 独立生成快照和执行 diff。当前 domain 的 schema 只把 import domain 中的符号
保存为不透明的完整名称，不会复制外部声明。schema 快照覆盖完整 domain，包括
公开和私有声明，同时保留每个声明的 `pub` 标记。这样每项声明的兼容性仍由拥有
它的 domain 负责，schema 检查也不依赖 import 的文件系统路径。schema 命令
不接受 import 路径映射。
diff 直接读取 baseline 和 candidate 的 Skel 源文件或目录，不接受 schema 快照
JSON 作为 diff 输入。
