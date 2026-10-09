import { useMemo } from 'react'
import { SiteActionsContext } from './siteActionsContext'

export default function SiteActionsProvider({ actions, children }) {
  const value = useMemo(() => actions ?? {}, [actions])
  return <SiteActionsContext.Provider value={value}>{children}</SiteActionsContext.Provider>
}
