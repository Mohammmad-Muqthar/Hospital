import { useRef } from 'react'
import { gsap, MQ, EASE, SCRUB, useGSAP } from '../../../../lib/gsap'
import { getNavOffset } from '../../../../lib/scroll'
import {
  APPROACH,
  NAV_ORDER,
  NAV_SLOT,
  ROLE_LABELS,
  SCENE,
  SWAP,
  TRANSITION_TILT,
  VEIL,
  getNavLayout,
} from './rolesScene'
import { ROLE_SESSIONS } from '../../../../data/mock/mockRoles'

/**
 * Where the pinned scene runs — the same query as the pinned layout in
 * Roles.css and the React `pinned` flag. Wide laptops pin from 600px tall;
 * the narrower two-column layout (1024–1279) needs 700px so the selector,
 * description and workspace all fit (shorter screens get the flow layout).
 */
const SIZE_OK = ['(min-width: 1280px) and (min-height: 600px)', '(min-width: 1024px) and (min-height: 700px)']
export const PINNED_QUERY = SIZE_OK.map((q) => `${q} and ${MQ.motionOK}`).join(', ')

/**
 * Flow layouts (tablet, mobile, short desktop; motion OK): no pin and no
 * tide — the teal fade is static CSS. Each block rises in as it enters the
 * viewport (scrubbed, so it reverses exactly). The workspace keeps a reduced
 * hint of depth.
 *
 * Copy and controls fade with `opacity` only — never `autoAlpha` — so the
 * heading, intro, tablist and description stay in the accessibility tree
 * and in the Tab order before the reader has scrolled to them. Only the
 * decorative (aria-hidden) workspace may use visibility.
 */
function buildFlowReveal(q, { mobile }) {
  const REST = { y: 0, z: 0, rotationX: 0, autoAlpha: 1, opacity: 1 }
  const reveal = (selector, trigger, from, start = 'top 98%', end = 'top 76%') => {
    const to = Object.fromEntries(Object.keys(from).map((key) => [key, REST[key]]))
    // Timeline-attached (not tween-attached) triggers defer their first
    // refresh, so creating them during a breakpoint change does not wipe
    // ScrollTrigger's recorded scroll position.
    gsap
      .timeline({ scrollTrigger: { trigger: q(trigger)[0], start, end, scrub: SCRUB, invalidateOnRefresh: true } })
      .fromTo(q(selector), from, { ...to, ease: EASE.out })
  }

  reveal('.roles__eyebrow', '.roles__head', { y: 20, opacity: 0 })
  reveal('.roles__title', '.roles__head', { y: 34, opacity: 0 }, 'top 96%', 'top 72%')
  reveal('.roles__lead', '.roles__lead', { y: 26, opacity: 0 })
  reveal('.roles__sel-col', '.roles__sel-col', { y: 22, opacity: 0 })
  reveal(
    '.rw-approach',
    '.roles__ws-col',
    { y: 48, z: mobile ? -60 : -120, rotationX: mobile ? 5 : 8, autoAlpha: 0 },
    'top 100%',
    'top 58%',
  )
  reveal('.roles__desc-col', '.roles__desc-col', { y: 22, opacity: 0 })
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const sineInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2

/**
 * Approach (pre-pin) scrub for the pinned desktop scene, read top to bottom
 * as: the light arrives → the heading → the workspace → selector and
 * description. Progress p runs from the section's top edge entering at the
 * bottom of the viewport (0) to reaching the top (1, = pin progress 0, where
 * anchor links land — a fully composed state).
 *
 * The light: How It Works ends on deep teal, so the section's top edge must
 * stay exactly that teal while it is visible below the navbar (otherwise a
 * seam shows). The veil is therefore a soft teal → transparent band pinned to
 * the section's top edge. It starts tall (a long, gentle dawn rising from the
 * bottom of the screen), contracts towards the edge until it ends just above
 * the eyebrow (by VEIL.restAt), holds while the edge travels up, and folds
 * away under the navbar once the edge has passed beneath it. So the light
 * owns the header area before any text appears: dark text never fades in
 * over teal, and the white window only ever rises over light.
 */
function buildApproach(root, q) {
  const range = { trigger: root, start: 'top bottom', end: 'top top', invalidateOnRefresh: true }

  const veil = q('.roles__veil')[0]
  const inner = q('.roles__inner')[0]
  const eyebrow = q('.roles__eyebrow')[0]
  gsap.set(veil, { autoAlpha: 1, transformOrigin: '50% 0%' })

  // Geometry, re-measured on every refresh (offsetTop ignores transforms).
  let edge = 0.9 // progress at which the top edge slides under the navbar
  let rest = 0.25 // band height at rest / full band height
  const measure = () => {
    edge = clamp(1 - getNavOffset() / window.innerHeight, 0.8, 0.97)
    const textTop = inner.offsetTop + eyebrow.offsetTop
    rest = clamp((textTop * VEIL.restFactor) / Math.max(1, veil.offsetHeight), 0.05, 1)
  }
  measure()

  // Band scale over the approach (1 = full height, 0 = gone).
  const scaleAt = (p) => {
    if (p <= VEIL.restAt) return 1 + (rest - 1) * sineInOut(p / VEIL.restAt)
    if (p <= edge) return rest
    return rest * (1 - ((p - edge) / (1 - edge)) ** 2)
  }
  // Locked to the scroll position (no smoothing) so the band never lags
  // behind the section edge when scrolling back up.
  gsap
    .timeline({ scrollTrigger: { ...range, scrub: true, onRefreshInit: measure } })
    .fromTo(veil, { scaleY: 1 }, { scaleY: 0, duration: 1, ease: (p) => 1 - scaleAt(p) })

  const tl = gsap.timeline({ defaults: { ease: EASE.out }, scrollTrigger: { ...range, scrub: SCRUB } })
  const { header: H, workspace: W, columns: C } = APPROACH

  // Copy and controls fade with opacity only (never visibility), so they stay
  // in the accessibility tree and the Tab order before they are revealed.
  tl.fromTo(q('.roles__eyebrow'), { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: H.duration }, H.at)
    .fromTo(q('.roles__title'), { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: H.duration }, H.at + H.stagger)
    .fromTo(
      q('.roles__lead'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: H.duration },
      H.at + H.stagger * 2.5,
    )
    // The window rises out of depth below the heading, over light, and
    // settles exactly as the pin takes over.
    .fromTo(
      q('.rw-approach'),
      { z: -300, rotationX: 14, rotationY: -10, y: () => window.innerHeight * 0.1 },
      { z: 0, rotationX: 0, rotationY: 0, y: 0, duration: 1 - W.at, ease: 'power2.out' },
      W.at,
    )
    .fromTo(q('.rw-floor'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26, ease: 'none' }, 0.72)
    .fromTo(q('.roles__sel-col'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: C.duration }, C.at)
    .fromTo(
      q('.roles__desc-col'),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: C.duration },
      C.at + C.stagger,
    )
}

