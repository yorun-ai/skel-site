import React, {type ReactNode} from 'react'
import Link from '@docusaurus/Link'
import {translate} from '@docusaurus/Translate'
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal'
import IconClose from '@theme/Icon/Close'

import styles from './styles.module.css'

export default function NavbarMobileSidebarHeader(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar()

  return (
    <div className={`navbar-sidebar__brand ${styles.header}`}>
      <Link
        aria-label="Skeleton DSL overview"
        className={styles.brand}
        onClick={mobileSidebar.toggle}
        to="/docs/">
        <span aria-hidden="true" className="navbar__logo">
          <img alt="" src="/brand/skel-navbar.png" />
        </span>
        <span className={`navbar__title ${styles.title}`}>
          Skeleton DSL
        </span>
      </Link>
      <button
        aria-label={translate({
          id: 'theme.docs.sidebar.closeSidebarButtonAriaLabel',
          message: 'Close navigation bar',
          description: 'The ARIA label for close button of mobile sidebar',
        })}
        className={`clean-btn navbar-sidebar__close ${styles.close}`}
        onClick={mobileSidebar.toggle}
        type="button">
        <IconClose color="var(--ifm-color-emphasis-600)" />
      </button>
    </div>
  )
}
