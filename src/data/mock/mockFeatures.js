/**
 * SAMPLE DATA — illustrative values for the Features product mock-ups.
 *
 * Everything here is fictional, deterministic and decorative (rendered inside
 * aria-hidden mock UI). Organisations are generic placeholders, people are
 * shown by initials only, and no patient data appears anywhere. Panels whose
 * figures could read like business results carry a "Sample data" tag.
 * Money is USD in compact notation ($12.4k, $186k) — the same currency and
 * style as the hero dashboard and the default pricing currency.
 */

export const SAMPLE_TAG = 'Sample data'

/* ------------------------------------------------------------------ */
/* Scene A — acquisition                                               */
/* ------------------------------------------------------------------ */

export const MOCK_LEAD = {
  title: 'Lead',
  record: {
    initials: 'HL',
    name: 'Harbor Logistics',
    context: 'Corporate wellness enquiry',
    status: 'Qualified',
    score: 86,
    source: 'Website form',
  },
  fields: [
    { label: 'Owner', value: 'A. Khan', avatar: 'AK' },
    { label: 'Created', value: 'Today, 09:42' },
    { label: 'Next step', value: 'Intro call' },
  ],
  duplicate: {
    title: 'Possible duplicate',
    detail: 'Same phone as “Harbor Logistics Pvt”',
    action: 'Review',
  },
  queue: [
    { initials: 'GS', name: 'Greenfield School', source: 'Referral', score: 72, status: 'Contacted' },
    { initials: 'AP', name: 'Apex Tech Park', source: 'Campaign', score: 64, status: 'New' },
    { initials: 'MC', name: 'Metro Cabs', source: 'Cold call', score: 58, status: 'Nurturing' },
    { initials: 'LM', name: 'Lakeside Mall', source: 'Walk-in', score: 51, status: 'New' },
  ],
}

export const MOCK_CALL = {
  contact: { name: 'Riverside Residency', meta: 'Facility manager', duration: '03:42' },
  outcomes: ['Interested', 'Call back', 'No answer'],
  activeOutcome: 0,
  next: { label: 'Next step', value: 'Site visit · Thu 11:00' },
}

/**
 * One deal per stage: every lane always shows all of its cards (the count
 * chip never promises a card the module has no room to show).
 */
export const MOCK_PIPELINE = {
  title: 'Pipeline',
  meta: 'Corporate',
  staleSummary: '1 stale',
  columns: [
    {
      id: 'new',
      label: 'New',
      deals: [{ name: 'Apex Tech Park', value: '$12.4k', close: '28 Oct' }],
    },
    {
      id: 'qualified',
      label: 'Qualified',
      deals: [{ name: 'Metro Cabs', value: '$9.6k', close: '02 Nov', stale: 'Stale 9d' }],
    },
    {
      id: 'proposal',
      label: 'Proposal',
      deals: [{ name: 'Harbor Logistics', value: '$48.2k', close: '18 Oct' }],
    },
    {
      id: 'won',
      label: 'Won',
      won: true,
      deals: [{ name: 'Lakeside Mall', value: '$36.8k', close: 'Closed' }],
    },
  ],
}

export const MOCK_FOLLOWUPS = {
  title: 'Today',
  /** Overdue first, then today's schedule in time order. */
  items: [
    { id: 'meeting', kind: 'Meeting', name: 'Metro Cabs', time: 'Yesterday', overdue: true },
    { id: 'call', kind: 'Call', name: 'Harbor Logistics', time: '10:30' },
    { id: 'whatsapp', kind: 'WhatsApp', name: 'Greenfield School', time: '12:15' },
    { id: 'visit', kind: 'Visit', name: 'Apex Tech Park', time: '15:00' },
  ],
  overdueLabel: 'Overdue',
}

/* ------------------------------------------------------------------ */
/* Scene B — reporting                                                 */
/* ------------------------------------------------------------------ */

export const MOCK_DASHBOARD = {
  title: 'Team performance',
  period: 'This month',
  filters: ['All departments', 'Cardiology', 'Orthopaedics'],
  totals: [
    { id: 'won', label: 'Won', value: '$186k', meta: '24 deals', tone: 'won' },
    { id: 'lost', label: 'Lost', value: '$41k', meta: '7 deals', tone: 'lost' },
  ],
  repsLabel: 'Revenue by rep',
  reps: [
    { initials: 'AK', name: 'A. Khan', value: '$62k', share: 0.92 },
    { initials: 'MR', name: 'M. Rao', value: '$50k', share: 0.74 },
    { initials: 'SN', name: 'S. Nair', value: '$43k', share: 0.64 },
    { initials: 'DM', name: 'D. Mathew', value: '$31k', share: 0.46 },
  ],
  trend: {
    label: 'Won revenue',
    meta: 'Last 8 weeks',
    /** Relative weekly values (0–100) for the sparkline. */
    points: [34, 41, 37, 48, 45, 57, 53, 66],
  },
  healthLabel: 'Pipeline health',
  health: [
    { id: 'healthy', label: 'On track', share: 0.62 },
    { id: 'risk', label: 'At risk', share: 0.26 },
    { id: 'stale', label: 'Stale', share: 0.12 },
  ],
}

