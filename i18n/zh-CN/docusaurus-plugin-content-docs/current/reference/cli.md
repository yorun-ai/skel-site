---
slug: /cli
---

# CLI 参考

skelc 校验、格式化、查询、生成快照和对比 `.skel` 定义，并生成 Go、TypeScript 与公开 Skel 契约。

内置 help 会列出当前安装版本支持的参数：

```bash
skelc --help
skelc check --help
skelc format --help
skelc lsp --help
skelc schema --help
skelc gen --help
```

## 全局输出

除 LSP 外，每个命令都在 stdout 输出恰好一个格式化 JSON 结果。help 保持文本，
LSP 使用 JSON-RPC。stderr 只保留日志和诊断，默认使用 JSONL；需要人类可读日志时
显式使用：

```bash
skelc --log-format text gen go-module --skel-in ./domain/user/skel --go-out ./domain/user/skeled/golang --go-module go.yorun.ai/app/demo/user
```

普通日志只包含 `level` 和 `message`；结构化诊断还会带上 `code`、`severity`、`range`，有时还有 `related` 和 `suggestion`：

```json
{"level":"warn","code":"loader.ignored-hidden-file","severity":"warning","range":{"start":{"file":"/path/.hidden.skel","line":1,"column":1},"end":{"file":"/path/.hidden.skel","line":1,"column":1}},"message":"/path/.hidden.skel ignored (HIDDEN_FILE)"}
```

退出码 `0` 表示结果满足预期，`1` 表示 `check` 或 `format --check` 完成但检查未通过，
`2` 表示命令失败。失败的命令会向 stdout 写入 `{code,message}`。Go 程序可使用
`go.yorun.ai/skelc/command` 中的公开结果和错误类型。

## 严格模式 {#strict-mode}

`--strict` 是默认关闭的全局参数。开启后，编译器将迁移 warning 视为 error，执行当前安装版本的语言要求：

```bash
skelc --strict check --skel-in ./domain/user/skel
skelc --strict gen go --skel-in ./domain/user/skel --go-out ./generated/user
```

严格模式拒绝没有 `pub` / `open` / `api` 的 service，以及在非 API service 中声明 actor audience、`auth` / `noauth` 或 `require`。忽略隐藏文件等普通 warning 保持不变。诊断码和位置不变，只改变 severity。

严格 `check` 未通过时退出码为 `1`；生成、schema、格式化命令因严格检查编译失败时退出码为 `2`。严格格式化先验证输入，失败时不改写文件。`schema diff` 严格检查候选代码，基线按原样读取。

Go 集成可在解析和编译时传入 `skelc.Input{SkelIn: "./skel", Strict: true}`。

## 输入模式

`--skel-in` 接受单个 `.skel` 文件或目录。目录模式要求存在 `domain.skel`；skelc 会忽略隐藏文件、子目录和非 Skel 文件，并按文件名字典序加载被采纳的文件。

目录模式下：

- 所有被采纳的 `.skel` 文件都必须声明同一个 domain
- `domain.skel` 只能包含 `domain ...` 以及可选的 `@desc`，不能包含其它顶层条目
- 普通 `.skel` 文件必须在文件开头声明 `domain ...`，且与 `domain.skel` 一致，也不允许在 domain 上使用 `@desc`

生成命令通过可重复传入的映射解析被 import 的 domain：

```bash
--skel-import demo.user=./domain/user/pub/skel
```

映射的 key 是 `import` 声明的完整 domain 名，value 指向该 domain 的公开 Skel 输入。

schema 命令不接受这些映射。schema 快照和基于源码的 diff 把外部符号保留为不透明的完整名称。

## 校验与转换

校验单个文件或目录：

```bash
skelc check --skel-in ./domain/user/skel
```

`check` 返回 `{valid,diagnostics}`，检查当前输入中的语法、命名、类型和引用规则；
输入通过 `--skel-in` 指定，也支持全局 `--strict`。单次运行会为每个 domain 报告最多
50 条相互独立的语法与语义诊断，并隔离无效声明，避免连带错误扩散。输入无效时检查仍会
正常完成，退出码为 `1`，不是命令失败。

原地格式化单个 `.skel` 文件，或者目录中被 loader 接受的全部 `.skel` 文件：

