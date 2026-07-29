import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from 'react'
import {createPortal} from 'react-dom'
import {useLocation} from '@docusaurus/router'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import {MagnifyingGlass} from '@phosphor-icons/react'
import OriginalSearchBar from '@theme-original/SearchBar'
import styles from './styles.module.css'

export default function SearchBar(
  props: ComponentProps<typeof OriginalSearchBar>,
) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const {pathname} = useLocation()
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext()
  const isChinese = currentLocale === 'zh-CN'

  const close = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setOpen(false)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.documentElement.classList.toggle('search-modal-open', open)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        close()
      }

      if (
        event.key.toLowerCase() === 'k' &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.documentElement.classList.remove('search-modal-open')
    }
  }, [close, open])

  useEffect(() => {
    if (!open) return undefined

    const frame = window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLInputElement>('.navbar__search-input')
        ?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open])

  return (
    <>
      <button
        aria-label={isChinese ? '搜索' : 'Search'}
        className="clean-btn"
        onClick={() => setOpen(true)}
        type="button">
        <MagnifyingGlass aria-hidden="true" size={16} />
      </button>
      {open &&
        createPortal(
          <>
            <button
              aria-label={isChinese ? '关闭搜索' : 'Close search'}
              className={styles.backdrop}
              onClick={close}
              onMouseDown={(event) => event.preventDefault()}
              type="button"
            />
            <div
              aria-label={isChinese ? '搜索文档' : 'Search documentation'}
              aria-modal="true"
              className={styles.dialog}
              ref={dialogRef}
              role="dialog">
              <OriginalSearchBar {...props} />
            </div>
          </>,
          document.body,
        )}
    </>
  )
}
