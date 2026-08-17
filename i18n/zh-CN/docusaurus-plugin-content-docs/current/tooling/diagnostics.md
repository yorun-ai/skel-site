---
slug: /diagnostics
---

# 诊断与 CI

## 结果和日志格式

命令结果始终在 stdout 输出格式化 JSON；`check` 在一个
`{valid,diagnostics}` 结果中返回全部诊断。stderr 只保留日志；工具集成可通过
以下参数要求 JSONL 日志：

```bash
skelc --log-format jsonl gen go --skel-in ./skel --go-out ./generated/domain
```

每条诊断包含稳定的 `code`、`severity`、精确的 `range` 和 `message`，还可带有
`related` 或 `suggestion`。退出码 `0` 表示结果满足预期，`1` 表示检查完成但未通过，
`2` 表示命令失败。

`check` 会在顶层声明、block 成员、右花括号和 decorator 边界处恢复语法分析，一次运行中为每个 domain 收集最多 50 条相互独立的语法与语义诊断。无效声明会被隔离处理，由它引起的级联错误不会重复报告。warning 也使用同一套结构化诊断模型，但不会导致非零退出码。

## 查询 schema

```bash
skelc schema list --skel-in ./skel
skelc schema get data demo.user.User --skel-in ./skel
```

schema 命令查看当前输入的顶层声明，不解析外部 domain 定义。

## 集成原则

- 固定 skelc 版本。
- 保留 stderr/stdout 边界和退出码。
- JSON/JSONL 字段属于工具协议，不要依赖人类可读文本的空格布局。
- 记录输入路径和 skelc 版本，方便复现生成问题。

所有参数见[CLI 参考](/docs/cli)。
