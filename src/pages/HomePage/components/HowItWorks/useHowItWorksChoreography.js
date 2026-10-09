import { useCallback, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, MQ, SCRUB } from '../../../../lib/gsap'
import { getNavOffset, scrollToY } from '../../../../lib/scroll'

/* ------------------------------------------------------------------ */
/* Layout branches                                                     */
/* ------------------------------------------------------------------ */
const MOTION = MQ.motionOK
const QUERIES = {
  split: `${MOTION} and (min-width: 1024px) and (min-height: 600px)`,
  tablet: `${MOTION} and (min-width: 768px) and (max-width: 1023px) and (min-height: 600px)`,
  phone: `${MOTION} and (max-width: 767px) and (min-height: 560px)`,
  // Too short for a pinned stage: composed static layout + a short scrubbed settle.
  flow: `${MOTION} and (min-width: 768px) and (max-height: 599px), ${MOTION} and (max-width: 767px) and (max-height: 559px)`,
}

/**
 * Per-variant numbers. Pin distance is in viewport heights (desktop ≤ 3.4,
 * phones kept short). Angles are [rotationY, rotationX] in degrees.
 *
 * The phone's CSS size is its FINAL size: during the steps it rests at
 * `restScale` with no rotation (a plain 2D transform) and the final move
 * settles it to the identity transform, so every hold is crisp. 3D turns
 * happen only while something is moving.
 */
const VARIANTS = {
  split: {
    layout: 'split',
    pinVh: 3.2,
    emerge: { z: -420, scale: 0.8, rotationY: -18, rotationX: 10, yVh: 0.12 },
    revealed: [-6.5, 2.2],
    nudge: [-2.4, 0.9],
    finalTilt: [-3.2, 1.2],
    restScale: 0.94,
    driftShare: 0.3,
  },
  tablet: {
    layout: 'stacked',
    pinVh: 2.8,
    emerge: { z: -320, scale: 0.84, rotationY: -12, rotationX: 7, yVh: 0.08 },
    revealed: [-5, 1.8],
    nudge: [-1.8, 0.7],
    finalTilt: [-2.4, 0.9],
    restScale: 0.96,
    driftShare: 0,
  },
  phone: {
    layout: 'stacked',
    pinVh: 2.4,
    emerge: { z: -240, scale: 0.86, rotationY: -9, rotationX: 6, yVh: 0.06 },
    revealed: [-4, 1.4],
    nudge: [-1.4, 0.5],
    finalTilt: [-1.8, 0.7],
    restScale: 0.97,
    driftShare: 0,
  },
}

/**
 * Master timeline map (unitless — the pin distance stretches it).
 * Each step: a transition of `stepDur`, then a readable hold before the next.
 */
const T = {
  reveal: 0.3, // intro hold ends; the heading glides to its supporting slot
  headDur: 0.7,
  emerge: 0.62, // the phone surfaces once the heading has mostly cleared the centre
  emergeDur: 1.05,
  phone: 1.7, // phone revealed (short hold)
  steps: [2.0, 3.15, 4.3, 5.45], // transition starts; each settles after stepDur, then holds
  stepDur: 0.75,
  final: 6.6,
  finalDur: 0.8,
  end: 7.75,
  // Step/final labels sit just inside each hold, so landing exactly on a
  // label always shows the fully settled state.
  labelInset: 0.1,
}

const STEP_LABELS = ['step1', 'step2', 'step3', 'step4']

/* ------------------------------------------------------------------ */
/* Measurement helpers (layout boxes only — immune to transforms)      */
/* ------------------------------------------------------------------ */
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

/** Widest rendered line of a text element, in untransformed px. */
function lineWidth(el) {
  const range = document.createRange()
  range.selectNodeContents(el)
  const box = el.getBoundingClientRect()
  const scale = el.offsetWidth ? box.width / el.offsetWidth : 1
  let left = Infinity
  let right = -Infinity
  for (const r of range.getClientRects()) {
    if (r.width < 1) continue
    left = Math.min(left, r.left)
    right = Math.max(right, r.right)
  }
  if (!Number.isFinite(left)) return el.offsetWidth
  return (right - left) / (scale || 1)
}

