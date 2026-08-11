import React, {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ArrowUpRight,
  Check,
  Copy,
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
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
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
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
      }
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
  const viewMarkdownLabel = translate({
    id: 'skel.copyPage.viewMarkdown',
    message: 'View as Markdown',
  })

  return (
    <div className="copy-page-control">
      <button
        className="copy-page-control__copy"
        onClick={copyMarkdown}
        type="button">
        <CopyIcon aria-hidden="true" size={16} />
        <span>{copyLabel}</span>
      </button>
      <a
        aria-label={viewMarkdownLabel}
        className="copy-page-control__toggle"
        href={currentMarkdownPath}
        rel="noreferrer"
        target="_blank"
        title={viewMarkdownLabel}>
        <ArrowUpRight aria-hidden="true" size={14} />
      </a>
    </div>
  )
}
