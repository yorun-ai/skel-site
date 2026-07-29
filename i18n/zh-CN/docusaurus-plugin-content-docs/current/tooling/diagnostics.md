---
slug: /diagnostics
---

# 诊断与 CI

## 日志格式

默认文本格式适合在终端里直接看；工具集成推荐用 JSONL：

```bash
skelc --log-format jsonl check --skel-in ./skel
```

每行独立包含 `level`、`severity`、稳定的 `code`、精确的 `range` 和 `message`。有相关声明或可自动修复的内容时，还会带上 `related` 或 `suggestion`。命令失败会返回非零退出码，自动化脚本靠退出码判断成败即可，不要解析文本。

`check` 会在顶层声明、block 成员、右花括号和 decorator 边界处恢复语法分析，一次运行中为每个 domain 收集最多 50 条相互独立的语法与语义诊断。无效声明会被隔离处理，由它引起的级联错误不会重复报告。warning 也使用同一套结构化诊断模型，但不会导致非零退出码。

## 查询 symbol

```bash
skelc symbol list --skel-in ./skel
skelc symbol get demo.user.User --skel-in ./skel
```

加上 `--output-format json` 就能拿到结构化结果。symbol 命令查看当前输入的顶层声明，不解析外部 domain 定义。

## 集成原则

- 固定 skelc 版本。
- 保留 stderr/stdout 边界和退出码。
- JSON/JSONL 字段属于工具协议，不要依赖人类可读文本的空格布局。
- 记录输入路径和 compiler version，方便复现生成问题。

所有参数见[CLI 参考](/docs/cli)。
