/**
 * SAMPLE DATA — illustrative values for the hero dashboard preview only.
 * Not real hospital or customer performance and no patient data. Every value
 * is static so the preview renders identically on every visit.
 * Owned by the Hero section.
 *
 * The figures are kept internally consistent, because a sales audience reads
 * them: each KPI's trend is a monthly series whose last point is the KPI
 * value, and every "vs last month" change is computed from the last two
 * points of the series it describes (never typed separately).
 */

/** Monthly series, Jan → Oct. The last point is "this month". */
const LEADS_BY_MONTH = [150, 172, 164, 188, 179, 203, 196, 214, 221, 248]
const OPEN_DEALS_BY_MONTH = [36, 41, 39, 45, 43, 49, 47, 55, 61, 64]
/** Won revenue, $k. The revenue chart plots the last six months. */
const WON_BY_MONTH = [470, 540, 510, 600, 640, 720, 690, 860, 1017, 1200]
const REVENUE_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']

/** Change from the previous month to this month, e.g. "+18%". */
function monthOverMonth(series) {
  const [previous, current] = series.slice(-2)
  const pct = Math.round((current / previous - 1) * 100)
  return `${pct >= 0 ? '+' : ''}${pct}%`
}

export const mockDashboard = {
  sampleLabel: 'Sample data',
  title: 'Sales overview',
  workspace: 'All branches',
  period: 'This month',
  user: { initials: 'AD' },

  /** Original three KPIs (kept) — each with its monthly series for the sparkline. */
  kpis: [
    {
      id: 'leads',
      label: 'Leads',
      value: '248',
      delta: monthOverMonth(LEADS_BY_MONTH), // +12%
      trend: LEADS_BY_MONTH,
    },
    {
      id: 'open-deals',
      label: 'Open Deals',
      value: '64',
      delta: monthOverMonth(OPEN_DEALS_BY_MONTH), // +5%
      trend: OPEN_DEALS_BY_MONTH,
    },
    {
      id: 'won',
      label: 'Won (mo)',
      value: '$1.2M',
      delta: monthOverMonth(WON_BY_MONTH), // +18%
      trend: WON_BY_MONTH,
    },
  ],

  /** Pipeline by stage (stage names from the original preview). */
  pipeline: [
    { stage: 'New', count: 84 },
    { stage: 'Contacted', count: 62 },
    { stage: 'Qualified', count: 38 },
    { stage: 'Proposal', count: 26 },
    { stage: 'Won', count: 17 },
  ],
  pipelineSummary: { label: 'Lead-to-won rate', value: '20%' },

  /** Won revenue by month, in $k (the same series as the "Won (mo)" KPI). */
  revenue: {
    title: 'Won revenue',
    total: '$1.2M',
    delta: `${monthOverMonth(WON_BY_MONTH)} vs last month`,
    months: REVENUE_MONTHS,
    values: WON_BY_MONTH.slice(-REVENUE_MONTHS.length),
    scaleMax: 1300,
    gridSteps: [0, 400, 800, 1200],
  },

  /** Generic representatives — no real people. */
  team: [
    { id: 'a', initials: 'RA', name: 'Rep A', unit: 'Cardiology', progress: 0.86, status: 'On track' },
    { id: 'b', initials: 'RB', name: 'Rep B', unit: 'Orthopedics', progress: 0.71, status: 'On track' },
    {
      id: 'c',
      initials: 'RC',
      name: 'Rep C',
      unit: 'Diagnostics',
      progress: 0.42,
      status: 'Needs follow-up',
    },
    { id: 'd', initials: 'RD', name: 'Rep D', unit: 'Pediatrics', progress: 0.63, status: 'On track' },
  ],

  /**
   * Upcoming follow-ups (business leads only). The panel shows as many
   * complete rows as its height allows, so the list is long enough to fill
   * the tallest preview.
   */
  followUps: [
    { id: 'f1', time: '09:30', title: 'Corporate wellness lead', type: 'Call back', owner: 'RA' },
    { id: 'f2', time: '11:00', title: 'Branch partnership proposal', type: 'Review', owner: 'RC' },
    { id: 'f3', time: '12:30', title: 'Clinic network demo', type: 'Follow-up', owner: 'RB' },
    { id: 'f4', time: '14:15', title: 'Diagnostics package quote', type: 'Send quote', owner: 'RD' },
    { id: 'f5', time: '15:30', title: 'Employer health plan renewal', type: 'Renewal', owner: 'RA' },
    { id: 'f6', time: '16:40', title: 'Referral partner check-in', type: 'Meeting', owner: 'RB' },
    { id: 'f7', time: '17:30', title: 'Wellness camp enquiry', type: 'Call back', owner: 'RC' },
  ],
}
