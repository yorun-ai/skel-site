---
slug: /cli
---

# CLI 参考

本文档以当前 module 中的 `cli` 实现为准。

`skelc` 读取 `.skel` 定义，进行校验、格式化、查询、导出和兼容性比较，或生成 Go / Go module / TypeScript / pub skel 代码。

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
skelc schema export --help
skelc schema compare --help
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

生成、schema 导出以及基于源码的 schema 比较通过 `--skel-import domain=PATH` 映射跨 domain 定义，具体用法见后面的对应命令。

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

## 5. 查询、导出和比较 schema

输出当前 Skel 中的全部顶层声明，每行格式为 `pub标记 类型 skelName`：

```bash
skelc schema list --skel-in ./domain/user/skel
skelc schema list data --skel-in ./domain/user/skel
```

可选的位置参数 `TYPE` 用于过滤列表。支持的类型为 `actor`、`config`、
`data`、`enum`、`event`、`resource`、`service`、`task` 和 `web`。

示例输出：

```text
pub  actor     demo.user.ClientActor
pub  data      demo.user.User
---  enum      demo.user.UserStatus
pub  resource  demo.user.User
pub  service   demo.user.UserService
---  web       demo.user.UserPortalWeb
```

`schema list` 只列当前 Skel 中声明的顶层条目，不解析跨 domain 定义，因此无需传 `--skel-import`。
需要机器读取时加上 `--output-format json`：

```bash
skelc schema list --output-format json --skel-in ./domain/user/skel
```

按类型和完整 Skel 名称读取一个完整声明：

```bash
skelc schema get data demo.user.User --skel-in ./domain/user/skel
skelc schema get resource demo.user.User --skel-in ./domain/user/skel
skelc schema get data demo.user.User --output-format json --skel-in ./domain/user/skel
```

不同声明类型拥有独立命名空间，因此 data 和 resource 可能使用相同的完整
Skel 名称。因此 `TYPE` 是必填参数，也是声明身份的一部分。`get` 返回单个完整
的规范化声明，包括对应的 data、enum、resource、service 或其他类型主体。
默认文本输出为确定的、便于阅读的详情树：

```text
pub data demo.user.User
  name: User
  members:
    - id: uuid
    - displayName: string?
```

工具需要无损结构时使用 `--output-format json` 获取完整声明对象。

找不到声明时退出码为 `1`。`schema list/get` 默认使用
`--scope all`；使用 `--scope public` 可以只查询公开契约。现有的
`symbol list/get` 仍然可用，但已经是保留原有摘要输出的废弃兼容入口。

导出按确定顺序排列、带格式版本的 JSON schema：

```bash
skelc schema export \
  --skel-in ./domain/user/skel \
  --schema-out ./dist/user.schema.json
```

`schema export` 默认使用 `--scope public`；需要完整 domain 时传
`--scope all`。省略 `--schema-out` 时，JSON 会写到标准输出。制品包含
`format`、`formatVersion`、domain、scope、文档信息和规范化声明；源码位置
不会写入制品，因此移动源码目录不会改变导出结果。

比较已发布 schema 和当前源码：

```bash
skelc schema compare \
  --against ./released/user.schema.json \
  --skel-in ./domain/user/skel
```

也可以比较两份源码或两份 schema 制品：

```bash
skelc schema compare \
  --against-skel-in ./previous/user/skel \
  --skel-in ./domain/user/skel

skelc schema compare \
  --against ./previous.schema.json \
  --schema-in ./current.schema.json
```

baseline 源码的依赖使用 `--against-skel-import domain=PATH`，candidate
源码的依赖使用 `--skel-import domain=PATH`。两侧必须采用相同 scope；默认
比较 `public`。

每项变化都有稳定 code，并归入三个影响等级：

- `breaking`：删除或改变已有契约、增加必填字段或参数、收紧认证要求等会破坏已有使用方的变化。
- `dangerous`：不一定直接造成源码不兼容，但可能改变行为的变化，例如增加 enum item 或放宽授权边界。
- `compatible`：增加可独立调用的声明或 method，以及修改文档和废弃元数据。

默认的 `--fail-on breaking` 在发现 breaking 变化时返回退出码 `2`；退出码
`1` 保留给命令参数、输入、编译和 schema 格式错误。CI 还可以选择
`--fail-on dangerous`、`--fail-on any-change` 或 `--fail-on none`。
`--output-format json` 会返回包含兼容性结论、分类计数、稳定变化 code、
symbol，以及可用 baseline/candidate 源码位置的结构化报告。

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
