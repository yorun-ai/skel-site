import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {useThemeConfig} from '@docusaurus/theme-common'
import {useNavbarSecondaryMenu} from '@docusaurus/theme-common/internal'
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle'
import NavbarItem, {type Props as NavbarItemConfig} from '@theme/NavbarItem'

import styles from './styles.module.css'

function useUtilityItems(): NavbarItemConfig[] {
  const items = useThemeConfig().navbar.items as NavbarItemConfig[]

  return items.filter((item) => {
    const className = 'className' in item ? item.className : undefined

    return (
      className?.includes('navbar-control--locale') ||
      className?.includes('navbar-github-link')
    )
  })
}

export default function NavbarMobileSidebarSecondaryMenu(): ReactNode {
  const secondaryMenu = useNavbarSecondaryMenu()
  const utilityItems = useUtilityItems()
  const navigationRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const updateScrollHint = useCallback(() => {
    const navigation = navigationRef.current
    if (!navigation) {
      return
    }

    const maxScrollTop = Math.max(
      0,
      navigation.scrollHeight - navigation.clientHeight,
    )
    setCanScrollDown(navigation.scrollTop < maxScrollTop - 1)
  }, [])

  useEffect(() => {
    const navigation = navigationRef.current
    if (!navigation) {
      return undefined
    }

    const resizeObserver = new ResizeObserver(updateScrollHint)
    const contentObserver = new MutationObserver(updateScrollHint)
    resizeObserver.observe(navigation)
    contentObserver.observe(navigation, {childList: true, subtree: true})
    updateScrollHint()

    return () => {
      resizeObserver.disconnect()
      contentObserver.disconnect()
    }
  }, [updateScrollHint])

  return (
    <div className={styles.layout}>
      <div className={styles.utilities}>
        <div
          className={`navbar__items navbar__items--right ${styles.utilityList}`}>
          {utilityItems.map((item, index) => (
            <NavbarItem {...item} key={index} />
          ))}
          <NavbarColorModeToggle />
        </div>
      </div>
      <div
        className={`${styles.navigation} ${canScrollDown ? styles.navigationCanScrollDown : ''}`}
        onScroll={updateScrollHint}
        ref={navigationRef}>
        {secondaryMenu.content}
      </div>
      <div className={styles.productLinks}>
        <a
          aria-label="Open Yorun Platform"
          className={styles.productSwitch}
          href="https://www.yorun.ai">
          <img
            alt=""
            aria-hidden="true"
            className={styles.yorunLogo}
            src="/brand/logo-simple.png"
          />
          <span>Yorun Platform</span>
        </a>
        <a
          aria-label="Switch to Vine Framework"
          className={styles.productSwitch}
          href="https://vine.yorun.ai">
          <img
            alt=""
            aria-hidden="true"
            className={styles.productLogo}
            src="/brand/vine-product.png"
          />
          <span>Vine Framework</span>
        </a>
      </div>
    </div>
  )
}
