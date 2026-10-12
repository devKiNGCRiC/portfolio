import SectionHead from '../components/SectionHead'
import StatusTag from '../components/StatusTag'
import { useReveal } from '../hooks/useReveal'
import { timeline, education } from '../data/journey'
import { site } from '../data/profile'
import './Journey.css'

const SHAPES = ['round', 'rect', 'oval', 'rect', 'round', 'oval', 'rect']

function Entry({ item, index }) {
  const ref = useReveal({ threshold: 0.4 })
  const shape = SHAPES[index % SHAPES.length]
  return (
    <li ref={ref} className={`entry reveal ${item.head ? 'entry--now' : ''}`}>
      <div
        className={`pstamp pstamp--${shape} ink--${item.ink}`}
        style={{ '--tilt': `${index % 2 ? 6 : -7}deg` }}
        aria-hidden="true"
      >
        <span className="pstamp__word">{item.stamp}</span>
        <span className="pstamp__year">{item.year}</span>
      </div>
      <div className="entry__text">
        <p className="entry__year">{item.year}</p>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </div>
    </li>
  )
}

export default function Journey() {
  const half = Math.ceil(timeline.length / 2)
  const eduRef = useReveal()

  return (
    <section id="journey" className="section journey" aria-labelledby="journey-title">
      <div className="wrap">
        <SectionHead
          id="journey-title"
          title={site.sections.journey.title}
          note={site.sections.journey.note}
          intro={site.sections.journey.intro}
        />

        <div className="passport">
          <ol className="passport__page">
            {timeline.slice(0, half).map((item, i) => (
              <Entry key={item.title} item={item} index={i} />
            ))}
          </ol>
          <ol className="passport__page" start={half + 1}>
            {timeline.slice(half).map((item, i) => (
              <Entry key={item.title} item={item} index={i + half} />
            ))}
          </ol>
        </div>

        <div ref={eduRef} className="visas reveal" aria-labelledby="edu-title">
          <h3 id="edu-title" className="visas__title display">
            Student visas
          </h3>
          <ul className="visas__list">
            {education.map((e) => (
              <li key={e.degree} className={`visa ${e.status === 'Current' ? 'visa--current' : ''}`}>
                <div className="visa__top">
                  <span className="visa__degree display">{e.degree}</span>
                  <StatusTag status={e.status === 'Current' ? 'In progress' : 'Completed'} />
                </div>
                <p className="visa__full">{e.full}</p>
                <dl className="visa__fields">
                  <div>
                    <dt>Issued by</dt>
                    <dd>{e.school}</dd>
                  </div>
                  <div>
                    <dt>Place</dt>
                    <dd>{e.campus}</dd>
                  </div>
                  {e.note && (
                    <div>
                      <dt>Score</dt>
                      <dd>{e.note}</dd>
                    </div>
                  )}
                </dl>
                <span className="visa__mrz mono" aria-hidden="true">
                  {`V<IND<<${e.degree}<<${e.school.toUpperCase().replace(/\s+/g, '<')}<<<<<<<<`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
