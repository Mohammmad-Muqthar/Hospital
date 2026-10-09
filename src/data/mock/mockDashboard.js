/**
 * SAMPLE DATA — illustrative values for the hero dashboard preview only.
 * Not real hospital or customer performance and no patient data. Every value
 * is static so the preview renders identically on every visit.
 * Owned by the Hero section.
 */
export const mockDashboard = {
  sampleLabel: 'Sample data',
  title: 'Sales overview',
  workspace: 'All branches',
  period: 'This month',
  user: { initials: 'AD' },

  /** Original three KPIs (kept) — each with a small trend series for its sparkline. */
  kpis: [
    {
      id: 'leads',
      label: 'Leads',
      value: '248',
      delta: '+12%',
      trend: [14, 18, 16, 21, 19, 24, 23, 27, 26, 31],
    },
    {
      id: 'open-deals',
      label: 'Open Deals',
      value: '64',
      delta: '+5%',
      trend: [40, 42, 41, 45, 44, 47, 50, 49, 52, 55],
    },
    {
      id: 'won',
      label: 'Won (mo)',
      value: '$1.2M',
      delta: '+18%',
      trend: [0.62, 0.66, 0.64, 0.75, 0.81, 0.79, 0.9, 0.98, 1.06, 1.2],
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

  /** Won revenue by month, in $k. */
  revenue: {
    title: 'Won revenue',
    total: '$1.2M',
    delta: '+18% vs last month',
    months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    values: [640, 720, 690, 860, 980, 1200],
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
