import {mkdir, readFile, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'
import type {LoadContext, Plugin} from '@docusaurus/types'
import type {
  DocMetadata,
  LoadedContent,
} from '@docusaurus/plugin-content-docs'

type DocusaurusWebpackConfig = Exclude<
  ReturnType<NonNullable<Plugin['configureWebpack']>>,
  void
>

function withoutFrontMatter(source: string): string {
  return source.replace(
    /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,
    '',
  )
}

function sourcePath(siteDir: string, source: string): string {
  return source.startsWith('@site/')
    ? path.join(siteDir, source.slice('@site/'.length))
    : source
}

function markdownOutputPath({
  baseUrl,
  outDir,
  permalink,
}: {
  baseUrl: string
  outDir: string
  permalink: string
}): string {
  const relativePermalink = permalink.startsWith(baseUrl)
    ? permalink.slice(baseUrl.length)
    : permalink.replace(/^\/+/, '')
  const relativeMarkdownPath = relativePermalink.endsWith('/')
    ? `${relativePermalink}index.md`
    : `${relativePermalink}.md`

  return path.join(outDir, relativeMarkdownPath)
}

function overviewMarkdown(
  translate: (id: string, fallback: string) => string,
): string {
  const link = (
    titleId: string,
    title: string,
    descriptionId: string,
    description: string,
    target: string,
  ) =>
    `- [${translate(titleId, title)}](${target}.md) — ${translate(descriptionId, description)}`

  return [
    `# ${translate('homepage.title', 'Skel Developers')}`,
    '',
    translate(
      'homepage.description',
      'Design explicit application contracts and generate reliable, type-safe code.',
    ),
    '',
    `## ${translate('homepage.sections.gettingStarted', 'Getting started')}`,
    '',
    link(
      'homepage.cards.installation.title',
      'Install skelc',
      'homepage.cards.installation.description',
      'Install the Skel compiler and verify your local toolchain.',
      'installation',
    ),
    link(
      'homepage.cards.quickStart.title',
      'Quick start',
      'homepage.cards.quickStart.description',
      'Write, validate, and generate code from your first contract.',
      'getting-started',
    ),
    link(
      'homepage.cards.language.title',
      'Language overview',
      'homepage.cards.language.description',
      'Learn how Skel models domains, data, and application capabilities.',
      'language',
    ),
    link(
      'homepage.cards.contractDesign.title',
      'Contract design',
      'homepage.cards.contractDesign.description',
      'Design stable boundaries that can evolve across applications.',
      'contract-design',
    ),
    '',
    `## ${translate('homepage.sections.guides', 'Guides')}`,
    '',
    link(
      'homepage.cards.workflow.title',
      'Validation workflow',
      'homepage.cards.workflow.description',
      'Format and validate contracts locally and in CI.',
      'workflow',
    ),
    link(
      'homepage.cards.syntax.title',
      'Syntax reference',
      'homepage.cards.syntax.description',
      'Look up declarations, types, annotations, and language rules.',
      'syntax',
    ),
    link(
      'homepage.cards.generation.title',
      'Code generation',
      'homepage.cards.generation.description',
      'Generate Go, TypeScript, Go modules, and public contracts.',
      'generation',
    ),
    link(
      'homepage.cards.editor.title',
      'Editor integration',
      'homepage.cards.editor.description',
      'Use diagnostics, formatting, and language features in your editor.',
      'editor',
    ),
    link(
      'homepage.cards.vine.title',
      'Vine integration',
      'homepage.cards.vine.description',
      'Connect generated contracts to Vine applications and runtime types.',
      'vine-integration',
    ),
  ].join('\n')
}

export default function markdownPagesPlugin({
  baseUrl,
  siteDir,
  codeTranslations,
}: LoadContext): Plugin {
  let docs: DocMetadata[] = []
  const developmentOutputDir = path.join(
    siteDir,
    '.docusaurus',
    'skel-markdown-pages',
  )
  const isDevelopment = process.env.NODE_ENV === 'development'
  const translate = (id: string, fallback: string) =>
    codeTranslations[id] ?? fallback
  const markdownForDoc = async (doc: DocMetadata) =>
    doc.id === 'index'
      ? overviewMarkdown(translate)
      : withoutFrontMatter(
          await readFile(sourcePath(siteDir, doc.source), 'utf8'),
        ).trim()
  const writeMarkdownPages = async ({
    outputBaseUrl,
    outputDir,
  }: {
    outputBaseUrl: string
    outputDir: string
  }) => {
    await Promise.all(
      docs.map(async (doc) => {
        const outputPath = markdownOutputPath({
          baseUrl: outputBaseUrl,
          outDir: outputDir,
          permalink: doc.permalink,
        })

        await mkdir(path.dirname(outputPath), {recursive: true})
        await writeFile(
          outputPath,
          `${await markdownForDoc(doc)}\n`,
          'utf8',
        )
      }),
    )
  }

  return {
    name: 'skel-markdown-pages',
    configureWebpack() {
      if (!isDevelopment) return {}

      return {
        devServer: {
          static: [
            {
              directory: developmentOutputDir,
              publicPath: baseUrl,
              watch: false,
            },
          ],
        },
      } as DocusaurusWebpackConfig
    },
    async allContentLoaded({allContent}) {
      const docsContent = allContent[
        'docusaurus-plugin-content-docs'
      ]?.default as LoadedContent | undefined

      docs =
        docsContent?.loadedVersions.flatMap((version) => version.docs) ??
        []

      if (isDevelopment) {
        await rm(developmentOutputDir, {force: true, recursive: true})
        await writeMarkdownPages({
          outputBaseUrl: baseUrl,
          outputDir: developmentOutputDir,
        })
      }
    },
    async postBuild({baseUrl, outDir}) {
      await writeMarkdownPages({
        outputBaseUrl: baseUrl,
        outputDir: outDir,
      })
    },
  }
}
