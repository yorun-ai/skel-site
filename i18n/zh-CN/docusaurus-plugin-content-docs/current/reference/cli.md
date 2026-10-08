---
slug: /cli
---

# CLI 参考

skelc 校验、格式化、查询和对比 `.skel` 定义，并生成 Go、TypeScript 与公开 Skel 契约。

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
`go.yorun.ai/skel/cmd/skelc/output` 中的公开结果和错误类型。

## 严格模式 {#strict-mode}

`--strict` 是默认关闭的全局参数。默认模式、`--strict` 和 `--strict=false` 执行相同的语言规则：

- service 必须声明 `pub`、`ext` 或 `api`。
- 客户端准入规则（`for Actor`、服务或方法的 auth、`require`）只允许用于 API service。
- API service 必须显式声明服务级 `auth required`、`auth optional` 或 `auth anonymous`；方法可继承服务模式。
- web 必须显式声明 `auth required`、`auth optional`、`auth anonymous` 或 `auth off`。

忽略隐藏文件等普通 warning 保持不变。`check` 未通过时退出码为 `1`；生成、schema、格式化命令因编译失败时退出码为 `2`。格式化先验证全部输入，再改写文件。`schema diff` 对候选和基线源码执行相同的语言规则。

Go 集成保留 `api.Input{SkelIn: "./skel", Strict: true}`。

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

`schema dep` 的所有视图和 `schema list --pub/--api` 同样接受这些映射来解析依赖；其他 schema 命令不接受这些映射。默认 schema 查询和基于源码的 diff 把外部符号保留为不透明的完整名称。

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

LSP 客户端可设置 `initializationOptions.strict`，或发送 `workspace/didChangeConfiguration`，内容为 `{ "strict": true }`（也支持 `{ "skelc": { "strict": true } }`）。显式初始化值覆盖 `skelc --strict lsp` 启动参数。两种取值目前的诊断结果相同。

分析会包含尚未保存的修改。包含 `domain.skel` 的目录作为目录输入，同目录内声明同一 domain 的文件会一起分析。没有 `domain.skel` 时，每个文件都是独立输入，因此同目录的独立文件可以声明相同的 domain 和类型而不冲突。这与 `check` 的行为一致：校验时不解析 import；生成命令则根据显式的 `--skel-import` 映射校验完整的 import 图。

LSP 通信独占标准输入和标准输出，集成方不能向服务器的 stdout 写入日志。

## 扫描源码导入

列出输入中直接声明的领域导入：

```bash
skelc scan imports --skel-in ./domain/user/skel
```

结果为 import 声明的 JSON 数组，每项包含 `domain`、可选的显式别名 `alias`、`file`，
以及从 1 开始的 `line` 和 `column`。没有导入时返回 `[]`。
同一领域在不同源文件中的重复导入分别保留，按文件和源位置排序。
注释和描述文本不计为导入。

查询会校验目标输入，但不会加载被导入的领域，因此无需提供 `--skel-import`
映射，也不会返回传递依赖。现有的 `--strict` 选项同样适用。

## 查询和查看 schema 差异

查询完整领域、公共契约或 API 视图选中的声明及外部依赖：

```bash
skelc schema dep --skel-in ./domain/user/skel --skel-import common=./domain/common/skel
skelc schema dep --pub --skel-in ./domain/user/skel --skel-import common=./domain/common/skel
skelc schema dep --api --skel-in ./domain/user/skel --skel-import common=./domain/common/skel
skelc schema dep --api --prune --actor demo.user.UserActor \
  --skel-in ./domain/user/skel --skel-import common=./domain/common/skel
skelc schema dep --api --prune --name common.Money \
  --skel-in ./domain/common/skel
```

不传视图参数时查询完整领域；`--pub` 与 `schema list --pub` 一样选择后端公共契约，`--api` 选择 API 视图。`--pub` 与 `--api` 互斥。`--actor`、`--prune` 和 `--name` 要求 `--api`。`--prune` 可选，与 API 生成共用规则：不传时保留公开 data/enum 和可选 `--actor` 匹配的服务；传入时至少指定一个 `--actor` 或 `--name`。两种起点都可重复并取并集；`--name` 要求 `--prune`，只能指定当前输入领域的 data/enum 完整名称。仅类型起点不选择服务。短名、导入别名和未知起点报错。查询需要完整解析输入，须通过 `--skel-import domain=PATH` 提供所需传递依赖映射，支持 `--strict`。

