# Skel Site

**English** | [简体中文](README.zh-CN.md)

This repository contains the public website and documentation for the Skel language and skelc toolchain, published at [skel.yorun.ai](https://skel.yorun.ai).

Vine framework documentation is maintained separately in [`vine-site`](https://github.com/yorun-ai/vine-site) and published at [vine.yorun.ai](https://vine.yorun.ai).

## Development

Prerequisites: Node.js 20 or later and pnpm.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both locales with hot reload behind one local address, so
edits refresh automatically and the language switcher works as it does in
production. Use `pnpm dev:en` or `pnpm dev:zh` for a lower-overhead,
single-locale server; its language switcher cannot leave the compiled locale.

Validate both locales with:

```bash
pnpm typecheck
pnpm build
```

## Deployment

Production deployments run automatically from `main` through Cloudflare
Workers Builds.

`pnpm build` generates the static site in `build`. `wrangler.jsonc` is the
source of truth for the Worker configuration, 404 fallback, and the
`skel.yorun.ai` custom domain.

Deploying to production requires authorized Cloudflare credentials.
Contributors do not need Cloudflare access to build or preview the site locally.

## Versioning

Before 1.0, the site maintains only the current `next` documentation.
Version snapshots begin with `v1.0.0`. Release maintainers can create one with:

```bash
pnpm docusaurus docs:version 1.0.0
```

Do not edit generated version snapshots manually.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for documentation ownership, bilingual
content requirements, and validation steps.

## License

Skel Site is open source under the [Apache License 2.0](LICENSE).
