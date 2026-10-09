import { useEffect, useRef, useState } from 'react'

/**
 * True once the document has scrolled more than `threshold` px.
 *
 * Uses an IntersectionObserver on a tiny absolutely-positioned sentinel at
 * the very top of the document instead of a scroll listener, so there is no
 * per-frame work and React state only changes when the boolean flips.
 * Independent of GSAP: pinned sections move the document scroll position like
 * any other content, so the sentinel leaves the viewport exactly when expected.
 *
 * Returns [scrolledPast, sentinelRef]. Render the sentinel once:
 *   <span ref={sentinelRef} className="nav-sentinel" aria-hidden="true" />
 */
export default function useScrolledPast(threshold = 12) {
  const [scrolledPast, setScrolledPast] = useState(false)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return undefined
    el.style.height = `${threshold}px`

    if (typeof IntersectionObserver === 'undefined') {
      // Very old browsers: fall back to a passive, rAF-throttled listener.
      let raf = 0
      const read = () => {
        raf = 0
        setScrolledPast(window.scrollY > threshold)
      }
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(read)
      }
      read()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('scroll', onScroll)
      }
    }

    const io = new IntersectionObserver(([entry]) => setScrolledPast(!entry.isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return [scrolledPast, sentinelRef]
}