JSON 返回 `domain`，排序后的本领域完整名称数组 `services`、`data`、`enums`、`actors`、`configs`、`events`、`resources`、`webs`、`tasks`，以及排序、去重的 `dependencies` 数组，其中每项形如 `{ "domain": "common", "name": "Money", "kind": "data" }`。完整和公共视图报告外部 data/enum、Actor 和权限资源引用，也覆盖 config、event、认证数据、资源检查与 task 声明中的类型。API 查询保留既有 JSON 字段（`domain`、`services`、`data`、`enums`、`dependencies`）及外部 data/enum 依赖语义，不输出 API 视图之外的声明分类。完整/public 视图的空分类仍输出 `[]`。

依赖结果表示所选本领域声明的引用，不是传递 import 图。遍历嵌套集合与泛型实参，外部声明仅记录引用，不展开成员；泛型定义与其外部类型实参分别报告。跨领域追踪需在依赖所属领域继续查询。空列表为 `[]`；空领域或有效 API 选择没有匹配服务时成功。不需要输出目录或目标语言参数。

以 JSON 数组输出当前 Skel 中的全部顶层声明摘要：

```bash
skelc schema list --skel-in ./domain/user/skel
skelc schema list data --skel-in ./domain/user/skel
```

可选的位置参数 `TYPE` 用于过滤列表。支持的声明种类为 `actor`、`config`、
`data`、`enum`、`event`、`resource`、`service`、`task` 和 `web`。

默认 `schema list` 只列当前 Skel 中声明的顶层条目，不解析跨 domain 定义，因此无需传 `--skel-import`。外部引用统一使用完整名称，不受当前文件所用 import alias 的影响。

选择后端公共或 API 生成视图：

```bash
skelc schema list --pub --skel-in ./domain/user/skel
skelc schema list --api --actor demo.user.UserActor --skel-in ./domain/user/skel
skelc schema list --api --prune --actor demo.user.UserActor \
  --name demo.user.Extra --skel-in ./domain/user/skel data
```

`--pub` 与 `--api` 互斥。公共视图包含公共契约及其本领域类型依赖；API 视图与 API 生成及 `schema dep --api` 使用相同选择规则。`--actor` 可重复，要求 `--api`，不要求 `--prune`。`--name` 可重复，要求 `--api --prune`，选择当前领域的 data/enum 起点。裁剪至少需要一个 Actor 或名称起点。位置参数 `TYPE` 在视图构建完成后过滤声明。

两种生成视图都会加载并校验完整 import 图，须通过 `--skel-import domain=PATH` 提供所需传递依赖映射。不传视图参数时，`list` 保留浅解析检查，不接受依赖映射。结果只包含当前领域的声明，包括所选起点依赖的本领域类型；外部依赖通过带有对应视图参数的 `schema dep` 查询。

所有模式返回相同的 JSON 数组，每项形如 `{ "pub": false, "name": "Result", "type": "data", "skelName": "demo.user.Result" }`。`pub` 保留原本的后端公共属性，不表示是否被选中：API service 或被引用的私有类型可以以 `pub: false` 出现在结果中。空视图或种类过滤结果返回 `[]`；输入或选择无效时报错，不返回空结果。所有模式均支持 `--strict`。

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

请求的声明不存在时，`get` 会返回 JSON `null` 和退出码 `0`——不存在是正常查询结果，而不是命令失败。默认 `schema list` 和 `schema get` 查询完整的当前 domain，不解析外部定义；生成视图查询会解析 import，但只返回选中的当前领域声明。每个声明保留原本的 `pub` 标记。

Service 和 web 声明使用 `authMode` 表示认证模式。
Service 方法保留声明的 `authMode` 和 `require`，同时提供 `effectiveAuthMode` 和可选的
`effectiveRequire`。`effectiveAuthMode` 将 service 默认值应用到继承认证策略的方法；
`effectiveRequire` 通过 `all` 组合 service 和 method 的权限要求，保留表达式顺序及
check 参数。两层均无权限要求时省略该字段。默认查询无需加载 import 即可计算这些
策略，因此外部 check 目标及参数类型仍可能未解析。

Actor 的 `auth` 字段表示其认证能力对象。

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

兼容性判断针对既有交互，不保证重新生成代码后实现无需修改。新增 service method
（包括 `ext` method）和 resource check 仍然兼容；使用新增能力需要对端支持。

- `BREAKING`：移除已有能力、拒绝原先允许的调用者，或使已有请求、响应不再兼容。例如新增必填输入、收紧认证、新增权限要求，以及移除 actor 的认证或权限能力。
- `DANGEROUS`：可能改变安全或业务解释语义，或无法证明兼容。例如放宽认证、替换权限表达式、改变 config lifecycle，以及新增 enum item。
- `COMPATIBLE`：保留既有交互，包括新增独立能力，以及修改文档和废弃元数据。

