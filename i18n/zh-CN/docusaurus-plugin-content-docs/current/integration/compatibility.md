---
slug: /compatibility
---

# 版本兼容

Skel 语法、CLI 参数与退出码、JSON/JSONL 字段、生成文件名、公开 API 和 module 元数据都是兼容性边界。

## 升级检查表

1. 固定并记录新旧 skelc 版本。
2. 在干净分支重新 format、check 和 generate。
3. 审查 Skel 源码与所有生成语言的 diff。
4. 检查 Vine、Go module 和 npm package 版本。
5. 运行生产方与消费者测试。
6. 为需要人工修改的变化提供迁移说明。

## 可重复生成

CI 与开发环境使用同一 skelc 版本；输入、import 映射和输出目录配置纳入版本管理。不要依赖未声明的本地 `replace`、相邻仓库或全局环境。

历史文档版本用于解释旧行为，但修复当前契约应以当前文档和对应 release note 为准。
