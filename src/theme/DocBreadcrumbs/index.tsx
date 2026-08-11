import React, {type ReactNode, useEffect, useState} from 'react'
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

    setPageTitle('')
    setTitleVisible(false)
    if (!mainTitle) {
      return undefined
    }

    setPageTitle(mainTitle.textContent?.trim() ?? '')
    const updateTitleVisibility = () => {
      const navbarBottom =
        document
          .querySelector<HTMLElement>('.navbar')
          ?.getBoundingClientRect().bottom ?? 0
      setTitleVisible(
        mainTitle.getBoundingClientRect().bottom <= navbarBottom,
      )
    }

    const titleResizeObserver = new ResizeObserver(updateTitleVisibility)
    titleResizeObserver.observe(mainTitle)
    pageScrollContainer?.addEventListener(
      'scroll',
      updateTitleVisibility,
      {passive: true},
    )
    window.addEventListener('scroll', updateTitleVisibility, {passive: true})
    window.addEventListener('resize', updateTitleVisibility)
    updateTitleVisibility()

    return () => {
      titleResizeObserver.disconnect()
      pageScrollContainer?.removeEventListener(
        'scroll',
        updateTitleVisibility,
      )
      window.removeEventListener('scroll', updateTitleVisibility)
      window.removeEventListener('resize', updateTitleVisibility)
    }
  }, [isOverviewPage, pathname])

  return (
    <div
      className="doc-breadcrumbs-bar"
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
