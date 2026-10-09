/**
 * Trionix Hospital CRM — business-facing website copy.
 *
 * This is the single source of truth for every word a visitor reads in the
 * marketing sections. Text here is preserved verbatim from the approved
 * content; change it here (not inside components) when copy needs updating.
 *
 * Illustrative numbers that appear inside product mock-ups live in
 * src/data/mock/ instead, so demo data is never confused with real copy.
 *
 * `icon` values are keys of the shared icon registry (components/ui/Icon.jsx).
 */

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
export const NAV_ITEMS = [
  { label: 'Features', target: 'features' },
  { label: 'How it works', target: 'howItWorks' },
  { label: 'Roles', target: 'roles' },
  { label: 'Support', target: 'support' },
  { label: 'Pricing', target: 'pricing' },
]

export const NAV_ACTIONS = {
  signIn: { label: 'Sign in', target: 'signIn' },
  trial: { label: 'Start trial', target: 'trial' },
}

/* ------------------------------------------------------------------ */
/* Phase 1 — Hero                                                      */
/* ------------------------------------------------------------------ */
export const HERO = {
  /** Full headline, kept intact. `lines` is the balanced desktop split. */
  headline: 'Grow your hospital sales with a CRM that tracks performance',
  headlineLines: ['Grow your hospital', 'sales with a CRM that', 'tracks performance'],
  /** Words rendered in the emerald accent colour. */
  headlineAccent: ['CRM', 'that', 'tracks', 'performance'],
  paragraph:
    'Hospital CRM unifies leads, deals, follow-ups and team performance into one secure, multi-tenant platform — designed for clinics and multi-branch hospital groups.',
  primaryCta: 'Start 14-day free trial',
  secondaryCta: 'View pricing',
  /** The four cards the dashboard splits into (original hero stats). */
  splitCards: [
    { value: '14 days', label: 'Free trial', icon: 'calendarClock' },
    { value: '3 plans', label: 'Starter to unlimited', icon: 'layers' },
    { value: '4 roles', label: 'Admin to receptionist', icon: 'users' },
    { value: '∞', label: 'Multi-branch ready', icon: 'building', srValue: 'Unlimited branches' },
  ],
}

/* ------------------------------------------------------------------ */
/* Phase 3 — Features                                                  */
/* ------------------------------------------------------------------ */
export const FEATURES_INTRO = {
  eyebrow: 'EVERYTHING IN ONE PLACE',
  title: 'A complete sales toolkit for healthcare teams',
  paragraph:
    'From first contact to closed deal, every step your team takes — tracked, measured and reportable.',
}

export const FEATURES = [
  {
    id: 'lead-management',
    scene: 'acquisition',
    title: 'Lead Management',
    description:
      'Capture, qualify and assign leads with duplicate detection, scoring and source tracking.',
    icon: 'users',
  },
  {
    id: 'cold-calling',
    scene: 'acquisition',
    title: 'Cold Calling',
    description:
      'A focused module for high-volume outreach with outcome logging and next-step scheduling.',
    icon: 'phone',
  },
  {
    id: 'deal-pipeline',
    scene: 'acquisition',
    title: 'Deal Pipeline',
    description:
      'Drag-and-drop Kanban from New to Won with deal value, expected close and stale flags.',
    icon: 'trendingUp',
  },
  {
    id: 'follow-ups',
    scene: 'acquisition',
    title: 'Follow-Ups & Reminders',
    description:
      'Schedule calls, WhatsApp, visits and meetings with overdue alerts and auto-reminders.',
    icon: 'calendarClock',
  },
  {
    id: 'manager-dashboard',
    scene: 'reporting',
    title: 'Manager Dashboard',
    description: 'Rep-level performance, pipeline health and won/lost revenue across departments.',
    icon: 'shield',
  },
  {
    id: 'crm-reports',
    scene: 'reporting',
    title: 'CRM Reports',
    description: 'Conversion, source and rep analytics with printable, filterable reports.',
    icon: 'barChart',
  },
  {
    id: 'weekly-board',
    scene: 'reporting',
    title: 'Weekly Board',
    description: 'Plan and review weekly sales activity per executive at a glance.',
    icon: 'calendarDays',
  },
  {
    id: 'daily-reports',
    scene: 'reporting',
    title: 'Daily Reports',
    description: 'Log daily activity and outcomes for accountability and coaching.',
    icon: 'fileText',
  },
  {
    id: 'marketing-calendar',
    scene: 'growth',
    title: 'Marketing Calendar',
    description:
      'Track public health events, clinic occasions and promotions that drive lead flow.',
    icon: 'megaphone',
  },
  {
    id: 'channel-partners',
    scene: 'growth',
    title: 'Channel Partners',
    description:
      'Manage affiliates and referrers with deal types, agreements and referral tracking.',
    icon: 'handshake',
  },
  {
    id: 'client-activities',
    scene: 'growth',
    title: 'Client Activities',
    description: 'Record project briefings, meetings and creative direction beyond the pipeline.',
    icon: 'briefcase',
  },
  {
    id: 'customer-support',
    scene: 'growth',
    title: 'Customer Support',
    description: 'Country-routed support via WhatsApp, call or email — India, Qatar and Global.',
    icon: 'lifeBuoy',
  },
]

