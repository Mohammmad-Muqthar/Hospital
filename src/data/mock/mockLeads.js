/**
 * SAMPLE DATA — illustrative leads for the Roles section's CRM workspace
 * mock-up. Generic labels only: no real people, no patient or medical data.
 * Deterministic (no random values, no dates computed at render).
 */

/** Lead statuses and the tone used for their status chip in the mock UI. */
export const LEAD_STATUS = {
  new: { label: 'New', tone: 'mint' },
  contacted: { label: 'Contacted', tone: 'neutral' },
  qualified: { label: 'Qualified', tone: 'emerald' },
  booked: { label: 'Consult booked', tone: 'emerald' },
  waiting: { label: 'Awaiting reply', tone: 'amber' },
}

/** Leads assigned to the sample Sales Executive (the "Today" view). */
export const ASSIGNED_LEADS = [
  { id: 'l1', name: 'Lead · Walk-in', initials: 'WI', department: 'Orthopaedics', status: 'new' },
  { id: 'l2', name: 'Lead · Campaign', initials: 'CP', department: 'Dermatology', status: 'waiting' },
  { id: 'l3', name: 'Lead · Call', initials: 'CL', department: 'Cardiology', status: 'qualified' },
]

/** Most recent captures shown in the Receptionist view. */
export const RECENT_CAPTURES = [
  { id: 'c1', name: 'Lead · Walk-in', department: 'Orthopaedics', source: 'Walk-in', time: '10:42' },
  { id: 'c2', name: 'Lead · Call', department: 'Paediatrics', source: 'Call', time: '10:18' },
  { id: 'c3', name: 'Lead · Campaign', department: 'Dermatology', source: 'Campaign', time: '09:56' },
  { id: 'c4', name: 'Lead · Walk-in', department: 'Dental', source: 'Walk-in', time: '09:31' },
]
