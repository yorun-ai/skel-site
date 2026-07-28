import React, {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
} from 'react'
import OriginalDocBreadcrumbs from '@theme-original/DocBreadcrumbs'

const activeBreadcrumbSelector =
  '.breadcrumbs__item--active .breadcrumbs__link'

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
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const activeBreadcrumb =
      wrapperRef.current?.querySelector<HTMLElement>(activeBreadcrumbSelector)

    if (!activeBreadcrumb) {
      return undefined
    }

    activeBreadcrumb.setAttribute('role', 'button')
    activeBreadcrumb.setAttribute('tabindex', '0')
    activeBreadcrumb.setAttribute('title', 'Back to page top')

    return () => {
      activeBreadcrumb.removeAttribute('role')
      activeBreadcrumb.removeAttribute('tabindex')
      activeBreadcrumb.removeAttribute('title')
    }
  })

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (
      (event.target as Element).closest(activeBreadcrumbSelector)
    ) {
      event.preventDefault()
      scrollToPageTop()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      (event.target as Element).closest(activeBreadcrumbSelector)
    ) {
      event.preventDefault()
      scrollToPageTop()
    }
  }

  return (
    <div
      className="doc-breadcrumbs-bar"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={wrapperRef}>
      <OriginalDocBreadcrumbs />
    </div>
  )
}
