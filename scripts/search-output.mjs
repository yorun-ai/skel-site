import assert from 'node:assert/strict'
import {readFile, readdir, writeFile} from 'node:fs/promises'
import path from 'node:path'

const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`))
  return match?.[1] ?? match?.[2] ?? match?.[3]
}
const canonical = (html) => {
  const tags = [...html.matchAll(/<link\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => attribute(tag, 'rel') === 'canonical')
  assert.equal(tags.length, 1, 'Each published document must have exactly one canonical')
  return attribute(tags[0], 'href')
}

/** Check the real bilingual output before it becomes deployable static assets. */
export async function finalizeSearchOutput(projectDir) {
  const output = path.join(projectDir, 'build')
  const read = (file) => readFile(path.join(output, file), 'utf8')
  const index = locations(await read('sitemap-index.xml'))
  assert.equal(index.length, 2, 'Both published languages must have a sitemap')
  const origin = new URL(index[0]).origin
  assert.deepEqual(index.map((url) => new URL(url).pathname).sort(),
    ['/sitemap.xml', '/zh-CN/sitemap.xml'])
  assert.ok((await read('robots.txt')).includes(`${origin}/sitemap-index.xml`))

  const pages = new Set()
  for (const sitemap of index) {
    const urls = locations(await read(new URL(sitemap).pathname))
    assert.ok(urls.length > 0, `Empty sitemap: ${sitemap}`)
    for (const url of urls) {
      assert.ok(!pages.has(url), `Duplicate sitemap URL: ${url}`)
      pages.add(url)
      const pathname = new URL(url).pathname
      assert.equal(new URL(url).origin, origin)
      assert.ok(!pathname.endsWith('/'), `Trailing slash in sitemap: ${url}`)
      assert.ok(!/\/(?:search)?$/.test(pathname), `Non-document in sitemap: ${url}`)
      const html = await read(`${pathname}.html`)
      assert.equal(canonical(html), url, `Canonical differs from sitemap: ${url}`)
      assert.match(html, /<h1[\s>]/, `Missing rendered heading: ${url}`)
      assert.doesNotMatch(html, /<meta[^>]*content=["']?noindex/, url)
      for (const match of html.matchAll(/<link\b[^>]*>/g)) {
        const tag = match[0]
        if (attribute(tag, 'rel') !== 'alternate' || !attribute(tag, 'hreflang')) continue
        const alternate = new URL(attribute(tag, 'href'))
        assert.equal(alternate.origin, origin)
        assert.ok(!alternate.pathname.endsWith('/'), `Trailing slash in alternate: ${alternate}`)
        assert.equal(canonical(await read(`${alternate.pathname}.html`)), alternate.href)
      }
    }
  }

  // Derive each Markdown canonical from HTML, including /docs/index.md -> /docs.
  const files = await readdir(output, {recursive: true})
  const markdown = files.filter((file) => /(?:^|\/)docs(?:\/.*)?\.md$/.test(file))
  assert.equal(markdown.length, pages.size, 'Every document must have one Markdown export')
  const headers = [(await readFile(path.join(projectDir, 'static/_headers'), 'utf8')).trim()]
  for (const file of markdown.sort()) {
    const htmlFile = file.endsWith('/index.md')
      ? file.slice(0, -'/index.md'.length) + '.html'
      : file.slice(0, -3) + '.html'
    const target = canonical(await read(htmlFile))
    assert.ok(pages.has(target), `Markdown canonical is not published: ${file}`)
    headers.push(`/${file}\n  Content-Type: text/markdown; charset=utf-8\n  Link: <${target}>; rel="canonical"`)
  }
  assert.ok(headers.length + 1 <= 100, 'Cloudflare supports at most 100 header rules')
  await writeFile(path.join(output, '_headers'), headers.join('\n\n') + '\n')

  for (const locale of ['', 'zh-CN/']) {
    const llms = await read(`${locale}llms.txt`)
    for (const [, href] of llms.matchAll(/\]\((https:[^)]+\.md)\)/g)) {
      const url = new URL(href)
      if (url.origin === origin) assert.ok((await read(url.pathname)).length > 0, href)
    }
    // Resolve overview links relative to the exported Markdown URL.
    const overviewPath = `/${locale}docs/index.md`
    for (const [, href] of (await read(overviewPath)).matchAll(/\]\(([^)]+\.md)\)/g)) {
      const url = new URL(href, `${origin}${overviewPath}`)
      if (url.origin === origin) assert.ok((await read(url.pathname)).length > 0, href)
    }
  }
  console.log(`[search] Verified ${pages.size} canonical documents and Markdown exports across both locales.`)
}
