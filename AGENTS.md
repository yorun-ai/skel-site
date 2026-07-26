# Skel Site Agent Guidelines

## Project Scope

- This repository is the public site for the Skel language and skelc toolchain.
- It owns Skel product pages, language guides and reference, skelc installation and CLI usage, diagnostics, code generation, LSP and editor integration, and release documentation.
- Vine framework documentation belongs to `vine-site`. Link to `https://vine.yorun.ai` instead of duplicating it here.
- Internal tools and non-public projects must not appear in public content, navigation, examples, release notes, or architecture diagrams.
- Keep implementation-specific source documentation in the owning source repository.

## Documentation Ownership

- English source documents live under `docs`.
- Simplified Chinese translations live under
  `i18n/zh-CN/docusaurus-plugin-content-docs/current`.
- Keep English source documents and their Simplified Chinese translations
  synchronized.
- Vine integration pages may describe the generated contract boundary, but Vine application and runtime behavior remain owned by `vine-site`.

## Versioning

- Site documentation versions follow skelc releases.
- Create snapshots with `pnpm docusaurus docs:version VERSION`.
- Do not manually edit generated version snapshots. Correct current documentation first, then create a new snapshot.
- Compatibility documentation must state the relevant skelc and Vine versions when behavior depends on both.

## Site Development

- Preserve the shared Yorun visual language and local Tailwind/shadcn theme implementation.
- Keep links valid in both locales. Use `/docs/...` for this site and absolute `https://vine.yorun.ai/docs/...` links for Vine content.
- Do not document planned syntax, commands, flags, or behavior as available.
- Run `pnpm typecheck`, `pnpm build`, and `git diff --check` after changes.