/**
 * Where the heading sits at progress 0: large and centred in the visible
 * stage (below the navbar). Returned as transforms relative to its slot.
 */
function headIntroGeometry({ stage, layoutEl, head, eyebrow, title, centred }) {
  const stageW = stage.clientWidth
  const stageH = stage.clientHeight
  const nav = getNavOffset()
  const areaH = stageH - nav
  const cx = stageW / 2
  const cy = nav + areaH / 2

  const t = offsetWithin(title, stage)
  const e = offsetWithin(eyebrow, stage)
  const tH = title.offsetHeight
  const tBox = title.offsetWidth
  const tLine = lineWidth(title)
  const eW = eyebrow.offsetWidth
  const eH = eyebrow.offsetHeight

  const slotFs = Number.parseFloat(getComputedStyle(title).fontSize) || 1
  const introFs = Number.parseFloat(getComputedStyle(head).fontSize) || slotFs
  const gutter = Number.parseFloat(getComputedStyle(layoutEl).paddingLeft) || 20
  const s = Math.max(1, Math.min(introFs / slotFs, (stageW - gutter * 2) / Math.max(1, tLine), (areaH * 0.62) / tH))
  const es = Math.min(1.18, s)
  const slotGap = Math.max(0, t.y - (e.y + eH))
  const gap = slotGap * Math.min(s, 1.7)
  const blockH = eH * es + gap + tH * s
  const top = cy - blockH / 2 - areaH * 0.025

  if (centred) {
    return {
      title: { x: cx - (t.x + tBox / 2), y: top + eH * es + gap - t.y, scale: s },
      eyebrow: { x: cx - (e.x + eW / 2), y: top - e.y, scale: es },
    }
  }
  const blockW = Math.max(eW * es, tLine * s)
  const left = cx - blockW / 2
  return {
    title: { x: left - t.x, y: top + eH * es + gap - t.y, scale: s },
    eyebrow: { x: left - e.x, y: top - e.y, scale: es },
  }
}

/* ------------------------------------------------------------------ */
/* Builders                                                            */
/* ------------------------------------------------------------------ */
function collect(root) {
  const q = gsap.utils.selector(root)
  return {
    stage: q('.how-stage')[0],
    layoutEl: q('.how-layout')[0],
    env: q('.how-env')[0],
    feather: q('.how-feather')[0],
    head: q('.how-head')[0],
    eyebrow: q('.how-head__eyebrow')[0],
    title: q('.how-head__title')[0],
    device: q('.how-device')[0],
    light: q('.how-device__light')[0],
    shadow: q('.how-device__shadow')[0],
    lens: q('.how-device__lens')[0],
    rig: q('.how-rig')[0],
    sheen: q('.how-phone__sheen')[0],
    notifs: q('[data-notif]').sort((a, b) => Number(a.dataset.notif) - Number(b.dataset.notif)),
    stepTitles: q('.how-step__title'),
    stepTexts: q('.how-step__text'),
  }
}

/** Pre-pin approach: off-white → deep teal, then the heading surfaces. */
function buildApproach(root, el, { end = 'top top', headFrom = 0.58 } = {}) {
  return gsap
    .timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top bottom',
        end,
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(el.env, { opacity: 0 }, { opacity: 1, duration: 0.75, ease: 'sine.inOut' }, 0)
    .fromTo(el.feather, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: 'sine.inOut' }, 0.8)
    .fromTo(
      el.head,
      { y: () => window.innerHeight * 0.07, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 - headFrom, ease: 'power2.out' },
      headFrom,
    )
    .set({}, {}, 1)
}

