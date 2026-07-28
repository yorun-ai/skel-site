import React, {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import clsx from 'clsx'
import {
  Collapsible,
  ThemeClassNames,
  useCollapsible,
  usePrevious,
  useStorageSlot,
} from '@docusaurus/theme-common'
import {isSamePath} from '@docusaurus/theme-common/internal'
import {
  findFirstSidebarItemLink,
  isActiveSidebarItem,
  useDocSidebarItemsExpandedState,
  useVisibleSidebarItems,
} from '@docusaurus/plugin-content-docs/client'
import Link from '@docusaurus/Link'
import {translate} from '@docusaurus/Translate'
import useIsBrowser from '@docusaurus/useIsBrowser'
import useIsomorphicLayoutEffect from '@docusaurus/useIsomorphicLayoutEffect'
import DocSidebarItems from '@theme/DocSidebarItems'
import DocSidebarItemLink from '@theme/DocSidebarItem/Link'
import type {Props} from '@theme/DocSidebarItem/Category'
import type {
  PropSidebarItemCategory,
  PropSidebarItemLink,
} from '@docusaurus/plugin-content-docs'

import styles from './styles.module.css'

const categoryAnimation = {duration: 140, easing: 'ease-out'}

function getCategoryStructureId(item: Props['item']): string {
  if (item.key) {
    return item.key
  }

  for (const child of item.items) {
    if (child.type === 'link' && child.docId) {
      return child.docId
    }
    if (child.type === 'category') {
      return getCategoryStructureId(child)
    }
  }

  return item.href ?? item.label
}

function getCategoryStateId(item: Props['item'], level: number): string {
  return `skel.docs.sidebarCategory.v2:${level}:${getCategoryStructureId(item)}`
}

function useAutoExpandActiveCategory({
  isActive,
  collapsed,
  updateCollapsed,
  activePath,
}: {
  isActive: boolean
  collapsed: boolean
  updateCollapsed: (collapsed: boolean) => void
  activePath: string
}) {
  const wasActive = usePrevious(isActive)
  const previousActivePath = usePrevious(activePath)

  useEffect(() => {
    const justBecameActive = isActive && !wasActive
    const stillActiveButPathChanged =
      isActive && wasActive && activePath !== previousActivePath
    if ((justBecameActive || stillActiveButPathChanged) && collapsed) {
      updateCollapsed(false)
    }
  }, [
    isActive,
    wasActive,
    collapsed,
    updateCollapsed,
    activePath,
    previousActivePath,
  ])
}

function useCategoryHrefWithSSRFallback(
  item: Props['item'],
): string | undefined {
  const isBrowser = useIsBrowser()

  return useMemo(() => {
    if (item.href && !item.linkUnlisted) {
      return item.href
    }
    if (isBrowser || !item.collapsible) {
      return undefined
    }
    return findFirstSidebarItemLink(item)
  }, [item, isBrowser])
}

function CollapseButton({
  collapsed,
  categoryLabel,
  onClick,
}: {
  collapsed: boolean
  categoryLabel: string
  onClick: ComponentProps<'button'>['onClick']
}) {
  return (
    <button
      aria-label={
        collapsed
          ? translate(
              {
                id: 'theme.DocSidebarItem.expandCategoryAriaLabel',
                message: "Expand sidebar category '{label}'",
                description: 'The ARIA label to expand the sidebar category',
              },
              {label: categoryLabel},
            )
          : translate(
              {
                id: 'theme.DocSidebarItem.collapseCategoryAriaLabel',
                message: "Collapse sidebar category '{label}'",
                description: 'The ARIA label to collapse the sidebar category',
              },
              {label: categoryLabel},
            )
      }
      aria-expanded={!collapsed}
      className="clean-btn menu__caret"
      onClick={onClick}
      type="button"
    />
  )
}

function CategoryLinkLabel({label}: {label: string}) {
  return <span className={styles.categoryLinkLabel}>{label}</span>
}

export default function DocSidebarItemCategory(props: Props): ReactNode {
  const visibleChildren = useVisibleSidebarItems(
    props.item.items,
    props.activePath,
  )

  return visibleChildren.length === 0 ? (
    <DocSidebarItemCategoryEmpty {...props} />
  ) : (
    <DocSidebarItemCategoryCollapsible {...props} />
  )
}

function isCategoryWithHref(
  category: PropSidebarItemCategory,
): category is PropSidebarItemCategory & {href: string} {
  return typeof category.href === 'string'
}

function DocSidebarItemCategoryEmpty({item, ...props}: Props): ReactNode {
  if (!isCategoryWithHref(item)) {
    return null
  }

  const {
    type: _type,
    collapsed: _collapsed,
    collapsible: _collapsible,
    items: _items,
    linkUnlisted: _linkUnlisted,
    ...forwardableProps
  } = item
  const linkItem: PropSidebarItemLink = {
    type: 'link',
    ...forwardableProps,
  }
  return <DocSidebarItemLink item={linkItem} {...props} />
}

function DocSidebarItemCategoryCollapsible({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}: Props): ReactNode {
  const categoryRef = useRef<HTMLLIElement>(null)
  const revealAfterExpandRef = useRef(false)
  const restoredStateIdRef = useRef<string | null>(null)
  const [restorationKey, setRestorationKey] = useState(0)
  const {items, label, collapsible, className, href} = item
  const hrefWithSSRFallback = useCategoryHrefWithSSRFallback(item)
  const isActive = isActiveSidebarItem(item, activePath)
  const isCurrentPage = isSamePath(href, activePath)
  const categoryStateId = getCategoryStateId(item, level)
  const [storedCollapsed, categoryStateSlot] =
    useStorageSlot(categoryStateId)

  const {collapsed, setCollapsed} = useCollapsible({
    initialState: () => {
      if (!collapsible) {
        return false
      }
      return isActive ? false : item.collapsed
    },
  })
  const {setExpandedItem} = useDocSidebarItemsExpandedState()

  const persistCollapsedState = (nextCollapsed: boolean) => {
    categoryStateSlot.set(nextCollapsed ? 'true' : 'false')
  }

  const updateCollapsed = (nextCollapsed: boolean = !collapsed) => {
    setExpandedItem(nextCollapsed ? null : index)
    setCollapsed(nextCollapsed)
    persistCollapsedState(nextCollapsed)
  }

  useIsomorphicLayoutEffect(() => {
    if (
      !collapsible ||
      isActive ||
      storedCollapsed === null ||
      restoredStateIdRef.current === categoryStateId
    ) {
      return
    }
    restoredStateIdRef.current = categoryStateId
    setCollapsed(storedCollapsed === 'true')
    setRestorationKey((current) => current + 1)
  }, [
    categoryStateId,
    collapsible,
    isActive,
    setCollapsed,
    storedCollapsed,
  ])

  useAutoExpandActiveCategory({
    isActive,
    collapsed,
    updateCollapsed,
    activePath,
  })

  const revealExpandedCategory = useCallback(() => {
    const category = categoryRef.current
    const sidebarMenu = category?.closest<HTMLElement>(
      '.theme-doc-sidebar-container .menu',
    )
    const childList = category?.querySelector<HTMLElement>(
      ':scope > .menu__list',
    )
    if (!category || !sidebarMenu || !childList) {
      return
    }

    const menuStyle = window.getComputedStyle(sidebarMenu)
    const fadeClearance =
      Number.parseFloat(
        menuStyle.getPropertyValue('--sidebar-scroll-fade-size'),
      ) || 56
    const menuRect = sidebarMenu.getBoundingClientRect()
    const categoryRect = category.getBoundingClientRect()
    const childListRect = childList.getBoundingClientRect()
    const visibleTop =
      Math.max(0, menuRect.top) + fadeClearance
    const visibleBottom =
      Math.min(window.innerHeight, menuRect.bottom) - fadeClearance
    const visibleHeight = visibleBottom - visibleTop
    if (visibleHeight <= 0) {
      return
    }

    const visibleTopOffset = visibleTop - menuRect.top
    const visibleBottomOffset = visibleBottom - menuRect.top
    let nextScrollTop = sidebarMenu.scrollTop

    if (categoryRect.height <= visibleHeight) {
      if (categoryRect.top < visibleTop) {
        nextScrollTop += categoryRect.top - visibleTop
      } else if (categoryRect.bottom > visibleBottom) {
        nextScrollTop += categoryRect.bottom - visibleBottom
      }
    } else if (childListRect.height <= visibleHeight) {
      if (childListRect.top < visibleTop) {
        nextScrollTop += childListRect.top - visibleTop
      } else if (childListRect.bottom > visibleBottom) {
        nextScrollTop += childListRect.bottom - visibleBottom
      }
    } else {
      const children = Array.from(
        childList.querySelectorAll<HTMLElement>(
          ':scope > .menu__list-item',
        ),
      )
      const childBounds = children.map((child) => {
        const rect = child.getBoundingClientRect()
        return {
          bottom:
            sidebarMenu.scrollTop + rect.bottom - menuRect.top,
          top: sidebarMenu.scrollTop + rect.top - menuRect.top,
        }
      })
      const maxScrollTop = Math.max(
        0,
        sidebarMenu.scrollHeight - sidebarMenu.clientHeight,
      )
      const clampScrollTop = (value: number) =>
        Math.min(maxScrollTop, Math.max(0, value))
      const candidates = new Set<number>([sidebarMenu.scrollTop])

      childBounds.forEach(({bottom, top}) => {
        candidates.add(clampScrollTop(top - visibleTopOffset))
        candidates.add(
          clampScrollTop(bottom - visibleBottomOffset),
        )
      })

      const scoreCandidate = (candidate: number) => {
        const candidateTop = candidate + visibleTopOffset
        const candidateBottom = candidate + visibleBottomOffset
        let fullyVisible = 0
        let visiblePixels = 0

        childBounds.forEach(({bottom, top}) => {
          if (top >= candidateTop && bottom <= candidateBottom) {
            fullyVisible += 1
          }
          visiblePixels += Math.max(
            0,
            Math.min(bottom, candidateBottom) -
              Math.max(top, candidateTop),
          )
        })

        return {
          distance: Math.abs(candidate - sidebarMenu.scrollTop),
          fullyVisible,
          visiblePixels,
        }
      }

      for (const candidate of candidates) {
        const candidateScore = scoreCandidate(candidate)
        const currentScore = scoreCandidate(nextScrollTop)
        if (
          candidateScore.fullyVisible > currentScore.fullyVisible ||
          (candidateScore.fullyVisible === currentScore.fullyVisible &&
            candidateScore.visiblePixels > currentScore.visiblePixels) ||
          (candidateScore.fullyVisible === currentScore.fullyVisible &&
            candidateScore.visiblePixels ===
              currentScore.visiblePixels &&
            candidateScore.distance < currentScore.distance)
        ) {
          nextScrollTop = candidate
        }
      }
    }

    if (Math.abs(nextScrollTop - sidebarMenu.scrollTop) > 1) {
      sidebarMenu.scrollTo({
        behavior: 'smooth',
        top: Math.max(0, nextScrollTop),
      })
    }
  }, [])

  const handleItemClick: ComponentProps<'a'>['onClick'] = (event) => {
    onItemClick?.(item)
    if (!collapsible) {
      return
    }

    if (href) {
      if (isCurrentPage) {
        event.preventDefault()
        revealAfterExpandRef.current = collapsed
        updateCollapsed(!collapsed)
      } else {
        revealAfterExpandRef.current = false
        updateCollapsed(false)
      }
    } else {
      event.preventDefault()
      revealAfterExpandRef.current = collapsed
      updateCollapsed(!collapsed)
    }
  }

  return (
    <li
      ref={categoryRef}
      className={clsx(
        ThemeClassNames.docs.docSidebarItemCategory,
        ThemeClassNames.docs.docSidebarItemCategoryLevel(level),
        'menu__list-item',
        {'menu__list-item--collapsed': collapsed},
        className,
      )}>
      <div
        className={clsx('menu__list-item-collapsible', {
          'menu__list-item-collapsible--active': isCurrentPage,
        })}>
        <Link
          {...props}
          aria-current={isCurrentPage ? 'page' : undefined}
          aria-expanded={
            collapsible && !href ? !collapsed : undefined
          }
          className={clsx(styles.categoryLink, 'menu__link', {
            'menu__link--sublist': collapsible,
            'menu__link--sublist-caret': !href && collapsible,
            'menu__link--active': isActive,
          })}
          href={
            collapsible ? hrefWithSSRFallback ?? '#' : hrefWithSSRFallback
          }
          onClick={handleItemClick}
          role={collapsible && !href ? 'button' : undefined}>
          <CategoryLinkLabel label={label} />
        </Link>
        {href && collapsible && (
          <CollapseButton
            categoryLabel={label}
            collapsed={collapsed}
            onClick={(event) => {
              event.preventDefault()
              revealAfterExpandRef.current = collapsed
              updateCollapsed(!collapsed)
            }}
          />
        )}
      </div>

      <Collapsible
        key={restorationKey}
        animation={categoryAnimation}
        as="ul"
        className="menu__list"
        collapsed={collapsed}
        lazy
        onCollapseTransitionEnd={(nextCollapsed) => {
          if (nextCollapsed) {
            revealAfterExpandRef.current = false
            return
          }
          if (!revealAfterExpandRef.current) {
            return
          }
          revealAfterExpandRef.current = false
          requestAnimationFrame(() => {
            requestAnimationFrame(revealExpandedCategory)
          })
        }}>
        <DocSidebarItems
          activePath={activePath}
          items={items}
          level={level + 1}
          onItemClick={onItemClick}
          tabIndex={collapsed ? -1 : 0}
        />
      </Collapsible>
    </li>
  )
}
