import { gsap, MQ, SCRUB, useGSAP, ANTICIPATE_PIN } from '../../../../lib/gsap'
import {
  ACTIVE_SWITCH,
  APPROACH,
  BEATS,
  CAMERA,
  ENTER,
  ENTER_AT,
  EXIT,
  EXIT_AT,
  INTRO_EXIT,
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
  // The approach docks the inner block; the master timeline moves the outer
  // header — two timelines never animate the same element.
  const intro = q('.feat-intro')[0]
  const introInner = q('.feat-intro__inner')[0]
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

  /* ---- Approach (pre-pin): heading docks behind the hero and comes forward ---- */
  // The section rises one viewport height during the approach. The heading
  // block rides APPROACH.DOCK viewports above its resting place — so it
  // follows the hero's last row closely instead of arriving a screen later —
  // then decelerates into place, reaching zero speed as the pin takes over.
  const approach = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top bottom',
      end: 'top top',
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  })
  // power1.in is quadratic: the offset's rate at the end is 2 × DOCK / (1 − DOCK_START)
  // viewports per viewport scrolled = exactly the scroll speed, so the heading lands
  // with zero on-screen velocity (no overshoot, no bump when the pin takes over).
  approach.fromTo(
    introInner,
    { y: () => -APPROACH.DOCK * window.innerHeight },
    { y: 0, duration: 1 - APPROACH.DOCK_START, ease: 'power1.in' },
    APPROACH.DOCK_START,
  )
  // One tween per part (not a `stagger`): every part's hidden start state is
  // rendered immediately, so no part shows early and then blinks out when its
  // turn comes.
  introParts.forEach((part, i) => {
    const at = APPROACH.revealAt + i * APPROACH.stagger
    approach.fromTo(part, { opacity: 0 }, { opacity: 1, duration: APPROACH.fade, ease: 'sine.out' }, at)
    approach.fromTo(
      part,
      { z: -200, y: 28, transformPerspective: 1200 },
      { z: 0, y: 0, duration: APPROACH.settle, ease: 'power2.out' },
      at,
    )
  })
  approach.to({}, { duration: 0 }, 1) // normalise the approach to 0 → 1

  /* ---- Master timeline (pinned) ---- */
  // The scene in view is the only one that takes pointer input (hover). It is
  // derived from the playhead, written to the DOM only when it changes.
  let active = null
  const setActive = (index) => {
    if (index === active) return
    active = index
    sceneEls.forEach((el, i) => el.toggleAttribute('data-active', i === index))
  }
  const sceneAt = (t) => (t < ACTIVE_SWITCH[0] ? -1 : t < ACTIVE_SWITCH[1] ? 0 : t < ACTIVE_SWITCH[2] ? 1 : 2)

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * PIN_VH)}`,
      pin: true,
      scrub: SCRUB,
      anticipatePin: ANTICIPATE_PIN,
      invalidateOnRefresh: true,
      // A refresh (resize, breakpoint switch, font load) re-renders the
      // timeline from 0 — firing onUpdate with "no scene" — and then restores
      // the playhead with events suppressed. Re-derive the active scene from
      // the restored playhead, or hover stays dead until the next scroll.
      onRefresh: (self) => self.animation && setActive(sceneAt(self.animation.time())),
    },
    onUpdate() {
      setActive(sceneAt(this.time()))
    },
  })
  Object.entries(LABELS).forEach(([name, at]) => tl.addLabel(name, at))

  // Intro: the heading recedes up and back, and has dissolved before scene A
  // rises into the space it occupied.
  const [introStart, introEnd] = BEATS.introOut
  const [fadeStart, fadeEnd] = BEATS.introFade
  tl.to(
    intro,
    { y: () => INTRO_EXIT.y * sh(), z: INTRO_EXIT.z, duration: introEnd - introStart, ease: INTRO_EXIT.ease },
    introStart,
  )
  tl.to(intro, { opacity: 0, duration: fadeEnd - fadeStart, ease: 'sine.inOut' }, fadeStart)

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

  // Each slot travels on its own path and fades in its own window (see the
  // hand-over notes in choreography.js): incoming panels only become visible
  // where the outgoing ones have already dissolved — no double exposure.
  const enterScene = (index) => {
    const start = ENTER_AT[index]
    const vectors = ENTER[LAYOUT_KEYS[index]]
    for (const slot of SLOTS) {
      const el = scenes[index][slot]
      const v = vectors[slot]
      const [fadeAt, fadeDur] = v.fade
      tl.fromTo(el, pose(v), { ...REST, duration: v.dur, ease: 'power3.out' }, start + v.at)
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: fadeDur, ease: 'sine.inOut' }, start + fadeAt)
    }
  }
  const exitScene = (index) => {
    const start = EXIT_AT[index]
    const vectors = EXIT[LAYOUT_KEYS[index]]
    for (const slot of SLOTS) {
      const el = scenes[index][slot]
      const v = vectors[slot]
      const [fadeAt, fadeDur] = v.fade
      tl.to(el, { ...pose(v), duration: v.dur, ease: 'sine.inOut' }, start + v.at)
      tl.to(el, { opacity: 0, duration: fadeDur, ease: 'sine.inOut' }, start + fadeAt)
    }
  }

  enterScene(0)
  exitScene(0)
  enterScene(1)
  exitScene(1)
  enterScene(2)

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
