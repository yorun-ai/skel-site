---
slug: /vine-integration
---

# Vine 集成

skelc 生成的 Go 代码以 Vine 的公开包作为运行时契约。生成内容包括数据类型、service/client/server spec、Event/Task/Web spec、Actor 与权限辅助，以及 domain schema。

## 版本关系

`skelc version` 会显示默认的 Vine 版本。生成 Go module 时，这个版本会写入输出的 `go.mod`。`--go-vine-version` 只能选择不低于默认值的版本，但它不保证更高版本一定兼容——升级时仍需固定具体版本、重新生成并跑测试。

## 推荐流程

1. 修改 `.skel`。
2. 运行 format 和 check。
3. 用项目固定的 skelc 版本重新生成。
4. 检查生成 API、module 依赖和 schema diff。
5. 运行 Vine 应用测试。

生成文件是派生产物，不要直接修改。Vine 的应用生命周期、Rpc/Web/Event/Task 实现方式见 [Vine 文档](https://vine.yorun.ai/docs/)。
