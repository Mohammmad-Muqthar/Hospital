/**
 * Hero master timeline — one pinned stage, one scrubbed timeline.
 *
 * Labels (in order):
 *   type       camera pull-back through the giant headline
 *   copy       paragraph + CTAs reveal
 *   hold       readable composition (CTA hold)
 *   dashboard  copy recedes, dashboard rises in 3D, stage turns off-white
 *   split      dashboard → 4 pieces → each turns over into a stat card
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
  /** Pin distance per timeline second, in viewport heights (sets the scroll pace). */
  vhPerSecond: 0.338,
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
  // split: pieces part with a fine gap and a little depth (over `partDur`),
  // then each turns over (staggered) while its crop condenses to the card's
  // shape. The first turn starts exactly as the parting ends (no overlap on
  // the same properties, velocity-matched eases, no dead hold).
  sepGap: 22,
  sepZ: -30,
  partDur: 0.55,
  turnDur: 1,
  turnStagger: 0.12,
  slicePerspective: 1400,
  endHold: 0.45,
}

const TABLET = {
  ...DESKTOP,
  vhPerSecond: 0.312,
  perspective: 900,
  startScale: [5.2, 5.6, 6],
  lineDur: 2.2,
  lineStagger: 0.2,
  dashFrom: { y: 0.72, rotationX: 16, rotationY: -5, scale: 0.88, z: -80 },
  dashDur: 1.8,
  sepGap: 16,
  sepZ: -24,
  slicePerspective: 1200,
}

