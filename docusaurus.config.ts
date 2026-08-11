import type {Config, Plugin} from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import {themes as prismThemes} from 'prism-react-renderer'
import remarkRemoveCjkSoftBreaks from './src/remark/remove-cjk-soft-breaks'

const devLocale = process.env.YORUN_DEV_LOCALE
const devWebSocketPath = devLocale
  ? `/__yorun_hmr_${devLocale.replace(/-/g, '_')}`
  : undefined
type DocusaurusWebpackConfig = Exclude<
  ReturnType<NonNullable<Plugin['configureWebpack']>>,
  void
>

const config: Config = {
  title: 'Skel',
  tagline: 'A contract language and toolchain for type-safe applications',
  favicon: 'favicon.ico',
  url: 'https://skel.yorun.ai',
  baseUrl: '/',
  organizationName: 'yorun-ai',
  projectName: 'skel-site',
  onBrokenLinks: 'throw',
  future: {
    faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      mdxCrossCompilerCache: true,
      rspackBundler: true,
      // Two locale-specific dev servers run concurrently behind the local
      // bilingual proxy. Do not let them write to the same persistent cache.
      rspackPersistentCache: process.env.YORUN_MULTILINGUAL_DEV !== '1',
      ssgWorkerThreads: false,
      gitEagerVcs: true,
    },
  },
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-CN'],
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en',
        baseUrl: '/',
      },
      'zh-CN': {
        label: '中文',
        htmlLang: 'zh-CN',
        baseUrl: '/zh-CN/',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: './docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkRemoveCjkSoftBreaks],
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
          versions: {
            current: {
              label: 'next',
              badge: false,
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    ['./src/plugins/tailwind.ts', {}],
    ['./src/plugins/aliases.ts', {}],
    ['./src/plugins/markdown-pages.ts', {}],
    ['./src/plugins/shared-preferences.ts', {}],
    ...(devWebSocketPath
      ? [
          () => ({
            name: 'yorun-multilingual-dev',
            configureWebpack: () =>
              // Docusaurus merges this into webpack-dev-server at runtime,
              // although its public webpack config type omits devServer.
              ({
                devServer: {
                  client: {
                    webSocketURL: {
                      pathname: devWebSocketPath,
                    },
                  },
                  webSocketServer: {
                    options: {
                      path: devWebSocketPath,
                    },
                  },
                },
              }) as unknown as DocusaurusWebpackConfig,
          }),
        ]
      : []),
  ],
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: 'filename',
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: 'docs',
        docsPluginIdForPreferredVersion: 'default',
        docsDir: [
          'docs',
          'i18n/zh-CN/docusaurus-plugin-content-docs',
        ],
        language: ['en', 'zh'],
        searchBarPosition: 'right',
        searchBarShortcutKeymap: 'mod+k',
        explicitSearchResultPath: true,
        removeDefaultStopWordFilter: ['en'],
      } satisfies import('@easyops-cn/docusaurus-search-local').PluginOptions,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Skeleton DSL',
      logo: {
        alt: 'Skel',
        src: 'brand/skel-navbar.png',
        width: 28,
        height: 28,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://vine.yorun.ai',
          label: 'Vine',
          position: 'left',
        },
        {
          type: 'search',
          className: 'navbar-search-control',
          position: 'right',
        },
        {
          type: 'docsVersionDropdown',
          className: 'navbar-control navbar-control--version',
          position: 'right',
          dropdownActiveClassDisabled: true,
        },
        {
          type: 'localeDropdown',
          className: 'navbar-control navbar-control--locale',
          position: 'right',
        },
        {
          className: 'navbar-github-link',
          href: 'https://github.com/yorun-ai/skelc',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Cartopeira Pte. Ltd.`,
    },
    prism: {
      additionalLanguages: ['go', 'bash', 'yaml', 'http', 'typescript', 'json'],
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    mermaid: {
      theme: {
        light: 'neutral',
        dark: 'dark',
      },
      options: {
        look: 'classic',
        layout: 'dagre',
        htmlLabels: true,
        fontFamily:
          "'Geist', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        flowchart: {
          curve: 'rounded',
          diagramPadding: 16,
          nodeSpacing: 48,
          rankSpacing: 64,
        },
      },
    },
  } satisfies Preset.ThemeConfig,
}

export default config
