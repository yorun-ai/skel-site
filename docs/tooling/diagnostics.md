---
slug: /diagnostics
---

# 诊断、Symbol 与自动化

## 日志格式

默认文本适合终端；工具集成使用 JSONL：

```bash
skelc --log-format jsonl check --skel-in ./skel
```

每行独立包含 `level`、`severity`、稳定的 `code`、精确 `range` 和 `message`；存在关联声明或可自动修复内容时，还会包含 `related` 或 `suggestion`。命令失败返回非零退出码，自动化不应只解析文字判断成功。

`check` 会在顶层声明、block 成员、右花括号和 decorator 边界恢复语法分析，并在一次运行中为每个 domain 收集最多 50 条相互独立的语法与语义诊断。无效声明会被隔离，依赖它产生的级联错误不会重复报告。warning 也使用同一结构化诊断模型，但不会导致非零退出码。

## 查询 symbol

```bash
skelc symbol list --skel-in ./skel
skelc symbol get demo.user.User --skel-in ./skel
```

加 `--output-format json` 可得到结构化结果。symbol 命令查看当前输入的顶层声明，不解析外部 domain 定义。

## 集成原则

- 固定 skelc 版本。
- 保留 stderr/stdout 边界和退出码。
- JSON/JSONL 字段属于工具协议，不依赖人类文本的空格布局。
- 记录输入路径和 compiler version，便于复现生成问题。

所有参数见[CLI 参考](/docs/cli)。
