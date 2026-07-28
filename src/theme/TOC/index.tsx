import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import clsx from 'clsx'
import TOCItems from '@theme/TOCItems'
import type {Props} from '@theme/TOC'

import CopyPageControl from './CopyPageControl'
import styles from './styles.module.css'

const linkClassName = 'table-of-contents__link toc-highlight'
const linkActiveClassName = 'table-of-contents__link--active'

type IndicatorPosition = {
  height: number
  left: number
  top: number
  visible: boolean
}

type DockPosition = {
  height: number
  left: number
  top: number
  width: number
}

type ScrollHints = {
  bottom: boolean
  top: boolean
}

const hiddenIndicator: IndicatorPosition = {
  height: 0,
  left: 0,
  top: 0,
  visible: false,
}

export default function TOC({className, ...props}: Props): ReactNode {
  const shellRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const dockFrameRef = useRef<number | null>(null)
  const [indicator, setIndicator] =
    useState<IndicatorPosition>(hiddenIndicator)
  const [dockPosition, setDockPosition] = useState<DockPosition | null>(null)
  const [scrollHints, setScrollHints] = useState<ScrollHints>({
    bottom: false,
    top: false,
  })

  const updateIndicator = useCallback(() => {
    const container = containerRef.current
    const list = container?.querySelector<HTMLElement>('.table-of-contents')
    const activeLink = container?.querySelector<HTMLElement>(
      `.${linkActiveClassName}`,
    )

    if (!container || !list || !activeLink) {
      setIndicator(hiddenIndicator)
      return
    }

    const containerRect = container.getBoundingClientRect()
    const listRect = list.getBoundingClientRect()
    const activeRect = activeLink.getBoundingClientRect()
    const verticalInset = 4
    const nextIndicator: IndicatorPosition = {
      height: Math.max(2, activeRect.height - verticalInset * 2),
      left: listRect.left - containerRect.left + container.scrollLeft,
      top:
        activeRect.top -
        containerRect.top +
        container.scrollTop +
        verticalInset,
      visible: true,
    }

    setIndicator((current) =>
      current.height === nextIndicator.height &&
      current.left === nextIndicator.left &&
      current.top === nextIndicator.top &&
      current.visible === nextIndicator.visible
        ? current
        : nextIndicator,
    )
  }, [])

  const updateScrollHints = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const maxScrollTop = Math.max(
      0,
      container.scrollHeight - container.clientHeight,
    )
    const nextHints: ScrollHints = {
      bottom: container.scrollTop < maxScrollTop - 1,
      top: container.scrollTop > 1,
    }

    setScrollHints((current) =>
      current.bottom === nextHints.bottom &&
      current.top === nextHints.top
        ? current
        : nextHints,
    )
  }, [])

  const scheduleIndicatorUpdate = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null
      updateIndicator()
      updateScrollHints()
    })
  }, [updateIndicator, updateScrollHints])

  const updateDockPosition = useCallback(() => {
    const shell = shellRef.current
    const column = shell?.parentElement
    const layoutContainer = shell?.closest<HTMLElement>(
      'main > .container',
    )
    const navbar = document.querySelector<HTMLElement>('.navbar')

    if (
      !shell ||
      !column ||
      !layoutContainer ||
      window.innerWidth <= 996
    ) {
      setDockPosition(null)
      return
    }

    const columnRect = column.getBoundingClientRect()
    const columnStyle = window.getComputedStyle(column)
    const paddingLeft = Number.parseFloat(columnStyle.paddingLeft) || 0
    const paddingRight = Number.parseFloat(columnStyle.paddingRight) || 0
    const contentTop =
      Number.parseFloat(window.getComputedStyle(layoutContainer).paddingTop) ||
      0
    const navbarBottom = navbar?.getBoundingClientRect().bottom ?? 0
    const bottomGap = Math.max(16, contentTop)
    const round = (value: number) => Math.round(value * 100) / 100
    const nextPosition: DockPosition = {
      height: round(
        Math.max(0, window.innerHeight - navbarBottom - contentTop - bottomGap),
      ),
      left: round(columnRect.left + paddingLeft),
      top: round(navbarBottom + contentTop),
      width: round(
        Math.max(0, columnRect.width - paddingLeft - paddingRight),
      ),
    }

    setDockPosition((current) =>
      current?.height === nextPosition.height &&
      current.left === nextPosition.left &&
      current.top === nextPosition.top &&
      current.width === nextPosition.width
        ? current
        : nextPosition,
    )
  }, [])

  const scheduleDockUpdate = useCallback(() => {
    if (dockFrameRef.current !== null) {
      cancelAnimationFrame(dockFrameRef.current)
    }
    dockFrameRef.current = requestAnimationFrame(() => {
      dockFrameRef.current = null
      updateDockPosition()
    })
  }, [updateDockPosition])

  useEffect(() => {
    const shell = shellRef.current
    const column = shell?.parentElement
    const layoutContainer = shell?.closest<HTMLElement>(
      'main > .container',
    )
    if (!shell || !column || !layoutContainer) {
      return undefined
    }

    const resizeObserver = new ResizeObserver(scheduleDockUpdate)
    resizeObserver.observe(column)
    resizeObserver.observe(layoutContainer)

    const rootStyleObserver = new MutationObserver(scheduleDockUpdate)
    rootStyleObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    })

    window.addEventListener('resize', scheduleDockUpdate)
    scheduleDockUpdate()

    return () => {
      resizeObserver.disconnect()
      rootStyleObserver.disconnect()
      window.removeEventListener('resize', scheduleDockUpdate)
      if (dockFrameRef.current !== null) {
        cancelAnimationFrame(dockFrameRef.current)
      }
    }
  }, [scheduleDockUpdate])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return undefined
    }

    const mutationObserver = new MutationObserver(scheduleIndicatorUpdate)
    mutationObserver.observe(container, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
    })

    const resizeObserver = new ResizeObserver(scheduleIndicatorUpdate)
    resizeObserver.observe(container)
    container
      .querySelectorAll<HTMLElement>('.table-of-contents__link')
      .forEach((link) => resizeObserver.observe(link))

    container.addEventListener('scroll', scheduleIndicatorUpdate, {
      passive: true,
    })

    let hideScrollbarTimer: number | undefined
    const showScrollbarForUserScroll = () => {
      container.classList.add(styles.userScrolling)
      if (hideScrollbarTimer !== undefined) {
        window.clearTimeout(hideScrollbarTimer)
      }
      hideScrollbarTimer = window.setTimeout(() => {
        container.classList.remove(styles.userScrolling)
      }, 700)
    }
    container.addEventListener('wheel', showScrollbarForUserScroll, {
      passive: true,
    })

    window.addEventListener('resize', scheduleIndicatorUpdate)
    scheduleIndicatorUpdate()

    return () => {
      mutationObserver.disconnect()
      resizeObserver.disconnect()
      container.removeEventListener('scroll', scheduleIndicatorUpdate)
      container.removeEventListener('wheel', showScrollbarForUserScroll)
      window.removeEventListener('resize', scheduleIndicatorUpdate)
      if (hideScrollbarTimer !== undefined) {
        window.clearTimeout(hideScrollbarTimer)
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [scheduleIndicatorUpdate])

  useEffect(() => {
    const container = containerRef.current
    const pageScrollContainer = document.querySelector<HTMLElement>(
      '.docs-doc-page .main-wrapper',
    )
    if (!container || !pageScrollContainer) {
      return undefined
    }

    const links = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(
        '.table-of-contents__link[href^="#"]',
      ),
    )
    if (links.length === 0) {
      return undefined
    }

    let clickedActiveLink: HTMLAnchorElement | null = null
    let clickedScrollTop: number | null = null

    const keepActiveLinkVisible = (activeLink: HTMLAnchorElement) => {
      const containerRect = container.getBoundingClientRect()
      const activeRect = activeLink.getBoundingClientRect()
      const edgePadding = 16
      const visibleTop = containerRect.top + edgePadding
      const visibleBottom = containerRect.bottom - edgePadding
      let nextScrollTop: number | null = null

      if (activeRect.top < visibleTop) {
        nextScrollTop =
          container.scrollTop + activeRect.top - visibleTop
      } else if (activeRect.bottom > visibleBottom) {
        nextScrollTop =
          container.scrollTop + activeRect.bottom - visibleBottom
      }

      if (nextScrollTop !== null) {
        container.scrollTo({
          top: Math.max(0, nextScrollTop),
          behavior: 'smooth',
        })
      }
    }

    const updateActiveLink = () => {
      const maxScrollTop =
        pageScrollContainer.scrollHeight - pageScrollContainer.clientHeight
      const remainingScroll = Math.max(
        0,
        maxScrollTop - pageScrollContainer.scrollTop,
      )
      const trailingProgress =
        1 -
        Math.min(
          1,
          remainingScroll / pageScrollContainer.clientHeight,
        )
      const activationOffset =
        40 +
        (pageScrollContainer.clientHeight * 0.6 - 40) *
          trailingProgress
      const activationLine =
        pageScrollContainer.getBoundingClientRect().top + activationOffset
      let activeLink = links[0]

      const clickedLinkIsAtTarget =
        clickedActiveLink !== null &&
        clickedScrollTop !== null &&
        Math.abs(pageScrollContainer.scrollTop - clickedScrollTop) <= 1
      const isAtPageBottom =
        pageScrollContainer.scrollTop +
          pageScrollContainer.clientHeight >=
        pageScrollContainer.scrollHeight - 2

      if (clickedLinkIsAtTarget) {
        activeLink = clickedActiveLink ?? links[0]
      } else if (isAtPageBottom) {
        clickedActiveLink = null
        clickedScrollTop = null
        activeLink = links[links.length - 1]
      } else {
        clickedActiveLink = null
        clickedScrollTop = null
        for (const link of links) {
          const rawId = link.getAttribute('href')?.slice(1)
          const heading = rawId
            ? document.getElementById(decodeURIComponent(rawId))
            : null

          if (
            !heading ||
            heading.getBoundingClientRect().top > activationLine
          ) {
            break
          }
          activeLink = link
        }
      }

      links.forEach((link) => {
        link.classList.toggle(linkActiveClassName, link === activeLink)
      })
      if (isAtPageBottom) {
        container.scrollTo({
          top: Math.max(
            0,
            container.scrollHeight - container.clientHeight,
          ),
          behavior: 'auto',
        })
      } else {
        keepActiveLinkVisible(activeLink)
      }
      scheduleIndicatorUpdate()
    }

    const handleLinkClick = (event: globalThis.MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const link = (event.target as Element).closest<HTMLAnchorElement>(
        '.table-of-contents__link[href^="#"]',
      )
      if (!link || !links.includes(link)) {
        return
      }

      const href = link.getAttribute('href')
      const rawId = href?.slice(1)
      const heading = rawId
        ? document.getElementById(decodeURIComponent(rawId))
        : null
      if (!href || !heading) {
        return
      }

      // Handle document TOC links against the inner page scroller. Preventing
      // Docusaurus' window-based handler also keeps the clicked item from
      // overwriting the custom active state after the scroll completes.
      event.preventDefault()
      event.stopPropagation()

      const nextScrollTop =
        pageScrollContainer.scrollTop +
        heading.getBoundingClientRect().top -
        pageScrollContainer.getBoundingClientRect().top -
        30
      const maxScrollTop =
        pageScrollContainer.scrollHeight - pageScrollContainer.clientHeight
      clickedActiveLink = link
      clickedScrollTop = Math.min(
        maxScrollTop,
        Math.max(0, nextScrollTop),
      )
      pageScrollContainer.scrollTo({
        top: clickedScrollTop,
        behavior: 'auto',
      })

      const nextUrl =
        `${window.location.pathname}${window.location.search}${href}`
      if (window.location.hash === href) {
        window.history.replaceState(window.history.state, '', nextUrl)
      } else {
        window.history.pushState(window.history.state, '', nextUrl)
      }
      updateActiveLink()
    }

    pageScrollContainer.addEventListener('scroll', updateActiveLink, {
      passive: true,
    })
    container.addEventListener('click', handleLinkClick, true)
    updateActiveLink()

    return () => {
      pageScrollContainer.removeEventListener('scroll', updateActiveLink)
      container.removeEventListener('click', handleLinkClick, true)
    }
  }, [scheduleIndicatorUpdate])

  useEffect(() => {
    scheduleIndicatorUpdate()
  }, [dockPosition, scheduleIndicatorUpdate])

  return (
    <div
      ref={shellRef}
      className={clsx(styles.tocShell, className)}
      style={
        dockPosition
          ? {
              height: dockPosition.height,
              left: dockPosition.left,
              position: 'fixed',
              top: dockPosition.top,
              width: dockPosition.width,
            }
          : undefined
      }>
      <CopyPageControl />
      <div
        ref={containerRef}
        className={clsx(
          styles.tableOfContents,
          scrollHints.top && styles.canScrollUp,
          scrollHints.bottom && styles.canScrollDown,
          'thin-scrollbar',
        )}>
        <span
          aria-hidden="true"
          className={styles.activeIndicator}
          style={{
            height: indicator.height,
            left: indicator.left,
            opacity: indicator.visible ? 1 : 0,
            top: indicator.top,
          }}
        />
        <TOCItems
          {...props}
          linkClassName={linkClassName}
          linkActiveClassName={linkActiveClassName}
        />
      </div>
    </div>
  )
}
