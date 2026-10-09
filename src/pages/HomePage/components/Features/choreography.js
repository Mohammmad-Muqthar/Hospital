/**
 * Spatial choreography for the desktop Features stage.
 *
 * All positions are in master-timeline seconds (the timeline is scrubbed, so
 * seconds are just proportions of the pin distance). Offsets are expressed as
 * fractions of the stage box (x → stage width, y → stage height) and resolved
 * by function-based values, so they are re-measured on every refresh.
 * Depth (z) is in px against the stage perspective.
 */

/** Total pinned scroll distance on desktop, in viewport heights. */
export const PIN_VH = 3.8

/**
 * Pre-pin approach (0 → 1 while the section rises from the fold to the top).
 * The heading DOCKS: it rides a fixed distance above its resting place, close
 * behind the hero's last row, then decelerates into position (a quadratic,
 * power1.in, release of the offset) so its on-screen speed reaches zero exactly
 * as the pin begins. Zero end speed needs 2 × DOCK = 1 − DOCK_START (both in
 * viewport heights). The parts surface right away, so the space the hero
 * vacates is never empty.
 */
export const APPROACH = {
  DOCK: 0.46,
  DOCK_START: 0.08,
  revealAt: 0,
  fade: 0.18,
  settle: 0.6,
  stagger: 0.06,
}

/** Timeline beats. `hold` segments are where a scene sits fully settled. */
export const BEATS = {
  introHold: 0.25, //       0 → 0.25   heading readable (anchor landing state)
  introOut: [0.25, 0.85], //            heading lifts up and back…
  introFade: [0.26, 0.55], //           …dissolving as scene A rises into the space beneath it
  enterA: 0.3, //                       scene A starts rising (slot offsets below)
  holdA: [1.95, 2.75],
  handAB: 2.75, //                      A → B hand-over starts
  holdB: [4.29, 5.05],
  handBC: 5.05, //                      B → C hand-over starts
  holdC: [6.59, 7.15],
}

export const TOTAL = BEATS.holdC[1]

/**
 * Where the heading goes when the stage takes over: up and back, moving while
 * it is still visible, so scene A can rise into the space beneath it as it
 * dissolves — the two never share the same area (y is a fraction of the
 * stage height).
 */
export const INTRO_EXIT = { y: -0.4, z: -320, ease: 'sine.inOut' }

/** Timeline labels (states) — also useful for scrollToTimelineLabel(). */
export const LABELS = {
  intro: 0,
  sceneA: BEATS.holdA[0],
  sceneB: BEATS.holdB[0],
  sceneC: BEATS.holdC[0],
}

/** Playhead thresholds that decide which scene accepts pointer input. */
export const ACTIVE_SWITCH = [BEATS.enterA + 0.8, BEATS.handAB + 0.55, BEATS.handBC + 0.55]

/*
 * Hand-overs are a spatial WAVE, not a crossfade. Every slot has its own
 * opacity window (`fade: [offset, length]`, relative to the window start),
 * ordered by where the panels sit on the stage: an outgoing panel has
 * dissolved before any incoming panel that lands on the same area becomes
 * visible, while incoming panels that land on already-vacated areas arrive
 * early. So the stage is never blank, but two scenes' text never overlaps.
 *
 *   A → B  (camera pans right): the right column hands over first, the
 *          centre next, the large left panel last.
 *   B → C  (camera cranes up):  the centre and right lift away first and
 *          C's hero rises into them; B's left column follows.
 *
 * `at` is when the slot starts to travel, `dur` its travel time. The
 * transform keeps moving well after the fade, so motion always overlaps:
 * outgoing panels are still receding while the incoming ones come forward.
 */

