import content from '../content/travel.json'

export const valleyRoute = content.valleyRoute ?? []
export const tripToProduct = content.tripToProduct ?? []
export const places = content.places ?? []
export const interests = content.interests ?? []

// itineraries made from my trips (Instagram carousels), each shown as a guidebook
const guidesContent = content.guides ?? {}
export const guides = {
  ...guidesContent,
  books: (guidesContent.books ?? []).map((b) => ({
    ...b,
    pages: (b.pages ?? []).map((p) => ({ ...p, thumb: p.thumb || p.image, stops: p.stops ?? [] })),
  })),
}

/** The guide page that covers a route stop, as { book, page }, or null. */
export function guidePageFor(stop) {
  for (let book = 0; book < guides.books.length; book++) {
    const page = guides.books[book].pages.findIndex((p) => p.stops.includes(stop))
    if (page >= 0) return { book, page }
  }
  return null
}
