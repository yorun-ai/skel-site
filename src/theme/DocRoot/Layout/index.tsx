import React, {type ReactNode, useEffect} from 'react'
import {useLocation} from '@docusaurus/router'
import DocRootLayout from '@theme-original/DocRoot/Layout'
import type {Props} from '@theme/DocRoot/Layout'

export default function DocRootLayoutWrapper(props: Props): ReactNode {
  const {pathname} = useLocation()

  useEffect(() => {
    const sidebar = document.querySelector<HTMLElement>(
      '.theme-doc-sidebar-container',
    )
    if (!sidebar) {
      return undefined
    }

    const pageScrollContainer = document.querySelector<HTMLElement>(
      '.docs-doc-page .main-wrapper',
    )
    const navbar = document.querySelector<HTMLElement>(
      '.docs-doc-page .navbar',
    )
    const updateNavbarScrollHint = () => {
      navbar?.classList.toggle(
        'docs-navbar-has-page-scroll',
        (pageScrollContainer?.scrollTop ?? 0) > 1,
      )
    }
    let hidePageScrollbarTimer: number | undefined
    const showPageScrollbarWhileScrolling = () => {
      if (!pageScrollContainer) {
        return
      }

      updateNavbarScrollHint()
      pageScrollContainer.classList.add('docs-page-is-scrolling')
      if (hidePageScrollbarTimer !== undefined) {
        window.clearTimeout(hidePageScrollbarTimer)
      }
      hidePageScrollbarTimer = window.setTimeout(() => {
        pageScrollContainer.classList.remove('docs-page-is-scrolling')
      }, 700)
    }

    pageScrollContainer?.addEventListener(
      'scroll',
      showPageScrollbarWhileScrolling,
      {passive: true},
    )
    updateNavbarScrollHint()

    const keepViewportPinned = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo({left: 0, top: 0, behavior: 'auto'})
      }
    }
    window.addEventListener('scroll', keepViewportPinned, {passive: true})
    keepViewportPinned()

    const sidebarMenu =
      sidebar.querySelector<HTMLElement>('.menu')
    let hideScrollbarTimer: number | undefined
    const updateSidebarScrollHints = () => {
      if (!sidebarMenu) {
        return
      }

      const maxScrollTop = Math.max(
        0,
        sidebarMenu.scrollHeight - sidebarMenu.clientHeight,
      )
      sidebarMenu.classList.toggle(
        'docs-sidebar-can-scroll-up',
        sidebarMenu.scrollTop > 1,
      )
      sidebarMenu.classList.toggle(
        'docs-sidebar-can-scroll-down',
        sidebarMenu.scrollTop < maxScrollTop - 1,
      )
    }
    const showScrollbarWhileScrolling = () => {
      if (!sidebarMenu) {
        return
      }

      updateSidebarScrollHints()
      sidebarMenu.classList.add('docs-sidebar-menu-is-scrolling')
      if (hideScrollbarTimer !== undefined) {
        window.clearTimeout(hideScrollbarTimer)
      }
      hideScrollbarTimer = window.setTimeout(() => {
        sidebarMenu.classList.remove('docs-sidebar-menu-is-scrolling')
      }, 700)
    }

    sidebarMenu?.addEventListener('wheel', showScrollbarWhileScrolling, {
      passive: true,
    })
    sidebarMenu?.addEventListener('scroll', showScrollbarWhileScrolling, {
      passive: true,
    })
    sidebarMenu?.addEventListener(
      'transitionend',
      updateSidebarScrollHints,
    )

    const sidebarContentObserver = new MutationObserver(
      updateSidebarScrollHints,
    )
    if (sidebarMenu) {
      sidebarContentObserver.observe(sidebarMenu, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        childList: true,
        subtree: true,
      })
    }

    const sidebarMenuResizeObserver = new ResizeObserver(
      updateSidebarScrollHints,
    )
    if (sidebarMenu) {
      sidebarMenuResizeObserver.observe(sidebarMenu)
    }
    updateSidebarScrollHints()

    return () => {
      sidebarContentObserver.disconnect()
      sidebarMenuResizeObserver.disconnect()
      sidebarMenu?.removeEventListener('wheel', showScrollbarWhileScrolling)
      sidebarMenu?.removeEventListener('scroll', showScrollbarWhileScrolling)
      sidebarMenu?.removeEventListener(
        'transitionend',
        updateSidebarScrollHints,
      )
      pageScrollContainer?.removeEventListener(
        'scroll',
        showPageScrollbarWhileScrolling,
      )
      navbar?.classList.remove('docs-navbar-has-page-scroll')
      window.removeEventListener('scroll', keepViewportPinned)
      if (hideScrollbarTimer !== undefined) {
        window.clearTimeout(hideScrollbarTimer)
      }
      if (hidePageScrollbarTimer !== undefined) {
        window.clearTimeout(hidePageScrollbarTimer)
      }
    }
  }, [])

  useEffect(() => {
    if (window.location.hash) {
      return
    }

    document
      .querySelector<HTMLElement>('.docs-doc-page .main-wrapper')
      ?.scrollTo({left: 0, top: 0, behavior: 'auto'})
  }, [pathname])

  useEffect(() => {
    const keepCurrentSidebarItemVisible = () => {
      const sidebarMenu = document.querySelector<HTMLElement>(
        '.theme-doc-sidebar-container .menu',
      )
      const activeLink = sidebarMenu?.querySelector<HTMLElement>(
        '.menu__link--active:not(.menu__link--sublist)',
      )
      if (!sidebarMenu || !activeLink) {
        return
      }

      const menuRect = sidebarMenu.getBoundingClientRect()
      const activeRect = activeLink.getBoundingClientRect()
      const menuStyle = window.getComputedStyle(sidebarMenu)
      const fadeClearance =
        Number.parseFloat(
          menuStyle.getPropertyValue('--sidebar-scroll-fade-size'),
        ) || 56
      const edgePadding = 8
      const visibleTop =
        Math.max(0, menuRect.top) +
        (sidebarMenu.scrollTop > 1 ? fadeClearance : edgePadding)
      const maxScrollTop = Math.max(
        0,
        sidebarMenu.scrollHeight - sidebarMenu.clientHeight,
      )
      const visibleBottom =
        Math.min(window.innerHeight, menuRect.bottom) -
        (sidebarMenu.scrollTop < maxScrollTop - 1
          ? fadeClearance
          : edgePadding)
      let scrollDelta = 0

      if (activeRect.top < visibleTop) {
        scrollDelta = activeRect.top - visibleTop
      } else if (activeRect.bottom > visibleBottom) {
        scrollDelta = activeRect.bottom - visibleBottom
      }

      if (Math.abs(scrollDelta) > 1) {
        sidebarMenu.scrollTo({
          behavior: 'auto',
          top: Math.max(0, sidebarMenu.scrollTop + scrollDelta),
        })
      }
    }

    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(keepCurrentSidebarItemVisible)
      })
    }, 180)

    return () => window.clearTimeout(timer)
  }, [pathname])

  return <DocRootLayout {...props} />
}
