import content from '../content/travel.json'

export const valleyRoute = content.valleyRoute ?? []
export const tripToProduct = content.tripToProduct ?? []
export const places = content.places ?? []

// the Valley of Flowers guide (an Instagram carousel), page by page
const guide = content.trekGuide ?? {}
export const trekGuide = {
  ...guide,
  pages: (guide.pages ?? []).map((p) => ({ ...p, thumb: p.thumb || p.image, stops: p.stops ?? [] })),
}
export const interests = content.interests ?? []

/** The page of the guide that covers a route stop, or -1. */
export const guidePageFor = (stop) => trekGuide.pages.findIndex((p) => p.stops.includes(stop))