```bash
skelc format --skel-in ./domain/user/skel
```

在 CI 中只检查格式、不修改文件：

```bash
skelc format --check --skel-in ./domain/user/skel
```

如果存在需要格式化的文件，`--check` 返回退出码 `1`。结果始终包含稳定的
`changed` 布尔值和有序 `files` 数组：

```json
{
  "changed": true,
  "files": ["/workspace/domain/user/skel/domain.skel"]
}
```

格式化会统一换行、缩进、空行和行尾空白，不会重排声明，也不会改变多行注释的相对缩进或三引号字符串值。命令会先验证全部输入，然后要么替换所有待修改文件，要么把已经替换的文件恢复原状。

## 运行语言服务器

编辑器和其它开发工具通过标准输入输出启动 Skel Language Server：

```bash
skelc lsp
```

语言服务器会在编辑过程中报告多条语法和语义问题，同时提供快速修复、诊断关联位置、文档符号、跨文件定义跳转、引用查找和 schema 兼容性 CodeLens。客户端可以启用实时兼容性诊断，并调用 `skel.schema.diff` 执行命令来获取当前内存 domain 的完整结构化报告。

兼容性分析复用 `skelc schema diff` 的影响分级规则。默认会把 domain 的源文件或目录与 Git `HEAD` 比较，客户端也可以提供显式 baseline 源码路径。`BREAKING`、`DANGEROUS` 和可选的 `COMPATIBLE` 变化分别以 warning、information 和 hint 诊断展示。

客户端通过 `initializationOptions.schemaCompatibility` 或 `workspace/didChangeConfiguration` 配置这个功能：`diagnostics` 和 `codeLens` 分别启用实时诊断与 CodeLens，`includeCompatible` 把 `COMPATIBLE` 变化也报告为 hint 诊断，`baseline` 指定相对于 domain 源目录的源码文件或目录；留空时使用 Git `HEAD`。服务器通过 `executeCommandProvider` 声明 `skel.schema.diff`，调用时传入一个文档 URI 参数，即可获得与 CLI 相同结构的完整报告。找不到 Git 历史时，实时兼容性诊断保持安静；显式调用命令时，则返回可操作的错误信息。

通过 `skelc --strict lsp` 开启严格诊断。客户端也可设置 `initializationOptions.strict`，或发送 `workspace/didChangeConfiguration`，内容为 `{ "strict": true }`（也支持 `{ "skelc": { "strict": true } }`）。显式初始化值覆盖启动参数；配置变化后立即刷新诊断，设为 `false` 恢复兼容模式。

分析会包含尚未保存的修改。包含 `domain.skel` 的目录作为目录输入，同目录内声明同一 domain 的文件会一起分析。没有 `domain.skel` 时，每个文件都是独立输入，因此同目录的独立文件可以声明相同的 domain 和类型而不冲突。这与 `check` 的行为一致：校验时不解析 import；生成命令则根据显式的 `--skel-import` 映射校验完整的 import 图。

LSP 通信独占标准输入和标准输出，集成方不能向服务器的 stdout 写入日志。

## 查询、生成快照和查看 schema 差异

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

请求的声明不存在时，`get` 会返回 JSON `null` 和退出码 `0`。不存在是正常查询结果，
不是命令失败。`schema list/get` 始终查询完整 domain，每个声明
保留自己的 `pub` 标记。

每个正常完成的 schema 命令都会向 stdout 写入恰好一个 JSON 结果，并以退出码 `0`
结束。命令、输入、编译、Git 历史或 schema 的任何失败都会以非零退出码结束，
并向 stdout 写入一个 JSON 错误对象：

```json
{
  "code": "COMPILATION_FAILED",
  "message": "failed to compile schema source"
}
```

程序必须根据 `code` 分支，不得解析 `message`。当前稳定 code 为：

- `INVALID_ARGUMENT`：命令参数或 flag 组合无效。
- `COMPILATION_FAILED`：Skel 源码加载、解析或语义分析失败。
- `GIT_HISTORY_NOT_FOUND`：无法找到隐式 Git baseline。
- `COMMAND_FAILED`：输出、投影、编码或其他命令执行失败。

