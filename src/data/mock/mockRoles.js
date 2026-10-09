/**
 * SAMPLE DATA — illustrative content for the Roles section's CRM workspace
 * mock-up (one app window that reconfigures itself per role).
 *
 * Everything here is decorative product-UI sample data: generic staff
 * initials, generic "Lead · Source" labels, no patients, no medical records.
 * Deterministic — no random values and no dates computed at render.
 * Role keys match the ids in ROLES (src/data/siteContent.js).
 */
import { ASSIGNED_LEADS, RECENT_CAPTURES } from './mockLeads'

export const WORKSPACE = {
  windowTitle: 'Trionix CRM — Clinic A',
  sampleLabel: 'Sample data',
  clinic: { name: 'Clinic A', branch: 'Main branch', initials: 'CA' },
  searchPlaceholder: 'Search leads, people…',
}

/**
 * Every navigation item the app can show. Each role sees only a subset
 * (ROLE_SESSIONS[role].nav) — "each person sees exactly what they need".
 * `icon` keys are resolved to lucide icons inside the Roles section.
 */
export const NAV_ITEMS = {
  today: { label: 'Today', icon: 'sun' },
  capture: { label: 'New enquiry', icon: 'userPlus' },
  dashboard: { label: 'Dashboard', icon: 'layout' },
  team: { label: 'Team', icon: 'team' },
  leads: { label: 'Leads', icon: 'users' },
  pipeline: { label: 'Pipeline', icon: 'kanban' },
  followups: { label: 'Follow-ups', icon: 'bell' },
  board: { label: 'Weekly board', icon: 'calendar' },
  reports: { label: 'Reports', icon: 'chart' },
  users: { label: 'Users', icon: 'userCog' },
  settings: { label: 'Settings', icon: 'settings' },
}

/** Per-role session: who is signed in, the nav they see and the page header. */
export const ROLE_SESSIONS = {
  admin: {
    user: { initials: 'AK', name: 'Aisha K.' },
    nav: ['dashboard', 'leads', 'pipeline', 'reports', 'users', 'settings'],
    activeNav: 'settings',
    page: { title: 'Settings', crumb: 'Clinic A · Workspace' },
  },
  'sales-manager': {
    user: { initials: 'OH', name: 'Omar H.' },
    nav: ['dashboard', 'team', 'pipeline', 'board', 'reports'],
    activeNav: 'team',
    page: { title: 'Team overview', crumb: 'This week · 6 reps' },
  },
  'sales-executive': {
    user: { initials: 'RS', name: 'Reem S.' },
    nav: ['today', 'leads', 'pipeline', 'followups'],
    activeNav: 'today',
    page: { title: 'Today', crumb: 'Tuesday, 13 Oct' },
  },
  receptionist: {
    user: { initials: 'NJ', name: 'Nadia J.' },
    nav: ['capture', 'leads'],
    activeNav: 'capture',
    page: { title: 'New enquiry', crumb: 'Front desk' },
  },
}

