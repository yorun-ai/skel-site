import React, {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {useLocation} from '@docusaurus/router'
import DocRootLayout from '@theme-original/DocRoot/Layout'
import type {Props} from '@theme/DocRoot/Layout'

import {Separator} from '@/components/ui/separator'

const defaultSidebarWidth = 280
const minSidebarWidth = 220
const maxSidebarWidth = 360
const storageKey = 'skel.docs.sidebarWidth.v2'

const clampSidebarWidth = (width: number) =>
  Math.min(maxSidebarWidth, Math.max(minSidebarWidth, width))

export default function DocRootLayoutWrapper(props: Props): ReactNode {
  const {pathname} = useLocation()
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth)
  const [sidebarAvailable, setSidebarAvailable] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    let initialWidth = defaultSidebarWidth
    try {
      const storedWidth = Number(window.localStorage.getItem(storageKey))
      if (Number.isFinite(storedWidth) && storedWidth > 0) {
        initialWidth = clampSidebarWidth(storedWidth)
      }
    } catch {
      // Resizing still works if storage is disabled.
    }

    setSidebarWidth(initialWidth)
    document.documentElement.style.setProperty(
      '--doc-sidebar-width',
      `${initialWidth}px`,
    )

    const sidebar = document.querySelector<HTMLElement>(
      '.theme-doc-sidebar-container',
    )
    setSidebarAvailable(Boolean(sidebar))
    if (!sidebar) {
      return undefined
    }

    const pageScrollContainer = document.querySelector<HTMLElement>(
      '.docs-doc-page .main-wrapper',
    )
    let hidePageScrollbarTimer: number | undefined
    const showPageScrollbarWhileScrolling = () => {
      if (!pageScrollContainer) {
        return
      }

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

    const keepViewportPinned = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo({left: 0, top: 0, behavior: 'auto'})
      }
    }
    window.addEventListener('scroll', keepViewportPinned, {passive: true})
    keepViewportPinned()

    const syncCollapsedState = () => {
      setSidebarCollapsed(sidebar.getBoundingClientRect().width < 80)
    }
    const observer = new MutationObserver(syncCollapsedState)
    observer.observe(sidebar, {attributes: true, attributeFilter: ['class']})
    sidebar.addEventListener('transitionend', syncCollapsedState)
    syncCollapsedState()

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

    const sidebarResizeObserver = new ResizeObserver(
      updateSidebarScrollHints,
    )
    if (sidebarMenu) {
      sidebarResizeObserver.observe(sidebarMenu)
    }
    updateSidebarScrollHints()

    return () => {
      observer.disconnect()
      sidebarContentObserver.disconnect()
      sidebarResizeObserver.disconnect()
      sidebar.removeEventListener('transitionend', syncCollapsedState)
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

  const updateSidebarWidth = useCallback((width: number) => {
    const nextWidth = clampSidebarWidth(width)
    setSidebarWidth(nextWidth)
    document.documentElement.style.setProperty(
      '--doc-sidebar-width',
      `${nextWidth}px`,
    )
    try {
      window.localStorage.setItem(storageKey, String(nextWidth))
    } catch {
      // The current page still resizes when storage is disabled.
    }
  }, [])

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = sidebarWidth
      event.currentTarget.setPointerCapture(event.pointerId)
      document.body.classList.add('docs-sidebar-is-resizing')

      const resize = (moveEvent: PointerEvent) => {
        updateSidebarWidth(startWidth + moveEvent.clientX - startX)
      }
      const stopResize = () => {
        document.body.classList.remove('docs-sidebar-is-resizing')
        window.removeEventListener('pointermove', resize)
        window.removeEventListener('pointerup', stopResize)
        window.removeEventListener('pointercancel', stopResize)
      }

      window.addEventListener('pointermove', resize)
      window.addEventListener('pointerup', stopResize)
      window.addEventListener('pointercancel', stopResize)
    },
    [sidebarWidth, updateSidebarWidth],
  )

  const resizeWithKeyboard = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        updateSidebarWidth(sidebarWidth + (event.key === 'ArrowLeft' ? -12 : 12))
      } else if (event.key === 'Home') {
        event.preventDefault()
        updateSidebarWidth(defaultSidebarWidth)
      }
    },
    [sidebarWidth, updateSidebarWidth],
  )

  return (
    <>
      <DocRootLayout {...props} />
      {sidebarAvailable && !sidebarCollapsed && (
        <Separator
          aria-label="Resize sidebar"
          aria-valuemax={maxSidebarWidth}
          aria-valuemin={minSidebarWidth}
          aria-valuenow={sidebarWidth}
          className="docs-sidebar-resizer bg-transparent data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-[9px]"
          decorative={false}
          onDoubleClick={() => updateSidebarWidth(defaultSidebarWidth)}
          onKeyDown={resizeWithKeyboard}
          onPointerDown={startResize}
          orientation="vertical"
          tabIndex={0}
          title="Drag to resize; double-click to reset"
        />
      )}
    </>
  )
}
