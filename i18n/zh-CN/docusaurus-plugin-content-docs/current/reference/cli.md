---
slug: /cli
---

# CLI 参考

本文档以当前 module 中的 `cli` 实现为准。

`skelc` 读取 `.skel` 定义，进行校验、格式化、查询、生成快照和兼容性差异分析，或生成 Go / Go module / TypeScript / pub skel 代码。

本文档只说明 CLI 操作、输入输出路径、参数和生成行为。`.skel` 文件本身的语法见 [Skel 语法参考](/docs/syntax)。

查看帮助：

```bash
skelc --help
skelc version --help
skelc gen go --help
skelc gen go-module --help
skelc gen ts --help
skelc gen skel --help
skelc schema --help
skelc schema list --help
skelc schema get --help
skelc schema snapshot --help
skelc schema diff --help
skelc symbol list --help
skelc symbol get --help
skelc check --help
skelc format --help
skelc lsp --help
```

查看 skelc 构建信息：

```bash
skelc version
skelc version --output-format json
```

`skelc` 的诊断日志默认使用文本格式。如果上层工具需要读取，加上全局参数 `--log-format jsonl` 就行：

```bash
skelc --log-format jsonl check --skel-in ./domain/user/skel
skelc --log-format jsonl gen go-module --skel-in ./domain/user/skel --go-out ./domain/user/skeled/golang --go-module go.yorun.ai/app/demo/user
```

普通日志只包含 `level` 和 `message`；结构化诊断还会带上 `code`、`severity`、`range`，有时还有 `related` 和 `suggestion`：

```json
{"level":"warn","code":"loader.ignored-hidden-file","severity":"warning","range":{"start":{"file":"/path/.hidden.skel","line":1,"column":1},"end":{"file":"/path/.hidden.skel","line":1,"column":1}},"message":"/path/.hidden.skel ignored (HIDDEN_FILE)"}
```

schema 命令始终输出格式化 JSON。其他支持多种结果格式的命令可使用
`--output-format json` 获取结构化输出。

## 1. 输入与依赖

`--skel-in` 接受一个 `.skel` 文件或目录。

单文件模式：

```bash
skelc check --skel-in ./domain/user/skel/user.skel
```

目录模式：

```bash
skelc check --skel-in ./domain/user/skel
```

目录模式要求：

- 目录下必须存在 `domain.skel`
- 隐藏文件、子目录、非 `.skel` 文件会被忽略
- 所有被采纳的 `.skel` 文件按文件名字典序加载
- 所有被采纳的 `.skel` 文件都必须在文件开头声明 `domain ...`
- 普通 `.skel` 文件的 domain 必须与 `domain.skel` 一致
- 普通 `.skel` 文件不允许在 domain 上使用 `@desc`
- `domain.skel` 只能包含 `domain ...` 以及可选的 `@desc`，不能包含其它顶层条目

生成命令通过 `--skel-import domain=PATH` 映射跨 domain 定义。schema 命令不接受依赖映射；schema 快照和基于源码的 diff 把外部符号保留为不透明的完整名称。

## 2. 校验 skel

```bash
skelc check --skel-in ./domain/user/skel
```

`check` 检查当前输入中的语法、命名、类型和引用规则；这个命令只接受 `--skel-in`。语法分析会在声明、block 成员、右花括号和 decorator 边界处恢复，单次运行可为每个 domain 报告最多 50 条相互独立的语法与语义诊断。使用 `--log-format jsonl` 时，每条诊断独占一行，包含 code、severity、range、related location，以及可选的 suggestion。

## 3. 格式化 skel

原地格式化单个 `.skel` 文件，或者目录中被 loader 接受的全部 `.skel` 文件：

```bash
skelc format --skel-in ./domain/user/skel
```

在 CI 中只检查格式、不修改文件：

```bash
skelc format --check --skel-in ./domain/user/skel
skelc format --check --output-format json --skel-in ./domain/user/skel
```

如果存在需要格式化的文件，`--check` 会按顺序输出其绝对路径并以非零状态退出。JSON 输出包含稳定的 `changed` 布尔值和有序 `files` 数组：

```json
{
  "changed": true,
  "files": ["/workspace/domain/user/skel/domain.skel"]
}
```

格式化会统一换行、缩进、空行和行尾空白，不会重排声明，也不会改变多行注释的相对缩进或三引号字符串值。命令会先验证全部输入并暂存所有待修改文件，保留所有者、mode 和平台支持的扩展元数据，再同步父目录后才报告成功；如果后续写入或持久化同步失败，已经替换的文件会被恢复。

