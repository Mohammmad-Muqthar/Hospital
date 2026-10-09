import { gsap, MQ, SCRUB, useGSAP } from '../../../../lib/gsap'
import {
  ACTIVE_SWITCH,
  BEATS,
  CAMERA,
  ENTER,
  EXIT,
  FADE_IN,
  FADE_OUT,
  LABELS,
  PIN_VH,
  TOTAL,
} from './choreography'

/** Full pinned 3D stage: wide + tall enough, and motion allowed. */
const STAGE_QUERY = `${MQ.cinematic} and ${MQ.motionOK}`
/** Everything else that still allows motion gets light, non-pinned reveals. */
const FLOW_QUERY = `${MQ.motionOK} and (max-width: 1023px), ${MQ.motionOK} and (max-height: 599px)`

const SLOTS = ['hero', 'medium', 'small1', 'small2']
const LAYOUT_KEYS = ['a', 'b', 'c']

/**
 * Builds the pinned desktop choreography: one master timeline on the
 * <section> (intro → scene A → B → C) plus a pre-pin approach that settles
 * the heading before the pin starts, so progress 0 is always composed.
 */
function buildStage(root) {
  const q = gsap.utils.selector(root)
  const stage = q('.feat-stage')[0]
  const intro = q('.feat-intro')[0]
  const introParts = q('.feat-intro__part')
  const camera = q('.feat-camera')[0]
  const sceneEls = q('.feat-scene')
  const scenes = sceneEls.map((scene) =>
    Object.fromEntries(SLOTS.map((slot) => [slot, scene.querySelector(`[data-slot="${slot}"]`)])),
  )

  root.classList.add('is-stage')

  // Size-dependent offsets are functions so every refresh re-measures them.
  const sw = () => stage.offsetWidth
  const sh = () => stage.offsetHeight
  const pose = (v) => ({
    x: () => v.x * sw(),
    y: () => v.y * sh(),
    z: v.z,
    rotationX: v.rotationX,
    rotationY: v.rotationY,
  })
  const REST = { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0 }

  /* ---- Approach (pre-pin): heading comes forward from depth and settles ---- */
  const approach = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top bottom',
      end: 'top top',
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  })
  approach.fromTo(
    introParts,
    { z: -200, y: 44, opacity: 0, transformPerspective: 1200 },
    { z: 0, y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.09 },
    0.32,
  )
  approach.to({}, { duration: 0 }, 1) // normalise the approach to 0 → 1

  /* ---- Master timeline (pinned) ---- */
  let active = null
  const setActive = (index) => {
    if (index === active) return
    active = index
    sceneEls.forEach((el, i) => el.toggleAttribute('data-active', i === index))
  }

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * PIN_VH)}`,
      pin: true,
      scrub: SCRUB,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    onUpdate() {
      const t = this.time()
      setActive(t < ACTIVE_SWITCH[0] ? -1 : t < ACTIVE_SWITCH[1] ? 0 : t < ACTIVE_SWITCH[2] ? 1 : 2)
    },
  })
  Object.entries(LABELS).forEach(([name, at]) => tl.addLabel(name, at))

  // Intro: the heading recedes up and back as the stage takes over.
  const [introStart, introEnd] = BEATS.introOut
  const [fadeStart, fadeEnd] = BEATS.introFade
  tl.to(intro, { y: () => -0.24 * sh(), z: -320, duration: introEnd - introStart, ease: 'power2.inOut' }, introStart)
  tl.to(intro, { opacity: 0, duration: fadeEnd - fadeStart, ease: 'sine.out' }, fadeStart)

  // Camera: starts tilted, resolves to identity for scene A, then makes a
  // small move during each hand-over and is back at identity on every hold.
  tl.fromTo(
    camera,
    { ...CAMERA.start, z: 0 },
    { rotationX: 0, rotationY: 0, duration: CAMERA.settleA[1] - CAMERA.settleA[0], ease: 'power2.out' },
    CAMERA.settleA[0],
  )
  for (const move of [CAMERA.aToB, CAMERA.bToC]) {
    const [s, e] = move.window
    const half = (e - s) / 2
    tl.to(camera, { ...move.peak, duration: half, ease: 'sine.inOut' }, s)
    tl.to(camera, { rotationX: 0, rotationY: 0, z: 0, duration: half, ease: 'sine.inOut' }, s + half)
  }

  const enterScene = (index, start) => {
    const vectors = ENTER[LAYOUT_KEYS[index]]
    for (const slot of SLOTS) {
      const el = scenes[index][slot]
      const v = vectors[slot]
      const at = start + v.at
      tl.fromTo(el, pose(v), { ...REST, duration: v.dur, ease: 'power3.out' }, at)
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: v.dur * FADE_IN, ease: 'sine.out' }, at)
    }
  }
  const exitScene = (index, start) => {
    const vectors = EXIT[LAYOUT_KEYS[index]]
    for (const slot of SLOTS) {
      const el = scenes[index][slot]
      const v = vectors[slot]
      const at = start + v.at
      tl.to(el, { ...pose(v), duration: v.dur, ease: 'sine.inOut' }, at)
      tl.to(el, { opacity: 0, duration: v.dur * FADE_OUT.dur, ease: 'sine.inOut' }, at + v.dur * FADE_OUT.delay)
    }
  }

  enterScene(0, BEATS.enterA[0])
  exitScene(0, BEATS.exitA[0])
  enterScene(1, BEATS.enterB[0])
  exitScene(1, BEATS.exitB[0])
  enterScene(2, BEATS.enterC[0])

  // Pad to the full length so the final hold is part of the pin.
  tl.to({}, { duration: 0 }, TOTAL)

  return () => {
    root.classList.remove('is-stage')
    sceneEls.forEach((el) => el.removeAttribute('data-active'))
  }
}

/**
 * Tablet, mobile and short desktop screens: no pin. Each panel settles
 * into place with a short scrubbed 3D move as it scrolls into view.
 *
 * Each reveal is a one-tween timeline rather than a bare tween: timeline
 * triggers defer their first refresh, so ScrollTrigger keeps the recorded
 * scroll position when a breakpoint switch rebuilds this branch (a bare
 * tween's immediate refresh clears it and the page would jump to the top).
 */
function buildFlow(root) {
  const q = gsap.utils.selector(root)
  const compact = window.matchMedia(MQ.mobile).matches
  const reveal = (trigger, start, end) =>
    gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger, start, end, scrub: 0.6 } })

  reveal(q('.feat-intro')[0], 'top 92%', 'top 55%').fromTo(
    q('.feat-intro__part'),
    { y: 32, z: -100, opacity: 0, transformPerspective: 900 },
    { y: 0, z: 0, opacity: 1, stagger: 0.08 },
  )

  q('.feat-panel').forEach((panel) => {
    reveal(panel, 'top 96%', 'top 64%').fromTo(
      panel,
      {
        y: 60,
        z: -80,
        rotationX: compact ? 8 : 10,
        opacity: 0,
        transformPerspective: 900,
        transformOrigin: '50% 0%',
      },
      { y: 0, z: 0, rotationX: 0, opacity: 1 },
    )
  })
}

/** All GSAP work for the Features section, scoped and auto-reverted. */
export default function useFeaturesChoreography(rootRef) {
  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      // (Scroll memory across breakpoint switches is kept by the page-level
      // trigger in hooks/useScrollTriggerSetup.js.)
      const mm = gsap.matchMedia()
      mm.add(STAGE_QUERY, () => buildStage(root))
      mm.add(FLOW_QUERY, () => buildFlow(root))
      // Reduced motion: no branch — the static composed layout is the CSS default.
    },
    { scope: rootRef },
  )
}
