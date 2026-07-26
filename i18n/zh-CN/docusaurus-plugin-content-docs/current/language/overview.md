---
slug: /language
---

# Skel 语言概览

一个 Skel domain 描述“对外成立的契约”，而不是某个实现文件。顶层声明分为四类：

| 类别 | 声明 | 作用 |
| --- | --- | --- |
| 数据 | `enum`、`data`、`config` | 定义值、消息和配置形状 |
| 身份与权限 | `actor`、`resource` | 定义调用者、认证和授权 |
| 交互 | `service`、`event` | 定义同步与异步边界 |
| 入口与执行 | `web`、`task` | 定义 Web 能力与任务触发器 |

## 建议建模顺序

1. 用 `data`、`enum` 建立稳定词汇。
2. 用 `actor` 明确谁可以调用。
3. 需要授权时定义 `resource`。
4. 用 `service`、`event`、`web`、`task` 组合能力。
5. 只把真正跨 domain 的声明标为 `pub`。

## 参考入口

完整语法、命名和 decorator 规则见[语法参考](/docs/syntax)。如何划分公开边界见[契约设计](/docs/contract-design)。
