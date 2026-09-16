---
slug: /vine-integration
---

# Vine 集成

skelc 生成的 Go 代码以 Vine 的公开包作为运行时契约。生成内容包括数据类型、服务/客户端/服务端规范（service/client/server spec）、Event、Task、Web 规范、Actor 与权限辅助代码，以及 Domain Schema。

## 版本关系

当前生成的 Go 契约需要 Vine v0.19.0 或更高版本。`skelc version` 会同时显示最低支持版本和默认 Vine 版本；生成 Go module 时，默认版本会写入输出的 `go.mod`，`--go-vine-version` 可以选择其它版本，但不能低于最低支持版本。更高版本不保证一定兼容，因此升级时应固定具体版本、重新生成并运行应用测试。

## 声明的 Web 挂载路径

声明了 `mount` 的 `web` 会把该值写入两处生成产物：Web spec 中的 `WebSpec.MountPath`，以及 runtime domain schema 中的 `MountPath`。读取其中任意一处即可，不要把这个前缀再写进应用配置。运行时 Vine 如何使用该值——包括 Portal 如何为已挂载站点解析入口规则——由 [Vine 文档](https://vine.yorun.ai/docs/portal)负责说明。

## 推荐流程

1. 修改 `.skel`。
2. 运行 format 和 check。
3. 用项目固定的 skelc 版本重新生成。
4. 检查生成 API、module 依赖和 schema diff。
5. 运行 Vine 应用测试。

生成文件是派生产物，不要直接修改，也不要在生成 package 中加入非托管 Go 文件。skelc 和 Vine 把生成 package 视为由生成器独占管理的单元。Vine 的应用生命周期、RPC、Web、Event 与 Task 的实现方式见 [Vine 文档](https://vine.yorun.ai/docs/)。
