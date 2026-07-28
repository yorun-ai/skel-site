# Skel 站点

[English](README.md) | **简体中文**

本仓库包含 Skel 语言和 skelc 工具链的公开网站与文档，发布于 [skel.yorun.ai](https://skel.yorun.ai)。

Vine 框架文档由 [`vine-site`](https://github.com/yorun-ai/vine-site) 独立维护，发布于 [vine.yorun.ai](https://vine.yorun.ai)。

## 本地开发

需要 Node.js 20 或更高版本以及 pnpm。

```bash
pnpm install
pnpm dev
```

`pnpm dev` 会在同一个本地地址启动两个语言版本并启用热更新，因此修改后页面会
自动刷新，语言切换器的行为也与生产环境一致。如需占用更少资源，可使用
`pnpm dev:en` 或 `pnpm dev:zh` 启动单语言服务器；此时不能通过语言切换器
离开当前编译的语言。

验证两个语言版本：

```bash
pnpm typecheck
pnpm build
```

## 部署

生产环境通过 Cloudflare Workers Builds 从 `main` 分支自动部署。

`pnpm build` 会在 `build` 目录生成静态站点。`wrangler.jsonc` 是 Worker
配置、404 回退页面和 `skel.yorun.ai` 自定义域名的唯一配置来源。

部署到生产环境需要经过授权的 Cloudflare 凭据。贡献者在本地构建或预览
站点时不需要 Cloudflare 权限。

## 版本管理

1.0 之前，站点只维护当前的 `next` 文档；版本快照从 `v1.0.0` 开始。
发布维护者可使用以下命令创建快照：

```bash
pnpm docusaurus docs:version 1.0.0
```

不要手工修改生成的版本快照。

## 参与贡献

文档归属、双语内容要求和验证步骤请参阅
[CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

Skel Site 使用 [Apache License 2.0](LICENSE) 开源。
