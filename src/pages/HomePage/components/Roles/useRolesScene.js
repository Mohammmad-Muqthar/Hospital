import { useRef } from 'react'
import { gsap, ScrollTrigger, MQ, EASE, SCRUB, useGSAP } from '../../../../lib/gsap'
import { getNavOffset } from '../../../../lib/scroll'
import { NAV_ORDER, NAV_SLOT, ROLE_LABELS, SCENE, TRANSITION_TILT, VEIL, getNavLayout } from './rolesScene'
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
 */
function buildFlowReveal(q, { mobile }) {
  const REST = { y: 0, z: 0, rotationX: 0, autoAlpha: 1 }
  const reveal = (selector, trigger, from, start = 'top 98%', end = 'top 76%') => {
    const to = Object.fromEntries(Object.keys(from).map((key) => [key, REST[key]]))
    // Timeline-attached (not tween-attached) triggers defer their first
    // refresh, so creating them during a breakpoint change does not wipe
    // ScrollTrigger's recorded scroll position.
    gsap
      .timeline({ scrollTrigger: { trigger: q(trigger)[0], start, end, scrub: SCRUB, invalidateOnRefresh: true } })
      .fromTo(q(selector), from, { ...to, ease: EASE.out })
  }

  reveal('.roles__eyebrow', '.roles__head', { y: 20, autoAlpha: 0 })
  reveal('.roles__title', '.roles__head', { y: 34, autoAlpha: 0 }, 'top 96%', 'top 72%')
  reveal('.roles__lead', '.roles__lead', { y: 26, autoAlpha: 0 })
  reveal('.roles__sel-col', '.roles__sel-col', { y: 22, autoAlpha: 0 })
  reveal(
    '.rw-approach',
    '.roles__ws-col',
    { y: 48, z: mobile ? -60 : -120, rotationX: mobile ? 5 : 8, autoAlpha: 0 },
    'top 100%',
    'top 58%',
  )
  reveal('.roles__desc-col', '.roles__desc-col', { y: 22, autoAlpha: 0 })
}

/**
 * Approach (pre-pin) scrub for the pinned desktop scene:
 *  - the deep-teal veil left by How It Works recedes upward like a tide, so
 *    the section's top edge stays teal (no seam) until it reaches the top;
 *  - the header, workspace and side columns arrive as the light takes over.
 * At the end of the approach everything is at rest: progress 0 of the pin
 * (where anchor links land) is a composed state.
 */
function buildApproach(root, q) {
  const range = { trigger: root, start: 'top bottom', end: 'top top', invalidateOnRefresh: true }

  const veil = q('.roles__veil')
  gsap.set(veil, { autoAlpha: 1 })
  // The veil's falloff band must not cross the section's top edge while that
  // edge is visible below the navbar (it would show a seam against the teal
  // section above). So the band's top meets the edge exactly when the edge
  // slides under the navbar (progress `edge`), then clears linearly; the
  // exponent k keeps the curve's slope continuous at `edge`.
  const solid = VEIL.solidVh / (VEIL.solidVh + VEIL.bandVh)
  const edgeProgress = () => Math.min(0.97, Math.max(0.8, 1 - getNavOffset() / window.innerHeight))
  let edge = edgeProgress()
  const veilEase = (p) => {
    if (p > edge) return solid + ((1 - solid) * (p - edge)) / (1 - edge)
    const k = ((1 - solid) * edge) / ((1 - edge) * solid)
    return solid * (p / edge) ** k
  }
  // Locked to the scroll position (no smoothing) so the veil never lags
  // behind the section edge when scrolling back up.
  gsap
    .timeline({
      scrollTrigger: {
        ...range,
        scrub: true,
        onRefresh: () => {
          edge = edgeProgress()
        },
      },
    })
    .fromTo(veil, { yPercent: 0 }, { yPercent: -100, ease: veilEase })

  const tl = gsap.timeline({ defaults: { ease: EASE.out }, scrollTrigger: { ...range, scrub: SCRUB } })

  const depth = { z: -300, rotationX: 14, rotationY: -10, y: () => window.innerHeight * 0.1 }

  // The window rises out of depth while the teal still surrounds it (a lit
  // object in a dark room), and settles as the light takes over.
  tl.fromTo(
    q('.rw-approach'),
    depth,
    { z: 0, rotationX: 0, rotationY: 0, y: 0, duration: 0.78, ease: 'power2.out' },
    0.22,
  )
    .fromTo(q('.rw-floor'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none' }, 0.66)
    // Dark text is revealed only once the light has reached it.
    .fromTo(q('.roles__eyebrow'), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.16 }, 0.84)
    .fromTo(q('.roles__title'), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.16 }, 0.84)
    .fromTo(q('.roles__lead'), { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.15 }, 0.85)
    .fromTo(q('.roles__sel-col'), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.2 }, 0.77)
    .fromTo(q('.roles__desc-col'), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.2 }, 0.8)
}