/** Entry vectors: where each slot comes FROM (its settled state is identity). */
export const ENTER = {
  // Scene A — rises out of depth below the receding heading; camera tilt resolves.
  // The two compact panels surface first in the lower right, where the heading
  // never was; the hero and the wide panel follow as the heading clears.
  // Window start: BEATS.enterA.
  a: {
    small1: { at: 0, dur: 1.6, fade: [0, 0.2], x: 0.02, y: 0.28, z: -1500, rotationX: 12, rotationY: -8 },
    small2: { at: 0.03, dur: 1.58, fade: [0.03, 0.2], x: 0.12, y: 0.24, z: -1700, rotationX: 10, rotationY: -14 },
    hero: { at: 0.06, dur: 1.54, fade: [0.12, 0.26], x: -0.03, y: 0.46, z: -900, rotationX: 10, rotationY: 12 },
    medium: { at: 0.1, dur: 1.54, fade: [0.14, 0.26], x: 0.1, y: 0.3, z: -1300, rotationX: 7, rotationY: -14 },
  },
  // Scene B — sweeps in from the right-hand depth plane, right column first.
  // Window start: BEATS.handAB.
  b: {
    small1: { at: 0.12, dur: 1.2, fade: [0.14, 0.2], x: 0.22, y: -0.08, z: -1300, rotationX: -4, rotationY: -14 },
    small2: { at: 0.15, dur: 1.18, fade: [0.16, 0.2], x: 0.26, y: 0.1, z: -1600, rotationX: 6, rotationY: -16 },
    hero: { at: 0.18, dur: 1.26, fade: [0.2, 0.24], x: 0.3, y: 0.02, z: -1100, rotationX: 3, rotationY: -16 },
    medium: { at: 0.34, dur: 1.18, fade: [0.4, 0.24], x: -0.12, y: 0.06, z: -1500, rotationX: 4, rotationY: 14 },
  },
  // Scene C — climbs up from below the stage floor (vertical change of direction).
  // Window start: BEATS.handBC.
  c: {
    hero: { at: 0.1, dur: 1.3, fade: [0.13, 0.18], x: 0.04, y: 0.42, z: -1000, rotationX: 16, rotationY: -4 },
    small2: { at: 0.12, dur: 1.28, fade: [0.16, 0.2], x: 0.0, y: 0.4, z: -1400, rotationX: 15, rotationY: 0 },
    small1: { at: 0.26, dur: 1.26, fade: [0.3, 0.2], x: -0.08, y: 0.36, z: -1500, rotationX: 14, rotationY: 6 },
    medium: { at: 0.28, dur: 1.26, fade: [0.31, 0.22], x: -0.04, y: 0.48, z: -1300, rotationX: 14, rotationY: 4 },
  },
}

/** Exit vectors: where each slot goes TO when its scene hands over. */
export const EXIT = {
  // A drifts left and back while B arrives from the right.
  // Window start: BEATS.handAB.
  a: {
    medium: { at: 0, dur: 0.96, fade: [0, 0.18], x: -0.05, y: -0.08, z: -1000, rotationX: -4, rotationY: 10 },
    small2: { at: 0.02, dur: 0.92, fade: [0.02, 0.18], x: -0.03, y: 0.1, z: -1100, rotationX: 2, rotationY: 8 },
    small1: { at: 0.05, dur: 0.92, fade: [0.06, 0.18], x: -0.07, y: 0.08, z: -900, rotationX: 2, rotationY: 12 },
    hero: { at: 0.08, dur: 1.0, fade: [0.3, 0.2], x: -0.2, y: 0.02, z: -800, rotationX: 2, rotationY: 14 },
  },
  // B lifts up and away while C climbs in from below.
  // Window start: BEATS.handBC.
  b: {
    small2: { at: 0, dur: 0.88, fade: [0, 0.18], x: 0.08, y: -0.1, z: -1000, rotationX: -8, rotationY: -4 },
    hero: { at: 0.02, dur: 0.95, fade: [0.02, 0.18], x: 0.02, y: -0.18, z: -700, rotationX: -12, rotationY: 0 },
    small1: { at: 0.03, dur: 0.92, fade: [0.03, 0.18], x: 0.06, y: -0.22, z: -800, rotationX: -12, rotationY: -4 },
    medium: { at: 0.12, dur: 0.9, fade: [0.18, 0.2], x: -0.06, y: -0.14, z: -900, rotationX: -10, rotationY: 4 },
  },
}

/** Window start for each scene's entrance / exit vectors above. */
export const ENTER_AT = [BEATS.enterA, BEATS.handAB, BEATS.handBC]
export const EXIT_AT = [BEATS.handAB, BEATS.handBC]

/** Camera (whole stage) moves — small, readable, always resolving to 0 on holds. */
export const CAMERA = {
  start: { rotationX: 9, rotationY: -6 },
  settleA: [0.45, 1.95],
  aToB: { peak: { rotationX: 1.5, rotationY: -4.5, z: -40 }, window: [2.75, 4.29] },
  bToC: { peak: { rotationX: 4, rotationY: 2.5, z: -40 }, window: [5.05, 6.59] },
}