/**
 * The pinned master timeline: Admin → Sales Manager → Sales Executive →
 * Receptionist. The app frame stays; role modules leave and arrive in depth,
 * the sidebar re-flows to the role's navigation, and the description
 * cross-fades. React state only mirrors the timeline (onActive).
 */
function buildMaster(root, q, roles, onActive) {
  const { firstHold, transition: T, hold, labelInset, lastHold, pinVh } = SCENE
  const S = SWAP
  const views = q('.rw-view')
  const descs = q('.roles-desc__panel')
  const titles = q('.rw-title__layer')
  const users = q('.rw-side .rw-user__layer')
  const tilt = q('.rw-tilt')
  const highlight = q('.rw-nav__hl')
  const navEl = Object.fromEntries(NAV_ORDER.map((id) => [id, root.querySelector(`.rw-nav__item[data-nav="${id}"]`)]))
  const mods = views.map((v) => gsap.utils.toArray(v.querySelectorAll('.rw-mod')))
  const layouts = roles.map((r) => getNavLayout(r.id))
  const activeSlot = roles.map((r, i) => layouts[i][ROLE_SESSIONS[r.id].activeNav].slot)
  const depthZ = (_, el) => -70 - Number(el.dataset.depth || 1) * 60

  // ---- Initial state: Admin -------------------------------------------
  const layers = [views, descs, titles, users]
  layers.forEach((group) => group.forEach((el, i) => gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 })))
  gsap.set(descs.slice(1), { y: 16 })
  mods.slice(1).forEach((group) => gsap.set(group, { autoAlpha: 0, z: depthZ, y: 18 }))
  NAV_ORDER.forEach((id) => {
    const l = layouts[0][id]
    gsap.set(navEl[id], l.visible ? { autoAlpha: 1, y: l.slot * NAV_SLOT, x: 0 } : { autoAlpha: 0, y: 0, x: -8 })
  })
  gsap.set(highlight, { y: activeSlot[0] * NAV_SLOT })
  gsap.set(tilt, { rotationX: 0, rotationY: 0, z: 0 })

  const switchTimes = []
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * pinVh)}`,
      pin: true,
      scrub: SCRUB,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    onUpdate() {
      const time = tl.time()
      // Reverting (refresh, breakpoint change, unmount) renders the timeline at
      // 0 even though the page is still scrolled into the scene — and when it
      // is being killed its ScrollTrigger is already detached. Neither is a
      // real state change, so React state is left alone.
      const st = tl.scrollTrigger
      if (!st || (time === 0 && st.scroll() > st.start + 1)) return
      let index = 0
      for (const s of switchTimes) if (time >= s) index += 1
      onActive(index)
    },
  })

  tl.addLabel(ROLE_LABELS[0], 0)
  let at = firstHold

  for (let from = 0; from < roles.length - 1; from += 1) {
    const to = from + 1
    const tiltPose = TRANSITION_TILT[from % TRANSITION_TILT.length]

    // Frame: a subtle perspective shift, then back to the readable rest pose.
    tl.to(tilt, { ...tiltPose, duration: T * 0.5, ease: 'sine.inOut' }, at).to(
      tilt,
      { rotationX: 0, rotationY: 0, z: 0, duration: T * 0.5, ease: 'sine.inOut' },
      at + T * 0.5,
    )

    // Every layer that swaps (modules, sidebar items, top-bar title, user,
    // description) finishes leaving before its replacement starts arriving,
    // so two role states are never readable on top of each other; the frame
    // tilt and the depth moves carry the continuity instead.

    // Outgoing modules recede into depth, staggered. They fade out quickly
    // (opacity eases out) while the recession accelerates (power2.in).
    const outMods = { duration: S.outDuration, stagger: S.outStagger }
    tl.to(mods[from], { z: -150, y: -12, ease: 'power2.in', ...outMods }, at + S.outAt)
      .to(mods[from], { autoAlpha: 0, ease: 'power1.out', ...outMods }, at + S.outAt)
      .set(views[from], { autoAlpha: 0 }, at + S.inAt)

    // Incoming modules rise forward from different depths, staggered.
    tl.set(views[to], { autoAlpha: 1 }, at + S.inAt).fromTo(
      mods[to],
      { autoAlpha: 0, z: depthZ, y: 18 },
      {
        autoAlpha: 1,
        z: 0,
        y: 0,
        duration: S.inDuration,
        ease: 'power2.out',
        stagger: S.inStagger,
        immediateRender: false,
      },
      at + S.inAt,
    )

    // Sidebar re-flows to the incoming role's navigation: items that leave
    // fade first, shared items slide, new items fade in once the slides have
    // (nearly) cleared their slots.
    NAV_ORDER.forEach((id) => {
      const a = layouts[from][id]
      const b = layouts[to][id]
      const el = navEl[id]
      if (a.visible && b.visible && a.slot !== b.slot) {
        tl.to(el, { y: b.slot * NAV_SLOT, duration: S.slideDuration, ease: 'power2.inOut' }, at + S.slideAt)
      } else if (a.visible && !b.visible) {
        tl.to(el, { autoAlpha: 0, x: -8, duration: 0.16, ease: 'power1.out' }, at + S.navOutAt)
      } else if (!a.visible && b.visible) {
        // y is in both vars so it is re-rendered when scrubbing either way.
        tl.fromTo(
          el,
          { autoAlpha: 0, x: -8, y: b.slot * NAV_SLOT },
          { autoAlpha: 1, x: 0, y: b.slot * NAV_SLOT, duration: 0.26, ease: 'power2.out', immediateRender: false },
          at + S.navInAt,
        )
      }
    })
    tl.to(highlight, { y: activeSlot[to] * NAV_SLOT, duration: S.slideDuration, ease: 'power2.inOut' }, at + S.slideAt)

    // Top-bar title and signed-in user swap.
    for (const group of [titles, users]) {
      tl.to(group[from], { autoAlpha: 0, y: -6, duration: 0.16, ease: 'power1.out' }, at + S.labelOutAt).fromTo(
        group[to],
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out', immediateRender: false },
        at + S.labelInAt,
      )
    }

    // Description cross-transition (out, then in — never both readable).
    tl.to(descs[from], { autoAlpha: 0, y: -14, duration: 0.24, ease: 'power1.out' }, at + S.descOutAt).fromTo(
      descs[to],
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.36, ease: 'power2.out', immediateRender: false },
      at + S.descInAt,
    )

    // Selector / aria state flips as the incoming role starts to arrive.
    switchTimes.push(at + S.switchAt)
    at += T
    tl.addLabel(ROLE_LABELS[to], at + labelInset)
    at += to === roles.length - 1 ? lastHold : hold
  }

  // Pad the final hold so the pin releases on a settled Receptionist state.
  tl.set({}, {}, at)
  return tl
}

/**
 * Wires the Roles section's GSAP choreography (one gsap.matchMedia: pinned
 * scene, flow reveals, or nothing for reduced motion).
 * Returns { timelineRef } — the pinned master timeline, null in tab mode, used
 * for label-based navigation — and { activeRef }, the last index mirrored
 * into React state (so the parent can keep it in sync on manual selection).
 */
export default function useRolesScene(rootRef, roles, setActiveIndex) {
  const timelineRef = useRef(null)
  const activeRef = useRef(0)

  useGSAP(
    () => {
      const root = rootRef.current
      const q = gsap.utils.selector(root)

      // (Scroll memory across breakpoint switches is kept by the page-level
      // trigger in hooks/useScrollTriggerSetup.js.)
      const mm = gsap.matchMedia()

      mm.add({ pinned: PINNED_QUERY, motionOK: MQ.motionOK, mobile: MQ.mobile }, (ctx) => {
        const { pinned, motionOK, mobile } = ctx.conditions
        if (!motionOK) return undefined

        if (!pinned) {
          buildFlowReveal(q, { mobile })
          return undefined
        }

        buildApproach(root, q)

        const onActive = (index) => {
          if (index === activeRef.current) return
          activeRef.current = index
          setActiveIndex(index)
        }
        activeRef.current = 0
        setActiveIndex(0)
        timelineRef.current = buildMaster(root, q, roles, onActive)

        return () => {
          timelineRef.current = null
        }
      })
    },
    { scope: rootRef },
  )

  return { timelineRef, activeRef }
}
