import React, {type ReactNode, useEffect, useRef, useState} from 'react'
import {useLocation} from '@docusaurus/router'

function scrollToPageTop() {
  const pageScrollContainer =
    document.querySelector<HTMLElement>('.docs-doc-page .main-wrapper')

  if (pageScrollContainer) {
    pageScrollContainer.scrollTo({top: 0, behavior: 'smooth'})
  } else {
    window.scrollTo({top: 0, behavior: 'smooth'})
  }
  if (window.location.hash) {
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}`,
    )
  }
}

export default function DocBreadcrumbs(): ReactNode {
  const {pathname} = useLocation()
  const isOverviewPage = /\/docs\/?$/.test(pathname)
  const titleBarRef = useRef<HTMLDivElement>(null)
  const [pageTitle, setPageTitle] = useState('')
  const [titleVisible, setTitleVisible] = useState(false)

  useEffect(() => {
    if (isOverviewPage) {
      setPageTitle('')
      setTitleVisible(false)
      return undefined
    }

    const pageScrollContainer = document.querySelector<HTMLElement>(
      '.docs-doc-page .main-wrapper',
    )
    const mainTitle = document.querySelector<HTMLElement>(
      '.docs-doc-page .theme-doc-markdown h1',
    )
    const layoutContainer = mainTitle?.closest<HTMLElement>(
      'main > .container',
    )

    setPageTitle('')
    setTitleVisible(false)
    if (!mainTitle) {
      return undefined
    }

    setPageTitle(mainTitle.textContent?.trim() ?? '')
    const updateTitleLayout = () => {
      const titleBar = titleBarRef.current
      if (!titleBar) {
        return
      }
      if (window.innerWidth <= 996) {
        titleBar.style.removeProperty('--docs-article-left')
        return
      }
      titleBar.style.setProperty(
        '--docs-article-left',
        `${Math.round(mainTitle.getBoundingClientRect().left * 100) / 100}px`,
      )
    }
    const updateTitleVisibility = () => {
      const navbarBottom =
        document
          .querySelector<HTMLElement>('.navbar')
          ?.getBoundingClientRect().bottom ?? 0
      setTitleVisible(
        mainTitle.getBoundingClientRect().bottom <= navbarBottom,
      )
    }

    const titleResizeObserver = new ResizeObserver(() => {
      updateTitleLayout()
      updateTitleVisibility()
    })
    titleResizeObserver.observe(mainTitle)
    if (layoutContainer) {
      titleResizeObserver.observe(layoutContainer)
    }
    pageScrollContainer?.addEventListener(
      'scroll',
      updateTitleVisibility,
      {passive: true},
    )
    window.addEventListener('scroll', updateTitleVisibility, {passive: true})
    window.addEventListener('resize', updateTitleLayout)
    window.addEventListener('resize', updateTitleVisibility)
    updateTitleLayout()
    updateTitleVisibility()

    return () => {
      titleResizeObserver.disconnect()
      pageScrollContainer?.removeEventListener(
        'scroll',
        updateTitleVisibility,
      )
      window.removeEventListener('scroll', updateTitleVisibility)
      window.removeEventListener('resize', updateTitleLayout)
      window.removeEventListener('resize', updateTitleVisibility)
    }
  }, [isOverviewPage, pathname])

  return (
    <div
      className="doc-breadcrumbs-bar"
      ref={titleBarRef}
      data-title-visible={titleVisible ? 'true' : 'false'}>
      <button
        aria-hidden={!titleVisible}
        className="doc-scroll-title"
        onClick={scrollToPageTop}
        tabIndex={titleVisible ? 0 : -1}
        title="Back to page top"
        type="button">
        {pageTitle}
      </button>
    </div>
  )
}