## 4. 运行语言服务器

编辑器和其它开发工具通过标准输入输出启动 Skel Language Server：

```bash
skelc lsp
```

语言服务器会在编辑过程中报告多条语法和语义问题，同时提供快速修复、诊断关联位置、文档符号、跨文件定义跳转和引用查找。

分析会包含尚未保存的修改，但每个源目录都是一份独立输入。只有位于同一目录且声明同一 domain 的文件才会合并，因此不同目录中的同名 domain 互不冲突。这与 `check` 的行为一致：校验时不解析 import；生成命令则根据显式的 `--skel-import` 映射校验完整的 import 图。

LSP 通信独占标准输入和标准输出，集成方不能向服务器的 stdout 写入日志。

## 5. 查询、生成快照和查看 schema 差异

以 JSON 数组输出当前 Skel 中的全部顶层声明摘要：

```bash
skelc schema list --skel-in ./domain/user/skel
skelc schema list data --skel-in ./domain/user/skel
```

可选的位置参数 `TYPE` 用于过滤列表。支持的类型为 `actor`、`config`、
`data`、`enum`、`event`、`resource`、`service`、`task` 和 `web`。

`schema list` 只列当前 Skel 中声明的顶层条目，不解析跨 domain 定义，因此无需传 `--skel-import`。外部引用统一使用完整名称，不受当前文件所用 import alias 的影响。

按类型和完整 Skel 名称读取一个完整声明：

```bash
skelc schema get data demo.user.User --skel-in ./domain/user/skel
skelc schema get resource demo.user.User --skel-in ./domain/user/skel
```

不同声明类型拥有独立命名空间，因此 data 和 resource 可能使用相同的完整
Skel 名称。因此 `TYPE` 是必填参数，也是声明身份的一部分。`get` 返回单个完整
的规范化 JSON 声明，包括对应的 data、enum、resource、service 或其他类型主体：

```json
{
  "pub": true,
  "name": "User",
  "type": "data",
  "skelName": "demo.user.User",
  "data": {
    "members": [
      {
        "name": "id",
        "type": {
          "kind": "scalar",
          "name": "uuid"
        }
      }
    ]
  }
}
```

找不到声明时退出码为 `1`。`schema list/get` 始终查询完整 domain，每个声明
保留自己的 `pub` 标记。现有的 `symbol list/get` 仍然可用，但已经是保留原有
摘要输出的废弃兼容入口。

生成按确定顺序排列、带格式版本的 JSON schema 快照：

```bash
skelc schema snapshot \
  --skel-in ./domain/user/skel \
  > ./dist/user.schema.json
```

`schema snapshot` 始终捕获完整 domain，每个声明保留自己的 `pub` 标记。JSON
写到标准输出，需要保存快照时使用 shell 重定向。制品包含 `format`、
`formatVersion`、domain、文档信息和规范化声明；源码位置不会写入制品，
因此移动源码目录不会改变导出结果。

快照制品不会嵌入 import domain 的定义，只会把外部符号记录为不透明的完整
名称。`schema snapshot` 不接受 `--skel-import`。依赖 domain 自身的兼容性，
应当在该 domain 上单独生成快照和执行 diff。

成员、参数和返回值中的 import 类型使用明确的
`"kind": "importedReference"` 表示：

```json
{
  "kind": "importedReference",
  "name": "identity.user.UserSummary"
}
```

当前 domain 自身拥有的已解析引用会保留其声明种类：`enum`、`data`、
`config` 或 `event`。这一区分属于规范化 schema，并与生成的 Vine 运行时
schema 元数据保持一致。

列出 baseline 和 candidate Skel 源文件或目录之间的全部 schema 变化：

```bash
skelc schema diff \
  --skel-in ./domain/user/skel

skelc schema diff \
  --baseline-skel-in ./previous/user/skel \
  --skel-in ./domain/user/skel
```

基于源码执行 diff 时，import 保持不透明，不使用文件系统映射。`schema diff`
不接受 import 映射。diff 始终覆盖完整 domain，包括公开和私有声明。它只接受
原始 Skel 源码，不读取 schema 快照文件。

`--baseline-skel-in` 是可选参数。省略时，skelc 会查找 `--skel-in` 所在的 Git
仓库，并从 `HEAD` 中提取同一个文件或目录，用最近一次已提交源码和当前工作区
进行 diff。baseline 源码位置使用稳定的 `HEAD:<repo-relative-path>` 形式。如果
找不到 Git 仓库、提交历史或 `HEAD` 中的对应路径，命令会报错并提示显式传入
`--baseline-skel-in`。

