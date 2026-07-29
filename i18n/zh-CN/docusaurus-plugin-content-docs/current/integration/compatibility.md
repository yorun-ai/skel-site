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
