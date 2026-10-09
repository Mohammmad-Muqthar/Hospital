import { useCallback, useLayoutEffect, useRef } from 'react'

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
    // Some engines can nudge the position while overflow is hidden.
    if (Math.abs(window.scrollY - saved.scrollY) > 1) {
      window.scrollTo({ top: saved.scrollY, behavior: 'instant' })
    }
  }, [])

  useLayoutEffect(() => {
    if (!active) return undefined
    const html = document.documentElement
    const scrollbarWidth = window.innerWidth - html.clientWidth
    savedRef.current = {
      overflow: html.style.overflow,
      scrollbarGutter: html.style.scrollbarGutter,
      paddingRight: html.style.paddingRight,
      scrollY: window.scrollY,
    }
    if (scrollbarWidth > 0) {
      if (supportsGutter()) html.style.scrollbarGutter = 'stable'
      else html.style.paddingRight = `${scrollbarWidth}px`
    }
    html.style.overflow = 'hidden'
    heldRef.current = true
    return release
  }, [active, release])

  return release
}
