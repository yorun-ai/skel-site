import React, {type ReactNode, useEffect} from 'react'

import {
  languageFromPath,
  pathForLanguage,
  readSharedLanguage,
  writeSharedLanguage,
} from '../../utils/sharedPreferences'

function synchronizeLanguage(): void {
  const preferredLanguage = readSharedLanguage()
  const currentLanguage = languageFromPath(window.location.pathname)

  if (!preferredLanguage) {
    writeSharedLanguage(currentLanguage)
    return
  }

  if (preferredLanguage !== currentLanguage) {
    window.location.replace(
      `${pathForLanguage(window.location.pathname, preferredLanguage)}${window.location.search}${window.location.hash}`,
    )
  }
}

export default function Root({children}: {children: ReactNode}): ReactNode {
  useEffect(() => {
    const recordLinkLanguage = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return

      const link = event.target.closest<HTMLAnchorElement>('a[href]')
      if (!link) return

      const target = new URL(link.href, window.location.href)
      if (target.origin !== window.location.origin) return

      writeSharedLanguage(languageFromPath(target.pathname))
    }
    const synchronizeWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        synchronizeLanguage()
      }
    }

    document.addEventListener('click', recordLinkLanguage, true)
    document.addEventListener('visibilitychange', synchronizeWhenVisible)
    window.addEventListener('focus', synchronizeLanguage)
    window.addEventListener('pageshow', synchronizeLanguage)

    return () => {
      document.removeEventListener('click', recordLinkLanguage, true)
      document.removeEventListener(
        'visibilitychange',
        synchronizeWhenVisible,
      )
      window.removeEventListener('focus', synchronizeLanguage)
      window.removeEventListener('pageshow', synchronizeLanguage)
    }
  }, [])

  return children
}
