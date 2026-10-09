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
 * PIN_VH viewport heights of scroll):
 *   [admin hold] [transition] [manager hold] [transition] [executive hold] [transition] [receptionist hold]
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
}

/** Window tilt used during each transition (varies direction subtly). */
export const TRANSITION_TILT = [
  { rotationY: -8, rotationX: 3, z: -80 },
  { rotationY: 7, rotationX: -2.5, z: -70 },
  { rotationY: -6, rotationX: 3.5, z: -80 },
]

/**
 * Role swap rhythm inside one transition (timeline seconds after it starts;
 * the transition lasts SCENE.transition = 1). Outgoing modules fade fast
 * (gone by ≈ 0.24) and the incoming ones begin at 0.22, so the content area
 * is never empty yet two role states are never readable together (at the
 * crossover both layers are below ≈ 15% opacity). Text layers (sidebar
 * items, title, user, description) fully clear before their replacement.
 */
export const SWAP = {
  outAt: 0,
  outDuration: 0.2,
  outStagger: 0.01,
  inAt: 0.22,
  inDuration: 0.46,
  inStagger: 0.05,
  navOutAt: 0.06,
  slideAt: 0.14,
  slideDuration: 0.32,
  navInAt: 0.3,
  labelOutAt: 0.1,
  labelInAt: 0.28,
  descOutAt: 0.04,
  descInAt: 0.3,
  switchAt: 0.3,
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
