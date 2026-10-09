/**
 * Shared, coalesced MediaQueryLists.
 *
 * Why this exists: gsap.matchMedia() creates a new MediaQueryList for every
 * condition of every section and attaches its internal change handler to
 * each one — and never detaches it, not even when the context is killed.
 * When the viewport crosses a breakpoint, every one of those lists fires and
 * each event runs a full "revert every pin + refresh every ScrollTrigger"
 * cycle. With eight sections (plus React StrictMode's discarded first mount
 * and HMR) that was ~20 back-to-back refreshes: a multi-second freeze on a
 * tablet rotation.
 *
 * Two small guarantees fix it without touching GSAP:
 *  1. window.matchMedia(query) returns ONE live MediaQueryList per query
 *     string, so re-registering the same handler on it is de-duplicated by
 *     the browser.
 *  2. A change handler registered on several lists runs at most once per
 *     task. Every query is re-evaluated live inside the handler (GSAP reads
 *     `.matches` for all of its queries), so a single run sees every change.
 *
 * Handlers registered on a single list (React hooks, Motion) are unaffected.
 * Must be imported before any matchMedia() consumer runs (see lib/gsap.js).
 */
const FLAG = '__trionixSharedMediaQueries'

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && !window.matchMedia[FLAG]) {
  const nativeMatchMedia = window.matchMedia.bind(window)
  const lists = new Map()
  const wrappers = new WeakMap()
  const ranThisTask = new Set()
  let clearQueued = false

  const coalesced = (handler) => {
    let wrapper = wrappers.get(handler)
    if (!wrapper) {
      wrapper = function onSharedMediaChange(event) {
        if (ranThisTask.has(handler)) return
        ranThisTask.add(handler)
        if (!clearQueued) {
          clearQueued = true
          setTimeout(() => {
            ranThisTask.clear()
            clearQueued = false
          }, 0)
        }
        return typeof handler === 'function' ? handler.call(this, event) : handler.handleEvent(event)
      }
      wrappers.set(handler, wrapper)
    }
    return wrapper
  }

  const share = (mql) => {
    const add = mql.addEventListener.bind(mql)
    const remove = mql.removeEventListener.bind(mql)
    mql.addEventListener = (type, handler, options) =>
      add(type, type === 'change' && handler ? coalesced(handler) : handler, options)
    mql.removeEventListener = (type, handler, options) =>
      remove(type, type === 'change' && handler ? coalesced(handler) : handler, options)
    mql.addListener = (handler) => handler && add('change', coalesced(handler))
    mql.removeListener = (handler) => handler && remove('change', coalesced(handler))
    return mql
  }

  const sharedMatchMedia = (query) => {
    const key = String(query).trim().replace(/\s+/g, ' ')
    let mql = lists.get(key)
    if (!mql) {
      mql = share(nativeMatchMedia(key))
      lists.set(key, mql)
    }
    return mql
  }
  sharedMatchMedia[FLAG] = true
  window.matchMedia = sharedMatchMedia
}