export const MOCK_REPORTS = {
  title: 'Conversion by source',
  filters: ['Last 30 days', 'All reps'],
  repsLabel: 'Conversion by rep',
  reps: [
    { initials: 'AK', value: 38 },
    { initials: 'MR', value: 31 },
    { initials: 'SN', value: 27 },
  ],
  footer: { print: 'Print', filters: 'Filters · 2' },
  sources: [
    { label: 'Referral', value: 41 },
    { label: 'Website', value: 32 },
    { label: 'Campaign', value: 24 },
    { label: 'Walk-in', value: 18 },
  ],
}

export const MOCK_WEEKLY = {
  title: 'This week',
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  /** Activity intensity per executive per day, 0 (none) – 3 (busy). */
  rows: [
    { initials: 'AK', levels: [3, 2, 3, 1, 2] },
    { initials: 'MR', levels: [2, 3, 1, 2, 3] },
    { initials: 'SN', levels: [1, 2, 2, 3, 1] },
    { initials: 'DM', levels: [2, 1, 3, 2, 0] },
  ],
}

export const MOCK_DAILY = {
  title: 'Daily report',
  date: 'Tue, 14 Oct',
  author: 'AK',
  rows: [
    { id: 'calls', label: 'Calls', value: '18' },
    { id: 'visits', label: 'Visits', value: '3' },
    { id: 'leads', label: 'Leads', value: '7' },
  ],
  outcome: '2 deals moved forward',
  status: 'Submitted',
}

/* ------------------------------------------------------------------ */
/* Scene C — growth                                                    */
/* ------------------------------------------------------------------ */

export const MOCK_CALENDAR = {
  month: 'September',
  weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  /** Index of the 1st in a Monday-first week (Tuesday). */
  startOffset: 1,
  days: 30,
  today: 18,
  /** Day → event kind, rendered as a marker in the grid. */
  marks: { 13: 'clinic', 22: 'promo', 23: 'promo', 24: 'promo', 29: 'health' },
  events: [
    { id: 'clinic', day: '13', month: 'Sep', title: 'Clinic open day', kind: 'Clinic occasion' },
    { id: 'promo', day: '22', month: 'Sep', title: 'Health check promotion', kind: 'Promotion' },
    { id: 'health', day: '29', month: 'Sep', title: 'World Heart Day', kind: 'Public health event' },
  ],
}

export const MOCK_PARTNERS = {
  partners: [
    { initials: 'ML', name: 'MedLink Partners', type: 'Affiliate', deal: 'Revenue share', agreement: 'Signed' },
    { initials: 'CP', name: 'CityCare Pharmacy', type: 'Referrer', deal: 'Per referral', agreement: 'Pending' },
    { initials: 'WH', name: 'Wellness Hub Gym', type: 'Referrer', deal: 'Fixed fee', agreement: 'Signed' },
  ],
}

export const MOCK_ACTIVITIES = {
  items: [
    { id: 'a1', kind: 'briefing', label: 'Briefing', title: 'Campaign briefing', meta: 'Mon 10:00' },
    { id: 'a2', kind: 'meeting', label: 'Meeting', title: 'Quarterly review', meta: 'Wed 14:30' },
    { id: 'a3', kind: 'creative', label: 'Creative direction', title: 'Brochure concepts', meta: 'Fri 11:00' },
    { id: 'a4', kind: 'meeting', label: 'Meeting', title: 'Open day planning', meta: 'Fri 15:00' },
  ],
}

export const MOCK_SUPPORT = {
  title: 'Support inbox',
  channels: [
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'call', label: 'Call' },
    { id: 'email', label: 'Email' },
  ],
  activeChannel: 'whatsapp',
  routeLabel: 'Route to',
  regions: ['India', 'Qatar', 'Global'],
  activeRegion: 'India',
  queueLabel: 'Open conversations',
  tickets: [
    { ref: '#4182', channel: 'whatsapp', subject: 'Package enquiry', region: 'India', wait: '2 min' },
    { ref: '#4179', channel: 'call', subject: 'Appointment help', region: 'Qatar', wait: '6 min' },
    { ref: '#4175', channel: 'email', subject: 'Billing question', region: 'Global', wait: '14 min' },
    { ref: '#4171', channel: 'whatsapp', subject: 'Report pickup', region: 'India', wait: '21 min' },
  ],
}
