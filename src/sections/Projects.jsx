import { useState } from 'react'
import SectionHead from '../components/SectionHead'
import StatusTag from '../components/StatusTag'
import ProjectArt from '../components/ProjectArt'
import CaseStudy from '../components/CaseStudy'
import Icon from '../components/Icon'
import { useReveal } from '../hooks/useReveal'
import { useTilt } from '../hooks/useTilt'
import { projects, workbench } from '../data/projects'
import { links, site } from '../data/profile'
import './Projects.css'

// card colour per project id; anything else is white
const THEMES = {
  safarnama: 'saffron',
  wanderlens: 'sky',
  tripwise: 'coral',
  pinchpop: 'green',
  algovisualizer: 'yellow',
  wanderlink: 'sky',
}

// On desktop the regular cards sit three to a row. When the last row would
// be short, its cards grow (two left) or centre (one left) so there's no gap.
const regular = projects.filter((p) => !p.featured)
function cardSize(project) {
  if (project.featured) return 'big'
  const i = regular.indexOf(project)
  const left = regular.length % 3
  if (left === 2 && i >= regular.length - 2) return 'wide'
  if (left === 1 && i === regular.length - 1) return 'centre'
  return ''
}

function ProjectCard({ project, size, onOpen }) {
  const reveal = useReveal({ threshold: 0.1 })
  const tilt = useTilt(6)
  const theme = THEMES[project.id] ?? 'white'

  return (
    <div ref={reveal} className={`bento__cell reveal ${size ? `bento__cell--${size}` : ''}`}>
      <article
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        className={`pcard pcard--${theme}`}
        aria-labelledby={`p-${project.id}`}
      >
        <div className="pcard__art" aria-hidden="true">
          <ProjectArt project={project} />
        </div>

        <div className="pcard__body">
          <div className="pcard__meta">
            <StatusTag status={project.status} />
            <span className="pcard__year">{project.year}</span>
          </div>
          <h3 id={`p-${project.id}`} className="pcard__title display">
            {project.name}
          </h3>
          <p className="pcard__tagline">{project.tagline}</p>
          <p className="pcard__summary">{project.summary}</p>
          <ul className="chips" aria-label="Tech stack">
            {project.tech.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
          <div className="pcard__actions">
            <button className="btn btn--ink btn--sm" onClick={() => onOpen(project)}>
              Read the story
            </button>
            <a className="btn btn--sm" href={project.repo || links.github} target="_blank" rel="noreferrer">
              <Icon name="github" size={16} />
              {project.repo ? 'Code' : 'GitHub'}
            </a>
            {project.live && (
              <a className="btn btn--sm" href={project.live} target="_blank" rel="noreferrer">
                <Icon name="external" size={16} />
                Live
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}

function Workbench() {
  const ref = useReveal({ threshold: 0.05 })
  const groups = ['All', ...new Set(workbench.map((w) => w.group))]
  const [group, setGroup] = useState('All')
  const shown = group === 'All' ? workbench : workbench.filter((w) => w.group === group)

  return (
    <div ref={ref} className="bench reveal">
      <div className="bench__head">
        <h3 className="display">More from the workbench</h3>
        <p className="hand">smaller builds &amp; experiments, all public on GitHub</p>
      </div>

      <div className="bench__filters" role="group" aria-label="Filter projects">
        {groups.map((g) => (
          <button key={g} className="bench__filter" aria-pressed={group === g} onClick={() => setGroup(g)}>
            {g}
          </button>
        ))}
      </div>

      <ul className="tags">
        {shown.map((w, i) => (
          <li key={w.name} className={`tag tag--${(i % 4) + 1}`}>
            <span className="tag__hole" aria-hidden="true" />
            <a href={w.repo} target="_blank" rel="noreferrer" className="tag__link">
              <span className="tag__name">{w.name}</span>
              <span className="tag__note">{w.note}</span>
              <span className="tag__tech">{w.tech}</span>
            </a>
            {w.live && (
              <a href={w.live} target="_blank" rel="noreferrer" className="tag__live">
                Live demo<span className="sr-only"> of {w.name}</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Projects() {
  const [open, setOpen] = useState(null)

  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHead
          id="projects-title"
          title={site.sections.projects.title}
          note={site.sections.projects.note}
          intro={site.sections.projects.intro}
        />

        <div className="bento">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} size={cardSize(p)} onOpen={setOpen} />
          ))}
        </div>

        <Workbench />
      </div>

      <CaseStudy key={open?.id ?? 'none'} project={open} onClose={() => setOpen(null)} />
    </section>
  )
}
