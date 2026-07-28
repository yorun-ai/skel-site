import React, {type ReactNode} from 'react'
import clsx from 'clsx'
import {
  Article,
  BookOpen,
  BracketsCurly,
  Code,
  FileCode,
  FlowArrow,
  GearSix,
  House,
  ListBullets,
  Package,
  Play,
  PlugsConnected,
  RocketLaunch,
  ShareNetwork,
  Terminal,
  TreeStructure,
  WarningCircle,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react'
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client'
import Link from '@docusaurus/Link'
import isInternalUrl from '@docusaurus/isInternalUrl'
import IconExternalLink from '@theme/Icon/ExternalLink'
import type {Props} from '@theme/DocSidebarItem/Link'

import styles from './styles.module.css'

function iconForHref(href: string): PhosphorIcon {
  if (/\/docs\/?$/.test(href)) return House
  if (href.endsWith('/overview')) return RocketLaunch
  if (href.endsWith('/installation')) return Package
  if (href.includes('getting-started')) return Play
  if (href.includes('input-layout')) return TreeStructure
  if (href.endsWith('/language')) return BookOpen
  if (href.includes('files-and-imports')) return TreeStructure
  if (href.includes('types-and-data')) return BracketsCurly
  if (href.includes('actors-and-access')) return PlugsConnected
  if (href.endsWith('/permissions')) return ShareNetwork
  if (href.endsWith('/services')) return FlowArrow
  if (href.includes('events-and-tasks')) return ListBullets
  if (href.endsWith('/metadata')) return BookOpen
  if (href.includes('contract-design')) return BracketsCurly
  if (href.endsWith('/syntax')) return Code
  if (href.endsWith('/workflow')) return FlowArrow
  if (href.endsWith('/diagnostics')) return WarningCircle
  if (href.endsWith('/editor')) return GearSix
  if (href === '/docs/generation') return Package
  if (href.includes('/generation/go')) return FileCode
  if (href.includes('/generation/typescript')) return Code
  if (href.includes('public-contracts')) return ShareNetwork
  if (href.includes('vine-integration')) return PlugsConnected
  if (href.includes('runtime-types')) return BracketsCurly
  if (href.includes('compatibility')) return ShareNetwork
  if (href.endsWith('/cli')) return Terminal
  if (href.includes('troubleshooting')) return WarningCircle
  if (href.includes('glossary')) return ListBullets
  if (!isInternalUrl(href)) return BookOpen
  return Article
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index: _index,
  ...props
}: Props): ReactNode {
  const {href, label, className, autoAddBaseUrl} = item
  const isActive = isActiveSidebarItem(item, activePath)
  const isInternalLink = isInternalUrl(href)
  const ItemIcon = iconForHref(href)

  return (
    <li
      className={clsx(
        'theme-doc-sidebar-item-link',
        `theme-doc-sidebar-item-link-level-${level}`,
        'menu__list-item',
        className,
      )}>
      <Link
        className={clsx('menu__link', {
          'menu__link--active': isActive,
        })}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}>
        {level > 1 && (
          <ItemIcon
            aria-hidden="true"
            className={styles.itemIcon}
            size={16}
            weight="fill"
          />
        )}
        <span className={styles.linkLabel} title={label}>
          {label}
        </span>
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  )
}
