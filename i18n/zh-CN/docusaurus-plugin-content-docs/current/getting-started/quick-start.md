---
slug: /getting-started
---

# skelc 使用说明

`skelc` 将 `.skel` 契约编译为 Go、Go module、TypeScript 或仅公开的 skel 定义，并提供校验、格式化和 symbol 查询能力。

## 安装与版本

使用 Go 安装：

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version
```

Vine runtime 对生成器有最低版本要求。发布或升级 Vine 后，使用以下命令查看要求并升级 `skelc`：

```bash
vine version
go install go.yorun.ai/skelc/cmd/skelc@latest
```

## 快速工作流

一个 domain 的推荐目录结构如下：

```text
user/
├── skel/
│   ├── domain.skel
│   └── user.skel
└── skeled/
```

先创建 domain 声明：

```skel title="skel/domain.skel"
domain demo.user
```

再声明契约：

```skel title="skel/user.skel"
domain demo.user

pub data User {
    id: int
    name: string
}

pub service UserService {
    method get {
        input {
            id: int
        }
        output User
    }
}
```

在生成代码前先格式化并校验：

```bash
skelc format --skel-in ./skel
skelc check --skel-in ./skel
```

为普通 Go 包生成代码：

```bash
skelc gen go \
  --skel-in ./skel \
  --go-out ./skeled
```

生成器使用 `.skelc-manifest.json` 跟踪生成文件，不会删除目录中未纳入清单的文件。生成代码仍是派生产物，不要手工修改，应修改 `.skel` 后重新生成；被修改的过期生成文件会被保留，便于人工处理。

## 输入目录与跨 domain 引用

`--skel-in` 可指向一个 `.skel` 文件或一个目录。目录模式要求包含 `domain.skel`；同一目录下有效 `.skel` 文件按名称排序加载，且都必须声明同一个 domain。

当契约引用外部 domain 时，在 `.skel` 中声明 `import`，并在命令中提供路径映射：

```skel
domain demo.order

import demo.user as user

data Order {
    owner: user.User
}
```

`check` 可以直接校验当前输入。生成引用外部 domain 的代码时，再通过可重复的 `--skel-import domain=PATH` 提供公开 Skel 路径。导入别名只影响 `.skel` 文件中的类型限定名，不影响生成目录。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `skelc check --skel-in PATH` | 校验语法、引用、命名和类型约束。 |
| `skelc format --skel-in PATH` | 原地格式化 Skel 文件。 |
| `skelc symbol list --skel-in PATH` | 列出本 domain 的顶层 symbol。 |
| `skelc symbol get NAME --skel-in PATH` | 查询指定 skel 名称。 |
| `skelc gen go ...` | 生成非 module 的 Go 代码。 |
| `skelc gen go-module ...` | 生成带 `go.mod` 的 regular / pub Go module。 |
| `skelc gen ts ...` | 生成 TypeScript data、enum 和适用的 service client。 |
| `skelc gen skel --pub ...` | 生成裁剪后的公开 `.skel` 契约。 |

`symbol` 支持 `--output-format json`，`version` 支持 `--output-format json`。上层工具需要读取诊断时，可将全局日志格式设为 JSONL：

```bash
skelc --log-format jsonl check --skel-in ./skel
```

## Go module 生成

模块项目通常同时生成 regular 与 pub 包：

```bash
skelc gen go-module \
  --skel-in ./skel \
  --go-out ./skeled/golang \
  --go-module example.com/demo/user/skeled \
  --go-pub-out ./pub/skeled/golang \
  --go-pub-module example.com/demo/user/skeledpub
```

- regular 包包含完整契约、服务端接口和对 pub 符号的 facade。
- pub 包只包含标记为 `pub` 的契约及其公开依赖，适合被其他 module 导入。
- 公共契约引用的 data、enum、actor 或 resource 也必须显式标记 `pub`。

跨 domain 的 Go module 生成还需要传入 skel 与 Go import 映射：

```bash
skelc gen go-module \
  --skel-in ./order/skel \
  --skel-import demo.user=./user/pub/skel \
  --go-import demo.user=example.com/demo/user/skeledpub \
  --go-out ./order/skeled/golang \
  --go-module example.com/demo/order/skeled
```

当所有外部 module 遵循同一目录规则时，可用 `--go-module-prefix` 代替多个 `--go-import` 映射。

## TypeScript 与 pub skel 生成

生成 TypeScript：

```bash
skelc gen ts \
  --skel-in ./skel \
  --ts-out ./pub/skel/typescript
```

加上 `--pub` 后，只生成公开的 data、enum，以及带 `via client` actor 的公开 service client。需要输出 npm package 元数据时，可使用 `--ts-as-module`、`--ts-module-scope` 与 `--ts-module`。

为其他 domain 导出最小契约集：

```bash
skelc gen skel \
  --pub \
  --skel-in ./skel \
  --skel-out ./pub/skel
```

`gen skel` 必须搭配 `--pub`，输出只保留公开契约及其必要依赖。

## 排障

遇到生成失败时，按下面顺序检查：

1. 运行 `skelc check --skel-in ...`，一次查看多个独立诊断，并优先处理每个根因下最早的错误。
2. 确认目录中存在唯一的 `domain.skel`，且各文件 domain 一致。
3. 对跨 domain 类型确认同时存在 `import` 和 `--skel-import`。
4. 对 pub 契约确认其引用的本 domain 依赖也标记为 `pub`。
5. 升级 `skelc`，使其满足 `vine version` 显示的最低版本。

详细 DSL 规则见 [Skel 语法参考](/docs/syntax)。
