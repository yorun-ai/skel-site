import React, {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'
import DocRootLayout from '@theme-original/DocRoot/Layout'
import type {Props} from '@theme/DocRoot/Layout'

import {Separator} from '@/components/ui/separator'

const defaultSidebarWidth = 240
const minSidebarWidth = 190
const maxSidebarWidth = 360
const storageKey = 'skel.docs.sidebarWidth'

const clampSidebarWidth = (width: number) =>
  Math.min(maxSidebarWidth, Math.max(minSidebarWidth, width))

export default function DocRootLayoutWrapper(props: Props): ReactNode {
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth)
  const [sidebarAvailable, setSidebarAvailable] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    let initialWidth = defaultSidebarWidth
    try {
      const storedWidth = Number(window.localStorage.getItem(storageKey))
      if (Number.isFinite(storedWidth) && storedWidth > 0) {
        initialWidth = clampSidebarWidth(storedWidth)
      }
    } catch {
      // Resizing still works if storage is disabled.
    }

    setSidebarWidth(initialWidth)
    document.documentElement.style.setProperty(
      '--doc-sidebar-width',
      `${initialWidth}px`,
    )

    const sidebar = document.querySelector<HTMLElement>(
      '.theme-doc-sidebar-container',
    )
    setSidebarAvailable(Boolean(sidebar))
    if (!sidebar) {
      return undefined
    }

    const syncCollapsedState = () => {
      setSidebarCollapsed(sidebar.getBoundingClientRect().width < 80)
    }
    const observer = new MutationObserver(syncCollapsedState)
    observer.observe(sidebar, {attributes: true, attributeFilter: ['class']})
    sidebar.addEventListener('transitionend', syncCollapsedState)
    syncCollapsedState()

    return () => {
      observer.disconnect()
      sidebar.removeEventListener('transitionend', syncCollapsedState)
    }
  }, [])

  const updateSidebarWidth = useCallback((width: number) => {
    const nextWidth = clampSidebarWidth(width)
    setSidebarWidth(nextWidth)
    document.documentElement.style.setProperty(
      '--doc-sidebar-width',
      `${nextWidth}px`,
    )
    try {
      window.localStorage.setItem(storageKey, String(nextWidth))
    } catch {
      // The current page still resizes when storage is disabled.
    }
  }, [])

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = sidebarWidth
      event.currentTarget.setPointerCapture(event.pointerId)
      document.body.classList.add('docs-sidebar-is-resizing')

      const resize = (moveEvent: PointerEvent) => {
        updateSidebarWidth(startWidth + moveEvent.clientX - startX)
      }
      const stopResize = () => {
        document.body.classList.remove('docs-sidebar-is-resizing')
        window.removeEventListener('pointermove', resize)
        window.removeEventListener('pointerup', stopResize)
        window.removeEventListener('pointercancel', stopResize)
      }

      window.addEventListener('pointermove', resize)
      window.addEventListener('pointerup', stopResize)
      window.addEventListener('pointercancel', stopResize)
    },
    [sidebarWidth, updateSidebarWidth],
  )

  const resizeWithKeyboard = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        updateSidebarWidth(sidebarWidth + (event.key === 'ArrowLeft' ? -12 : 12))
      } else if (event.key === 'Home') {
        event.preventDefault()
        updateSidebarWidth(defaultSidebarWidth)
      }
    },
    [sidebarWidth, updateSidebarWidth],
  )

  return (
    <>
      <DocRootLayout {...props} />
      {sidebarAvailable && !sidebarCollapsed && (
        <Separator
          aria-label="Resize sidebar"
          aria-valuemax={maxSidebarWidth}
          aria-valuemin={minSidebarWidth}
          aria-valuenow={sidebarWidth}
          className="docs-sidebar-resizer bg-transparent data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-[9px]"
          decorative={false}
          onDoubleClick={() => updateSidebarWidth(defaultSidebarWidth)}
          onKeyDown={resizeWithKeyboard}
          onPointerDown={startResize}
          orientation="vertical"
          tabIndex={0}
          title="Drag to resize; double-click to reset"
        />
      )}
    </>
  )
}
