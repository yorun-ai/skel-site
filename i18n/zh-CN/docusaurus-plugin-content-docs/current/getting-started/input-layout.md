---
slug: /input-layout
---

# 项目目录

## 单文件模式

做实验或者写个小契约的时候，直接传一个 `.skel` 文件就行：

```bash
skelc check --skel-in ./user.skel
```

## 目录模式

正式 domain 推荐用目录来组织：

```text
user/
├── skel/
│   ├── domain.skel
│   ├── model.skel
│   └── service.skel
├── skeled/
└── pub/
```

`domain.skel` 只负责 domain 声明和可选的说明文字；其他文件声明同一个 domain，按职责拆开。skelc 按文件名字典序加载，隐藏文件、子目录和非 `.skel` 文件会自动忽略。

## 外部 domain

先在 Skel 里声明逻辑依赖：

```skel
import demo.user as user
```

生成时再给物理映射：

```bash
--skel-import demo.user=../user/pub/skel
```

逻辑 domain 名保持不变，路径和语言包名交给构建环境去映射。Go 和 TypeScript 生成分别用 `--go-import`、`--ts-import`。

## 输出所有权

生成器靠 `.skelc-manifest.json` 来管理自己的输出，所以生成文件和手写文件能放在同一个目录下。清单里没列的文件不会被删；不过手写文件一定不要跟生成文件用同一个路径，否则下一次生成就直接覆盖掉了。

继续阅读：[校验工作流](/docs/workflow)和[代码生成](/docs/generation)。