每项变化都有稳定 code，`impact` 使用三个 SCREAMING_CASE 枚举值：

- `BREAKING`：删除或从结构上改变已有契约、增加必填字段或参数，以及其他要求已有使用方修改代码或数据的变化。
- `DANGEROUS`：保持结构兼容但可能改变运行时、安全或解释语义的变化，例如改变认证或权限要求、改变 config lifecycle，以及增加 enum item。
- `COMPATIBLE`：增加可独立调用的声明或 method，以及修改文档和废弃元数据。

domain 名称变化表示整个 schema 身份被替换，而不是某个嵌套符号改名。diff 只输出
一项 `domain.name.changed`，其中 `change: "MODIFIED"`、`impact: "BREAKING"`，
随后停止，不再展开被替换 domain 下的声明、成员或元数据变化。

每项结果还带有独立的 SCREAMING_CASE `change` 维度：

- `ADDED`：新增声明、member、item、method 或 capability。
- `REMOVED`：删除已有元素。
- `MODIFIED`：已有元素的类型、顺序、可见性、元数据、认证、授权、敏感性或其他属性发生变化。

例如，新增 enum item 的结果为 `change: "ADDED"`、`impact: "DANGEROUS"`；
新增必填 data member 同样是 `change: "ADDED"`，但 `impact: "BREAKING"`。

命令始终在结构化 JSON 报告中返回全部变化，包括兼容性结论、分类计数、稳定
变化 code、symbol，以及可用的 baseline/candidate 源码位置。无论兼容性结论
如何，diff 完成后都返回退出码 `0`；命令参数、输入、编译和 schema 格式错误
返回 `1`。CI 可以读取报告并自行应用失败策略，无需配置 diff 命令。

旧 `symbol get` 找不到时的兼容输出仍为：

```text
symbol not found: demo.user.Missing
```

## 6. 生成 Go 代码

生成非 module Go 代码：

```bash
skelc gen go \
  --skel-in ./domain/booker/skel \
  --go-out ./domain/booker/src/server/skeled
```

生成 Go module 代码：

```bash
skelc gen go-module \
  --skel-in ./domain/booker/skel \
  --go-out ./domain/booker/skeled/golang \
  --go-module example.com/demo/booker/skeled
```

显式指定外部 domain 的 Go import：

```bash
skelc gen go-module \
  --skel-in ./domain/booker/skel \
  --go-out ./domain/booker/skeled/golang \
  --skel-import app=./domain/app/pub/skel/skel \
  --skel-import user=./domain/user/pub/skel/skel \
  --go-import app=example.com/demo/apppub \
  --go-import user=example.com/demo/userpub \
  --go-module example.com/demo/booker/skeled
```

用 module prefix 推导外部 domain 的 Go import：

```bash
skelc gen go-module \
  --skel-in ./domain/booker/skel \
  --go-out ./domain/booker/skeled/golang \
  --skel-import app=./domain/app/pub/skel/skel \
  --skel-import user=./domain/user/pub/skel/skel \
  --go-module-prefix example.com/demo/skeled
```

同时生成 pub module 和 regular module：

```bash
skelc gen go-module \
  --skel-in ./domain/user/skel \
  --skel-import app=./domain/app/pub/skeled/skel \
  --go-out ./domain/user/skeled/golang \
  --go-pub-out ./domain/user/pub/skeled/golang \
  --go-import app=example.com/demo/skeled/apppub@v0.0.0-00010101000000-000000000000 \
  --go-module example.com/demo/skeled/user \
  --go-pub-module example.com/demo/skeled/userpub
```

常用参数：

- `--skel-in PATH`：输入 `.skel` 文件或目录
- `--go-out PATH`：Go 代码输出目录
- `--go-vine-version VERSION`：指定生成代码使用的 Vine module version

`gen go-module` 额外支持：

- `--skel-import domain=PATH`：外部 skel domain 路径，可重复传入
- `--go-module MODULE`：显式指定当前输出 module
- `--go-pub-out PATH`：pub Go module 输出目录；需要与 `--go-out` 一起使用
- `--go-pub-module MODULE`：显式指定 pub 输出 module；未指定时默认为当前 module 加 `pub`
- `--go-import domain=PACKAGE`：外部 domain 的 Go import path，可重复传入
- `--go-module-prefix PREFIX`：用于推导 Go module / import path

