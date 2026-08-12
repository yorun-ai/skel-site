export type SharedLanguage = 'en' | 'zh-CN'
export type SharedTheme = 'light' | 'dark'

const languageCookie = 'yorun_language'
const themeCookie = 'yorun_theme'
const cookieMaxAge = 60 * 60 * 24 * 365

function readCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  return match ? decodeURIComponent(match.slice(prefix.length)) : null
}

function writeCookie(name: string, value: string): void {
  const sharedDomain =
    window.location.hostname === 'yorun.ai' ||
    window.location.hostname.endsWith('.yorun.ai')
      ? '; Domain=.yorun.ai; Secure'
      : ''

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax${sharedDomain}`
}

export function languageFromPath(pathname: string): SharedLanguage {
  return /^\/zh-CN(?:\/|$)/.test(pathname) ? 'zh-CN' : 'en'
}

export function pathForLanguage(
  pathname: string,
  language: SharedLanguage,
): string {
  const unlocalizedPath =
    pathname.replace(/^\/zh-CN(?=\/|$)/, '') || '/'

  return language === 'zh-CN'
    ? `/zh-CN${unlocalizedPath === '/' ? '/' : unlocalizedPath}`
    : unlocalizedPath
}

export function readSharedLanguage(): SharedLanguage | null {
  const value = readCookie(languageCookie)
  return value === 'en' || value === 'zh-CN' ? value : null
}

export function writeSharedLanguage(language: SharedLanguage): void {
  writeCookie(languageCookie, language)
}

export function readSharedTheme(): SharedTheme | null {
  const value = readCookie(themeCookie)
  return value === 'light' || value === 'dark' ? value : null
}

export function writeSharedTheme(theme: SharedTheme): void {
  writeCookie(themeCookie, theme)
}

export function removeLegacyThemeStorage(): void {
  try {
    window.localStorage.removeItem('theme')
  } catch {
    // Storage can be unavailable in privacy-restricted contexts.
  }
}
