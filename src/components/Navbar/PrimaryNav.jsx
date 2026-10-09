import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import { SECTION_IDS } from '../../config/site'
import { FADE, SPRING } from '../../lib/motion'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import NavLink from './NavLink'

const sameNumbers = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

/**
 * Centered desktop navigation. The active section is marked with a single
 * 4px accent dot that glides between labels (Motion, transform + opacity
 * only) and fades out while an unlinked section (hero, security) is in view.
 */
export default function PrimaryNav({ items, activeId }) {
  const listRef = useRef(null)
  const linkEls = useRef([])
  const dotRef = useRef(null)
  const prevIndexRef = useRef(-1)
  const [centers, setCenters] = useState([])
  const reduceMotion = usePrefersReducedMotion()

  // Measure each label's centre (relative to the list) — on mount, on font
  // load and whenever the list or any link resizes. State changes only when
  // a value actually changes.
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return undefined
    const measure = () => {
      const next = linkEls.current.map((el) => (el ? Math.round(el.offsetLeft + el.offsetWidth / 2) : 0))
      setCenters((prev) => (sameNumbers(prev, next) ? prev : next))
    }
    measure()
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) measure()
    })
    if (typeof ResizeObserver === 'undefined') return () => {
      cancelled = true
    }
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    linkEls.current.forEach((el) => el && ro.observe(el))
    return () => {
      cancelled = true
      ro.disconnect()
    }
  }, [])

  const activeIndex = items.findIndex((item) => SECTION_IDS[item.target] === activeId)

  useEffect(() => {
    const dot = dotRef.current
    if (!dot) return undefined
    const prev = prevIndexRef.current
    prevIndexRef.current = activeIndex

    if (activeIndex < 0) {
      const a = animate(dot, { opacity: 0, scale: 0.4 }, reduceMotion ? { duration: 0 } : FADE.fast)
      return () => a.stop()
    }
    const x = (centers[activeIndex] ?? 0) - 2
    // Appearing (or re-measured in place, or reduced motion): jump, then fade.
    if (prev < 0 || prev === activeIndex || reduceMotion) {
      const a = animate(dot, { x }, { duration: 0 })
      const b = animate(dot, { opacity: 1, scale: 1 }, reduceMotion ? { duration: 0 } : FADE.base)
      return () => {
        a.stop()
        b.stop()
      }
    }
    const a = animate(dot, { x, opacity: 1, scale: 1 }, SPRING.indicator)
    return () => a.stop()
  }, [activeIndex, centers, reduceMotion])

  return (
    <nav className="nav__primary" aria-label="Primary">
      <ul className="nav__list" role="list" ref={listRef}>
        {items.map((item, i) => (
          <li key={item.label} className="nav__item">
            <NavLink
              item={item}
              active={i === activeIndex}
              linkRef={(el) => {
                linkEls.current[i] = el
              }}
            />
          </li>
        ))}
      </ul>
      <span ref={dotRef} className="nav__dot" aria-hidden="true" style={{ opacity: 0 }} />
    </nav>
  )
}
