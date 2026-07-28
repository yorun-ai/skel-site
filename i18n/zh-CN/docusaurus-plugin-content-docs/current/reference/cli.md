---
slug: /cli
---

# CLI 参考

本文档以当前 module 中的 `cli` 实现为准。

`skelc` 用来读取 `.skel` 定义，进行校验，或生成 Go / Go module / TypeScript / pub skel 代码。

本文档只说明 CLI 操作、输入输出路径、参数和生成行为；`.skel` 文件本身的语法见 [Skel 语法参考](/docs/syntax)。

查看帮助：

```bash
skelc --help
skelc version --help
skelc gen go --help
skelc gen go-module --help
skelc gen ts --help
skelc gen skel --help
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

`skelc` 的诊断日志默认使用文本格式。需要被上层工具读取时，可以使用全局参数 `--log-format jsonl`：

```bash
skelc --log-format jsonl check --skel-in ./domain/user/skel
skelc --log-format jsonl gen go-module --skel-in ./domain/user/skel --go-out ./domain/user/skeled/golang --go-module go.yorun.ai/app/demo/user
```

普通日志仍只包含 `level` 与 `message`；结构化诊断还包含 `code`、`severity`、`range`，并可带 `related` 与 `suggestion`：

```json
{"level":"warn","code":"loader.ignored-hidden-file","severity":"warning","range":{"start":{"file":"/path/.hidden.skel","line":1,"column":1},"end":{"file":"/path/.hidden.skel","line":1,"column":1}},"message":"/path/.hidden.skel ignored (HIDDEN_FILE)"}
```

## 1. 输入与依赖

`--skel-in` 可以是一个 `.skel` 文件，也可以是一个目录。

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

跨 domain 定义在生成阶段通过 `--skel-import domain=PATH` 映射，具体用法见后面的各生成命令。

## 2. 校验 skel

```bash
skelc check --skel-in ./domain/user/skel
```

`check` 检查当前输入中的语法、命名、类型和引用规则；该命令只接受 `--skel-in`。语法分析会在声明、block 成员、右花括号和 decorator 边界恢复，单次运行可为每个 domain 报告最多 50 条相互独立的语法与语义诊断。使用 `--log-format jsonl` 时，每条诊断分别占一行，并包含 code、severity、range、related location 和可选 suggestion。

## 3. 格式化 skel

原地格式化单个 `.skel` 文件或目录中被 loader 接受的全部 `.skel` 文件：

```bash
skelc format --skel-in ./domain/user/skel
```

格式化会统一换行、缩进、空行和行尾空白，不会重排声明或修改三引号字符串内容。命令会先验证全部输入，全部验证成功后才写入文件。

## 4. 运行语言服务器

编辑器和其它开发工具可以通过标准输入输出启动 Skel Language Server：

```bash
skelc lsp
```

该命令使用 Language Server Protocol，提供多条实时语法与工作区语义诊断、诊断快速修复、关联位置、文档符号、跨文件定义跳转和引用查找。语义分析直接使用未保存的内存内容，合并同一 domain 的文件，并以 workspace 中 `.skel` 文件声明的 domain 和 import alias 解析跨 domain 引用；协议消息独占标准输入输出，因此不要手动向该命令的 stdout 写入日志。

## 5. 查看 symbol

输出当前 skel 中所有顶层 symbol，每行格式为 `pub标记 类型 skelName`：

```bash
skelc symbol list --skel-in ./domain/user/skel
```

示例输出：

```text
pub  actor    demo.user.ClientActor
pub  data     demo.user.User
---  enum     demo.user.UserStatus
pub  resource demo.user.User
pub  service  demo.user.UserService
---  web      demo.user.UserPortalWeb
```

`symbol list` 只列当前 skel 中声明的顶层 symbol，不解析跨 domain 引用，因此不需要传 `--skel-import`。
需要机器读取时可以使用 `--output-format json`：

```bash
skelc symbol list --output-format json --skel-in ./domain/user/skel
```

查询单个 symbol：

```bash
skelc symbol get demo.user.User --skel-in ./domain/user/skel
```

找到时输出：

```text
pub  data  demo.user.User
```

找不到时退出码为 `1`，输出：

```text
symbol not found: demo.user.Missing
```

`get` 同样支持 `--output-format json`。

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
- `gen go` 不接收 `--skel-import`、`--go-module-prefix`、`--go-module`、`--go-import` 或 `--pub`
- 所有生成命令都通过 `.skelc-manifest.json` 管理输出；未纳入清单的文件不会被删除，内容被修改的过期生成文件也会保留
- 未指定 `--go-pub-out` 时，Go module 输出完整的 data / enum / config / actor / resource / service / event / web / task
- 指定 `--go-pub-out` 时，会同时生成 pub module 和 regular module；schema 只跟随 pub 的 client/listener 或非 pub 的完整定义生成一次
- pub service 在 pub module 中生成 client spec，在 regular module 中生成 server spec
- pub event 在 pub module 中生成 listener spec，在 regular module 中生成 emitter spec
- pub actor 的 auth service 在 pub module 中生成 server spec
- pub actor 的 credential / info / actor permission service 跟随 pub actor 生成
- pub resource 在 pub module 中生成权限码常量、check service server 和 schema；regular module 会在 `pub.go` 里生成 facade
- regular module 会 require pub module，并通过 `pub.go` 暴露 pub 符号的 type alias / facade；regular 包是符号超集
- pub service / method 的 `require` 引用本 domain resource 时，该 resource 必须标 `pub`
- 公开契约引用到未标 `pub` 的 data / enum / actor / resource 时会报错，不会隐式带出依赖
- schema 只在 pub 或 regular/full 一侧出现，不会两边同时注册同一个非 full schema；regular/full schema 可以覆盖 pub schema
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
