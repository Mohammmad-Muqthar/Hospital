import { FEATURES, FEATURE_SCENES } from '../../../../data/siteContent'
import { CallArt, FollowUpsArt, LeadArt, PipelineArt } from './art/AcquisitionArt'
import { DailyArt, DashboardArt, ReportsArt, WeeklyArt } from './art/ReportingArt'
import { ActivitiesArt, CalendarArt, PartnersArt, SupportArt } from './art/GrowthArt'

/** Mock-UI illustration for each feature id. */
const ART = {
  'lead-management': LeadArt,
  'cold-calling': CallArt,
  'deal-pipeline': PipelineArt,
  'follow-ups': FollowUpsArt,
  'manager-dashboard': DashboardArt,
  'crm-reports': ReportsArt,
  'weekly-board': WeeklyArt,
  'daily-reports': DailyArt,
  'marketing-calendar': CalendarArt,
  'channel-partners': PartnersArt,
  'client-activities': ActivitiesArt,
  'customer-support': SupportArt,
}

/**
 * Composition of each scene. `layout` selects the stage arrangement
 * (A: hero left · B: hero centre · C: hero right). Each feature takes a
 * `slot` in that arrangement and a card `variant` (its internal layout):
 *   hero  — icon, title, description, large product module
 *   wide  — header row, full-width module beneath
 *   tall  — narrow column, module fills the height
 *   split — text column beside the module
 *   small — text first, compact module last
 *   flip  — compact module first, text last
 */
const COMPOSITION = {
  acquisition: {
    layout: 'a',
    panels: {
      'lead-management': { slot: 'hero', variant: 'hero' },
      'cold-calling': { slot: 'small1', variant: 'small' },
      'deal-pipeline': { slot: 'medium', variant: 'wide' },
      'follow-ups': { slot: 'small2', variant: 'flip' },
    },
  },
  reporting: {
    layout: 'b',
    panels: {
      'manager-dashboard': { slot: 'hero', variant: 'hero' },
      'crm-reports': { slot: 'medium', variant: 'tall' },
      'weekly-board': { slot: 'small1', variant: 'small' },
      'daily-reports': { slot: 'small2', variant: 'flip' },
    },
  },
  growth: {
    layout: 'c',
    panels: {
      'marketing-calendar': { slot: 'hero', variant: 'hero' },
      'channel-partners': { slot: 'small1', variant: 'small' },
      'client-activities': { slot: 'small2', variant: 'flip' },
      'customer-support': { slot: 'medium', variant: 'split' },
    },
  },
}

const FEATURE_BY_ID = Object.fromEntries(FEATURES.map((f) => [f.id, f]))

/** Scenes in page order; panels keep the content order from siteContent. */
export const SCENES = FEATURE_SCENES.map((scene) => {
  const comp = COMPOSITION[scene.id]
  return {
    id: scene.id,
    layout: comp.layout,
    panels: scene.featureIds.map((id) => ({
      feature: FEATURE_BY_ID[id],
      Art: ART[id],
      ...comp.panels[id],
    })),
  }
})
