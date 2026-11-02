import { useReveal } from '../hooks/useReveal'
import { stops, placeFor } from '../data/stops'

const fmt = new Intl.NumberFormat('en-IN')

/** Big chunky title, an optional handwritten aside, and a short intro. */
export default function SectionHead({ id, title, note, intro }) {
  const ref = useReveal()
  // sections double as stops on the trek; show an Indian highway milestone
  // with the place on the cap and its altitude below
  const stop = stops.find((s) => `${s.id}-title` === id)
  const place = stop && stop !== stops[0] ? placeFor(stop.id) : null
  return (
    <header ref={ref} className="shead reveal">
      {place && (
        <p className="milestone" aria-hidden="true">
          <span>{place.name}</span>
          <b>{fmt.format(place.alt)} m</b>
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
