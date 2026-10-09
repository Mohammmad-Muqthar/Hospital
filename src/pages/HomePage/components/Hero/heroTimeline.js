/**
 * Hero master timeline — one pinned stage, one scrubbed timeline.
 *
 * Labels (in order):
 *   type       camera pull-back through the giant headline
 *   copy       paragraph + CTAs reveal
 *   hold       readable composition (CTA hold)
 *   dashboard  copy recedes, dashboard rises in 3D, stage turns off-white
 *   split      dashboard → 4 slices → crop → flip → stat cards
 *   end        cards settled, short hold, pin releases into Features
 *
 * Everything size-dependent is function-based and the ScrollTrigger uses
 * invalidateOnRefresh, so resizes re-measure the DOM (offset-based, so the
 * values are never polluted by the transforms being animated).
 */
import { gsap, SCRUB } from '../../../../lib/gsap'

/** Layout + motion run only here; otherwise the static stacked layout is shown. */
export const CINEMA_MQ = '(prefers-reduced-motion: no-preference) and (min-height: 520px)'

const DESKTOP = {
  pin: 3.4,
  perspective: 1000,
  startScale: [6.4, 6.9, 7.4],
  lineDur: 2.4,
  lineStagger: 0.22,
  bgFrom: 1.12,
  scrim: 0.6,
  copyY: 26,
  ctaY: 18,
  hold: 0.6,
  copyOut: { y: -0.12, scale: 0.96 },
  dashFrom: { y: 0.78, rotationX: 22, rotationY: -8, scale: 0.86, z: -120 },
  dashDur: 2,
  dashHold: 0.5,
  sepGap: 22,
  sepZ: -70,
  slicePerspective: 1400,
  flipStagger: 0.14,
  moveStagger: 0.1,
  endHold: 0.6,
}

const TABLET = {
  ...DESKTOP,
  pin: 3,
  perspective: 900,
  startScale: [5.2, 5.6, 6],
  lineDur: 2.2,
  lineStagger: 0.2,
  dashFrom: { y: 0.72, rotationX: 16, rotationY: -5, scale: 0.88, z: -80 },
  dashDur: 1.8,
  sepGap: 14,
  sepZ: -50,
  slicePerspective: 1200,
}

const MOBILE = {
  ...DESKTOP,
  pin: 2.4,
  perspective: 700,
  startScale: [3.8, 4.1, 4.4, 4.7, 5],
  lineDur: 1.9,
  lineStagger: 0.18,
  bgFrom: 1.08,
  copyY: 18,
  ctaY: 14,
  hold: 0.45,
  copyOut: { y: -0.08, scale: 0.97 },
  dashFrom: { y: 0.7, rotationX: 12, rotationY: -3, scale: 0.9, z: -40 },
  dashDur: 1.6,
  dashHold: 0.4,
  sepGap: 8,
  sepZ: -30,
  slicePerspective: 900,
  flipStagger: 0.12,
  moveStagger: 0.08,
  endHold: 0.5,
}

/**
 * Ease for the z tween that makes the *apparent* scale (perspective / (perspective − z))
 * follow a smooth power2.out curve from `s0` to 1 — big change early, soft landing.
 */
function depthEase(s0) {
  const base = gsap.parseEase('power2.out')
  const zSpan = 1 - 1 / s0
  return (t) => {
    const s = 1 + (s0 - 1) * (1 - base(t))
    return 1 - (1 - 1 / s) / zSpan
  }
}

/** Sum offsetLeft/Top up to `ancestor` (layout position, ignores transforms). */
function offsetWithin(el, ancestor) {
  let x = 0
  let y = 0
  let node = el
  while (node && node !== ancestor) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent
  }
  return { x, y }
}

