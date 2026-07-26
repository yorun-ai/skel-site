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

Use `pnpm dev:zh` for Simplified Chinese. Validate both locales with:

```bash
pnpm typecheck
pnpm build
```

## Deployment

Cloudflare Workers Builds deploys the generated Docusaurus site as static
assets for [skel.yorun.ai](https://skel.yorun.ai). Configure the connected Git
repository with:

```text
Build command: pnpm run build
Deploy command: pnpm exec wrangler deploy
```

The production branch is `main`. The Wrangler configuration publishes `build`
and serves Docusaurus's generated `404.html` for unmatched routes. It also owns
the `skel.yorun.ai` custom domain; update that route here instead of maintaining
it separately in the Cloudflare dashboard.

## Versioning

Documentation versions follow skelc releases:

```bash
pnpm docusaurus docs:version 0.10.0
```

Do not edit generated version snapshots manually.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for documentation ownership, bilingual
content requirements, and validation steps.

## License

Skel Site is open source under the [Apache License 2.0](LICENSE).
