import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { SPRING } from '../../../../lib/motion'

const NEXT_KEYS = { vertical: ['ArrowDown', 'ArrowRight'], horizontal: ['ArrowRight', 'ArrowDown'] }
const PREV_KEYS = { vertical: ['ArrowUp', 'ArrowLeft'], horizontal: ['ArrowLeft', 'ArrowUp'] }

/**
 * Typography-led role tablist. One source of truth: `activeIndex` comes from
 * the parent (mirrors the scroll timeline in pinned mode, or tab state).
 * `onSelect(index)` either scrolls to the role's timeline label or sets state.
 */
export default function RoleSelector({ roles, activeIndex, orientation, onSelect, idPrefix, reduce }) {
  const listRef = useRef(null)
  const tabRefs = useRef([])
  const [mark, setMark] = useState(null)

  // Position the small indicator from layout offsets (unaffected by the
  // GSAP transforms on ancestor wrappers).
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return undefined
    const measure = () => {
      const tab = tabRefs.current[activeIndex]
      if (!tab) return
      const next = { x: tab.offsetLeft, y: tab.offsetTop + tab.offsetHeight / 2 }
      setMark((prev) => (prev && prev.x === next.x && prev.y === next.y ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [activeIndex, orientation])

  const handleKeyDown = useCallback(
    (event) => {
      const current = tabRefs.current.indexOf(event.target)
      if (current === -1) return
      let next = null
      if (NEXT_KEYS[orientation].includes(event.key)) next = (current + 1) % roles.length
      else if (PREV_KEYS[orientation].includes(event.key)) next = (current - 1 + roles.length) % roles.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = roles.length - 1
      if (next === null) return
      event.preventDefault()
      tabRefs.current[next]?.focus({ preventScroll: true })
      onSelect(next)
    },
    [orientation, roles.length, onSelect],
  )

  return (
    <div
      ref={listRef}
      className={`roles-sel roles-sel--${orientation}`}
      role="tablist"
      aria-label="Roles"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
    >
      {roles.map((role, i) => {
        const selected = i === activeIndex
        return (
          <button
            key={role.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${role.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${role.id}`}
            tabIndex={selected ? 0 : -1}
            className={`roles-sel__tab${selected ? ' is-active' : ''}`}
            onClick={() => onSelect(i)}
          >
            <span className="roles-sel__label">{role.title}</span>
          </button>
        )
      })}
      {mark && (
        <motion.span
          className="roles-sel__mark"
          aria-hidden="true"
          initial={false}
          animate={{ x: mark.x, y: mark.y }}
          transition={reduce ? { duration: 0 } : SPRING.indicator}
        />
      )}
    </div>
  )
}
