import './PrayerFlags.css'

// the five colours, always in this order: sky, wind, fire, water, earth
const COLOURS = ['#2f6fd6', '#ffffff', '#e53935', '#2dbe4f', '#ffc400']
const COUNT = 15
const SAG = 46

// a point on the string, which sags in the middle like a real line of flags
const at = (t) => ({ x: 20 + t * 960, y: 14 + 4 * SAG * t * (1 - t) })

/** A string of Himalayan prayer flags fluttering across the section. */
export default function PrayerFlags() {
  const flags = Array.from({ length: COUNT }, (_, i) => at((i + 0.5) / COUNT))
  return (
    <svg className="flags" viewBox="0 0 1000 130" aria-hidden="true">
      <path d={`M20 14 Q500 ${14 + 2 * SAG} 980 14`} className="flags__string" />
      <circle cx="20" cy="14" r="5" className="flags__knot" />
      <circle cx="980" cy="14" r="5" className="flags__knot" />
      {flags.map((p, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
          <g className="flags__flag" style={{ animationDelay: `${(i % 5) * -0.45}s` }}>
            <path d="M-20 0 H20 V44 L12 40 L4 46 L-4 40 L-12 46 L-20 42 Z" fill={COLOURS[i % 5]} />
            <path d="M-11 14 H11 M-11 22 H11 M-11 30 H5" className="flags__script" />
          </g>
        </g>
      ))}
    </svg>
  )
}
