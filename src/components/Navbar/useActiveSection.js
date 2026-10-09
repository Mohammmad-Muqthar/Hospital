import { useEffect, useState } from 'react'

/**
 * Which of the given section ids currently sits under a horizontal "reading
 * line" in the viewport (default: 40% from the top). Returns the id or null.
 *
 * - IntersectionObserver only (no ScrollTrigger), so it never affects pin
 *   measurement order. Pinned sections stay `position: fixed` over the
 *   viewport while pinned and therefore remain active for their whole scene.
 * - Sections that are not in the list (hero, security…) simply produce null,
 *   so no link stays highlighted while the visitor reads an unlinked section.
 * - React state is only updated when the active id actually changes.
 *
 * `ids` must be a stable array (define it at module level).
 */
export default function useActiveSection(ids, { line = 0.4 } = {}) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return undefined

    const top = Math.round(line * 100)
    const bottom = 100 - top - 1
    const intersecting = new Map()

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) intersecting.set(entry.target.id, entry.isIntersecting)
        const next = ids.find((id) => intersecting.get(id)) ?? null
        setActiveId((prev) => (prev === next ? prev : next))
      },
      // A 1%-tall band at the reading line.
      { rootMargin: `-${top}% 0px -${bottom}% 0px`, threshold: 0 },
    )

    elements.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids, line])

  return activeId
}
