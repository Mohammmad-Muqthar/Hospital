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

/** Teal veil geometry — keep in sync with .roles__veil (height 140vh, solid to 100vh). */
export const VEIL = { solidVh: 100, bandVh: 40 }
