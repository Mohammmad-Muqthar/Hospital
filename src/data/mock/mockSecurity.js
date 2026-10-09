/**
 * SAMPLE DATA — generic labels for the decorative "secure by design"
 * architecture in the Security section. No patient data, no real clinics,
 * no numbers presented as business results. Every value is deterministic.
 *
 * Geometry is expressed in "plane pixels" of the 3D scene at its reference
 * size (the whole scene is scaled to fit its container), so the visual and
 * the GSAP choreography read from one source of truth.
 */

/** Hospital-group platform: a forest plinth carrying a lighter plate. */
export const PLATFORM = {
  base: { w: 580, d: 480, h: 20 },
  /** Inset of the plate from the plinth edge, and its thickness. */
  plate: { inset: 16, h: 12 },
}

/** Clinic chamber footprint / height (independent tenants). */
export const CHAMBER = { w: 168, d: 116, h: 34 }

/**
 * Four tenant chambers on a 2 × 2 layout. `col`/`row` place them on the
 * plate; the timeline spreads them apart from the platform centre.
 * `focus` marks the chamber used for the consent-gated support story.
 */
export const CHAMBERS = [
  { id: 'a', name: 'Clinic A', branch: 'Branch · North', col: 0, row: 0 },
  { id: 'b', name: 'Clinic B', branch: 'Branch · East', col: 1, row: 0 },
  { id: 'c', name: 'Clinic C', branch: 'Branch · West', col: 0, row: 1 },
  { id: 'd', name: 'Clinic D', branch: 'Branch · South', col: 1, row: 1, focus: true },
]

/** The chamber that gains prominence during the isolation state. */
export const ACTIVE_CHAMBER_ID = 'c'

/** Internal data layers revealed inside every chamber (generic CRM entities). */
export const DATA_LAYERS = ['Leads', 'Deals', 'Follow-ups']

/** Consent-gated access request shown attached to the focus chamber. */
export const ACCESS_REQUEST = {
  title: 'Support access request',
  requester: 'Platform support',
  pending: 'Pending',
  approved: 'Approved by tenant admin',
  timeBound: 'Time-bound · 24h',
}

/** Support request token routed to a regional desk (its country is the desk label). */
export const SUPPORT_TOKEN = {
  label: 'Support request',
}

/** Index (into SECURITY.features[3].regions) of the desk the token routes to. */
export const ROUTED_REGION_INDEX = 1
