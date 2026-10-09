/**
 * Site-wide configuration: asset locations, destinations and section ids.
 *
 * Every external destination can be overridden without touching code via a
 * Vite env file (.env.local), e.g.:
 *   VITE_TRIAL_URL=https://app.trionixhospital.com/signup
 *   VITE_SIGNIN_URL=https://app.trionixhospital.com/login
 *   VITE_HERO_VIDEO_SRC=/videos/hero.mp4
 */
const env = import.meta.env

export const SECTION_IDS = {
  top: 'top',
  features: 'features',
  howItWorks: 'how-it-works',
  roles: 'roles',
  security: 'security',
  pricing: 'pricing',
}

export const siteConfig = {
  name: 'Trionix Hospital CRM',

  /**
   * Official Trionix Hospital logo (transparent PNG or SVG, white wordmark
   * for dark backgrounds). Place the original file at
   * public/images/trionix-hospital-logo.png — it is NOT generated here.
   * `aspectRatio` (width / height) reserves space before the image loads.
   */
  logo: {
    src: env.VITE_LOGO_SRC || '/images/trionix-hospital-logo.png',
    alt: 'Trionix Hospital',
    aspectRatio: 2.05,
  },

  /**
   * Hero background video. Replace public/videos/hero.mp4 (and optionally
   * hero.webm / a poster image). If the file is missing the hero falls back
   * to a still cinematic background automatically.
   */
  hero: {
    videoSrc: env.VITE_HERO_VIDEO_SRC || '/videos/hero.mp4',
    videoSrcWebm: env.VITE_HERO_VIDEO_WEBM || '',
    posterSrc: env.VITE_HERO_POSTER_SRC || '',
  },

  /**
   * Destinations outside this page. Connect these to the real application
   * routes (or pass onTrial / onSignIn handlers through SiteActionsProvider).
   */
  links: {
    trial: env.VITE_TRIAL_URL || '/signup',
    signIn: env.VITE_SIGNIN_URL || '/login',
    support: env.VITE_SUPPORT_URL || '/support',
    fullPricing: env.VITE_FULL_PRICING_URL || '/pricing',
    /** In-page pricing section used by "View pricing". */
    pricing: `#${SECTION_IDS.pricing}`,
  },
}
