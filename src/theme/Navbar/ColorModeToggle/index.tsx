import React, {type ReactNode, useEffect} from 'react'
import {
  useColorMode,
  useThemeConfig,
  type ColorMode,
} from '@docusaurus/theme-common'
import ColorModeToggle from '@theme/ColorModeToggle'
import type {Props} from '@theme/Navbar/ColorModeToggle'

import {
  readSharedTheme,
  removeLegacyThemeStorage,
  writeSharedTheme,
  type SharedTheme,
} from '../../../utils/sharedPreferences'
import styles from './styles.module.css'

type PersistlessSetColorMode = (
  colorMode: ColorMode | null,
  options: {persist: false},
) => void

function systemColorMode(): SharedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function NavbarColorModeToggle({
  className,
}: Props): ReactNode {
  const navbarStyle = useThemeConfig().navbar.style
  const {disableSwitch, respectPrefersColorScheme} =
    useThemeConfig().colorMode
  const {colorModeChoice: currentChoice, setColorMode} = useColorMode()
  const setWithoutLocalStorage =
    setColorMode as PersistlessSetColorMode

  useEffect(() => {
    const synchronizeTheme = () => {
      removeLegacyThemeStorage()

      const preferredTheme = readSharedTheme()
      if (!preferredTheme) {
        const initialTheme = currentChoice ?? systemColorMode()
        writeSharedTheme(initialTheme)
        setWithoutLocalStorage(initialTheme, {persist: false})
        return
      }

      const currentAttribute =
        document.documentElement.getAttribute('data-theme-choice')
      if (currentAttribute !== preferredTheme) {
        setWithoutLocalStorage(preferredTheme, {
          persist: false,
        })
      }
    }
    const synchronizeWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        synchronizeTheme()
      }
    }

    synchronizeTheme()
    document.addEventListener('visibilitychange', synchronizeWhenVisible)
    window.addEventListener('focus', synchronizeTheme)
    window.addEventListener('pageshow', synchronizeTheme)

    return () => {
      document.removeEventListener(
        'visibilitychange',
        synchronizeWhenVisible,
      )
      window.removeEventListener('focus', synchronizeTheme)
      window.removeEventListener('pageshow', synchronizeTheme)
    }
  }, [currentChoice, setWithoutLocalStorage])

  if (disableSwitch) {
    return null
  }

  return (
    <ColorModeToggle
      buttonClassName={
        navbarStyle === 'dark'
          ? styles.darkNavbarColorModeToggle
          : undefined
      }
      className={className}
      onChange={(nextChoice) => {
        const nextTheme = nextChoice ?? systemColorMode()
        writeSharedTheme(nextTheme)
        setWithoutLocalStorage(nextTheme, {persist: false})
        removeLegacyThemeStorage()
      }}
      respectPrefersColorScheme={respectPrefersColorScheme}
      value={currentChoice}
    />
  )
}
