import content from '../content/guide.json'

/*
  The route through the site, in scroll order. Each stop's `id` must match a section id.
  `pose` is what clay-KiNG does there; `say` is the speech bubble.
*/
export const stops = content.stops ?? []