stderr 只保留零到多条 JSONL 日志和诊断，永远不属于命令结果；使用
`--log-format text` 可以切换成人类可读格式。

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
名称。`schema snapshot` 不接受 `--skel-import`。要检查某个依赖 domain 自身的
兼容性，应在该 domain 上单独执行 snapshot 和 diff。

成员、参数和返回值中的 import 类型使用明确的
`"kind": "importedReference"` 表示：

```json
{
  "kind": "importedReference",
  "name": "identity.user.UserSummary"
}
```

当前 domain 自身拥有的已解析引用会保留其声明种类：`enum`、`data`、
`config` 或 `event`。

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

- `BREAKING`：删除或结构性改变已有契约，增加必填字段或参数，或迫使现有使用者修改其代码或数据。
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

命令会把检测到的全部变化写入结构化 JSON 报告，包括兼容性结论、分类计数、稳定
变化 code、symbol，以及可用的 baseline/candidate 源码位置。无论兼容性结论
如何，diff 完成后都返回退出码 `0`；命令参数、输入、编译和 schema 格式错误
返回 `2`。CI 可以读取报告并自行应用失败策略，无需配置 diff 命令。

## 生成 Go 源码

在已有 module 中生成 Go 文件：

```bash
skelc gen go \
  --skel-in ./domain/booker/skel \
  --go-out ./domain/booker/src/server/skeled
```

`--go-vine-version` 覆盖写入生成 module 的 Vine 依赖版本。必须是完整的、带 `v` 前缀的语义版本（例如 `v0.20.2`），与 Go module 路径兼容，且不低于最低支持版本。`skelc version` 会报告该最低版本，以及未指定该参数时写入的默认版本。

生成文件的顶部附近都会带有 `Code generated by skelc. DO NOT EDIT.` 所有权标记；无标记文件会被保留。重新生成时会删除仍带标记但已不再需要的文件，并覆盖本次生成路径上的文件。

每个生成命令在提交输出后返回 `{generated}`。非致命编译诊断默认作为 JSONL 日志写入 stderr；需要人类可读日志时使用 `--log-format text`。

## 生成 Go module

生成独立 module：

```bash
skelc gen go-module \
  --skel-in ./domain/booker/skel \
  --go-out ./domain/booker/skeled/golang \
  --go-module example.com/demo/booker/skeled
```

同时生成 regular module 和 pub module：

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

外部 domain 需要同时提供 Skel 和 Go import 映射：

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

当所有 domain 遵循统一命名规则时，`--go-module-prefix` 可以推导外部 pub module 路径；显式 `--go-import domain=module` 映射优先。

`gen go` 和 `gen go-module` 均支持 `--skel-import`、`--go-import`，以及互斥的 `--api` / `--pub`。这两个模式不能与 `--go-pub-out` 或 `--go-pub-module` 合用。

生成前会校验写入的 module 元数据。主 module、pub module 及由 prefix 推导的路径都必须是有效 Go module 路径，Go import 的版本必须是完整、带 `v` 前缀且与 module 路径兼容的语义版本。指向同一 Go module 的映射必须使用一致的版本；版本冲突（包括覆盖所选 runtime 依赖）会导致生成失败。

`--api` 生成 Portal 客户端，可用 `--go-vrpc-version` 覆盖默认的 vRPC v0.12.0，不接受 `--go-vine-version`。后端 Go 输出要求 Vine v0.20.2 或更高版本；`skelc version` 的 `minimumVineVersion` 会报告此要求。module prefix 会把 domain `shop.order` 推导为 `example.com/gen/shop/orderapi`，跨领域 API 类型引用对应的 `xxxapi` 包。

### module 参数

- `--skel-import domain=PATH`：外部 skel domain 路径，可重复传入
- `--go-module MODULE`：显式指定当前输出 module
- `--go-pub-out PATH`：pub Go module 输出目录；需要与 `--go-out` 一起使用
- `--go-pub-module MODULE`：显式指定 pub 输出 module；未指定时默认为当前 module 加 `pub`
- `--go-import domain=PACKAGE`：外部 domain 的 Go import path，可重复传入
- `--go-module-prefix PREFIX`：用于推导 Go module / import path

`--go-module-prefix`、`--go-module`、`--go-pub-module` 不能以 `/` 结尾。

