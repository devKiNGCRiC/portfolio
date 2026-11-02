import { useSyncExternalStore } from 'react'

/*
  Three looks, named after mountain light. index.html picks one before first
  paint (a saved choice, else the visitor's time of day); this module lets the
  page read and change it.
*/
export const THEMES = ['sunrise', 'sunset', 'night']
export const THEME_LABELS = { sunrise: 'Sunrise', sunset: 'Sunset', night: 'Night' }

const listeners = new Set()

export const getTheme = () => document.documentElement.dataset.theme || 'sunrise'

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // private mode or blocked storage: the theme still applies for this visit
  }
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => 'sunrise')
}
