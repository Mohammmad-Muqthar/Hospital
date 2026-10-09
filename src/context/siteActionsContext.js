import { createContext } from 'react'

/**
 * Optional navigation callbacks supplied by the host application
 * (e.g. a router). Shape: { onTrial, onSignIn, onSupport, onPricing, onFullPricing }.
 * Each handler receives the click event; calling event.preventDefault()
 * cancels the default link navigation.
 */
export const SiteActionsContext = createContext({})
