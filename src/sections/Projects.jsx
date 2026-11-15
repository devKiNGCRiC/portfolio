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

// projects with their own card skin (see "card skins" in Projects.css);
// anything added later from /admin gets the plain white card
const SKINS = new Set(['wanderlens', 'pinchpop', 'algovisualizer', 'devblog', 'tripwise', 'safarnama', 'wanderlink'])

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
  const skin = SKINS.has(project.id) ? `skin--${project.id}` : ''
  // the screenshot's size once loaded; a phone one makes the art shrink to fit it
  const [shot, setShot] = useState(null)
  const tall = shot && shot.h > shot.w
  // cards showing a screenshot don't tilt: a 3D-transformed card is redrawn as a
  // texture, which blurs the small text in the screenshot
  const pointer = shot ? {} : { onPointerMove: tilt.onPointerMove, onPointerLeave: tilt.onPointerLeave }

  return (
    <div ref={reveal} className={`bento__cell reveal ${size ? `bento__cell--${size}` : ''}`}>
      <article
        {...pointer}
        className={`pcard ${skin} ${shot ? (tall ? 'pcard--phone' : 'pcard--laptop') : ''}`}
        aria-labelledby={`p-${project.id}`}
      >
        <div className="pcard__art" aria-hidden="true">
          <ProjectArt project={project} shot={shot} onShot={setShot} />
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
          {project.featured && project.features.length > 0 && (
            <ul className="pcard__features" aria-label="Highlights">
              {project.features.slice(0, 6).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
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

// workbench stickers wear their app's own colours (see "workbench stickers" in Projects.css)
const BENCH_SKINS = {
  smartconvert: 'smartconvert',
  'katha-heritage-platform': 'katha',
  'EcoVibes-Static-Website': 'ecovibes',
  blinktalk: 'blinktalk',
  rupeemate: 'rupeemate',
  'votewise-election-assistant': 'votewise',
  'expense-tracker': 'expense',
  portfolio: 'portfolio',
  'bmi-calculator': 'bmi',
}
const TILTS = [-2, 1.5, -1, 2, -1.5, 1]

function Workbench() {
  const ref = useReveal({ threshold: 0.05 })
  const groups = ['All', ...new Set(workbench.map((w) => w.group))]
  const [group, setGroup] = useState('All')
  const shown = group === 'All' ? workbench : workbench.filter((w) => w.group === group)
  // tags whose screenshot is a phone screen (about twice as tall as wide; a tall
  // full-page web capture stays a photo)
  const [tall, setTall] = useState(() => new Set())
  const measure = (name) => (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    if (h > w * 1.7) setTall((s) => new Set(s).add(name))
  }

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

      <ul className="stks">
        {shown.map((w, i) => {
          const title = w.title || w.name
          const phone = tall.has(w.name)
          const skin = BENCH_SKINS[w.name]
          return (
            <li
              key={w.name}
              className={`stk ${skin ? `stk--${skin}` : ''} ${phone ? 'stk--phone' : ''}`}
              style={{ '--r': `${TILTS[i % TILTS.length]}deg` }}
            >
              <a href={w.repo} target="_blank" rel="noreferrer" className="stk__link">
                {w.image &&
                  (phone ? (
                    <span className="stk__shot stk__shot--phone">
                      <span className="stk__phone">
                        <img src={w.image} alt={`Screenshot of ${title}`} />
                      </span>
                    </span>
                  ) : (
                    <span className="stk__shot">
                      <img src={w.image} alt={`Screenshot of ${title}`} loading="lazy" onLoad={measure(w.name)} />
                    </span>
                  ))}
                <span className="stk__body">
                  <span className="stk__title">{title}</span>
                  <span className="stk__note">{w.note}</span>
                  {phone && w.points?.length > 0 && (
                    <span className="stk__points">
                      {w.points.map((p) => (
                        <span key={p}>{p}</span>
                      ))}
                    </span>
                  )}
                  <span className="stk__tech">
                    {w.tech.split(/\s*(?:,|\+|&)\s*/).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                  <span className="stk__repo">
                    <Icon name="github" size={13} />
                    {w.repo.split('/').filter(Boolean).pop()}
                  </span>
                </span>
              </a>
              {(w.live || w.badge) && (
                <span className="stk__stamps">
                  {w.badge && <span className="stk__stamp">{w.badge}</span>}
                  {w.live && (
                    <a href={w.live} target="_blank" rel="noreferrer" className="stk__stamp stk__stamp--live">
                      Live<span className="sr-only"> demo of {title}</span>
                    </a>
                  )}
                </span>
              )}
            </li>
          )
        })}
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
