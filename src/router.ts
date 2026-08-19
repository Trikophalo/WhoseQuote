import { useEffect, useState } from 'react'

export const ROUTES = ['game', 'faq', 'impressum', 'datenschutz', 'nutzungsbedingungen', 'bildnachweise'] as const
export type Route = (typeof ROUTES)[number]

function fromHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return (ROUTES as readonly string[]).includes(hash) ? (hash as Route) : 'game'
}

export function navigate(route: Route) {
  window.location.hash = route === 'game' ? '' : `/${route}`
  window.scrollTo(0, 0)
}

/** Minimaler Hash-Router — reicht für eine SPA mit fünf statischen Seiten. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(fromHash)
  useEffect(() => {
    const onChange = () => setRoute(fromHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
