/**
 * SAMPLE DATA — illustrative values for the hero dashboard preview only.
 * Not real hospital or customer performance. Owned by the Hero section.
 */
export const mockDashboard = {
  sampleLabel: 'Sample data',
  kpis: [
    { id: 'leads', label: 'Leads', value: '248' },
    { id: 'open-deals', label: 'Open Deals', value: '64' },
    { id: 'won', label: 'Won (mo)', value: '$1.2M' },
  ],
  pipeline: [
    { stage: 'New', share: 0.3 },
    { stage: 'Contacted', share: 0.5 },
    { stage: 'Qualified', share: 0.7 },
    { stage: 'Proposal', share: 0.45 },
    { stage: 'Won', share: 0.9 },
  ],
}
