import content from '../content/skills.json'

// { comfortable: { label, note }, learning: {...}, exploring: {...} }
export const levels = Object.fromEntries((content.levels ?? []).map(({ id, ...rest }) => [id, rest]))
export const skillGroups = content.groups ?? []
