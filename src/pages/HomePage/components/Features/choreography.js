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

/** Timeline beats. `hold` segments are where a scene sits fully settled. */
export const BEATS = {
  introHold: 0.25, //       0 → 0.25   heading readable (anchor landing state)
  introOut: [0.25, 1.1], //             heading recedes up and back…
  introFade: [0.28, 0.8], //            …and is gone before the panels pass it
  enterA: [0.6, 1.95], //               scene A arrives from depth
  holdA: [1.95, 2.75],
  exitA: [2.75, 3.75],
  enterB: [3.12, 4.29],
  holdB: [4.29, 5.05],
  exitB: [5.05, 6.0],
  enterC: [5.42, 6.59],
  holdC: [6.59, 7.15],
}

export const TOTAL = BEATS.holdC[1]

/** Timeline labels (states) — also useful for scrollToTimelineLabel(). */
export const LABELS = {
  intro: 0,
  sceneA: BEATS.holdA[0],
  sceneB: BEATS.holdB[0],
  sceneC: BEATS.holdC[0],
}

/** Playhead thresholds that decide which scene accepts pointer input. */
export const ACTIVE_SWITCH = [1.3, 3.5, 5.8]

/**
 * Opacity envelopes, as fractions of each panel's travel time. Incoming
 * panels become solid early in their travel; outgoing panels fade in the
 * middle of theirs — so a hand-over is a short crossfade, never a blank
 * frame and never a long double exposure.
 */
export const FADE_IN = 0.3
export const FADE_OUT = { delay: 0.12, dur: 0.5 }

/**
 * Entry vectors: where each slot comes FROM (its settled state is identity).
 * `at` offsets the start inside the scene's enter window; `dur` is the
 * travel time. Foreground (hero) travels furthest in the shortest time,
 * background panels arrive later and slower — natural parallax.
 */
export const ENTER = {
  // Scene A — rises out of depth below the receding heading; camera tilt resolves.
  a: {
    hero: { at: 0, dur: 1.0, x: -0.03, y: 0.2, z: -900, rotationX: 10, rotationY: 12 },
    medium: { at: 0.1, dur: 1.12, x: 0.1, y: 0.02, z: -1300, rotationX: 7, rotationY: -14 },
    small1: { at: 0.16, dur: 1.16, x: 0.02, y: 0.26, z: -1500, rotationX: 12, rotationY: -8 },
    small2: { at: 0.2, dur: 1.15, x: 0.12, y: 0.22, z: -1700, rotationX: 10, rotationY: -14 },
  },
  // Scene B — sweeps in from the right-hand depth plane (the camera pans right).
  b: {
    hero: { at: 0, dur: 1.1, x: 0.2, y: 0.02, z: -1100, rotationX: 3, rotationY: -16 },
    medium: { at: 0.1, dur: 1.07, x: -0.12, y: 0.06, z: -1500, rotationX: 4, rotationY: 14 },
    small1: { at: 0.05, dur: 1.12, x: 0.22, y: -0.08, z: -1300, rotationX: -4, rotationY: -14 },
    small2: { at: 0.14, dur: 1.03, x: 0.26, y: 0.1, z: -1600, rotationX: 6, rotationY: -16 },
  },
  // Scene C — climbs up from below the stage floor (vertical change of direction).
  c: {
    hero: { at: 0, dur: 1.1, x: 0.04, y: 0.42, z: -1000, rotationX: 16, rotationY: -4 },
    medium: { at: 0.12, dur: 1.05, x: -0.04, y: 0.48, z: -1300, rotationX: 14, rotationY: 4 },
    small1: { at: 0.08, dur: 1.09, x: -0.08, y: 0.36, z: -1500, rotationX: 14, rotationY: 6 },
    small2: { at: 0.15, dur: 1.02, x: 0.0, y: 0.4, z: -1400, rotationX: 15, rotationY: 0 },
  },
}

/** Exit vectors: where each slot goes TO when its scene hands over. */
export const EXIT = {
  // A drifts left and back while B arrives from the right.
  a: {
    hero: { at: 0, dur: 1.0, x: -0.12, y: 0.02, z: -800, rotationX: 2, rotationY: 14 },
    medium: { at: 0.04, dur: 0.96, x: -0.05, y: -0.08, z: -1000, rotationX: -4, rotationY: 10 },
    small1: { at: 0.08, dur: 0.92, x: -0.07, y: 0.08, z: -900, rotationX: 2, rotationY: 12 },
    small2: { at: 0.1, dur: 0.9, x: -0.03, y: 0.1, z: -1100, rotationX: 2, rotationY: 8 },
  },
  // B lifts up and away while C climbs in from below.
  b: {
    hero: { at: 0, dur: 0.95, x: 0.02, y: -0.18, z: -700, rotationX: -12, rotationY: 0 },
    medium: { at: 0.04, dur: 0.9, x: -0.06, y: -0.14, z: -900, rotationX: -10, rotationY: 4 },
    small1: { at: 0.02, dur: 0.92, x: 0.06, y: -0.22, z: -800, rotationX: -12, rotationY: -4 },
    small2: { at: 0.07, dur: 0.88, x: 0.08, y: -0.1, z: -1000, rotationX: -8, rotationY: -4 },
  },
}

/** Camera (whole stage) moves — small, readable, always resolving to 0 on holds. */
export const CAMERA = {
  start: { rotationX: 9, rotationY: -6 },
  settleA: [0.45, 1.95],
  aToB: { peak: { rotationX: 1.5, rotationY: -4.5, z: -40 }, window: [2.75, 4.29] },
  bToC: { peak: { rotationX: 4, rotationY: 2.5, z: -40 }, window: [5.05, 6.59] },
}
