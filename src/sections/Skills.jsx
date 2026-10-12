import SectionHead from '../components/SectionHead'
import { useReveal } from '../hooks/useReveal'
import { skillGroups, levels } from '../data/skills'
import { site } from '../data/profile'
import './Skills.css'

const BAGS = Object.entries(levels).map(([level, l]) => ({ level, name: l.label, note: l.note }))

function Suitcase({ bag, index }) {
  const ref = useReveal({ threshold: 0.15 })
  const groups = skillGroups
    .map((g) => ({ pouch: g.pouch, items: g.items.filter((i) => i.level === bag.level) }))
    .filter((g) => g.items.length)

  return (
    <li ref={ref} className={`bag bag--${bag.level} reveal`} style={{ transitionDelay: `${index * 0.08}s` }}>
      <span className="bag__handle" aria-hidden="true" />
      <div className="bag__body">
        <div className="bag__label">
          <h3 className="display">{bag.name}</h3>
          <p>{bag.note}</p>
        </div>
        {groups.map((g) => (
          <div key={g.pouch} className="bag__group">
            <h4>{g.pouch}</h4>
            <ul className="bag__stickers">
              {g.items.map((item, i) => (
                <li key={item.name} style={{ '--r': `${((i * 37) % 7) - 3}deg` }}>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <span className="bag__wheels" aria-hidden="true">
        <i />
        <i />
      </span>
    </li>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="wrap">
        <SectionHead
          id="skills-title"
          title={site.sections.skills.title}
          note={site.sections.skills.note}
          intro={site.sections.skills.intro}
        />
        <ul className="bags">
          {BAGS.map((b, i) => (
            <Suitcase key={b.level} bag={b} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
