import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import StatusTag from './StatusTag'
import { links } from '../data/profile'

const STOPS = [
  ['problem', 'The problem'],
  ['idea', 'The idea'],
  ['solution', 'What I built'],
  ['learned', 'What I learned'],
]

/** Case study as a trip itinerary, in a native <dialog> (focus trap + Esc for free). */
export default function CaseStudy({ project, onClose }) {
  const ref = useRef(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (project && !d.open) d.showModal()
    if (!project && d.open) d.close()
  }, [project])

  const p = project
  return (
    <dialog
      ref={ref}
      className="case"
      aria-labelledby="case-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {p && (
        <div className="case__card">
          <button className="case__close" onClick={onClose} aria-label="Close case study">
            <Icon name="close" size={20} />
          </button>

          <div className="case__head">
            <StatusTag status={p.status} />
            <h2 id="case-title" className="display">
              {p.name}
            </h2>
            <p className="case__tagline">{p.tagline}</p>
          </div>

          <ol className="itinerary">
            {STOPS.map(([key, label], i) => (
              <li key={key} style={{ '--i': i }}>
                <span className="itinerary__dot" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{label}</h3>
                  <p>{p.story[key]}</p>
                </div>
              </li>
            ))}
          </ol>

          {p.features.length > 0 && (
            <div className="case__block">
              <h3>What&rsquo;s inside</h3>
              <ul className="chips">
                {(showAll ? p.features : p.features.slice(0, 10)).map((f) => (
                  <li key={f} className="chip">
                    {f}
                  </li>
                ))}
                {p.features.length > 10 && (
                  <li>
                    <button className="chip chip--more" onClick={() => setShowAll((s) => !s)}>
                      {showAll ? 'Show fewer' : `+${p.features.length - 10} more`}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}

          {p.evolution && (
            <div className="case__block">
              <h3>Next stops</h3>
              <ul className="case__next">
                {p.evolution.map((e) => (
                  <li key={e.name}>
                    <span>
                      <b>{e.name}</b>, {e.note}
                    </span>
                    <StatusTag status={e.status} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="case__block">
            <h3>Packed with</h3>
            <ul className="chips">
              {p.tech.map((t) => (
                <li key={t} className="chip chip--sky">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="case__actions">
            <a className="btn btn--saffron" href={p.repo || links.github} target="_blank" rel="noreferrer">
              <Icon name="github" size={18} />
              {p.repo ? 'View code' : 'GitHub profile'}
            </a>
            {p.live && (
              <a className="btn" href={p.live} target="_blank" rel="noreferrer">
                <Icon name="external" size={18} />
                Live demo
              </a>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
