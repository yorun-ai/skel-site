import {mkdir, readFile, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'
import type {LoadContext, Plugin} from '@docusaurus/types'
import type {
  DocMetadata,
  LoadedContent,
} from '@docusaurus/plugin-content-docs'
import {
  contractStages,
  guideGroups,
  skelMechanisms,
  type LocalizedCopy,
} from '../data/developerLanding'

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
  const copy = ({id, text}: LocalizedCopy) => translate(id, text)
  const renderStages = contractStages
    .map((stage) => `**${copy(stage.title)}** \`${stage.artifact}\``)
    .join(' → ')
  const renderMechanisms = skelMechanisms
    .map((mechanism) => {
      const markers = mechanism.markers
        .map((marker) => `\`${marker}\``)
        .join(' · ')
      const links = mechanism.links
        .map((link) => `[${copy(link.title)}](${link.to.slice(1)}.md)`)
        .join(' · ')

      return [
        `### ${copy(mechanism.title)}`,
        '',
        `**${copy(mechanism.label)}** · ${markers}`,
        '',
        copy(mechanism.description),
        '',
        links,
      ].join('\n')
    })
    .join('\n\n')
  const renderGuideGroups = guideGroups
    .map(
      (group) =>
        `### ${copy(group.title)}\n\n${group.links
          .map(
            (link) =>
              `- [${copy(link.title)}](${link.to.slice(1)}.md) — ${copy(link.description)}`,
          )
          .join('\n')}`,
    )
    .join('\n\n')

  return [
    `# ${translate('homepage.title', 'Overview')}`,
    '',
    translate(
      'homepage.description',
      'Skel is a contract DSL and compiler for Vine applications. It puts domain types, caller identities, permissions, services, events, and tasks in one source that skelc can validate and generate.',
    ),
    `**${translate('homepage.description.ai', 'AI-generated changes meet a machine-checkable boundary before they enter application code.')}**`,
    '',
    `[${translate('homepage.actions.first', 'Create the first contract')}](getting-started.md) · [${translate('homepage.actions.language', 'Read the language model')}](language.md) · [${translate('homepage.actions.generate', 'Choose an output')}](generation.md)`,
    '',
    `## ${translate('homepage.sections.mechanisms.title', 'What the compiler keeps explicit')}`,
    '',
    translate(
      'homepage.sections.mechanisms.description',
      'Skel leaves algorithms to application code. It fixes the parts that domains, generated clients, and Vine runtime must agree on.',
    ),
    '',
    renderMechanisms,
    '',
    `## ${translate('homepage.sections.loop.title', 'From contract to application')}`,
    '',
    translate(
      'homepage.sections.loop.description',
      'Source, validation, generated code, and runtime integration stay separate, so each change has a clear review point.',
    ),
    '',
    renderStages,
    '',
    `## ${translate('homepage.sections.guides.title', 'Read by the job at hand')}`,
    '',
    translate(
      'homepage.sections.guides.description',
      'Start with the contract decision you need to make.',
    ),
    '',
    renderGuideGroups,
    '',
    `## ${translate('homepage.status.label', 'Before 1.0')}`,
    '',
    `${translate('homepage.status.description', 'Pin skelc in development and CI, then review generated diffs when the compiler or a public contract changes.')} [${translate('homepage.status.installation', 'Install skelc')}](installation.md) · [${translate('homepage.status.compatibility', 'Compatibility')}](compatibility.md)`,
  ].join('\n')
}

export default function markdownPagesPlugin({
  baseUrl,
  siteDir,
  codeTranslations,
}: LoadContext): Plugin {
  let docs: DocMetadata[] = []
  let developmentWrite = Promise.resolve()
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
        developmentWrite = developmentWrite.then(async () => {
          await rm(developmentOutputDir, {
            force: true,
            maxRetries: 4,
            recursive: true,
            retryDelay: 80,
          })
          await writeMarkdownPages({
            outputBaseUrl: baseUrl,
            outputDir: developmentOutputDir,
          })
        })
        await developmentWrite
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
