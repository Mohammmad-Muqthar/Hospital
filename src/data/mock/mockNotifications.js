/**
 * SAMPLE DATA — phone notifications for the How It Works section.
 * Generic, illustrative CRM events (no patient or customer data).
 * One notification per step, in step order.
 *
 * `tone` picks a restrained accent for the status icon and `icon` names the
 * status glyph (resolved inside the HowItWorks phone mock-up).
 */
export const mockNotifications = [
  {
    stepId: 'capture',
    title: 'New lead captured',
    body: 'New enquiry received and assigned to the sales team.',
    tone: 'neutral',
    icon: 'userPlus',
  },
  {
    stepId: 'follow-up',
    title: 'Follow-up scheduled',
    body: 'Call reminder created for the assigned sales representative.',
    tone: 'emerald',
    icon: 'calendarClock',
  },
  {
    stepId: 'convert',
    title: 'Deal moved to Won',
    body: 'Opportunity marked successfully completed.',
    tone: 'success',
    icon: 'badgeCheck',
  },
  {
    stepId: 'analyze',
    title: 'Performance updated',
    body: 'Latest pipeline and sales summary is ready.',
    tone: 'insight',
    icon: 'chart',
  },
]

/** Static lock-screen chrome for the phone mock-up (deterministic, illustrative). */
export const mockPhoneScreen = {
  appName: 'Trionix CRM',
  timestamp: 'now',
  date: 'Tuesday, 14 May',
  time: '9:41',
}
