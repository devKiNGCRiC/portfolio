import content from '../content/guide.json'
import { valleyRoute } from './travel'

/*
  The route through the site, in scroll order. Each stop's `id` must match a section id.
  `pose` is what clay-KiNG does there; `say` is the speech bubble.
*/
export const stops = content.stops ?? []

/*
  The page is also the Valley of Flowers trek: each stop is matched to a point
  on the real route (Delhi → … → Hemkund Sahib), so the page climbs as you
  scroll and the last stop is the summit.
*/
export function placeFor(id) {
  const i = Math.max(0, stops.findIndex((s) => s.id === id))
  if (!valleyRoute.length) return null
  return valleyRoute[Math.round((i * (valleyRoute.length - 1)) / Math.max(1, stops.length - 1))]
}
