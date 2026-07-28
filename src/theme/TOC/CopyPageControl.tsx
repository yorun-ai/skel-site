import React, {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  CaretDown,
  Check,
  Copy,
  FileMd,
} from '@phosphor-icons/react'
import {useDoc} from '@docusaurus/plugin-content-docs/client'
import {translate} from '@docusaurus/Translate'

const resetDelay = 2000

type CopyState = 'copied' | 'error' | 'idle'

function markdownPath(pathname: string): string {
  return pathname.endsWith('/')
    ? `${pathname}index.md`
    : `${pathname}.md`
}

export default function CopyPageControl(): ReactNode {
  const {metadata} = useDoc()
  const rootRef = useRef<HTMLDivElement>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const currentMarkdownPath = markdownPath(metadata.permalink)

  const resetCopyStateLater = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
    }
    resetTimerRef.current = setTimeout(() => {
      setCopyState('idle')
      resetTimerRef.current = null
    }, resetDelay)
  }

  const copyMarkdown = async () => {
    try {
      const response = await fetch(currentMarkdownPath, {cache: 'no-store'})
      if (!response.ok) {
        throw new Error(`Markdown request failed: ${response.status}`)
      }
      await navigator.clipboard.writeText(await response.text())
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
    resetCopyStateLater()
  }

  useEffect(() => {
    const closeWhenOutside = (
      event: MouseEvent | TouchEvent | FocusEvent,
    ) => {
      if (
        rootRef.current?.contains(event.target as Node)
      ) {
        return
      }
      setMenuOpen(false)
    }

    document.addEventListener('mousedown', closeWhenOutside)
    document.addEventListener('touchstart', closeWhenOutside)
    document.addEventListener('focusin', closeWhenOutside)
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
      }
      document.removeEventListener('mousedown', closeWhenOutside)
      document.removeEventListener('touchstart', closeWhenOutside)
      document.removeEventListener('focusin', closeWhenOutside)
    }
  }, [])

  const copyLabel =
    copyState === 'copied'
      ? translate({
          id: 'skel.copyPage.copied',
          message: 'Copied',
        })
      : copyState === 'error'
        ? translate({
            id: 'skel.copyPage.error',
            message: 'Copy failed',
          })
        : translate({
            id: 'skel.copyPage.label',
            message: 'Copy page',
          })
  const CopyIcon = copyState === 'copied' ? Check : Copy

  return (
    <div className="copy-page-control" ref={rootRef}>
      <button
        className="copy-page-control__copy"
        onClick={copyMarkdown}
        type="button">
        <CopyIcon aria-hidden="true" size={16} />
        <span>{copyLabel}</span>
      </button>
      <button
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={translate({
          id: 'skel.copyPage.menuAriaLabel',
          message: 'Copy page options',
        })}
        className="copy-page-control__toggle"
        onClick={() => {
          setMenuOpen((open) => !open)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setMenuOpen(false)
          }
        }}
        type="button">
        <CaretDown aria-hidden="true" size={12} weight="bold" />
      </button>

      {menuOpen && (
        <div className="copy-page-menu" role="menu">
          <button
            className="copy-page-menu__item"
            onClick={copyMarkdown}
            role="menuitem"
            type="button">
            <Copy aria-hidden="true" size={17} />
            <span>
              <strong>
                {translate({
                  id: 'skel.copyPage.label',
                  message: 'Copy page',
                })}
              </strong>
              <small>
                {translate({
                  id: 'skel.copyPage.copyDescription',
                  message: 'Copy page as Markdown for LLMs',
                })}
              </small>
            </span>
          </button>
          <a
            className="copy-page-menu__item"
            href={currentMarkdownPath}
            rel="noreferrer"
            role="menuitem"
            target="_blank">
            <FileMd aria-hidden="true" size={17} />
            <span>
              <strong>
                {translate({
                  id: 'skel.copyPage.viewMarkdown',
                  message: 'View as Markdown ↗',
                })}
              </strong>
              <small>
                {translate({
                  id: 'skel.copyPage.viewDescription',
                  message: 'View this page as plain text',
                })}
              </small>
            </span>
          </a>
        </div>
      )}
    </div>
  )
}
