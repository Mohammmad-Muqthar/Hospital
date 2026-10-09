/**
 * Shared constants for the Roles scene: sidebar layout per role and the
 * pinned timeline's structure. Kept in one place so the React markup, the
 * tab-mode Motion animations and the GSAP timeline always agree.
 */
import { NAV_ITEMS, ROLE_SESSIONS } from '../../../../data/mock/mockRoles'

/** Every sidebar item, in a stable DOM order. */
export const NAV_ORDER = Object.keys(NAV_ITEMS)

/** Height of one sidebar row (design px inside the zoomed window). */
export const NAV_SLOT = 32

/** For a role: { [navId]: { visible, slot, active } }. Hidden items keep slot -1. */
export function getNavLayout(roleId) {
  const session = ROLE_SESSIONS[roleId]
  const layout = {}
  for (const id of NAV_ORDER) {
    const slot = session.nav.indexOf(id)
    layout[id] = { visible: slot !== -1, slot, active: id === session.activeNav }
  }
  return layout
}

/** Timeline label per role (index matches ROLES order). */
export const ROLE_LABELS = ['admin', 'manager', 'executive', 'receptionist']

/**
 * Pinned timeline rhythm (timeline seconds; the whole timeline is mapped onto
 * pinVh viewport heights of scroll):
 *   [admin hold] [transition] [manager hold] [transition] [executive hold] [transition] [receptionist hold]
 * Docked layouts (short frames, see Roles.css) open with the heading →
 * workspace hand-over, then hold Admin:
 *   [dock] [admin hold] [transition] …
 * Each label sits a little inside its hold so a click lands on a settled state.
 */
export const SCENE = {
  firstHold: 0.6,
  transition: 1,
  hold: 0.9,
  labelInset: 0.32,
  lastHold: 0.75,
  /** Total pin distance in viewport heights (desktop budget ≤ 3.2). */
  pinVh: 3,
  /** Docked layouts: hand-over length, Admin label (after it), Admin hold end. */
  dock: 0.5,
  dockLabelInset: 0.06,
  dockHold: 0.92,
  /** Docked layouts: smallest workspace scale at progress 0 (of its resting size). */
  dockMinScale: 0.88,
  /** Docked layouts: 0.32 more timeline at the same scroll pace (≤ 3.2). */
  pinVhDocked: 3.15,
}

/** Window tilt used during each transition (varies direction subtly). */
export const TRANSITION_TILT = [
  { rotationY: -8, rotationX: 3, z: -80 },
  { rotationY: 7, rotationX: -2.5, z: -70 },
  { rotationY: -6, rotationX: 3.5, z: -80 },
]

/**
 * Role swap rhythm inside one transition (timeline seconds after it starts;
 * the transition lasts SCENE.transition = 1).
 *
 * Modules hand the window over as a wave sweeping down, across or up the
 * content area (whichever keeps the most of it readable for that pair of
 * layouts): each outgoing module recedes when the wave reaches its leading
 * edge (`wave` × its position in the content area), and each incoming
 * module rises in as soon as the wave has reached it AND every outgoing
 * module under its footprint has faded below ≈ 6% (`clearAt` of the
 * fade). So the new role builds up where the old one has already gone
 * while the rest of the old one is still readable: the content area is
 * never empty, and no two modules are readable on top of each other
 * (useRolesScene.js, scheduleSwap).
 * Text layers (title, user, description) clear just before their
 * replacement arrives, and do so ahead of the module wave — so the brief
 * moment where an area of the content changes hands never coincides with
 * the moment the title or the description changes: no frame is blank.
 */
export const SWAP = {
  outAt: 0,
  outDuration: 0.13,
  /** Delay of the wave from one side of the content area to the other. */
  wave: 0.22,
  /** Fraction of an outgoing fade after which its area may be re-used (opacity ≈ 0.06). */
  clearAt: 0.75,
  inAt: 0.06,
  inFade: 0.18,
  inDuration: 0.46,
  navOutAt: 0.02,
  navOutDuration: 0.12,
  slideAt: 0.03,
  slideDuration: 0.24,
  navInAt: 0.12,
  navInStep: 0.025,
  labelOutAt: 0.02,
  labelOutDuration: 0.09,
  labelInAt: 0.08,
  descOutAt: 0,
  descOutDuration: 0.1,
  descInAt: 0.1,
  switchAt: 0.1,
}

/**
 * Approach (pre-pin) choreography, in approach progress (0 = section top at
 * the bottom of the viewport, 1 = at the top / pin start).
 */
export const APPROACH = {
  header: { at: 0.4, duration: 0.28, stagger: 0.03 },
  workspace: { at: 0.46 },
  columns: { at: 0.64, duration: 0.24, stagger: 0.04 },
}

/**
 * Teal veil (a band pinned to the section's top edge, see .roles__veil):
 * it contracts until approach progress `restAt`, to a height of
 * `restFactor` × the eyebrow's offset from the section top.
 */
export const VEIL = { restAt: 0.6, restFactor: 1.25 }
