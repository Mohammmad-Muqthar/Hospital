/**
 * SAMPLE DATA — phone notifications for the How It Works section.
 * Generic, illustrative CRM events (no patient or customer data).
 * One notification per step, in step order.
 */
export const mockNotifications = [
  {
    stepId: 'capture',
    title: 'New lead captured',
    body: 'New enquiry received and assigned to the sales team.',
    tone: 'neutral',
  },
  {
    stepId: 'follow-up',
    title: 'Follow-up scheduled',
    body: 'Call reminder created for the assigned sales representative.',
    tone: 'emerald',
  },
  {
    stepId: 'convert',
    title: 'Deal moved to Won',
    body: 'Opportunity marked successfully completed.',
    tone: 'success',
  },
  {
    stepId: 'analyze',
    title: 'Performance updated',
    body: 'Latest pipeline and sales summary is ready.',
    tone: 'insight',
  },
]
