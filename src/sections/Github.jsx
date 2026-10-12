import SectionHead from '../components/SectionHead'
import Icon from '../components/Icon'
import { useGithub } from '../hooks/useGithub'
import { useReveal } from '../hooks/useReveal'
import { links, openSourceGoals, site } from '../data/profile'
import './Github.css'

const DAY = 86_400_000

function status(pushed) {
  const days = (Date.now() - new Date(pushed)) / DAY
  if (days < 7) return ['Boarding', 'go']
  if (days < 60) return ['On time', 'ok']
  return ['Landed', 'done']
}

function when(pushed) {
  const days = Math.floor((Date.now() - new Date(pushed)) / DAY)
  if (days < 1) return 'today'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function Board({ gh }) {
  if (gh.status === 'loading') {
    return (
      <ul className="board__rows" aria-busy="true" aria-label="Loading repositories">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="board__row board__row--skeleton" />
        ))}
      </ul>
    )
  }
  if (gh.status === 'error' || !gh.repos?.length) {
    return (
      <div className="board__empty">
        <p>Board&rsquo;s offline. GitHub might be rate-limiting this browser.</p>
        <a className="btn btn--saffron btn--sm" href={links.github} target="_blank" rel="noreferrer">
          See repos on GitHub
        </a>
      </div>
    )
  }
  return (
    <ul className="board__rows">
      {gh.repos.map((r, i) => {
        const [label, tone] = status(r.pushed)
        return (
          <li key={r.id} style={{ '--i': i }}>
            <a className="board__row" href={r.url} target="_blank" rel="noreferrer">
              <span className="board__time">{when(r.pushed)}</span>
              <span className="board__dest">
                {r.name}
                {r.description && <small>{r.description}</small>}
              </span>
              <span className="board__gate">{r.language ?? '—'}</span>
              <span className={`board__status board__status--${tone}`}>{label}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default function Github() {
  const gh = useGithub(links.githubUser)
  const boardRef = useReveal({ threshold: 0.05 })
  const sideRef = useReveal()
  const done = openSourceGoals.filter((g) => g.done).length

  return (
    <section id="github" className="section gh" aria-labelledby="github-title">
      <div className="wrap">
        <SectionHead
          id="github-title"
          title={site.sections.github.title}
          note={site.sections.github.note}
          intro={site.sections.github.intro}
        />

        <div className="gh__grid">
          <div ref={boardRef} className="board reveal">
            <div className="board__top">
              <span className="board__title display">
                <Icon name="plane" size={22} /> Departures
              </span>
              <span className="board__user">@{links.githubUser}</span>
            </div>
            <div className="board__cols" aria-hidden="true">
              <span>Pushed</span>
              <span>Destination</span>
              <span>Gate</span>
              <span>Status</span>
            </div>
            <Board gh={gh} />
          </div>

          <div ref={sideRef} className="gh__side reveal">
            <div className="ghcard">
              {gh.status === 'ready' && gh.profile.avatar ? (
                <img className="ghcard__avatar" src={gh.profile.avatar} alt="" width="72" height="72" loading="lazy" />
              ) : (
                <span className="ghcard__avatar" aria-hidden="true">
                  <Icon name="github" size={30} />
                </span>
              )}
              <div>
                <p className="ghcard__handle display">@{links.githubUser}</p>
                <p className="ghcard__count">
                  {gh.status === 'ready' ? `${gh.profile.publicRepos} public repos` : 'public repos'}
                </p>
              </div>
              <a className="btn btn--ink btn--sm" href={links.github} target="_blank" rel="noreferrer">
                Follow
              </a>
              <figure className="ghcard__chart">
                <img
                  src={`https://ghchart.rshah.org/ff4032/${links.githubUser}`}
                  alt={`GitHub contribution chart for ${links.githubUser} over the last year`}
                  loading="lazy"
                  width="663"
                  height="104"
                  onError={(e) => {
                    e.currentTarget.closest('figure').hidden = true
                  }}
                />
              </figure>
            </div>

            <div className="checklist">
              <h3 className="display">Open-source checklist</h3>
              <p>Beginner here, not a maintainer. Ticking these off as they happen.</p>
              <ul>
                {openSourceGoals.map((g) => (
                  <li key={g.text} className={g.done ? 'is-done' : ''}>
                    <span className="checklist__box" aria-hidden="true" />
                    <span>
                      {g.link ? (
                        <a href={g.link} target="_blank" rel="noreferrer">
                          {g.text}
                        </a>
                      ) : (
                        g.text
                      )}
                      <span className="sr-only">{g.done ? ' (done)' : ' (not yet)'}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="checklist__foot hand">
                {done} of {openSourceGoals.length} done, more soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
