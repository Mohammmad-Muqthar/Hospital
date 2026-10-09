import { useRef } from 'react'
import { gsap, ScrollTrigger, MQ, EASE, SCRUB, useGSAP, ANTICIPATE_PIN } from '../../../../lib/gsap'
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
import { measureFit } from './workspace/fit'

/**
 * Where the stage has side columns (selector and description beside the
 * workspace) — Roles.css. Below it the selector is a row above the
 * workspace.
 */
export const COLUMNS_QUERY = '(min-width: 1200px)'

/**
 * Where the pinned scene runs — the same query as the pinned layout in
 * Roles.css and the React `pinned` flag. Narrower screens (tablets in either
 * orientation, small laptop windows) can't give the workspace a legible size
 * beside the selector and description inside one viewport, so they get the
 * flow layout with tap/click selection.
 */
export const PINNED_QUERY = `(min-width: 1200px) and (min-height: 600px) and ${MQ.motionOK}`

/**
 * Pinned frames up to 880px tall dock the heading (the docked layout in
 * Roles.css): the stage owns the whole frame and the first scroll hands it
 * over from the heading to the workspace. Includes the pinned conditions,
 * so it never changes (and never rebuilds the scene) in flow layouts.
 */
const DOCK_QUERY = `(min-width: 1200px) and (min-height: 600px) and (max-height: 880px) and ${MQ.motionOK}`

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

/** Layout offset of `el` from the top of `root` (ignores transforms). */
function offsetWithin(el, root) {
  let y = 0
  for (let n = el; n && n !== root; n = n.offsetParent) y += n.offsetTop
  return y
}

/** Layout box of `el` relative to `root` (offset chain — ignores transforms). */
function boxWithin(el, root) {
  let x = 0
  let y = 0
  for (let n = el; n && n !== root; n = n.offsetParent) {
    x += n.offsetLeft
    y += n.offsetTop
  }
  return { el, x, y, w: el.offsetWidth, h: el.offsetHeight }
}

const easeOut1 = (x) => 1 - (1 - clamp(x, 0, 1)) ** 2

/**
 * Wave schedule for one role hand-over (see SWAP in rolesScene.js). Every
 * module's layout box is measured in the window's own coordinates (all role
 * views share the content area), so the schedule only depends on the
 * window's design layout, never on the viewport.
 *   out[i] — when outgoing module i starts to recede (as the wave reaches it);
 *   in[j]  — when incoming module j starts to rise in: once the wave has
 *            reached it AND every outgoing module it overlaps has cleared.
 * The wave sweeps down, across or up the window — whichever keeps more of
 * the content area covered by a readable module at its thinnest moment (it
 * depends on how the two roles' layouts overlap: e.g. a full-width strip
 * on top blocks every module below it). Ties sweep down.
 */
const WAVE_FROM = {
  top: (b, a) => (b.y - a.y) / a.h,
  left: (b, a) => (b.x - a.x) / a.w,
  bottom: (b, a) => (a.y + a.h - b.y - b.h) / a.h,
  right: (b, a) => (a.x + a.w - b.x - b.w) / a.w,
}

