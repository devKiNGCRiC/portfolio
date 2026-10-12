/*
  Content now lives in /src/content/*.json and is editable from /admin.
  These modules just read the JSON and fill in sensible defaults.
*/
import site from '../content/site.json'

export { site }
export const profile = site.profile
export const links = site.links
export const openSourceGoals = site.openSourceGoals ?? []
