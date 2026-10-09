import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden',
  )
}

/**
 * Keeps keyboard focus inside `containerRef` while `active`:
 *  - moves focus in on activation (`initialFocusRef` or the first focusable),
 *  - wraps Tab / Shift+Tab at the ends,
 *  - pulls focus back if it escapes (e.g. assistive tech moved it),
 *  - calls `onEscape` on the Escape key.
 * Focus restoration on close is the caller's job (it knows the trigger).
 */
export default function useFocusTrap(containerRef, active, { initialFocusRef, onEscape } = {}) {
  const onEscapeRef = useRef(onEscape)
  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    const container = containerRef.current
    if (!active || !container) return undefined

    const first = initialFocusRef?.current ?? getFocusable(container)[0]
    first?.focus({ preventScroll: true })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscapeRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = getFocusable(container)
      if (!items.length) {
        event.preventDefault()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      const current = document.activeElement
      if (event.shiftKey && (current === firstItem || !container.contains(current))) {
        event.preventDefault()
        lastItem.focus({ preventScroll: true })
      } else if (!event.shiftKey && (current === lastItem || !container.contains(current))) {
        event.preventDefault()
        firstItem.focus({ preventScroll: true })
      }
    }

    const onFocusIn = (event) => {
      if (!container.contains(event.target)) getFocusable(container)[0]?.focus({ preventScroll: true })
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [active, containerRef, initialFocusRef])
}
