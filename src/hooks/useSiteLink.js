import { useCallback, useContext } from 'react'
import { SECTION_IDS, siteConfig } from '../config/site'
import { SiteActionsContext } from '../context/siteActionsContext'
import { handleAnchorClick, isHashHref } from '../lib/scroll'

const HANDLER_KEYS = {
  trial: 'onTrial',
  signIn: 'onSignIn',
  support: 'onSupport',
  pricing: 'onPricing',
  fullPricing: 'onFullPricing',
}

/** Resolve a link target key ('trial', 'roles', '#pricing', '/login') to an href. */
export function resolveHref(target) {
  if (target in siteConfig.links) return siteConfig.links[target]
  if (target in SECTION_IDS) return `#${SECTION_IDS[target]}`
  return target
}

/**
 * Returns { href, onClick } for any site destination.
 * - In-page anchors smooth-scroll (pinned-section aware).
 * - Host-app handlers from SiteActionsProvider run first and may cancel
 *   default navigation with event.preventDefault().
 * - `onNavigate` runs after a click (e.g. to close the mobile menu).
 */
export default function useSiteLink(target, { href: hrefOverride, onClick: extraOnClick, onNavigate } = {}) {
  const actions = useContext(SiteActionsContext)
  const href = hrefOverride ?? resolveHref(target)
  const handler = actions[HANDLER_KEYS[target]]

  const onClick = useCallback(
    (event) => {
      extraOnClick?.(event)
      handler?.(event)
      if (!event.defaultPrevented && isHashHref(href)) handleAnchorClick(event, href)
      onNavigate?.(event)
    },
    [extraOnClick, handler, href, onNavigate],
  )

  return { href, onClick }
}