/* ------------------------------------------------------------------ */
/* Admin — settings workspace                                          */
/* ------------------------------------------------------------------ */
export const ADMIN_VIEW = {
  general: {
    title: 'General',
    fields: [
      { label: 'Clinic name', value: 'Clinic A — Main Branch' },
      { label: 'Tagline', value: 'Specialist care, close to home' },
    ],
  },
  branding: {
    title: 'Clinic branding',
    logoLabel: 'Upload logo',
    logoMeta: 'PNG or SVG',
    colourLabel: 'Brand colour',
    colourValue: '#086B56',
  },
  users: {
    title: 'User management',
    meta: '5 of 5 seats',
    columns: ['Name', 'Role', 'Status'],
    rows: [
      { initials: 'AK', name: 'Aisha K.', role: 'Admin', status: 'Active' },
      { initials: 'OH', name: 'Omar H.', role: 'Sales Manager', status: 'Active' },
      { initials: 'RS', name: 'Reem S.', role: 'Sales Executive', status: 'Active' },
      { initials: 'FA', name: 'Faisal A.', role: 'Sales Executive', status: 'Invited' },
      { initials: 'NJ', name: 'Nadia J.', role: 'Receptionist', status: 'Active' },
    ],
  },
  permissions: {
    title: 'Permissions',
    rows: [
      { label: 'View team reports', on: true },
      { label: 'Edit pipeline stages', on: true },
      { label: 'Export lead data', on: false },
      { label: 'Manage users', on: false },
    ],
  },
  terms: { title: 'Terms of Service', version: 'v3 · Active', meta: 'Updated 2 Oct' },
  config: {
    title: 'CRM configuration',
    rows: [
      { label: 'Lead sources', value: '6' },
      { label: 'Pipeline stages', value: '7' },
      { label: 'Departments', value: '12' },
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Sales Manager — team, pipeline, reporting, weekly board             */
/* ------------------------------------------------------------------ */
export const MANAGER_VIEW = {
  activity: [
    { label: 'Calls', value: '64', delta: '+12%' },
    { label: 'WhatsApp', value: '41', delta: '+8%' },
    { label: 'Visits', value: '9', delta: '+2' },
  ],
  team: {
    title: 'Team performance',
    meta: 'Follow-ups completed',
    reps: [
      { initials: 'RS', name: 'Reem S.', done: 21, target: 24 },
      { initials: 'FA', name: 'Faisal A.', done: 17, target: 24 },
      { initials: 'JM', name: 'Joseph M.', done: 14, target: 20 },
      { initials: 'LT', name: 'Lina T.', done: 9, target: 16 },
    ],
  },
  pipeline: {
    title: 'Pipeline',
    meta: '106 open',
    stages: [
      { label: 'New', value: 42 },
      { label: 'Contacted', value: 28 },
      { label: 'Consult booked', value: 19 },
      { label: 'Treatment plan', value: 11 },
      { label: 'Won', value: 6 },
    ],
  },
  report: {
    title: 'New leads',
    meta: 'Last 8 weeks',
    current: '36',
    delta: '+24%',
    series: [18, 22, 19, 27, 24, 31, 29, 36],
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
  },
  board: {
    title: 'Weekly board',
    days: [
      { day: 'Mon', items: [{ label: 'Review', tone: 'emerald' }, { label: 'Calls 12', tone: 'neutral' }] },
      { day: 'Tue', items: [{ label: 'Recalls', tone: 'mint' }, { label: 'Visits 2', tone: 'neutral' }] },
      { day: 'Wed', items: [{ label: '1:1s', tone: 'neutral' }, { label: 'Calls 15', tone: 'neutral' }] },
      { day: 'Thu', items: [{ label: 'Sprint', tone: 'emerald' }, { label: 'Calls 9', tone: 'neutral' }] },
      { day: 'Fri', items: [{ label: 'Report', tone: 'amber' }, { label: 'Visits 3', tone: 'neutral' }] },
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Sales Executive — focused daily workflow                            */
/* ------------------------------------------------------------------ */
export const EXECUTIVE_VIEW = {
  followups: {
    title: 'Follow-up reminders',
    items: [
      { id: 'f1', type: 'call', lead: 'Lead · Call', detail: 'Second call · Cardiology', due: '09:00', overdue: true },
      { id: 'f2', type: 'whatsapp', lead: 'Lead · Campaign', detail: 'Send consult options', due: '11:30' },
      { id: 'f3', type: 'visit', lead: 'Lead · Walk-in', detail: 'Clinic visit · Orthopaedics', due: '14:00' },
      { id: 'f4', type: 'call', lead: 'Lead · Referral', detail: 'Confirm appointment', due: '16:15' },
    ],
  },
  leads: { title: 'Assigned leads', meta: `${ASSIGNED_LEADS.length} new`, items: ASSIGNED_LEADS },
  opportunities: {
    title: 'Active opportunities',
    items: [
      { id: 'o1', name: 'Knee consult package', stage: 'Consult booked', value: 'QAR 8,400', progress: 0.55 },
      { id: 'o2', name: 'Dental implant plan', stage: 'Treatment plan', value: 'QAR 12,900', progress: 0.75 },
      { id: 'o3', name: 'Skin care programme', stage: 'Contacted', value: 'QAR 3,250', progress: 0.3 },
    ],
  },
  activities: {
    title: 'Daily activity',
    items: [
      { label: 'Calls', done: 5, target: 12 },
      { label: 'WhatsApp', done: 9, target: 15 },
      { label: 'Visits', done: 1, target: 3 },
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Receptionist — quick lead capture                                   */
/* ------------------------------------------------------------------ */
export const RECEPTIONIST_VIEW = {
  tabs: ['New walk-in enquiry', 'Incoming call'],
  fields: {
    name: { label: 'Full name', placeholder: 'Visitor’s full name' },
    phone: { label: 'Phone', value: '+974 55•• ••12' },
    department: { label: 'Department of interest', shortLabel: 'Department', value: 'Orthopaedics' },
    source: { label: 'Source', options: ['Walk-in', 'Call', 'Campaign'], selected: 0 },
    notes: { label: 'Notes', value: 'Asked about consultation timings next week.' },
  },
  saveLabel: 'Save lead',
  recent: { title: 'Recent captures', meta: 'Today', items: RECENT_CAPTURES },
  today: {
    title: 'Captured today',
    items: [
      { label: 'Walk-in', value: '7' },
      { label: 'Call', value: '5' },
      { label: 'Campaign', value: '3' },
    ],
  },
}
