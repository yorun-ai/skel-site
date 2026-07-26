# Skel 站点

[English](README.md) | **简体中文**

本仓库包含 Skel 语言和 skelc 工具链的公开网站与文档，发布于 [skel.yorun.ai](https://skel.yorun.ai)。

Vine 框架文档由 [`vine-site`](https://github.com/yorun-ai/vine-site) 独立维护，发布于 [vine.yorun.ai](https://vine.yorun.ai)。

## 本地开发

需要 Node.js 20 或更高版本以及 pnpm。

```bash
pnpm install
pnpm dev:zh
```

使用 `pnpm dev:en` 启动英文站点。验证两个语言版本：

```bash
pnpm typecheck
pnpm build
```

## 版本管理

文档版本跟随 skelc 发布：

```bash
pnpm docusaurus docs:version 0.10.0
```

不要手工修改生成的版本快照。

## 参与贡献

文档归属、双语内容要求和验证步骤请参阅
[CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

Skel Site 使用 [Apache License 2.0](LICENSE) 开源。