### 生成行为

- `gen go` 写入已有模块，不创建 `go.mod`
- 未指定 `--go-pub-out` 时，Go module 输出完整的 data / enum / config / actor / resource / service / event / web / task
- 指定 `--go-pub-out` 时，会同时生成 pub module 和 regular module；同一个非 full schema 只在一侧注册，且 regular 或 full schema 可以覆盖 pub schema
- pub service 在 pub module 中生成 client spec，在 regular module 中生成 server spec
- pub event 在 pub module 中生成 listener spec，在 regular module 中生成 emitter spec
- pub actor 的 auth service 在 pub module 中生成 server spec，credential / info / actor permission service 跟随 pub actor 生成
- pub resource 在 pub module 中生成权限码常量、check service server 和 schema；regular module 会在 `pub.go` 里生成 facade
- regular module 会 require pub module，并通过 `pub.go` 暴露 pub 符号的 type alias / facade；regular 包是符号超集
- pub service / method 的 `require` 引用本 domain resource 时，该 resource 必须标 `pub`
- 公开契约的本领域 data / enum 依赖自动收集，无需 `pub`；actor / resource 仍要求公开可见性
- `web` 不支持 `pub`，普通 Go 生成会为每个 `web` 生成 `web.WebSpec`
- `web` 生成的 server interface 形如 `UserPortalWebServer`，默认实现形如 `DefaultUserPortalWebServer`
- `web` 默认实现只提供空壳，具体路由仍然由 Go 代码实现 `Routes(*web.Router)`
- 已声明的 `web` 挂载路径会写入生成的 spec 和 runtime schema，详见 [Vine 集成](/docs/vine-integration#声明的-web-挂载路径)。
- `--go-module-prefix` 可用于推导外部 domain 的 pub import path；pub Go 包按 `<prefix>/<domain parts except last>/<last-domain>pub` 拼接，例如 `example.com/demo/skeled/userpub`

## 生成 TypeScript

生成 TypeScript 源码：

```bash
skelc gen ts --api \
  --skel-in ./domain/booker/skel \
  --ts-out ./domain/booker/pub/skel/typescript
```

`gen ts` 必须传 `--api`，不接受 `--pub`。输出 API 服务客户端、其数据依赖，以及显式公开的 data 和 enum；没有 API 服务的领域也可以生成纯类型 API 包。旧服务含客户端准入规则时仍生成客户端，同时给出迁移 warning。

要生成 package 元数据，加上 `--ts-as-module`，并用 `--ts-module` 或 `--ts-module-scope` 指定包名。外部 domain 通过可重复传入的 `--ts-import domain=package` 映射：

```bash
skelc gen ts --api \
  --skel-in ./domain/booker/skel \
  --ts-out ./domain/booker/pub/skel/typescript \
  --skel-import app=./domain/app/pub/skel/skel \
  --skel-import user=./domain/user/pub/skel/skel
```

生成的包名及依赖包名必须是有效的小写 npm 包名，例如 `@example/client`。指向同一 npm 包的显式版本约束必须一致，冲突会导致生成失败。自动推导出的通配版本不会覆盖显式约束。

## 生成 pub skel

为其他 domain 导出公开契约面：

```bash
skelc gen skel \
  --pub \
  --skel-in ./domain/user/skel \
  --skel-out ./domain/user/pub/skel
```

`gen skel` 必须传 `--pub`。输出保留公开的 data、enum、config、actor、resource、service、event 及其所需的公开依赖；隐式数据依赖保留原有可见性标记。actor 的 `auth { credential / info }` 会渲染回 actor 内部，不额外输出顶层 data。pub service / method 的 `require` 引用本 domain resource 时，该 resource 必须标 `pub`。

## 版本信息

显示编译器、平台、Go 和默认 Vine 版本信息：

```bash
skelc version
```

集成方应使用 `skelc version` 返回的 `version` 字段检查所需的最低版本。

这些命令涉及的语言规则见 [Skel 语法参考](/docs/syntax)。

schema snapshot 会在标记 `@noTrim` 的 config 字段上记录 `noTrim: true`；新增或移除该标记会在 `schema diff` 中报告 `data.member.no-trim.changed`（`DANGEROUS`）。
