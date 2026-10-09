import { useCallback, useLayoutEffect, useRef } from 'react'
import { ScrollTrigger } from '../../lib/gsap'

const supportsGutter = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('scrollbar-gutter', 'stable')

/**
 * Locks page scrolling while `active` is true.
 *
 * Deliberately uses `overflow: hidden` on <html> (never `position: fixed` on
 * <body>): fixing the body would reset the scroll position and break every
 * pinned ScrollTrigger scene underneath. The scroll position is preserved and
 * a classic scrollbar keeps its gutter, so nothing behind the menu reflows.
 *
 * Returns `release()` — call it synchronously right before programmatic
 * scrolling (e.g. a menu link that smooth-scrolls to a section) so the scroll
 * is never blocked by the lock. Releasing twice is harmless.
 *
 * If ScrollTrigger refreshes while the lock is held (rotation, a breakpoint
 * switch that also closes the menu, late-loading content), the page-level
 * scroll anchor (useScrollTriggerSetup) has already re-seated the reader in
 * the new layout, so the pre-lock pixel position is stale and is NOT restored.
 */
export default function useBodyScrollLock(active) {
  const heldRef = useRef(false)
  const savedRef = useRef(null)

  const release = useCallback(() => {
    if (!heldRef.current) return
    heldRef.current = false
    const html = document.documentElement
    const saved = savedRef.current
    html.style.overflow = saved.overflow
    html.style.scrollbarGutter = saved.scrollbarGutter
    html.style.paddingRight = saved.paddingRight
    // Some engines can nudge the position while overflow is hidden — undo
    // that, unless the layout was re-measured (then the anchor owns it).
    if (!saved.relayout && Math.abs(window.scrollY - saved.scrollY) > 1) {
      window.scrollTo({ top: saved.scrollY, behavior: 'instant' })
    }
  }, [])

  useLayoutEffect(() => {
    if (!active) return undefined
    const html = document.documentElement
    const scrollbarWidth = window.innerWidth - html.clientWidth
    const saved = {
      overflow: html.style.overflow,
      scrollbarGutter: html.style.scrollbarGutter,
      paddingRight: html.style.paddingRight,
      scrollY: window.scrollY,
      relayout: false,
    }
    savedRef.current = saved
    const onRefresh = () => {
      saved.relayout = true
    }
    ScrollTrigger.addEventListener('refresh', onRefresh)
    if (scrollbarWidth > 0) {
      if (supportsGutter()) html.style.scrollbarGutter = 'stable'
      else html.style.paddingRight = `${scrollbarWidth}px`
    }
    html.style.overflow = 'hidden'
    heldRef.current = true
    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      release()
    }
  }, [active, release])

  return release
}