const MOBILE = {
  ...DESKTOP,
  vhPerSecond: 0.266,
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
  sepGap: 12,
  sepZ: -18,
  partDur: 0.5,
  turnDur: 0.95,
  turnStagger: 0.1,
  slicePerspective: 900,
  endHold: 0.4,
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

/** Group the headline's words into the lines of the active layout. */
function headlineLines(words, key) {
  const lines = []
  words.forEach((word) => {
    const n = Number(word.dataset[key]) || 0
    ;(lines[n] ||= []).push(word)
  })
  return lines.filter(Boolean)
}

export function buildHeroTimeline(root, conditions, { onCoveredChange } = {}) {
  const S = conditions.mobile ? MOBILE : conditions.tablet ? TABLET : DESKTOP
  const q = gsap.utils.selector(root)
  const one = (sel) => q(sel)[0]

  const bg = one('.hero-bg')
  const scrim = one('.hero-bg__scrim')
  const light = one('.hero__light')
  const copy = one('.hero__copy')
  const linesWrap = one('.hero__lines')
  const lines = headlineLines(q('.hero__word'), conditions.mobile ? 'lineNarrow' : 'lineWide')
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

  /* ---------- Split geometry (re-read on every refresh) ----------
   * Desktop cuts the dashboard into four vertical strips (cards in a row);
   * the 2×2 layouts cut it into quadrants, so every piece is already larger
   * than its card and nothing is ever scaled up (no blurred fragments). */
  const piece = (i) => {
    const s = slices[i]
    const cols = Math.max(1, Math.round(frame.offsetWidth / s.offsetWidth))
    const rows = Math.max(1, Math.round(frame.offsetHeight / s.offsetHeight))
    const col = Math.round(s.offsetLeft / s.offsetWidth)
    const row = Math.round(s.offsetTop / s.offsetHeight)
    return { col, row, cols, rows, w: s.offsetWidth, h: s.offsetHeight }
  }
  // The tile each piece condenses to: the card's size, centred in the piece.
  const tile = (i) => {
    const p = piece(i)
    const card = cards[i]
    const radius = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 16
    return {
      x: Math.max(0, (p.w - card.offsetWidth) / 2),
      y: Math.max(0, (p.h - card.offsetHeight) / 2),
      radius,
    }
  }
  const outerRadius = () => parseFloat(getComputedStyle(whole).borderTopLeftRadius) || 18
  // Only the dashboard's outer corners are rounded while the pieces are whole.
  const cornerRadii = (i) => {
    const { col, row, cols, rows } = piece(i)
    const r = outerRadius()
    const left = col === 0
    const top = row === 0
    const right = col === cols - 1
    const bottom = row === rows - 1
    // [top-left, top-right, bottom-right, bottom-left]
    return [left && top ? r : 0, right && top ? r : 0, right && bottom ? r : 0, left && bottom ? r : 0]
  }
  const clipFrom = (i) => {
    const [a, b, c, d] = cornerRadii(i)
    return `inset(0px 0px 0px 0px round ${a}px ${b}px ${c}px ${d}px)`
  }
  const clipTo = (i) => {
    const t = tile(i)
    return `inset(${t.y}px ${t.x}px ${t.y}px ${t.x}px round ${t.radius}px)`
  }
  const sepOffset = (i) => {
    const { col, row, cols, rows } = piece(i)
    return { x: (col - (cols - 1) / 2) * S.sepGap, y: (row - (rows - 1) / 2) * S.sepGap }
  }
  // Travel from the piece's centre to its card's centre (layout positions).
  const cardTarget = (i) => {
    const s = offsetWithin(slices[i], layer)
    const c = offsetWithin(cards[i], layer)
    return {
      x: c.x + cards[i].offsetWidth / 2 - (s.x + slices[i].offsetWidth / 2),
      y: c.y + cards[i].offsetHeight / 2 - (s.y + slices[i].offsetHeight / 2),
    }
  }

  /* ---------- Initial, non-timeline state ---------- */
  // Perspective must sit on the words' direct parent (perspective only reaches children).
  gsap.set(linesWrap, { perspective: S.perspective })
  gsap.set(ctaGroup, { pointerEvents: 'none' })
  gsap.set(slicesWrap, { autoAlpha: 0 })
  // The real stat cards stay in the accessibility tree the whole time (plain
  // opacity, not visibility): screen readers get the four facts from the top
  // of the page while the decorative, aria-hidden pieces do the visual turn.
  gsap.set(cardsList, { opacity: 0 })
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
      // Constant scroll pace: the pin is as long as the choreography needs.
      end: () => `+=${Math.round(vh() * S.vhPerSecond * tl.duration())}`,
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
  // viewport while it is close, then eases it up into its slot. All words of
  // a line share one tween, so they project exactly like a single element.
  gsap.set(linesWrap, { perspectiveOrigin: `50% ${50 / lines.length}%` })
  const firstLineShift = () => {
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0
    const target = nav + (window.innerHeight - nav) / 2
    const word = lines[0][0]
    const pos = offsetWithin(word, root)
    return target - (pos.y + word.offsetHeight / 2)
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

  /* ---------- split: pieces part, then each turns over into its card ----------
   * 1. swap the unified dashboard for four pixel-identical piece copies
   * 2. the pieces part with a fine gap and a little depth
   * 3. each piece turns over (staggered) while it travels to its card slot;
   *    in the first half of the turn its crop condenses from the piece to
   *    the card's shape, so the cropped fragment is only ever seen in motion
   *    and foreshortened, and the change completes by the edge-on moment
   * 4. the back face is the stat card laid out at its final size, so it
   *    settles at identity (crisp), then swaps to the flat accessible grid
   */
  const splitAt = riseAt + S.dashDur + S.dashHold
  tl.addLabel('split', splitAt)
  tl.set(whole, { autoAlpha: 0 }, splitAt)
  tl.set(slicesWrap, { autoAlpha: 1 }, splitAt)
  tl.to(shadow, { opacity: 0, duration: 0.45, ease: 'power1.out' }, splitAt)
  tl.fromTo(edges, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' }, splitAt + 0.05)

  const cropDelay = S.turnDur * 0.06
  const cropDur = S.turnDur * 0.42
  slices.forEach((slice, i) => {
    // part
    tl.fromTo(
      slice,
      { x: 0, y: 0, z: 0, rotationY: 0, transformPerspective: S.slicePerspective },
      {
        x: () => sepOffset(i).x,
        y: () => sepOffset(i).y,
        z: S.sepZ,
        duration: S.partDur,
        ease: 'power2.out',
      },
      splitAt,
    )

    // turn over + travel to the card slot (explicit start values: these
    // continue exactly where the parting ended, whatever the scroll path)
    const turnAt = splitAt + S.partDur + i * S.turnStagger
    tl.fromTo(
      slice,
      { rotationY: 0, z: S.sepZ },
      { rotationY: 180, z: 0, duration: S.turnDur, ease: 'power2.inOut', immediateRender: false },
      turnAt,
    )
    tl.fromTo(
      slice,
      { x: () => sepOffset(i).x, y: () => sepOffset(i).y },
      {
        x: () => cardTarget(i).x,
        y: () => cardTarget(i).y,
        duration: S.turnDur,
        ease: 'power3.inOut',
        immediateRender: false,
      },
      turnAt,
    )

    // condense: piece → card-shaped tile, finished by the edge-on moment
    tl.fromTo(
      fronts[i],
      { clipPath: () => clipFrom(i) },
      { clipPath: () => clipTo(i), duration: cropDur, ease: 'power1.inOut' },
      turnAt + cropDelay,
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
        top: () => tile(i).y,
        bottom: () => tile(i).y,
        left: () => tile(i).x,
        right: () => tile(i).x,
        borderTopLeftRadius: () => tile(i).radius,
        borderTopRightRadius: () => tile(i).radius,
        borderBottomRightRadius: () => tile(i).radius,
        borderBottomLeftRadius: () => tile(i).radius,
        duration: cropDur,
        ease: 'power1.inOut',
      },
      turnAt + cropDelay,
    )
  })

  /* ---------- end: swap to the flat accessible cards, hold ---------- */
  const endAt = splitAt + S.partDur + (slices.length - 1) * S.turnStagger + S.turnDur + 0.05
  tl.addLabel('end', endAt)
  tl.set(slicesWrap, { autoAlpha: 0 }, endAt)
  tl.set(cardsList, { opacity: 1 }, endAt)
  tl.to({}, { duration: S.endHold }, endAt)

  coveredAt = coveredTime / tl.duration()
  return tl
}
