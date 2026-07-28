import React, {type ReactNode, useEffect, useRef, useState} from 'react'
import {DotsNine} from '@phosphor-icons/react'

import styles from './styles.module.css'

export default function NavbarLogo(): ReactNode {
  const [open, setOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !switcherRef.current?.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className={styles.switcher} ref={switcherRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={`navbar__brand ${styles.trigger}`}
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button">
        <span aria-hidden="true" className="navbar__logo" />
        <span className="navbar__title">Skeleton DSL</span>
        <DotsNine
          aria-hidden="true"
          className={styles.switchIcon}
          weight={open ? 'fill' : 'regular'}
        />
      </button>

      {open && (
        <div
          aria-label="Select framework"
          className={styles.menu}
          role="menu">
          <a
            className={styles.option}
            href="https://vine.yorun.ai"
            onClick={() => setOpen(false)}
            role="menuitem">
            <span
              aria-hidden="true"
              className={styles.optionLogo}>
              V
            </span>
            <span className={styles.optionTitle}>
              <span className={styles.optionName}>Vine Framework</span>
              <span className={styles.optionMeta}>by Yorun</span>
            </span>
          </a>
        </div>
      )}
    </div>
  )
}
