import { useReveal } from '../hooks/useReveal'
import { stops } from '../data/stops'

/** Big chunky title, an optional handwritten aside, and a short intro. */
export default function SectionHead({ id, title, note, intro }) {
  const ref = useReveal()
  // sections double as stops on the road trip; show an Indian highway milestone
  const stopIndex = stops.findIndex((s) => `${s.id}-title` === id)
  return (
    <header ref={ref} className="shead reveal">
      {stopIndex > 0 && (
        <p className="milestone" aria-hidden="true">
          <span>Stop</span>
          <b>{String(stopIndex).padStart(2, '0')}</b>
        </p>
      )}
      <div className="shead__row">
        <h2 id={id} className="shead__title display">
          {title}
        </h2>
        {note && (
          <p className="shead__note" aria-hidden="true">
            {note}
          </p>
        )}
      </div>
      {intro && <p className="shead__intro">{intro}</p>}
    </header>
  )
}