function scheduleSwap(outBoxes, inBoxes, area) {
  const S = SWAP
  // Boxes that merely touch (a few px of column-width difference) don't count.
  const tolX = area.w * 0.03
  const tolY = area.h * 0.03
  const overlaps = (a, b) =>
    Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > tolX &&
    Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > tolY

  const plan = (from) => {
    const pos = (b) => clamp(WAVE_FROM[from](b, area), 0, 1)
    const out = outBoxes.map((a) => S.outAt + S.wave * pos(a))
    const cleared = out.map((t) => t + S.outDuration * S.clearAt)
    const inn = inBoxes.map((b) =>
      outBoxes.reduce((t, a, i) => (overlaps(a, b) ? Math.max(t, cleared[i]) : t), S.inAt + S.wave * pos(b)),
    )
    return { out, in: inn }
  }

  // Thinnest moment: the smallest share of the content area (sampled on a
  // grid) covered by a module at ≥ 35% opacity, with the same fades as the
  // timeline (power1.out).
  const points = []
  for (let gx = 0.05; gx < 1; gx += 0.1) {
    for (let gy = 0.05; gy < 1; gy += 0.1) points.push([area.x + area.w * gx, area.y + area.h * gy])
  }
  const inside = (b, [x, y]) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
  const thinnest = (p) => {
    const end = Math.max(...p.in) + S.inFade
    let worst = 1
    for (let t = 0; t <= end; t += 0.01) {
      const shown = [
        ...outBoxes.filter((_, i) => 1 - easeOut1((t - p.out[i]) / S.outDuration) >= 0.35),
        ...inBoxes.filter((_, j) => t >= p.in[j] && easeOut1((t - p.in[j]) / S.inFade) >= 0.35),
      ]
      worst = Math.min(worst, points.filter((pt) => shown.some((b) => inside(b, pt))).length / points.length)
    }
    return worst
  }
  let best = null
  for (const from of Object.keys(WAVE_FROM)) {
    const p = plan(from)
    const score = thinnest(p)
    if (!best || score > best.score + 0.02) best = { ...p, from, score }
  }
  return best
}

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
  const eyebrow = q('.roles__eyebrow')[0]
  gsap.set(veil, { autoAlpha: 1, transformOrigin: '50% 0%' })

  // Geometry, re-measured on every refresh (offsetTop ignores transforms).
  let edge = 0.9 // progress at which the top edge slides under the navbar
  let rest = 0.25 // band height at rest / full band height
  const measure = () => {
    edge = clamp(1 - getNavOffset() / window.innerHeight, 0.8, 0.97)
    const textTop = offsetWithin(eyebrow, root)
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
 * Docked layout geometry (short pinned frames, see Roles.css): the stage
 * fills the frame and the heading overlays its top. At pin progress 0 the
 * scene sits below the heading:
 *  - the workspace keeps at least SCENE.dockMinScale of its resting size
 *    (its UI type stays legible) and is moved down so its top clears the
 *    heading; its lower edge may slip under the fold — the product rising
 *    into view;
 *  - the selector and the description ride down with it, each keeping its
 *    top under the heading and its bottom inside the frame; a column that
 *    cannot do both (the stacked description of 1200–1365px layouts on the
 *    shortest frames) waits, transparent, and rises in with the hand-over.
 * Measured from layout offsets and the window's fit size, so it is
 * independent of the transforms applied.
 */
function dockGeometry(root) {
  const inner = root.querySelector('.roles__inner')
  const head = root.querySelector('.roles__head')
  const stage = root.querySelector('.roles__stage')
  const gap = parseFloat(getComputedStyle(inner).getPropertyValue('--roles-dock-gap')) || 24
  const stageTop = offsetWithin(stage, root)
  const stageH = stage.offsetHeight
  const overlap = Math.max(0, offsetWithin(head, root) + head.offsetHeight + gap - stageTop)
  const fit = measureFit(root.querySelector('.rw-fit'))
  const winH = fit ? fit.height : stageH
  const scale = clamp(Math.floor(((stageH - overlap) / winH) * 1000) / 1000, SCENE.dockMinScale, 1)
  // The window is centred in its column and scaled about the column centre.
  const ws = Math.max(0, Math.round(overlap - (stageH - scale * winH) / 2))
  // Lowest point (stage coordinates) a column may reach: the frame's bottom.
  const limit = root.offsetHeight - stageTop - 12
  // floor: a shift the column must not go below (a column stacked under
  // another one keeps riding with it, so the two never collide).
  const ride = (el, floor = 0) => {
    const top = offsetWithin(el, root) - stageTop
    const need = Math.max(floor, overlap - top)
    const room = limit - (top + el.offsetHeight)
    const y = Math.round(Math.max(0, need, Math.min(ws, room)))
    return { y, top, bottom: top + el.offsetHeight, opacity: y <= room ? 1 : 0 }
  }
  const sel = ride(root.querySelector('.roles-sel'))
  const descEl = root.querySelector('.roles-desc')
  const stacked = offsetWithin(descEl, root) - stageTop >= sel.bottom - 1
  return {
    ws,
    scale,
    sel,
    desc: ride(descEl, stacked ? sel.y : 0),
    lift: Math.round(Math.min(40, overlap * 0.4)),
  }
}

/**
 * Docked layouts only: the opening hand-over from the heading to the
 * product. Progress 0 (where anchor links land) shows the heading with the
 * scene composed below it; scrolling on, the heading lifts away while the
 * selector and description rise into place and the workspace settles at its
 * full, legible size (scale 1 — crisp at rest). Scrubbed, so it reverses.
 */
function buildDock(tl, root, q, duration) {
  const geo = () => dockGeometry(root)
  // The heading clears first (it is gone before the rising window reaches
  // it, so the two never read on top of each other); the scene follows a
  // beat later and settles with the end of the hand-over.
  const fade = duration * 0.42
  const rise = { duration: duration * 0.88, ease: 'power2.inOut' }
  const riseAt = duration - rise.duration
  tl.fromTo(q('.roles__head'), { y: 0 }, { y: () => -geo().lift, duration: fade, ease: 'power1.in' }, 0)
    .fromTo(q('.roles__head'), { opacity: 1 }, { opacity: 0, duration: fade, ease: 'none' }, 0)
    .fromTo(q('.roles-sel'), { y: () => geo().sel.y }, { y: 0, ...rise }, riseAt)
    .fromTo(
      q('.roles-desc'),
      { y: () => geo().desc.y, opacity: () => geo().desc.opacity },
      { y: 0, opacity: 1, ...rise },
      riseAt,
    )
    .fromTo(
      q('.roles__ws-col'),
      { y: () => geo().ws, scale: () => geo().scale },
      { y: 0, scale: 1, ...rise },
      riseAt,
    )
}

/**
 * The pinned master timeline: Admin → Sales Manager → Sales Executive →
 * Receptionist. The app frame stays; role modules leave and arrive in depth,
 * the sidebar re-flows to the role's navigation, and the description
 * cross-fades. React state only mirrors the timeline (onActive). Docked
 * layouts open with the heading → workspace hand-over (buildDock).
 */
function buildMaster(root, q, roles, onActive, { dock }) {
  const { firstHold, transition: T, hold, labelInset, lastHold } = SCENE
  const pinVh = dock ? SCENE.pinVhDocked : SCENE.pinVh
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
  const depthZ = (el) => -70 - Number(el.dataset.depth || 1) * 60

  // Module boxes in the window's coordinates, measured before any transform
  // is set (layout offsets ignore transforms anyway).
  const win = root.querySelector('.rw-window')
  const content = root.querySelector('.rw-content')
  const contentBox = boxWithin(content, win)
  const boxes = mods.map((group) => group.map((el) => boxWithin(el, win)))

  // ---- Initial state: Admin -------------------------------------------
  const layers = [views, descs, titles, users]
  layers.forEach((group) => group.forEach((el, i) => gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 })))
  gsap.set(descs.slice(1), { y: 16 })
  mods.slice(1).forEach((group) => group.forEach((el) => gsap.set(el, { autoAlpha: 0, z: depthZ(el), y: 18 })))
  NAV_ORDER.forEach((id) => {
    const l = layouts[0][id]
    gsap.set(navEl[id], l.visible ? { autoAlpha: 1, y: l.slot * NAV_SLOT, x: 0 } : { autoAlpha: 0, y: 0, x: -8 })
  })
  gsap.set(highlight, { y: activeSlot[0] * NAV_SLOT })
  gsap.set(tilt, { rotationX: 0, rotationY: 0, z: 0 })

  const switchTimes = []
  const indexAt = (time) => switchTimes.reduce((index, s) => (time >= s ? index + 1 : index), 0)
  // Mirror the timeline into React state, for real renders only:
  //  - while ScrollTrigger refreshes (any resize) it renders the timeline at
  //    0 with the page momentarily scrolled to the top, then restores it
  //    silently — the 'refresh' listener below re-syncs afterwards;
  //  - after a resize out of the pinned layout, the CSS layout changes (and
  //    the page scrolls) before gsap.matchMedia tears this scene down; those
  //    last renders must not pick the role the flow layout starts with.
  const pinnedNow = window.matchMedia(PINNED_QUERY)
  const sync = () => {
    const st = tl.scrollTrigger
    if (st && pinnedNow.matches && !ScrollTrigger.isRefreshing) onActive(indexAt(tl.time()))
  }
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * pinVh)}`,
      pin: true,
      scrub: SCRUB,
      anticipatePin: ANTICIPATE_PIN,
      invalidateOnRefresh: true,
    },
    onUpdate() {
      // A revert (breakpoint change, unmount) renders the timeline at 0
      // although the page is still scrolled into the scene — and when it is
      // being killed its ScrollTrigger is already detached. Not real changes.
      const st = tl.scrollTrigger
      if (!st || (tl.time() === 0 && st.scroll() > st.start + 1)) return
      sync()
    },
  })
  // After every refresh, re-derive the role from the restored timeline.
  ScrollTrigger.addEventListener('refresh', sync)
  tl.data = { release: () => ScrollTrigger.removeEventListener('refresh', sync) }

  let at = firstHold
  if (dock) {
    buildDock(tl, root, q, SCENE.dock)
    // Admin is "arrived at" once the hand-over has settled.
    tl.addLabel(ROLE_LABELS[0], SCENE.dock + SCENE.dockLabelInset)
    at = SCENE.dockHold
  } else {
    tl.addLabel(ROLE_LABELS[0], 0)
  }

  for (let from = 0; from < roles.length - 1; from += 1) {
    const to = from + 1
    const tiltPose = TRANSITION_TILT[from % TRANSITION_TILT.length]

    // Frame: a subtle perspective shift, then back to the readable rest pose.
    tl.to(tilt, { ...tiltPose, duration: T * 0.5, ease: 'sine.inOut' }, at).to(
      tilt,
      { rotationX: 0, rotationY: 0, z: 0, duration: T * 0.5, ease: 'sine.inOut' },
      at + T * 0.5,
    )

    // Modules: a wave across the window (scheduleSwap picks its direction).
    // An outgoing module recedes into depth (the recession accelerates, the
    // fade eases out); an incoming one rises forward from its own depth once
    // its footprint is clear. Never two modules readable on the same spot;
    // the frame tilt and the depth moves carry the continuity.
    const plan = scheduleSwap(boxes[from], boxes[to], contentBox)
    const fadeOut = { duration: S.outDuration }
    mods[from].forEach((el, i) => {
      tl.to(el, { z: -150, y: -12, ease: 'power2.in', ...fadeOut }, at + plan.out[i]).to(
        el,
        { autoAlpha: 0, ease: 'power1.out', ...fadeOut },
        at + plan.out[i],
      )
    })
    mods[to].forEach((el, j) => {
      const z = depthZ(el)
      tl.fromTo(
        el,
        { z, y: 18 },
        { z: 0, y: 0, duration: S.inDuration, ease: 'power2.out', immediateRender: false },
        at + plan.in[j],
      ).fromTo(
        el,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: S.inFade, ease: 'power1.out', immediateRender: false },
        at + plan.in[j],
      )
    })
    // The views themselves only gate visibility around their modules' moves.
    tl.set(views[to], { autoAlpha: 1 }, at + Math.min(...plan.in))
      .set(views[from], { autoAlpha: 0 }, at + Math.max(...plan.out) + S.outDuration)

    // Sidebar re-flows to the incoming role's navigation: items that leave
    // fade first, shared items slide, new items fade in top to bottom once
    // their slot is clear.
    NAV_ORDER.forEach((id) => {
      const a = layouts[from][id]
      const b = layouts[to][id]
      const el = navEl[id]
      if (a.visible && b.visible && a.slot !== b.slot) {
        tl.to(el, { y: b.slot * NAV_SLOT, duration: S.slideDuration, ease: 'power2.inOut' }, at + S.slideAt)
      } else if (a.visible && !b.visible) {
        tl.to(el, { autoAlpha: 0, x: -8, duration: S.navOutDuration, ease: 'power1.out' }, at + S.navOutAt)
      } else if (!a.visible && b.visible) {
        // y is in both vars so it is re-rendered when scrubbing either way.
        tl.fromTo(
          el,
          { autoAlpha: 0, x: -8, y: b.slot * NAV_SLOT },
          { autoAlpha: 1, x: 0, y: b.slot * NAV_SLOT, duration: 0.24, ease: 'power2.out', immediateRender: false },
          at + S.navInAt + b.slot * S.navInStep,
        )
      }
    })
    tl.to(highlight, { y: activeSlot[to] * NAV_SLOT, duration: S.slideDuration, ease: 'power2.inOut' }, at + S.slideAt)

    // Top-bar title and signed-in user roll over (out up, in from below).
    for (const group of [titles, users]) {
      tl.to(
        group[from],
        { autoAlpha: 0, y: -6, duration: S.labelOutDuration, ease: 'power1.out' },
        at + S.labelOutAt,
      ).fromTo(
        group[to],
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out', immediateRender: false },
        at + S.labelInAt,
      )
    }

    // Description: out (accelerating away), then in — never both readable,
    // never more than ≈ 0.07 of a transition without one.
    tl.to(
      descs[from],
      { autoAlpha: 0, y: -10, duration: S.descOutDuration, ease: 'power1.in' },
      at + S.descOutAt,
    ).fromTo(
      descs[to],
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out', immediateRender: false },
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

      mm.add({ pinned: PINNED_QUERY, motionOK: MQ.motionOK, mobile: MQ.mobile, docked: DOCK_QUERY }, (ctx) => {
        const { pinned, motionOK, mobile, docked } = ctx.conditions
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
        const master = buildMaster(root, q, roles, onActive, { dock: docked })
        timelineRef.current = master

        return () => {
          master.data.release()
          timelineRef.current = null
        }
      })
    },
    { scope: rootRef },
  )

  return { timelineRef, activeRef }
}
