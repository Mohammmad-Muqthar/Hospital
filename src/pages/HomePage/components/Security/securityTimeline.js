import { gsap, EASE } from '../../../../lib/gsap'
import { CHAMBER, ROUTED_REGION_INDEX } from '../../../../data/mock/mockSecurity'
import { SCENE, fitScene, hubOffsetFromRegion, spreadOffset } from './securityGeometry'

/**
 * Timeline labels, in story order. Feature i of SECURITY.features maps to
 * FEATURE_LABELS[i]; the quick navigation jumps to these.
 */
export const FEATURE_LABELS = ['branch', 'isolation', 'consent', 'routing']

/**
 * Story beats in timeline units. Labels are evenly spaced (2 units) so the
 * pinned desktop scene and the non-pinned scroll-by blocks on smaller
 * screens can share one timeline: each feature owns the same scroll length.
 */
export const BEATS = {
  branch: 1,
  isolation: 3,
  consent: 5,
  routing: 7,
  final: 8,
  end: 8.5,
}
/** Spacing between consecutive feature labels (in timeline units). */
export const BEAT_SPACING = 2

/** Start of each scene transition (B, C, D); the reading area hands over there too. */
const HANDOVERS = [1.5, 3.5, 5.4]

/**
 * Reading-area hand-over is strictly sequential: the outgoing feature is
 * fully gone (TEXT_OUT) before the incoming one starts (TEXT_IN_AT), so the
 * two never share pixels in the stacked cell — no ghost text at any stop.
 */
const TEXT_OUT = 0.2
const TEXT_IN_AT = 0.24

/** Time at which the active feature (aria-current) switches: between out and in. */
export const FEATURE_SWITCH_TIMES = HANDOVERS.map((t) => t + (TEXT_OUT + TEXT_IN_AT) / 2)

/** Camera / spacing presets per motion mode. Angles in degrees. */
const MODES = {
  desktop: {
    cam: {
      start: { rx: 57, rz: -41 },
      branch: { rx: 56, rz: -41 },
      isolation: { rx: 52, rz: -34 },
      consent: { rx: 54, rz: -45 },
      routing: { rx: 58, rz: -31 },
      final: { rx: 57, rz: -38 },
    },
    rig: {
      consent: { x: -14, y: 30, z: 24 },
      routing: { x: 6, y: -26, z: 30 },
    },
    gaps: { tight: 8, branch: 34, isolation: 60 },
    lift: 16,
  },
  compact: {
    cam: {
      start: { rx: 56, rz: -40 },
      branch: { rx: 56, rz: -40 },
      isolation: { rx: 53, rz: -36 },
      consent: { rx: 55, rz: -43 },
      routing: { rx: 57, rz: -34 },
      final: { rx: 57, rz: -38 },
    },
    rig: {
      consent: { x: -24, y: 52, z: 20 },
      routing: { x: 0, y: -12, z: 20 },
    },
    gaps: { tight: 8, branch: 30, isolation: 52 },
    lift: 12,
  },
}

/**
 * The camera is three transform tweens sharing one time, duration and ease:
 * tilt on the scene, turn on the plane, and the matching counter-rotation on
 * every billboard anchor (so labels keep facing the viewer). Plain transforms
 * on 14 elements — nothing inherited is animated across the 3D tree.
 */
function setCamera(view, { rx, rz }) {
  gsap.set(view.scene, { rotationX: rx })
  gsap.set(view.plane, { rotation: rz })
  gsap.set(view.billboards, {
    x: 0,
    y: 0,
    z: (i, el) => Number(el.dataset.bz) || 0,
    rotation: -rz,
    rotationY: 0,
    rotationX: -rx,
  })
}

function moveCamera(tl, view, { rx, rz }, vars, at) {
  tl.to(view.scene, { rotationX: rx, ...vars }, at)
  tl.to(view.plane, { rotation: rz, ...vars }, at)
  tl.to(view.billboards, { rotationX: -rx, rotation: -rz, ...vars }, at)
}

/**
 * Build the single master timeline for the Security architecture.
 * `q` is a gsap.utils.selector scoped to the section. Returns the paused
 * timeline (the caller attaches it to a ScrollTrigger).
 *
 * Every tween animates transforms or opacity. No two tweens animate the same
 * property of the same element at overlapping times, so scrubbing backwards
 * is exact.
 */
