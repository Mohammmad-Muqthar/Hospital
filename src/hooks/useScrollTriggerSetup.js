import { useEffect } from 'react'
import { SECTION_IDS } from '../config/site'
import { ScrollTrigger } from '../lib/gsap'
import { scrollToSection } from '../lib/scroll'

/*
 * The page layout changes height whenever ScrollTrigger refreshes (pin
 * distances are viewport-relative), so a raw pixel scrollY is meaningless
 * across a resize, a breakpoint switch or a reload. Instead we remember an
 * ANCHOR: which page section sits under the middle of the viewport and how
 * far through it (0–1, measured on the section's in-flow box, i.e. its pin
 * spacer when pinned). After every refresh the reader is re-seated on that
 * anchor, and the anchor is saved across reloads.
 */
const STORAGE_KEY = 'trionix:scroll-anchor'
const PROBE = 0.5 // viewport fraction used as the reading line

// We restore the position ourselves once every pinned section exists; the
// browser's automatic restoration runs too early (before pin spacers add
// their height) and lands in the wrong section.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  ScrollTrigger.clearScrollMemory('manual')
}

const anchorElements = () =>
  [...Object.values(SECTION_IDS).map((id) => document.getElementById(id)), document.querySelector('footer')].filter(
    Boolean,
  )

/** In-flow box of a section: its pin spacer while pinned, else itself. */
const flowBox = (el) => (el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el)

function measureRanges() {
  const scrollY = window.scrollY
  return anchorElements().map((el, index) => {
    const box = flowBox(el)
    const top = box.getBoundingClientRect().top + scrollY
    return { key: el.id || `section-${index}`, top, height: Math.max(1, box.offsetHeight) }
  })
}

function anchorFor(ranges, scrollY) {
  if (!ranges.length) return null
  const probe = scrollY + window.innerHeight * PROBE
  let range = ranges[0]
  for (const r of ranges) if (r.top <= probe) range = r
  return { key: range.key, progress: Math.min(1, Math.max(0, (probe - range.top) / range.height)) }
}

function yForAnchor(ranges, anchor) {
  const range = anchor && ranges.find((r) => r.key === anchor.key)
  if (!range) return null
  const max = document.documentElement.scrollHeight - window.innerHeight
  const y = range.top + anchor.progress * range.height - window.innerHeight * PROBE
  return Math.round(Math.min(Math.max(0, y), Math.max(0, max)))
}

/** Finish every in-flight scrub catch-up so a programmatic jump lands settled. */
function settleScrubs() {
  ScrollTrigger.update()
  ScrollTrigger.getAll().forEach((st) => {
    // getTween() is the scrub tween, or 0 when the trigger isn't smoothed.
    const tween = st.getTween?.()
    if (tween) tween.progress(1)
  })
}

/** Instant jump that also settles scrubbed timelines (no 1s catch-up). */
function jumpTo(y) {
  window.scrollTo({ top: y, behavior: 'auto' })
  settleScrubs()
}

function readSaved() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null')
    return saved && saved.path === window.location.pathname ? saved : null
  } catch {
    return null
  }
}

function isReturnVisit() {
  const type = performance.getEntriesByType?.('navigation')?.[0]?.type
  return type === 'reload' || type === 'back_forward'
}

/**
 * Page-level ScrollTrigger housekeeping. Runs after every section has
 * created its triggers (sections use layout effects; this is a passive
 * effect on the page component, so it runs last):
 *  - re-sorts and refreshes once web fonts and media have loaded, so pin
 *    distances are measured against final text metrics;
 *  - keeps the reader anchored to the same place through every refresh
 *    (resize, rotation, breakpoint switch, late-loading content);
 *  - restores the reading position on reload / back-forward, otherwise
 *    honours a #hash in the URL (the browser can't: pinned sections are
 *    created after its initial jump).
 */
export default function useScrollTriggerSetup() {
  useEffect(() => {
    let cancelled = false
    let raf = 0
    let ranges = []
    let anchor = null
    let ready = false // until the initial position is settled, don't re-seat
    // Between a viewport resize and the refresh that re-measures the page,
    // scroll events describe a half-reflowed layout; don't learn from them.
    let layoutPending = false
    let pendingTimer = 0

    // One inert, page-level trigger that lives outside every section's
    // gsap.matchMedia(). It keeps ScrollTrigger from forgetting the scroll
    // position when a breakpoint change reverts every section at once, and
    // its onUpdate tracks the anchor on every settled scroll update.
    const keeper = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: () => {
        if (ready && !layoutPending && !ScrollTrigger.isRefreshing) anchor = anchorFor(ranges, window.scrollY)
      },
    })

    const onRefresh = () => {
      ranges = measureRanges()
      if (ready && anchor) {
        const y = yForAnchor(ranges, anchor)
        if (y != null && Math.abs(window.scrollY - y) > 2) jumpTo(y)
      }
      layoutPending = false
      clearTimeout(pendingTimer)
    }
    ScrollTrigger.addEventListener('refresh', onRefresh)

    const onResize = () => {
      layoutPending = true
      clearTimeout(pendingTimer)
      // ScrollTrigger skips refreshing for some resizes (e.g. a mobile
      // address bar showing/hiding); stop waiting once it clearly isn't coming.
      pendingTimer = setTimeout(() => {
        layoutPending = false
      }, 800)
    }
    window.addEventListener('resize', onResize)

    const save = () => {
      try {
        const current = anchorFor(measureRanges(), window.scrollY)
        window.sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ path: window.location.pathname, hash: window.location.hash, anchor: current }),
        )
      } catch {
        /* storage unavailable (private mode) — nothing to restore next time */
      }
    }
    const onVisibility = () => document.visibilityState === 'hidden' && save()
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onVisibility)

    const refresh = () => {
      if (cancelled) return
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    }

    const settleInitialPosition = () => {
      if (cancelled) return
      const saved = isReturnVisit() ? readSaved() : null
      const { hash } = window.location
      ranges = measureRanges()
      if (saved?.anchor) {
        const y = yForAnchor(ranges, saved.anchor)
        if (y != null) jumpTo(y)
      } else if (hash && hash.length > 1) {
        scrollToSection(hash, { smooth: false, updateHash: false, moveFocus: false })
        settleScrubs()
      }
      anchor = anchorFor(ranges, window.scrollY)
      ready = true
    }

    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    fontsReady.then(() => {
      refresh()
      raf = requestAnimationFrame(settleInitialPosition)
    })

    if (document.readyState !== 'complete') window.addEventListener('load', refresh, { once: true })

    return () => {
      cancelled = true
      keeper.kill()
      cancelAnimationFrame(raf)
      clearTimeout(pendingTimer)
      window.removeEventListener('resize', onResize)
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      window.removeEventListener('load', refresh)
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}
