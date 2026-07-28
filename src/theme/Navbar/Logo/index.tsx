import React, {type ReactNode} from 'react'
import Link from '@docusaurus/Link'
import {translate} from '@docusaurus/Translate'
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal'

import styles from './styles.module.css'

export default function NavbarLogo(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar()

  return (
    <div className={styles.switcher}>
      <button
        aria-expanded={mobileSidebar.shown}
        aria-label={translate({
          id: 'skel.navbar.mobileMenu.ariaLabel',
          message: 'Open documentation menu',
        })}
        className={`navbar__brand ${styles.mobileBrand}`}
        onClick={mobileSidebar.toggle}
        type="button">
        <span aria-hidden="true" className="navbar__logo" />
        <span className={`navbar__title ${styles.mobileTitle}`}>
          Skeleton DSL
        </span>
      </button>

      <Link
        className={`navbar__brand ${styles.desktopBrand}`}
        to="/docs/">
        <span aria-hidden="true" className="navbar__logo" />
        <span className="navbar__title">Skeleton DSL</span>
      </Link>

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
          <span className={styles.productName}>Yorun Platform</span>
        </a>
        <a
          aria-label="Switch to Vine Framework"
          className={styles.productSwitch}
          href="https://vine.yorun.ai">
          <span aria-hidden="true" className={styles.productLogo}>
            V
          </span>
          <span className={styles.productName}>Vine Framework</span>
        </a>
      </div>
    </div>
  )
}