/** Internal motion chapters for the features stage (never shown as headings). */
export const FEATURE_SCENES = [
  { id: 'acquisition', featureIds: ['lead-management', 'cold-calling', 'deal-pipeline', 'follow-ups'] },
  { id: 'reporting', featureIds: ['manager-dashboard', 'crm-reports', 'weekly-board', 'daily-reports'] },
  { id: 'growth', featureIds: ['marketing-calendar', 'channel-partners', 'client-activities', 'customer-support'] },
]

/* ------------------------------------------------------------------ */
/* Phase 4 — How it works                                              */
/* ------------------------------------------------------------------ */
export const HOW_IT_WORKS = {
  eyebrow: 'HOW IT WORKS',
  title: 'From lead to won — in four steps',
  steps: [
    {
      id: 'capture',
      title: 'Capture leads',
      description:
        'Leads flow in from campaigns, cold calling and channel partners — assigned to the right rep instantly.',
      icon: 'userPlus',
    },
    {
      id: 'follow-up',
      title: 'Track follow-ups',
      description:
        'Every call, WhatsApp and visit is logged with reminders so nothing slips through the cracks.',
      icon: 'calendarClock',
    },
    {
      id: 'convert',
      title: 'Convert deals',
      description:
        'Move opportunities across stages to Won with reasons, value and close dates captured.',
      icon: 'trendingUp',
    },
    {
      id: 'analyze',
      title: 'Analyze performance',
      description: 'Managers see rep-level KPIs, pipeline health and revenue in real time.',
      icon: 'barChart',
    },
  ],
}

/* ------------------------------------------------------------------ */
/* Phase 5 — Roles                                                     */
/* ------------------------------------------------------------------ */
export const ROLES_INTRO = {
  eyebrow: 'BUILT FOR EVERY ROLE',
  title: 'The right view for every team member',
  paragraph:
    'Role-based access means each person sees exactly what they need — nothing more, nothing less.',
}

export const ROLES = [
  {
    id: 'admin',
    title: 'Admin',
    description: 'Full control: branding, users, settings, terms and all CRM data for the clinic.',
    icon: 'shield',
  },
  {
    id: 'sales-manager',
    title: 'Sales Manager',
    description: 'Oversee the team, review performance, reports and the weekly board.',
    icon: 'users',
  },
  {
    id: 'sales-executive',
    title: 'Sales Executive',
    description: 'Work leads, deals and follow-ups with a focused daily workflow.',
    icon: 'phone',
  },
  {
    id: 'receptionist',
    title: 'Receptionist',
    description: 'Capture walk-in and call leads quickly into the pipeline.',
    icon: 'clipboardList',
  },
]

/* ------------------------------------------------------------------ */
/* Phase 6 — Secure by design                                          */
/* ------------------------------------------------------------------ */
export const SECURITY = {
  eyebrow: 'SECURE BY DESIGN',
  title: 'Multi-tenant. Multi-branch. Private by default.',
  titleLines: ['Multi-tenant.', 'Multi-branch.', 'Private by default.'],
  paragraph:
    'Built for hospital groups, not just single clinics. Every tenant’s data stays isolated, and support access is always consent-gated.',
  points: [
    'Per-clinic data isolation across all CRM entities',
    'Custom branding — logo, name and tagline per tenant',
    'Versioned Terms of Service with acceptance tracking',
    '14-day trial provisioning with seat-based plans',
  ],
  features: [
    {
      id: 'multi-branch',
      title: 'Multi-branch ready',
      description: 'Run every branch under one hospital group with isolated, per-clinic data.',
      icon: 'building',
    },
    {
      id: 'isolation',
      title: 'Tenant data isolation',
      /** `clinic_id` is rendered as inline code (see codeToken). */
      description: "Each clinic's leads, deals and follow-ups are securely separated by clinic_id.",
      codeToken: 'clinic_id',
      icon: 'database',
    },
    {
      id: 'consent',
      title: 'Consent-gated support',
      description:
        'Platform support requests time-bound access — approved by your tenant admin.',
      icon: 'keyRound',
    },
    {
      id: 'routing',
      title: 'Country-routed help',
      description: 'Support contacts auto-route by country: India, Qatar and Global.',
      icon: 'globe',
      regions: ['India', 'Qatar', 'Global'],
    },
  ],
}

/* ------------------------------------------------------------------ */
/* Phase 8 — Footer                                                    */
/* ------------------------------------------------------------------ */
export const FOOTER = {
  description: 'The healthcare sales performance platform for clinics and hospital groups.',
  columns: [
    {
      heading: 'Product',
      links: [
        { label: 'Features', target: 'features' },
        { label: 'How it works', target: 'howItWorks' },
        { label: 'Roles', target: 'roles' },
        { label: 'Pricing', target: 'pricing' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'Support', target: 'support' },
        { label: 'Sign in', target: 'signIn' },
        { label: 'Start trial', target: 'trial' },
      ],
    },
  ],
  healthcare: {
    heading: 'Built for healthcare',
    message: 'Privacy-minded data isolation',
    icon: 'heartPulse',
  },
  copyright: '© 2026 Trionix Hospital CRM. All rights reserved.',
}