function buildStage(root, variantKey, onStepChange, memory) {
  const v = VARIANTS[variantKey]
  const el = collect(root)
  const { notifs, stepTitles, stepTexts, rig, light, shadow, sheen, lens } = el
  const centred = v.layout === 'stacked'

  root.classList.add('how--stage', `how--${v.layout}`)

  buildApproach(root, el)

  // ---- Function-based geometry (re-evaluated on every ScrollTrigger refresh)
  const intro = () => headIntroGeometry({ ...el, centred })
  const drift = () => {
    if (!v.driftShare) return 0
    const d = offsetWithin(el.device, el.stage)
    return (el.stage.clientWidth / 2 - (d.x + el.device.offsetWidth / 2)) * v.driftShare
  }
  // Notifications are laid out newest-first; at step k every visible card is
  // shifted up by the final offset of the newest one (k), so the stack always
  // starts at the top slot. `slot(k)` is that offset.
  const slot = (k) => notifs[k].offsetTop - notifs[notifs.length - 1].offsetTop
  const arrival = (k) => notifs[k].offsetHeight * 0.42
  const sheenFor = (ry) => ry * -1.6

  // Crispness: while the phone is square to the viewer (no rotation, no z),
  // perspective has no visual effect — but it makes the browser rasterise
  // the device at a fallback scale and resample it. Dropping it during those
  // holds lets the in-phone text render pixel-sharp at its true scale.
  let lensFlat = false
  const syncLensFlat = () => {
    const square =
      Math.abs(gsap.getProperty(rig, 'rotationY')) < 1e-3 &&
      Math.abs(gsap.getProperty(rig, 'rotationX')) < 1e-3 &&
      Math.abs(gsap.getProperty(rig, 'z')) < 0.05
    if (square === lensFlat) return
    lensFlat = square
    lens.classList.toggle('is-flat', square)
  }

  let lastStep = -2
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * v.pinVh)}`,
      pin: true,
      scrub: SCRUB,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        if (!ScrollTrigger.isRefreshing) memory.progress = self.progress
      },
    },
    onUpdate() {
      const time = this.time()
      let index = -1
      T.steps.forEach((start, k) => {
        if (time >= start + T.stepDur * 0.45) index = k
      })
      if (index !== lastStep) {
        lastStep = index
        onStepChange(index)
      }
      syncLensFlat()
    },
  })

  tl.addLabel('intro', 0)

  // ---- STAGE 1 → 2: heading glides from the centred intro to its supporting slot
  tl.fromTo(
    el.eyebrow,
    {
      x: () => intro().eyebrow.x,
      y: () => intro().eyebrow.y,
      scale: () => intro().eyebrow.scale,
    },
    { x: 0, y: 0, scale: 1, duration: T.headDur, ease: 'power2.inOut' },
    T.reveal,
  ).fromTo(
    el.title,
    {
      x: () => intro().title.x,
      y: () => intro().title.y,
      scale: () => intro().title.scale,
      opacity: 1,
    },
    { x: 0, y: 0, scale: 1, opacity: centred ? 0.78 : 0.66, duration: T.headDur, ease: 'power2.inOut' },
    T.reveal,
  )

  // ---- STAGE 2: the phone emerges from depth and straightens
  const e = v.emerge
  const rest = v.restScale
  tl.fromTo(lens, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power1.out' }, T.emerge + 0.08)
    .fromTo(
      rig,
      {
        x: () => drift() * 1.2,
        y: () => window.innerHeight * e.yVh,
        z: e.z,
        scale: e.scale * rest,
        rotationY: e.rotationY,
        rotationX: e.rotationX,
      },
      {
        x: drift,
        y: 0,
        z: 0,
        scale: rest,
        rotationY: v.revealed[0],
        rotationX: v.revealed[1],
        duration: T.emergeDur,
        ease: 'power3.out',
      },
      T.emerge,
    )
    .fromTo(
      sheen,
      { xPercent: sheenFor(e.rotationY) },
      { xPercent: sheenFor(v.revealed[0]), duration: T.emergeDur, ease: 'power3.out' },
      T.emerge,
    )
    .fromTo(
      light,
      { opacity: 0, scale: 0.72, x: drift },
      { opacity: 1, scale: 1, x: drift, duration: 0.9, ease: 'power2.out' },
      T.emerge + 0.15,
    )
    .fromTo(
      shadow,
      { opacity: 0, scaleX: 0.55, x: drift },
      { opacity: 1, scaleX: rest, x: drift, duration: 0.9, ease: 'power2.out' },
      T.emerge + 0.15,
    )

  tl.addLabel('phone', T.phone)

  // ---- STAGES 3–6: one step per notification
  T.steps.forEach((t0, k) => {
    if (k === 0) {
      // Step 1: the phone glides to centre-left and squares up to the viewer.
      tl.to(rig, { x: 0, rotationY: 0, rotationX: 0, duration: T.stepDur }, t0)
        .to(sheen, { xPercent: 0, duration: T.stepDur }, t0)
        .to([light, shadow], { x: 0, duration: T.stepDur }, t0)
    } else {
      // Later steps: a small, settling turn as each notification lands —
      // the device "reacts", then rests square (and crisp) for the hold.
      const [ny, nx] = v.nudge
      tl.to(rig, { rotationY: ny, rotationX: nx, duration: 0.32, ease: 'sine.inOut' }, t0 + 0.08)
        .to(rig, { rotationY: 0, rotationX: 0, duration: 0.35, ease: 'sine.inOut' }, t0 + 0.4)
        .to(sheen, { xPercent: sheenFor(ny), duration: 0.32, ease: 'sine.inOut' }, t0 + 0.08)
        .to(sheen, { xPercent: 0, duration: 0.35, ease: 'sine.inOut' }, t0 + 0.4)
    }

    // Existing notifications slide down one slot; the previous newest is de-emphasised.
    for (let i = 0; i < k; i += 1) {
      tl.to(notifs[i], { y: () => -slot(k), duration: 0.5, ease: 'power2.inOut' }, t0)
    }
    if (k > 0) {
      tl.to(notifs[k - 1], { opacity: 0.74, scale: 0.98, duration: 0.45, ease: 'power1.inOut' }, t0 + 0.05)
    }

    // The new notification drops into the top slot, like a real banner arriving.
    tl.fromTo(
      notifs[k],
      { y: () => -slot(k) - arrival(k), opacity: 0, scale: 0.95 },
      { y: () => -slot(k), opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' },
      t0 + (k ? 0.17 : 0.14),
    )

    // Step copy: the outgoing block lifts away, the incoming one rises in.
    if (k > 0) {
      tl.to(stepTitles[k - 1], { y: -16, opacity: 0, duration: 0.25, ease: 'sine.inOut' }, t0).to(
        stepTexts[k - 1],
        { y: -12, opacity: 0, duration: 0.25, ease: 'sine.inOut' },
        t0 + 0.04,
      )
    }
    tl.fromTo(
      stepTitles[k],
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
      t0 + (k ? 0.24 : 0.18),
    ).fromTo(
      stepTexts[k],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
      t0 + (k ? 0.3 : 0.24),
    )

    tl.addLabel(STEP_LABELS[k], t0 + T.stepDur + T.labelInset)
  })

  // ---- STAGE 7: final — a slight tilt while it comes forward, then it
  // straightens and settles at the identity transform (crisp, full size).
  const [fy, fx] = v.finalTilt
  tl.to(rig, { scale: 1, duration: T.finalDur, ease: 'power2.inOut' }, T.final)
    .to(rig, { rotationY: fy, rotationX: fx, duration: T.finalDur * 0.45, ease: 'sine.inOut' }, T.final)
    .to(rig, { rotationY: 0, rotationX: 0, duration: T.finalDur * 0.55, ease: 'sine.inOut' }, T.final + T.finalDur * 0.45)
    .to(sheen, { xPercent: sheenFor(fy), duration: T.finalDur * 0.45, ease: 'sine.inOut' }, T.final)
    .to(sheen, { xPercent: 0, duration: T.finalDur * 0.55, ease: 'sine.inOut' }, T.final + T.finalDur * 0.45)
    .to(notifs.slice(0, -1), { opacity: 0.92, scale: 1, duration: 0.6, ease: 'power1.inOut' }, T.final + 0.1)
    .to(light, { scale: 1.08, duration: T.finalDur }, T.final)
    .to(shadow, { scaleX: 1, duration: T.finalDur }, T.final)
    .addLabel('final', T.final + T.finalDur + T.labelInset)
    .set({}, {}, T.end)

  const stopResume = resumeAfterSwitch(memory, (p) => {
    const st = tl.scrollTrigger
    return st ? st.start + p * (st.end - st.start) : null
  })

  return () => {
    stopResume()
    rememberForSwitch(memory, memory.progress)
    root.classList.remove('how--stage', `how--${v.layout}`)
    lens.classList.remove('is-flat')
    onStepChange(-1)
  }
}

/* ------------------------------------------------------------------ */
/* Scroll memory across breakpoint switches                            */
/* ------------------------------------------------------------------ */
// A switch while the visitor is inside this section (a tablet rotated, a
// window resized) rebuilds the scene with a different pin length — or none —
// so ScrollTrigger's restored pixel offset would land on another state, or in
// another section. Each branch records how far through the section the
// visitor was and the next branch re-seats them at the same point.
function rememberForSwitch(memory, progress) {
  memory.pending = progress > 0 && progress < 1 ? progress : null
  memory.at = performance.now()
  memory.progress = 0
}

function resumeAfterSwitch(memory, yForProgress) {
  const resume = () => {
    ScrollTrigger.removeEventListener('refresh', resume)
    const pending = memory.pending
    memory.pending = null
    if (pending == null || performance.now() - memory.at > 1500) return
    const y = yForProgress(pending)
    if (y == null) return
    scrollToY(y, { smooth: false })
    memory.progress = pending // a programmatic re-seat may not emit onUpdate before the next switch
  }
  ScrollTrigger.addEventListener('refresh', resume)
  return () => ScrollTrigger.removeEventListener('refresh', resume)
}

/** Short screens: no pin, composed layout, a brief scrubbed settle on entry. */
function buildFlow(root, memory) {
  const el = collect(root)
  // Progress through the unpinned section (0: its top meets the viewport top,
  // 1: its bottom meets the viewport bottom), kept for breakpoint switches.
  const tracker = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      if (!ScrollTrigger.isRefreshing) memory.progress = self.progress
    },
  })
  const stopResume = resumeAfterSwitch(memory, (p) => tracker.start + p * (tracker.end - tracker.start))
  buildApproach(root, el, { end: 'top 30%', headFrom: 0.5 })
  gsap
    .timeline({
      scrollTrigger: {
        trigger: el.device,
        start: 'top bottom',
        end: 'center 55%',
        scrub: SCRUB,
      },
    })
    .fromTo(
      el.rig,
      { y: 60, scale: 0.94, rotationY: -12, rotationX: 6 },
      { y: 0, scale: 1, rotationY: 0, rotationX: 0, ease: 'power2.out', duration: 1 },
      0,
    )
    .fromTo(el.light, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 1 }, 0)

  return () => {
    stopResume()
    rememberForSwitch(memory, memory.progress)
  }
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */
/**
 * Wires the How It Works choreography with gsap.matchMedia (reverted with
 * the component). Returns the active step index (-1 when none / static) —
 * updated only when the index changes, never per frame.
 */
export default function useHowItWorksChoreography(rootRef) {
  const [activeStep, setActiveStep] = useState(-1)
  const lastRef = useRef(-1)

  const onStepChange = useCallback((index) => {
    if (lastRef.current === index) return
    lastRef.current = index
    setActiveStep(index)
  }, [])

  // Scroll memory shared by the breakpoint branches (never React state).
  const memoryRef = useRef({ progress: 0, pending: null, at: 0 })

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const memory = memoryRef.current

      // Passive trigger that lives outside the breakpoint branches (same
      // pattern as Features). When the last viewport ScrollTrigger is killed,
      // GSAP wipes its recorded scroll position, so a breakpoint switch would
      // otherwise drop the visitor at the top of the page.
      ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top' })

      const mm = gsap.matchMedia()
      mm.add(QUERIES.split, () => buildStage(root, 'split', onStepChange, memory))
      mm.add(QUERIES.tablet, () => buildStage(root, 'tablet', onStepChange, memory))
      mm.add(QUERIES.phone, () => buildStage(root, 'phone', onStepChange, memory))
      mm.add(QUERIES.flow, () => buildFlow(root, memory))
      // prefers-reduced-motion: reduce → nothing to build; the CSS
      // composition is already complete and static (no pin).
    },
    { scope: rootRef },
  )

  return activeStep
}