method 的认证规则会先解析 service 继承，再比较实际模式；显式模式与继承后等价的模式视为兼容。
重复添加 service 或 method 已经要求的权限也视为兼容。
web 从 `off` 改为 `required`、`optional` 或 `anonymous` 属于破坏性变化，因为所带凭证会被校验，而不是直接透传。
权限合取条件会合并 service 与 method 两个层级后比较；新增必需条件（`P` 变成 `P && Q`）属于破坏性变化。
相同条件的重排、重复声明或在两个层级间移动均兼容；其他逻辑改写，包括不等价的析取表达式，继续视为危险变化。
能够在当前 schema 中追踪且仅用于响应的
数据新增字段视为兼容。在其余类型不变时，输入允许 null、输出不再返回 null 均兼容。
新增 nullable credential 字段不要求旧调用者提供该字段。输入输出共用、独立公开、泛型和用途不明
的类型继续保守判断。仅字段重排视为兼容；参数重排仍为破坏性变化，因为运行时支持位置调用。
`compatible: true` 表示没有 `BREAKING`，不排除 `DANGEROUS`，也不保证部署或版本选择兼容。

domain 名称变化表示整个 schema 身份被替换，而不是某个嵌套符号改名。diff 只输出
一项 `domain.name.changed`，其中 `change: "MODIFIED"`、`impact: "BREAKING"`，
随后停止，不再展开被替换 domain 下的声明、成员或元数据变化。

每项结果还带有独立的 SCREAMING_CASE `change` 维度：

- `ADDED`：新增声明、member、item、method 或 capability。
- `REMOVED`：删除已有元素。
- `MODIFIED`：已有元素的类型、顺序、可见性、元数据、认证、授权、敏感性或其他属性发生变化。

例如，新增 enum item 的结果为 `change: "ADDED"`、`impact: "DANGEROUS"`；
新增必填输入字段同样是 `change: "ADDED"`，但 `impact: "BREAKING"`。

命令会把检测到的全部变化写入结构化 JSON 报告，包括兼容性结论、分类计数、稳定
变化 code、symbol，以及可用的 baseline/candidate 源码位置。无论兼容性结论
如何，diff 完成后都返回退出码 `0`；命令参数、输入、编译和 schema 格式错误
返回 `2`。CI 可以读取报告并自行应用失败策略，无需配置 diff 命令。

## Go 库集成 {#go-library-integration}

Go 工具可直接通过 `go.yorun.ai/skel/api` 调用 `Check`、`ScanImports`、
`FormatSource`、`FormatFiles`、`QuerySchema`、`DiffSchemaSources` 和依赖查询。
`Check` 允许未解析导入，将源码错误作为诊断返回并设置 `Valid: false`；加载失败返回
error。格式化返回源码字节或全部输入验证通过后的修改计划，不写入文件。

`QuerySchema` 默认保留未解析导入，与 schema list/get 一致；设置 `Pub`、`Api` 或
`ResolveImports` 可选择完整解析的视图，并需提供完整依赖映射。
结果的 `Domain` 字段是 `*schema.Domain`，可通过 `domain.Declarations()` 和
`domain.Find(kind, skelName)` 检查声明。`go.yorun.ai/skel/schema/diff` 提供
`Compare(baseline, candidate)`，直接比较语义 domain。
`DiffSchemaSources` 比较显式源码输入；磁盘候选输入未指定基线时使用 Git HEAD。
基线和候选输入必须满足相同的语言规则。

