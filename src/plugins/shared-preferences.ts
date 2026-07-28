import type {Plugin} from '@docusaurus/types'

const bootstrapScript = String.raw`
!function () {
  var cookieDomain =
    location.hostname === 'yorun.ai' || location.hostname.endsWith('.yorun.ai')
      ? '; Domain=.yorun.ai; Secure'
      : ''
  var writeCookie = function (name, value) {
    document.cookie =
      encodeURIComponent(name) +
      '=' +
      encodeURIComponent(value) +
      '; Path=/; Max-Age=31536000; SameSite=Lax' +
      cookieDomain
  }
  var readCookie = function (name) {
    var prefix = encodeURIComponent(name) + '='
    var item = document.cookie
      .split(';')
      .map(function (part) { return part.trim() })
      .find(function (part) { return part.indexOf(prefix) === 0 })
    return item ? decodeURIComponent(item.slice(prefix.length)) : null
  }

  try {
    localStorage.removeItem('theme')
  } catch (_) {}

  var theme = readCookie('yorun_theme')
  if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
    theme = 'light'
    writeCookie('yorun_theme', theme)
  }
  var effectiveTheme =
    theme === 'system'
      ? matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme
  document.documentElement.setAttribute('data-theme', effectiveTheme)
  document.documentElement.setAttribute('data-theme-choice', theme)

  var pathIsChinese = /^\/zh-CN(?:\/|$)/.test(location.pathname)
  var language = readCookie('yorun_language')
  if (pathIsChinese) {
    if (language !== 'zh-CN') writeCookie('yorun_language', 'zh-CN')
  } else if (language === 'zh-CN') {
    location.replace(
      '/zh-CN' +
        (location.pathname === '/' ? '/' : location.pathname) +
        location.search +
        location.hash,
    )
  } else if (language !== 'en') {
    writeCookie('yorun_language', 'en')
  }
}()
`

export default function sharedPreferencesPlugin(): Plugin {
  return {
    name: 'yorun-shared-preferences',
    injectHtmlTags() {
      return {
        postBodyTags: [
          {
            tagName: 'script',
            innerHTML: bootstrapScript,
          },
        ],
      }
    },
  }
}
