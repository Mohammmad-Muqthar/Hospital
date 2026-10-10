/**
 * Scroll helpers that understand pinned ScrollTrigger sections.
 *
 * Contract for sections: put the anchor id (e.g. id="roles") on the element
 * that is pinned — or on a non-pinned element. A pinned element's true
 * document position is its ScrollTrigger start, not its bounding box (while
 * pinned it is position: fixed).
 */
import { ScrollTrigger } from './gsap'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Current sticky navbar height in px (reads the --nav-h token). */
export function getNavOffset() {
  if (typeof window === 'undefined') return 0
  const value = getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  return Number.parseFloat(value) || 0
}

function findPinTrigger(el) {
  return ScrollTrigger.getAll().find(
    (st) => st.pin && st.vars.pin !== false && (st.pin === el || st.pin.contains(el)),
  )
}

/** Document scroll position at which a section should be considered "arrived at". */
export function getSectionScrollTop(el) {
  const pinned = findPinTrigger(el)
  if (pinned) return pinned.start
  const top = el.getBoundingClientRect().top + window.scrollY
  return top - getNavOffset()
}

/** Scroll the window to an absolute position (smooth unless reduced motion). */
export function scrollToY(y, { smooth = true } = {}) {
  const max = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo({
    top: Math.min(Math.max(0, Math.round(y)), Math.max(0, max)),
    behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto',
  })
}

/**
 * Scroll to an in-page section by id (with or without leading '#').
 * Returns true when the target exists so callers can preventDefault().
 */
export function scrollToSection(id, { smooth = true, updateHash = true, moveFocus = true } = {}) {
  const cleanId = String(id).replace(/^#/, '')
  if (!cleanId) return false
  const el = document.getElementById(cleanId)
  if (!el) return false
  scrollToY(cleanId === 'top' ? 0 : getSectionScrollTop(el), { smooth })
  if (updateHash && window.location.hash !== `#${cleanId}`) {
    window.history.replaceState(null, '', cleanId === 'top' ? window.location.pathname : `#${cleanId}`)
  }
  if (moveFocus) focusSection(el)
  return true
}

/**
 * Move the sequential focus starting point into a section without scrolling
 * (the scroll is already handled), so the next Tab continues inside it like
 * a native anchor jump would. Sections get tabindex="-1" on demand.
 */
export function focusSection(el) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

/**
 * Scroll so a scrubbed timeline sits exactly on one of its labels.
 * Used by the Roles selector to jump to a role inside the pinned scene.
 */
export function scrollToTimelineLabel(timeline, label, options) {
  const st = timeline?.scrollTrigger
  if (!st || !(label in timeline.labels)) return false
  const progress = timeline.labels[label] / timeline.duration()
  scrollToY(st.start + (st.end - st.start) * progress, options)
  return true
}

/** True when an href points at an in-page anchor ("#pricing"). */
export const isHashHref = (href) => typeof href === 'string' && href.startsWith('#')

/**
 * onClick handler factory for in-page links: smooth-scrolls to the section
 * and keeps a real href on the element for accessibility / no-JS.
 */
export function handleAnchorClick(event, href, afterScroll) {
  if (!isHashHref(href)) return
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return
  if (scrollToSection(href)) {
    event.preventDefault()
    afterScroll?.()
  }
}
