import type {DocMetadata} from '@docusaurus/plugin-content-docs'

/** Build each locale's index from the same metadata as the published docs. */
export function llmsText(
  docs: DocMetadata[],
  origin: string,
  baseUrl: string,
  locale: string,
): string {
  const zh = locale === 'zh-CN'
  const clean = (text: string) => text.replace(/\s+/g, ' ').trim()
  const entries = [...docs]
    .sort((a, b) => a.permalink.localeCompare(b.permalink))
    .map((doc) => {
      const markdownPath = doc.permalink.endsWith('/')
        ? `${doc.permalink}index.md`
        : `${doc.permalink}.md`
      const title = clean(doc.title).replace(/([\[\]\\])/g, '\\$1')
      const description =
        typeof doc.frontMatter.description === 'string'
          ? `: ${clean(doc.frontMatter.description)}`
          : ''
      return `- [${title}](${new URL(markdownPath, origin).href})${description}`
    })

  return [
    '# Skel',
    '',
    `> ${zh ? 'Skel 是采用 Apache-2.0 许可证的契约语言及 skelc 工具链。在 .skel 文件中描述领域类型、Actor、认证、权限、服务、事件与任务，校验契约后生成 Go、TypeScript 或公开 Skel 输出。' : 'Skel is an Apache-2.0 contract language and skelc toolchain. Describe domain types, actors, authentication, permissions, services, events and tasks in .skel files, then validate contracts and generate Go, TypeScript or public Skel outputs.'}`,
    '',
    zh
      ? '工作流程覆盖安装、格式化、语义检查、Schema 查询与差异比较、代码生成、诊断及基于 LSP 的编辑器集成。业务算法、数据库模型和部署配置属于应用职责；契约校验不能替代应用测试或人工审查。'
      : 'The workflow covers installation, formatting, semantic checks, schema queries and diffs, code generation, diagnostics and editor integration through LSP. Business algorithms, database models and deployment configuration remain application concerns. Contract validation does not replace application tests or human review.',
    '',
    zh
      ? '本站维护 Skel 语言规则、skelc 用法及生成契约边界。应用装配、运行时行为和部署说明由 Vine 文档维护。'
      : 'This site owns Skel language rules, skelc usage and generated contract boundaries. Application assembly, runtime behavior and deployment belong to the Vine documentation.',
    '',
    zh
      ? '1.0 之前仅维护当前 next 文档，内容跟踪当前源码，可能领先于最新发布版本。请固定经过验证的工具链版本，并在升级前阅读兼容性说明。'
      : 'Before 1.0, only current next documentation is maintained. It tracks current source and may be ahead of the latest release. Pin reviewed toolchain revisions and consult the compatibility guide before upgrading.',
    '',
    zh
      ? '下列链接指向已发布文档的 Markdown 导出版本。'
      : 'The links below point to Markdown exports of the published documentation.',
    '',
    zh ? '## 文档' : '## Documentation',
    '',
    ...entries,
    '',
    '## Optional',
    '',
    `- [Vine framework](https://vine.yorun.ai/): ${zh ? '相关项目的官方文档。' : 'Official documentation for the related project.'}`,
    `- [Yorun](https://www.yorun.ai/): ${zh ? '商业产品工作台；其开放状态以官网说明为准。' : 'The commercial product workbench; consult its website for availability.'}`,
    `- [${zh ? 'English' : '中文'}](${new URL(zh ? '/llms.txt' : '/zh-CN/llms.txt', origin).href}): ${zh ? '英文文档索引。' : 'Chinese documentation index.'}`,
    `- [Sitemap](${new URL(`${baseUrl}sitemap.xml`, origin).href}): ${zh ? '本站页面索引。' : 'Published site pages.'}`,
    '',
  ].join('\n')
}