export function buildHeroTimeline(root, conditions, { onCoveredChange } = {}) {
  const S = conditions.mobile ? MOBILE : conditions.tablet ? TABLET : DESKTOP
  const q = gsap.utils.selector(root)
  const one = (sel) => q(sel)[0]

  const bg = one('.hero-bg')
  const scrim = one('.hero-bg__scrim')
  const light = one('.hero__light')
  const copy = one('.hero__copy')
  const linesWrap = one(conditions.mobile ? '.hero__lines--narrow' : '.hero__lines--wide')
  const lines = q(conditions.mobile ? '.hero__lines--narrow .hero__line' : '.hero__lines--wide .hero__line')
  const lead = one('.hero__lead')
  const ctaGroup = one('.hero__ctas')
  const ctas = q('.hero__cta')
  const layer = one('.hero__dash-layer')
  const frame = one('.hero__dash-frame')
  const shadow = one('.hero__dash-shadow')
  const whole = one('.hero__dash-whole')
  const slicesWrap = one('.hero__slices')
  const slices = q('.hero__slice')
  const fronts = q('.hero__slice-front')
  const edges = q('.hero__slice-edge')
  const cardsList = one('.hero__cards')
  const cards = q('.hero__cards > li')

  const vh = () => window.innerHeight
  const last = slices.length - 1

  /* ---------- Geometry (re-read on every refresh) ---------- */
  const geometry = () => {
    const W = frame.offsetWidth
    const H = frame.offsetHeight
    const sw = slices[0].offsetWidth
    const cw = cards[0].offsetWidth
    const ch = cards[0].offsetHeight
    const radius = parseFloat(getComputedStyle(cards[0]).borderTopLeftRadius) || 16
    const k = Math.min(1, (sw - 8) / cw, (H * 0.9) / ch)
    return { W, H, sw, cw, ch, k, radius, insetX: (sw - cw * k) / 2, insetY: (H - ch * k) / 2 }
  }
  const sliceTarget = (i) => {
    const s = offsetWithin(slices[i], layer)
    const c = offsetWithin(cards[i], layer)
    return {
      x: c.x + cards[i].offsetWidth / 2 - (s.x + slices[i].offsetWidth / 2),
      y: c.y + cards[i].offsetHeight / 2 - (s.y + slices[i].offsetHeight / 2),
    }
  }
  const outerRadius = () => parseFloat(getComputedStyle(whole).borderTopLeftRadius) || 18
  // Initial per-corner radii: only the outer slices carry the dashboard's rounded corners.
  const cornerRadii = (i) => {
    const r = outerRadius()
    return [i === 0 ? r : 0, i === last ? r : 0, i === last ? r : 0, i === 0 ? r : 0]
  }
  const clipFrom = (i) => {
    const [tl, tr, br, bl] = cornerRadii(i)
    return `inset(0px 0px 0px 0px round ${tl}px ${tr}px ${br}px ${bl}px)`
  }
  const clipTo = () => {
    const g = geometry()
    const r = g.radius * g.k
    return `inset(${g.insetY}px ${g.insetX}px ${g.insetY}px ${g.insetX}px round ${r}px ${r}px ${r}px ${r}px)`
  }

  /* ---------- Initial, non-timeline state ---------- */
  // Perspective must sit on the lines' direct parent (perspective only reaches children).
  gsap.set(linesWrap, { perspective: S.perspective })
  gsap.set(ctaGroup, { pointerEvents: 'none' })
  gsap.set(slicesWrap, { autoAlpha: 0 })
  gsap.set(cardsList, { autoAlpha: 0 })
  // The dashboard waits fully transparent (still in the accessibility tree)
  // until its rise begins, so no corner can peek in during the CTA hold.
  gsap.set(frame, { opacity: 0 })

  let covered = false
  let coveredAt = 1
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      pin: true,
      start: 'top top',
      end: () => `+=${Math.round(vh() * S.pin)}`,
      scrub: SCRUB,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const isCovered = self.progress >= coveredAt
        if (isCovered !== covered) {
          covered = isCovered
          onCoveredChange?.(covered)
        }
      },
    },
  })

  /* ---------- type: camera pull-back through the headline ---------- */
  tl.addLabel('type', 0)
  // A single camera pulling back: the vanishing point sits on the FIRST line,
  // so it resolves first and every later line (closer to the camera at any
  // instant) projects further *below* it — the lines layer in depth but can
  // never overlap. The wrapper shift keeps the giant first line centred in the
  // viewport while it is close, then eases it up into its slot.
  gsap.set(linesWrap, { perspectiveOrigin: `50% ${50 / lines.length}%` })
  const firstLineShift = () => {
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0
    const target = nav + (window.innerHeight - nav) / 2
    const pos = offsetWithin(lines[0], root)
    return target - (pos.y + lines[0].offsetHeight / 2)
  }
  tl.fromTo(linesWrap, { y: firstLineShift }, { y: 0, duration: S.lineDur, ease: 'power2.out' }, 0)
  lines.forEach((line, i) => {
    const s0 = S.startScale[i] ?? S.startScale[S.startScale.length - 1]
    const at = i * S.lineStagger
    tl.fromTo(
      line,
      { z: S.perspective * (1 - 1 / s0) },
      { z: 0, duration: S.lineDur, ease: depthEase(s0) },
      at,
    )
    tl.fromTo(line, { opacity: 0 }, { opacity: 1, duration: S.lineDur * 0.14, ease: 'power1.out' }, at)
  })
  const typeEnd = (lines.length - 1) * S.lineStagger + S.lineDur
  tl.fromTo(bg, { scale: S.bgFrom }, { scale: 1, duration: typeEnd, ease: 'power2.out' }, 0)
  tl.fromTo(scrim, { opacity: 0 }, { opacity: S.scrim, duration: typeEnd - 0.5, ease: 'power1.inOut' }, 0.15)

  /* ---------- copy: paragraph, then the CTA pair ---------- */
  const copyAt = typeEnd - 0.55
  tl.addLabel('copy', copyAt)
  tl.fromTo(lead, { y: S.copyY, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, copyAt)
  ctas.forEach((cta, i) => {
    tl.fromTo(
      cta,
      { y: S.ctaY, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
      copyAt + 0.25 + i * 0.12,
    )
  })
  tl.set(ctaGroup, { pointerEvents: 'auto' }, copyAt + 0.45)

  /* ---------- hold ---------- */
  const holdAt = copyAt + 1.1
  tl.addLabel('hold', holdAt)

  /* ---------- dashboard: copy recedes, dashboard rises, stage turns light ---------- */
  const dashAt = holdAt + S.hold
  tl.addLabel('dashboard', dashAt)
  tl.set(ctaGroup, { pointerEvents: 'none' }, dashAt + 0.1)
  // Copy recedes first (gone before the light surface reaches it — no ghosted text).
  tl.to(
    copy,
    { y: () => vh() * S.copyOut.y, scale: S.copyOut.scale, opacity: 0, duration: 0.75, ease: 'sine.in' },
    dashAt,
  )
  // The dashboard starts just below the fold (tilted back, slightly smaller,
  // deeper) and settles to identity: a camera-like ease, no wobble.
  const riseAt = dashAt + 0.2
  tl.set(frame, { opacity: 1 }, riseAt)
  tl.fromTo(
    frame,
    { ...S.dashFrom, y: () => vh() * S.dashFrom.y },
    { y: 0, rotationX: 0, rotationY: 0, scale: 1, z: 0, duration: S.dashDur, ease: 'power3.out' },
    riseAt,
  )
  // The light page surface rises with the dashboard (a soft-edged sheet
  // travelling up), so the stage never passes through a flat grey crossfade.
  const lightAt = dashAt + 0.25
  const lightDur = 1.35
  tl.fromTo(light, { yPercent: 50 }, { yPercent: -30, duration: lightDur, ease: 'power1.inOut' }, lightAt)
  const coveredTime = lightAt + lightDur

  /* ---------- split: slices > tiles > arrange > flip > cards ----------
   * 1. swap the unified dashboard for four pixel-identical slice copies
   * 2. slices separate with growing gaps and a little depth
   * 3. each strip is cropped to a tile with the card's proportions
   * 4. tiles travel to their card slot (and, where the card is wider than a
   *    strip, as in the 2x2 layouts, the fragment zooms up to card size)
   * 5. staggered rotateY flip reveals the stat card on the back face, which
   *    is laid out at its final size, so it always settles at scale 1
   * 6. swap to the flat, accessible card grid (identical geometry)
   */
  const splitAt = riseAt + S.dashDur + S.dashHold
  const cropAt = splitAt + 0.2
  const arrangeAt = splitAt + 0.85
  const flipAt = splitAt + 1.35
  tl.addLabel('split', splitAt)
  tl.set(whole, { autoAlpha: 0 }, splitAt)
  tl.set(slicesWrap, { autoAlpha: 1 }, splitAt)
  tl.to(shadow, { opacity: 0, duration: 0.45, ease: 'power1.out' }, splitAt)
  tl.fromTo(edges, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' }, splitAt + 0.05)

  const tileRadius = () => geometry().radius * geometry().k
  const cardInsetX = () => (geometry().sw - geometry().cw) / 2
  const cardInsetY = () => (geometry().H - geometry().ch) / 2

  slices.forEach((slice, i) => {
    const offset = i - last / 2
    const moveAt = arrangeAt + i * S.moveStagger

    tl.fromTo(
      slice,
      { x: 0, y: 0, z: 0, rotationY: 0, transformPerspective: S.slicePerspective },
      { x: offset * S.sepGap, z: S.sepZ, duration: 0.9, ease: 'power2.out' },
      splitAt,
    )

    // crop: strip to tile
    tl.fromTo(
      fronts[i],
      { clipPath: () => clipFrom(i), scale: 1 },
      { clipPath: clipTo, duration: 0.85, ease: 'power2.inOut' },
      cropAt,
    )
    tl.fromTo(
      edges[i],
      {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderTopLeftRadius: () => cornerRadii(i)[0],
        borderTopRightRadius: () => cornerRadii(i)[1],
        borderBottomRightRadius: () => cornerRadii(i)[2],
        borderBottomLeftRadius: () => cornerRadii(i)[3],
      },
      {
        top: () => geometry().insetY,
        bottom: () => geometry().insetY,
        left: () => geometry().insetX,
        right: () => geometry().insetX,
        borderTopLeftRadius: tileRadius,
        borderTopRightRadius: tileRadius,
        borderBottomRightRadius: tileRadius,
        borderBottomLeftRadius: tileRadius,
        duration: 0.85,
        ease: 'power2.inOut',
      },
      cropAt,
    )

    // arrange: tile to its card slot (+ zoom to card size where needed)
    tl.to(
      slice,
      { x: () => sliceTarget(i).x, y: () => sliceTarget(i).y, duration: 1, ease: 'power3.inOut' },
      moveAt,
    )
    tl.to(fronts[i], { scale: () => 1 / geometry().k, duration: 1, ease: 'power3.inOut' }, moveAt)
    tl.to(
      edges[i],
      {
        top: cardInsetY,
        bottom: cardInsetY,
        left: cardInsetX,
        right: cardInsetX,
        borderTopLeftRadius: () => geometry().radius,
        borderTopRightRadius: () => geometry().radius,
        borderBottomRightRadius: () => geometry().radius,
        borderBottomLeftRadius: () => geometry().radius,
        duration: 1,
        ease: 'power3.inOut',
      },
      moveAt,
    )

    // flip
    tl.to(slice, { rotationY: 180, z: 0, duration: 0.95, ease: 'power2.inOut' }, flipAt + i * S.flipStagger)
  })

  /* ---------- end: swap to the flat accessible cards, hold ---------- */
  const endAt = Math.max(flipAt + last * S.flipStagger + 0.95, arrangeAt + last * S.moveStagger + 1) + 0.05
  tl.addLabel('end', endAt)
  tl.set(slicesWrap, { autoAlpha: 0 }, endAt)
  tl.set(cardsList, { autoAlpha: 1 }, endAt)
  tl.to({}, { duration: S.endHold }, endAt)

  coveredAt = coveredTime / tl.duration()
  return tl
}
