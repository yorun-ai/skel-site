import {writeFile} from 'node:fs/promises'
import path from 'node:path'
import type {LoadContext, Plugin} from '@docusaurus/types'

/** Publish sitemap discovery for the configured locales. */
export default function searchIndexPlugin({siteConfig, i18n}: LoadContext): Plugin {
  return {
    name: 'search-index',
    async postBuild({outDir}) {
      if (i18n.currentLocale !== i18n.defaultLocale) return
      const sitemaps = i18n.locales.map((locale) => {
        const baseUrl = i18n.localeConfigs[locale].baseUrl
        return new URL(`${baseUrl}sitemap.xml`, siteConfig.url).href
      })
      await writeFile(
        path.join(outDir, 'sitemap-index.xml'),
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          sitemaps.map((url) => `  <sitemap><loc>${url}</loc></sitemap>`).join('\n') +
          '\n</sitemapindex>\n',
        'utf8',
      )
      await writeFile(
        path.join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.url}/sitemap-index.xml\n`,
        'utf8',
      )
    },
  }
}