生成行为：

- `gen go` 只生成非 module Go 代码；只接受 `--skel-in`、`--go-out`、`--go-vine-version`
- `gen go` 不接受 `--skel-import`、`--go-module-prefix`、`--go-module`、`--go-import` 或 `--pub`
- 所有生成文件顶部附近都带有 `Code generated by skelc. DO NOT EDIT.`
  所有权标记；无标记文件不会被删，本次不再生成的带标记文件会被清理；从
  v0.9.3–v0.11.0 任一版本升级后的第一次生成会迁移并删除旧 `.skelc-manifest.json`
- 未指定 `--go-pub-out` 时，Go module 输出完整的 data / enum / config / actor / resource / service / event / web / task
- 指定 `--go-pub-out` 时，会同时生成 pub module 和 regular module；schema 只跟随 pub 的 client/listener 或非 pub 的完整定义生成一次
- pub service 在 pub module 中生成 client spec，在 regular module 中生成 server spec
- pub event 在 pub module 中生成 listener spec，在 regular module 中生成 emitter spec
- pub actor 的 auth service 在 pub module 中生成 server spec
- pub actor 的 credential / info / actor permission service 跟随 pub actor 生成
- pub resource 在 pub module 中生成权限码常量、check service server 和 schema；regular module 会在 `pub.go` 里生成 facade
- regular module 会 require pub module，并通过 `pub.go` 暴露 pub 符号的 type alias / facade；regular 包是符号超集
- pub service / method 的 `require` 引用本 domain resource 时，该 resource 必须标 `pub`
- 公开契约引用了没标 `pub` 的 data / enum / actor / resource 时会直接报错，不会隐式带出依赖
- schema 只在 pub 或 regular/full 一侧出现，不会两边同时注册同一个非 full schema；regular/full schema 能覆盖 pub schema
- `web` 不支持 `pub`，普通 Go 生成会为每个 `web` 生成 `web.WebSpec`
- `web` 生成的 server interface 形如 `UserPortalWebServer`
- `web` 生成的默认实现形如 `DefaultUserPortalWebServer`
- `web` 默认实现只提供空壳，具体路由仍然由 Go 代码实现 `Routes(*web.Router)`
- `--go-module-prefix` 可用于推导外部 domain 的 pub import path；pub Go 包按 `<prefix>/<domain parts except last>/<last-domain>pub` 拼接，例如 `example.com/demo/skeled/userpub`
- `--go-module-prefix`、`--go-module`、`--go-pub-module` 不能以 `/` 结尾；需要在参数传入时修正

## 7. 生成 TypeScript 代码

```bash
skelc gen ts \
  --skel-in ./domain/booker/skel \
  --ts-out ./domain/booker/pub/skel/typescript
```

生成 pub-only TypeScript 代码：

```bash
skelc gen ts \
  --pub \
  --skel-in ./domain/booker/skel \
  --ts-out ./domain/booker/pub/skel/typescript
```

带外部 skel import：

```bash
skelc gen ts \
  --skel-in ./domain/booker/skel \
  --ts-out ./domain/booker/pub/skel/typescript \
  --skel-import app=./domain/app/pub/skel/skel \
  --skel-import user=./domain/user/pub/skel/skel
```

生成行为：

- TypeScript 代码生成会输出全部 data / enum，不按 service / task / event 引用裁剪
- service client 只生成包含 `via client` actor 的 service
- `--pub` 时只生成标了 `pub` 的 data / enum，以及标了 `pub` 且包含 `via client` actor 的 service client

## 8. 生成 pub skel

```bash
skelc gen skel \
  --pub \
  --skel-in ./domain/booker/skel \
  --skel-out ./domain/booker/pub/skel/skel
```

带依赖：

```bash
skelc gen skel \
  --pub \
  --skel-in ./domain/booker/skel \
  --skel-out ./domain/booker/pub/skel/skel \
  --skel-import app=./domain/app/pub/skel/skel \
  --skel-import user=./domain/user/pub/skel/skel
```

生成行为：

- `gen skel` 必须传 `--pub`
- 输出会裁剪 `.skel` 定义，只保留标了 `pub` 的 data / enum / config / actor / resource / service / event
- actor 的 `auth { credential / info }` 会渲染回 actor 内部，不额外输出顶层 data
- pub service / method 的 `require` 如果引用本 domain resource，该 resource 必须标 `pub`