/**
 * The pinned master timeline: Admin → Sales Manager → Sales Executive →
 * Receptionist. The app frame stays; role modules leave and arrive in depth,
 * the sidebar re-flows to the role's navigation, and the description
 * cross-fades. React state only mirrors the timeline (onActive).
 */
function buildMaster(root, q, roles, onActive) {
  const { firstHold, transition: T, hold, labelInset, lastHold, pinVh } = SCENE
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

    // Outgoing modules recede into depth (staggered), then the view hides.
    tl.to(mods[from], { autoAlpha: 0, z: -150, y: -12, duration: 0.3, ease: 'power2.in', stagger: 0.03 }, at).set(
      views[from],
      { autoAlpha: 0 },
      at + 0.5,
    )

    // Incoming modules rise forward from different depths (staggered),
    // overlapping the exit so the window never reads as empty.
    tl.set(views[to], { autoAlpha: 1 }, at + 0.26).fromTo(
      mods[to],
      { autoAlpha: 0, z: depthZ, y: 18 },
      { autoAlpha: 1, z: 0, y: 0, duration: 0.46, ease: 'power3.out', stagger: 0.05, immediateRender: false },
      at + 0.28,
    )

    // Sidebar re-flows to the incoming role's navigation.
    NAV_ORDER.forEach((id) => {
      const a = layouts[from][id]
      const b = layouts[to][id]
      const el = navEl[id]
      if (a.visible && b.visible && a.slot !== b.slot) {
        tl.to(el, { y: b.slot * NAV_SLOT, duration: 0.4, ease: 'power2.inOut' }, at + 0.24)
      } else if (a.visible && !b.visible) {
        tl.to(el, { autoAlpha: 0, x: -8, duration: 0.22, ease: 'power1.in' }, at + 0.14)
      } else if (!a.visible && b.visible) {
        // y is in both vars so it is re-rendered when scrubbing either way.
        tl.fromTo(
          el,
          { autoAlpha: 0, x: -8, y: b.slot * NAV_SLOT },
          { autoAlpha: 1, x: 0, y: b.slot * NAV_SLOT, duration: 0.3, ease: 'power2.out', immediateRender: false },
          at + 0.36,
        )
      }
    })
    tl.to(highlight, { y: activeSlot[to] * NAV_SLOT, duration: 0.4, ease: 'power2.inOut' }, at + 0.24)

    // Top-bar title and signed-in user swap.
    for (const group of [titles, users]) {
      tl.to(group[from], { autoAlpha: 0, y: -6, duration: 0.18, ease: 'power1.in' }, at + 0.22).fromTo(
        group[to],
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out', immediateRender: false },
        at + 0.38,
      )
    }

    // Description cross-transition.
    tl.to(descs[from], { autoAlpha: 0, y: -14, duration: 0.3, ease: 'power2.in' }, at + 0.1).fromTo(
      descs[to],
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.36, ease: 'power2.out', immediateRender: false },
      at + 0.38,
    )

    // Selector / aria state flips when the incoming role becomes dominant.
    switchTimes.push(at + T * 0.42)
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

      // GSAP forgets the recorded scroll position when the last ScrollTrigger
      // on the page is killed (a breakpoint change where every trigger lives
      // in a toggling matchMedia context), and the following refresh then
      // jumps to the top. This inert trigger outlives those changes.
      ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top' })

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
