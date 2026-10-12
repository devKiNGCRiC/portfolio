import content from '../content/projects.json'
import { links } from './profile'

export const projects = (content.projects ?? []).map((p) => ({
  features: [],
  tech: [],
  repo: '',
  live: '',
  ...p,
  story: { problem: '', idea: '', solution: '', learned: '', ...p.story },
}))

// repo defaults to github.com/<you>/<name>
export const workbench = (content.workbench ?? []).map((w) => ({
  ...w,
  repo: w.repo || `${links.github}/${w.name}`,
}))
