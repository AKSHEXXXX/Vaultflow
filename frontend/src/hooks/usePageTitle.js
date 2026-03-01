import { useEffect } from 'react'

const BASE = 'VaultFlow'

/**
 * Sets the browser tab title.
 * @param {string} title - page title, e.g. "Dashboard"
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : BASE
    return () => { document.title = BASE }
  }, [title])
}
