---
slug: /input-layout
---

# 项目目录

## 单文件模式

实验或小型契约可直接传入一个 `.skel` 文件：

```bash
skelc check --skel-in ./user.skel
```

## 目录模式

正式 domain 推荐使用目录：

```text
user/
├── skel/
│   ├── domain.skel
│   ├── model.skel
│   └── service.skel
├── skeled/
└── pub/
```

`domain.skel` 只保存 domain 声明及可选说明；其他文件声明相同 domain 并按职责拆分。skelc 按文件名字典序加载，忽略隐藏文件、子目录和非 `.skel` 文件。

## 外部 domain

Skel 中先声明逻辑依赖：

```skel
import demo.user as user
```

生成时再提供物理映射：

```bash
--skel-import demo.user=../user/pub/skel
```

逻辑 domain 名保持稳定，路径和语言包名则由构建环境映射。Go 和 TypeScript 生成还分别使用 `--go-import`、`--ts-import`。

## 输出所有权

生成器通过 `.skelc-manifest.json` 管理自己的输出，因此可以与手写文件共用目录。未纳入清单的文件不会被删除；但手写文件不能与生成文件使用相同路径，否则下一次生成会覆盖它。

继续阅读：[校验工作流](/docs/workflow)和[代码生成](/docs/generation)。
