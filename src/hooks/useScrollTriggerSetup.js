import { useEffect } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { scrollToSection } from '../lib/scroll'

/**
 * Page-level ScrollTrigger housekeeping. Runs after every section has
 * created its triggers (sections use layout effects; this is a passive
 * effect on the page component, so it runs last):
 *  - re-sorts and refreshes once web fonts and media have loaded, so pin
 *    distances are measured against final text metrics;
 *  - honours a #hash in the URL on first load (the browser cannot do this
 *    itself because pinned sections are created after its initial jump).
 */
export default function useScrollTriggerSetup() {
  useEffect(() => {
    let cancelled = false
    let raf = 0

    const refresh = () => {
      if (cancelled) return
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    }

    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    fontsReady.then(() => {
      refresh()
      const { hash } = window.location
      if (hash && hash.length > 1) {
        raf = requestAnimationFrame(() => {
          if (!cancelled) scrollToSection(hash, { smooth: false, updateHash: false })
        })
      }
    })

    if (document.readyState !== 'complete') window.addEventListener('load', refresh, { once: true })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('load', refresh)
    }
  }, [])
}