`Input.Sources` 和检查选项接受以逻辑文件路径为键的完整 `map[string][]byte` 内存快照。
相对路径基于当前工作目录解析，目录遵循通常的 `domain.skel` 布局。nil 使用磁盘；
非 nil 快照不会回退到磁盘。导入 domain 也必须包含在快照中，并通过 `SkelImports`
映射。内存源码 diff 必须显式指定基线。只读 API 提供支持取消的 `Context` 版本。
参见 [Go API 示例](https://github.com/yorun-ai/skel/blob/main/README.zh-CN.md#程序调用-api)。

自定义语言 binding 使用 Go 编写，通过 `go.yorun.ai/skel/codegen` 接入。
先用 `api.Parse` 解析，再调用 `codegen.Prepare` 选择完整、公开或 API 范围。
`codegen.Input` 引用同一套 `schema` 声明，提供生成选择、声明查询、外部依赖、
类型遍历和泛型替换。准备完成后只读使用模型，目标语言导入路径和名称由 binding 保存。

实现 `codegen.Generator` 并返回 `[]codegen.File`。`codegen.Generate` 只生成并校验
文件集合，便于检查；`codegen.Run` 负责输出、清理和失败回滚。文件使用相对路径与命名
 target，输出目录不能重叠。生成路径上的已有文件会被替换，过期的已标记文件会被删除，
无关的未标记文件会保留。其他源码格式需设置 `File.CommentPrefix`，例如 Python 使用 `#`。

`api.NewGolangGenerator`、`api.NewTypeScriptGenerator` 和 `api.NewSkeletonGenerator`
也使用相同接口，并按选项选择生成范围。`Out` 提供命名上下文，实际输出位置由
`codegen.Run` 指定。主 target 为 `""`，Go 分离输出额外使用 `"pub"`。
参见[可运行的 binding 示例](https://github.com/yorun-ai/skel/blob/main/codegen/example_test.go)。

## 生成 Go 源码

在已有 module 中生成 Go 文件：

```bash
skelc gen go \
  --skel-in ./domain/booker/skel \
  --go-out ./domain/booker/src/server/skeled
```

`--go-vine-version` 覆盖写入生成 module 的 Vine 依赖版本。必须是完整的、带 `v` 前缀的语义版本（例如 `v0.28.0`），与 Go module 路径兼容，且不低于最低支持版本。`skelc version` 会报告该最低版本，以及未指定该参数时写入的默认版本。

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

`--api` 生成 portal 客户端，可用 `--go-vrpc-version` 覆盖默认的 vRPC v0.13.0，不接受 `--go-vine-version`。后端 Go 输出需要 Vine 的 `RegisterDomainDescriptor` API，默认依赖与最低支持版本均为 v0.28.0；详见[兼容性说明](/docs/compatibility#生成产物契约)。module prefix 会把 domain `shop.order` 推导为 `example.com/gen/shop/orderapi`，跨领域 API 类型引用对应的 `xxxapi` 包。

`gen go --api`、`gen go-module --api` 和 `gen ts --api` 支持可重复的 `--actor domain.NameActor`，仅生成 `for` 声明匹配指定 actor 全称的服务。多个 actor 取服务并集；未启用 `--prune` 时省略参数会生成全部 API 服务。筛选保留服务的全部方法，不按 认证模式 或权限条件删减方法，也不限制 actor 的 via。未知名称、短名和导入别名会报错。未启用 `--prune` 时输出保留显式公开的 data / enum，其他数据类型及外部类型依赖只跟随选中的服务收集。

```bash
skelc gen ts --api \
  --actor demo.user.UserActor \
  --skel-in ./skel \
  --ts-out ./generated/user-api
```

### 裁剪 API 类型

API 生成支持 `--prune`，以可重复的 `--actor` 和/或 `--name` 作为起点：

```bash
skelc gen go --api --prune --name demo.user.User \
  --skel-in ./skel --go-out ./generated/userapi
skelc gen ts --api --prune --actor demo.user.UserActor --name demo.user.Extra \
  --skel-in ./skel --ts-out ./generated/user-api
```

只保留所选服务、类型及其本领域类型依赖，包括递归类型和泛型实参；未引用的公开 data/enum 不再生成。只有 `--name` 时不选择服务，同时指定 Actor 和类型时取并集。`--prune` 要求 `--api` 和至少一个起点；`--name` 要求 `--prune`，且必须是当前领域的 data/enum，外部类型需在其所属领域生成。适用于 `gen go`、`gen go-module`、`gen ts`，包括 `--ts-as-module`。不启用裁剪时保留公开类型。`schema dep --api` 与生成共用选择逻辑，目标语言导入和包依赖由最终生成内容决定。

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
- 指定 `--go-pub-out` 时，会同时生成 pub module 和 regular module；同一个非 full schema 只在一侧注册
- pub service 在 pub module 中生成 client spec，在 regular module 中生成 server spec
- pub event 在 pub module 中生成 listener spec，在 regular module 中生成 emitter spec
- pub actor 的 auth service 在 pub module 中生成 server spec，credential / info / actor permission service 跟随 pub actor 生成
- pub resource 在 pub module 中生成权限码常量、check service server 和 schema；regular module 会为其生成 facade
- regular module 会 require pub module，并暴露 pub module 的符号；regular 包是符号超集
- pub service / method 的 `require` 引用本 domain resource 时，该 resource 必须标 `pub`
- 公开契约的本领域 data / enum 依赖自动收集，无需 `pub`；actor / resource 仍要求公开可见性
- `web` 不支持 `pub`，普通 Go 生成会为每个 `web` 生成 web spec
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

`gen ts` 必须传 `--api`，不接受 `--pub`。默认输出 API 服务客户端、其数据依赖，以及显式公开的 data 和 enum；没有 API 服务的领域也可以生成纯类型 API 包。

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
