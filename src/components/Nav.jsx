import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { profile, links } from '../data/profile'
import { stops, placeFor } from '../data/stops'
import { useLocalTime } from '../hooks/useLocalTime'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './Nav.css'

const dockStops = stops.filter((s) => s.dock !== false)

/** Map any stop (including ones not in the dock) to the dock stop that covers it. */
function dockIdFor(active) {
  let current = dockStops[0].id
  for (const s of stops) {
    if (s.dock !== false) current = s.id
    if (s.id === active) return current
  }
  return current
}

function RickshawIcon() {
  return (
    <svg viewBox="0 0 48 34" aria-hidden="true">
      <path d="M6 24 V12 Q6 5 14 5 H34 Q40 5 41 11 L44 20 V24 Z" fill="#ffc400" stroke="#141414" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M8 24 V15 H30 V24 Z M32 12 H39 L42 20 H32 Z" fill="#1f9e4a" stroke="#141414" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="13" cy="26" r="5" fill="#141414" />
      <circle cx="38" cy="26" r="5" fill="#141414" />
      <circle cx="13" cy="26" r="1.8" fill="#ff9933" />
      <circle cx="38" cy="26" r="1.8" fill="#ff9933" />
    </svg>
  )
}

const fmt = new Intl.NumberFormat('en-IN')

/** Where you are on the trek: the altitude counts up (or down) to each new stop. */
function Altimeter({ active }) {
  const place = placeFor(active)
  const target = place?.alt ?? 0
  const reduced = useReducedMotion()
  const [alt, setAlt] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    const start = from.current
    if (reduced || start === target) {
      from.current = target
      const id = requestAnimationFrame(() => setAlt(target))
      return () => cancelAnimationFrame(id)
    }
    const t0 = performance.now()
    let id
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / 900)
      const v = Math.round(start + (target - start) * (1 - (1 - t) ** 3))
      from.current = v
      setAlt(v)
      if (t < 1) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [target, reduced])

  if (!place) return null
  const summit = active === stops.at(-1)?.id
  return (
    <span className={`altimeter ${summit ? 'altimeter--summit' : ''}`} title={`On the Valley of Flowers trek: ${place.name}`}>
      <svg viewBox="0 0 24 18" aria-hidden="true">
        <path d="M1 17 L8 6 L12 11 L16 3 L23 17 Z" fill="#fff" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 7 L16 3 L18 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">Altitude on the trek: </span>
      <b>{fmt.format(alt)} m</b>
      <span className="altimeter__place">{summit ? 'Summit!' : place.name}</span>
    </span>
  )
}

export default function Nav({ active, onOpenTerminal }) {
  const time = useLocalTime(profile.timezone)
  const current = dockIdFor(active)
  const itemRefs = useRef({})
  const [x, setX] = useState(0)

  // drive the little rickshaw to the active stop
  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[current]
      if (el) setX(el.offsetLeft + el.offsetWidth / 2)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [current])

  return (
    <>
      <header className="topbar">
        <a href="#top" className="topbar__logo" aria-label={`${profile.nickname}, back to top`}>
          <span className="topbar__flag" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {profile.nickname}
        </a>
        <div className="topbar__right">
          <Altimeter active={active} />
          <span className="topbar__time">
            <Icon name="pin" size={15} />
            <span className="sr-only">Local time in Chennai:</span>
            Chennai {time}
          </span>
          <button className="topbar__icon" onClick={onOpenTerminal} aria-label="Open terminal" title="Terminal (press /)">
            <Icon name="terminal" size={18} />
          </button>
          <a className="btn btn--sm btn--saffron topbar__cv" href={links.resume} download>
            <Icon name="download" size={16} />
            Resume
          </a>
        </div>
      </header>

      <nav className="road" aria-label="Sections">
        <span className="road__rickshaw" style={{ '--x': `${x}px` }} aria-hidden="true">
          <RickshawIcon />
        </span>
        {dockStops.map((s) => (
          <a
            key={s.id}
            ref={(el) => (itemRefs.current[s.id] = el)}
            href={`#${s.id}`}
            className="road__stop"
            aria-current={current === s.id ? 'true' : undefined}
          >
            <Icon name={s.icon} size={19} />
            <span>{s.label}</span>
          </a>
        ))}
      </nav>
    </>
  )
}