export function buildSecurityTimeline(q, { mode = 'desktop', withText = true } = {}) {
  const cfg = MODES[mode]
  const view = { scene: q('.sx-scene')[0], plane: q('.sx-plane')[0], billboards: q('.sx-bb') }
  const rig = q('.sx-rig')[0]
  const slots = q('.sx-slot')
  const chambers = q('.sx-chamber')
  const aos = q('.sx-ao')
  const active = q('.sx-slot.is-active')[0]
  const focus = q('.sx-slot.is-focus')[0]
  const activeChamber = active.querySelector('.sx-chamber')
  const activeAo = active.querySelector('.sx-ao')
  const focusChamber = focus.querySelector('.sx-chamber')
  const focusAo = focus.querySelector('.sx-ao')
  const names = q('.sx-name')
  const walls = q('.sx-walls')
  const wallPlanes = q('.sx-wall')
  const slabsBySlot = slots.map((slot) => slot.querySelectorAll('.sx-slab'))
  const tags = q('.sx-tag')
  const panel = q('.sx-panel')[0]
  const pending = q('.sx-status--pending')[0]
  const approved = q('.sx-status--approved')[0]
  const timeRow = q('.sx-panel__time')[0]
  const gate = q('.sx-gate')[0]
  const regionLifts = q('.sx-region__lift')
  const regionLabels = q('.sx-region__label')
  const routedLabel = q('.sx-region.is-routed .sx-region__label')[0]
  const routedGlow = q('.sx-region.is-routed .sx-region__glow')[0]
  const token = q('.sx-token')[0]
  const tokenBody = q('.sx-token__body')[0]
  const tokenAo = q('.sx-token__ao')[0]
  const tokenFaces = q('.sx-puck .sx-face')
  const chip = q('.sx-chip')[0]
  const features = q('.sec-feature')
  const stage = q('.sx')[0]
  const isDense = () => {
    const { width, height } = stage.getBoundingClientRect()
    return fitScene(width, height).dense
  }

  const hub = hubOffsetFromRegion(ROUTED_REGION_INDEX)
  // Hovers just above the chamber roofs while it travels down the corridor.
  const floatZ = 46
  const deckZ = 1
  const restTokenZ = SCENE.region.h
  const restAoZ = SCENE.region.h + 1.5
  const gateOpen = 78
  const spread = (gap) => ({
    x: (i, el) => spreadOffset(el, gap).x,
    y: (i, el) => spreadOffset(el, gap).y,
  })

  /* ---------- Start state (progress 0: a composed, unified platform) ---------- */
  setCamera(view, cfg.cam.start)
  gsap.set(rig, { x: 0, y: 0, z: 0 })
  gsap.set(slots, spread(cfg.gaps.tight))
  gsap.set(chambers, { z: -(CHAMBER.h - 12) })
  gsap.set(aos, { opacity: 0.35 })
  gsap.set(names, { opacity: 0, y: 6 })
  gsap.set(walls, { z: -24 })
  gsap.set(wallPlanes, { opacity: 0 })
  slabsBySlot.forEach((slabs) => gsap.set(slabs, { z: SCENE.slabHiddenZ }))
  gsap.set(tags, { opacity: 0, x: 6 })
  gsap.set(panel, { opacity: 0, y: 12 })
  gsap.set(pending, { opacity: 1 })
  gsap.set(approved, { opacity: 0, y: 6 })
  gsap.set(timeRow, { opacity: 0, y: 4 })
  gsap.set(gate, { rotationZ: 0 })
  gsap.set(regionLifts, { z: -(SCENE.region.h - 3) })
  gsap.set(regionLabels, { opacity: 0, y: 6 })
  gsap.set(routedGlow, { opacity: 0 })
  gsap.set(token, { x: hub.x, y: hub.y })
  gsap.set(tokenBody, { z: floatZ })
  gsap.set(tokenAo, { z: deckZ, opacity: 0, scale: 1.6 })
  gsap.set(tokenFaces, { opacity: 0 })
  gsap.set(chip, { opacity: 0, y: 8 })
  if (withText) gsap.set(features.slice(1), { opacity: 0, y: 16 })

  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.inOut } })

  /* ---------- A · Multi-branch ready: clinic chambers rise and separate ---------- */
  tl.to(chambers, { z: 0, duration: 0.8, stagger: 0.06, ease: 'power3.inOut' }, 0)
  tl.to(slots, { ...spread(cfg.gaps.branch), duration: 0.9 }, 0.08)
  tl.to(aos, { opacity: 1, duration: 0.7 }, 0.1)
  moveCamera(tl, view, cfg.cam.branch, { duration: 0.9, ease: EASE.soft }, 0.05)
  tl.to(names, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: EASE.out }, 0.5)
  tl.addLabel('branch', BEATS.branch)

  /* ---------- B · Tenant data isolation: walls rise, data layers reveal ---------- */
  const [b, c, d] = HANDOVERS
  if (withText) crossfade(tl, features[0], features[1], b)
  tl.to(names, { opacity: 0, y: -6, duration: 0.3, ease: 'none' }, b + 0.1)
  moveCamera(tl, view, cfg.cam.isolation, { duration: 1.3, ease: EASE.soft }, b)
  tl.to(slots, { ...spread(cfg.gaps.isolation), duration: 1.1 }, b)
  tl.to(walls, { z: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out' }, b + 0.2)
  tl.to(wallPlanes, { opacity: 1, duration: 0.6, ease: 'none' }, b + 0.2)
  slabsBySlot.forEach((slabs, i) => {
    tl.to(
      slabs,
      { z: (j) => SCENE.slabZ[j], duration: 0.8, stagger: 0.07, ease: 'power3.out' },
      b + 0.35 + i * 0.05,
    )
  })
  tl.to(activeChamber, { z: cfg.lift, duration: 0.6, ease: EASE.inOut }, b + 0.6)
  tl.to(activeAo, { opacity: 0.55, scale: 1.06, duration: 0.6 }, b + 0.6)
  tl.to(tags, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: EASE.out }, b + 1.05)
  tl.addLabel('isolation', BEATS.isolation)

  /* ---------- C · Consent-gated support: request → approval → gate opens ---------- */
  if (withText) crossfade(tl, features[1], features[2], c)
  tl.to(tags, { opacity: 0, x: 6, duration: 0.25, ease: 'none' }, c)
  tl.to(activeChamber, { z: 0, duration: 0.5 }, c)
  tl.to(activeAo, { opacity: 1, scale: 1, duration: 0.5 }, c)
  moveCamera(tl, view, cfg.cam.consent, { duration: 1.1, ease: EASE.soft }, c)
  tl.to(rig, { ...cfg.rig.consent, duration: 1.1, ease: EASE.soft }, c)
  tl.to(focusChamber, { z: cfg.lift * 0.75, duration: 0.5 }, c + 0.2)
  tl.to(focusAo, { opacity: 0.6, scale: 1.05, duration: 0.5 }, c + 0.2)
  tl.to(panel, { opacity: 1, y: 0, duration: 0.35, ease: EASE.out }, c + 0.3)
  tl.to(pending, { opacity: 0, duration: 0.2, ease: 'none' }, c + 0.85)
  tl.to(approved, { opacity: 1, y: 0, duration: 0.25, ease: EASE.out }, c + 0.9)
  tl.to(gate, { rotationZ: gateOpen, duration: 0.45, ease: EASE.inOut }, c + 1.0)
  tl.to(timeRow, { opacity: 1, y: 0, duration: 0.25, ease: EASE.out }, c + 1.1)
  tl.addLabel('consent', BEATS.consent)

  /* ---------- D · Country-routed help: a request token docks at its desk ---------- */
  if (withText) crossfade(tl, features[2], features[3], d)
  tl.to(panel, { opacity: 0, y: -8, duration: 0.3, ease: 'none' }, d)
  tl.to(gate, { rotationZ: 0, duration: 0.4 }, d + 0.05)
  tl.to(focusChamber, { z: 0, duration: 0.45 }, d)
  tl.to(focusAo, { opacity: 1, scale: 1, duration: 0.45 }, d)
  moveCamera(tl, view, cfg.cam.routing, { duration: 1.2, ease: EASE.soft }, d)
  tl.to(rig, { ...cfg.rig.routing, duration: 1.2, ease: EASE.soft }, d)
  tl.to(regionLifts, { z: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, d + 0.15)
  tl.to(regionLabels, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: EASE.out }, d + 0.4)
  tl.to(tokenFaces, { opacity: 1, duration: 0.2, ease: 'none' }, d + 0.55)
  tl.to(tokenAo, { opacity: 1, duration: 0.25, ease: 'none' }, d + 0.55)
  tl.to(chip, { opacity: 1, y: 0, duration: 0.25, ease: EASE.out }, d + 0.6)
  tl.to(token, { x: 0, y: 0, duration: 0.6, ease: EASE.inOut }, d + 0.8)
  tl.to(tokenBody, { z: restTokenZ, duration: 0.35, ease: 'power2.inOut' }, d + 1.15)
  tl.to(tokenAo, { z: restAoZ, scale: 1, duration: 0.35, ease: 'power2.inOut' }, d + 1.15)
  tl.to(routedGlow, { opacity: 1, duration: 0.25, ease: 'none' }, d + 1.35)
  tl.to(routedLabel, { opacity: 0, duration: 0.2, ease: 'none' }, d + 1.2)
  tl.addLabel('routing', BEATS.routing)

  /* ---------- Final: settle into the composed architecture ---------- */
  const f = 7.2
  moveCamera(tl, view, cfg.cam.final, { duration: 0.8, ease: EASE.soft }, f)
  tl.to(rig, { x: 0, y: 0, z: 0, duration: 0.8, ease: EASE.soft }, f)
  tl.to(slots, { ...spread(SCENE.restGap), duration: 0.8 }, f)
  // The layer tags return as a recap, except on dense (phone) stages, where
  // they would crowd the docked request chip. Evaluated per refresh.
  tl.to(
    tags,
    { opacity: () => (isDense() ? 0 : 1), x: 0, duration: 0.35, stagger: 0.05, ease: EASE.out },
    f + 0.35,
  )
  tl.addLabel('final', BEATS.final)
  // Short hold so the final composition is read before the pin releases.
  tl.to({}, { duration: BEATS.end - BEATS.final }, BEATS.final)

  return tl
}

/** Reading-area handover: the outgoing feature lifts away, then the incoming one settles in. */
function crossfade(tl, from, to, at) {
  tl.to(from, { opacity: 0, y: -14, duration: TEXT_OUT, ease: 'power1.in' }, at)
  tl.fromTo(
    to,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.35, ease: EASE.out, immediateRender: false },
    at + TEXT_IN_AT,
  )
}
