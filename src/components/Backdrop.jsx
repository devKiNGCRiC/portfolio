import { useEffect } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './Backdrop.css'

/*
  The page background: one day of the trip, told by the sky.
  Scroll moves the sky from sunrise → day → golden hour → sunset → dusk → night,
  arcs a sun across the screen, and brings out the moon and stars at the end.
  On top: drifting colour glows, topographic contour lines, parallax doodles, film grain.
  Everything is gradients + transforms, so it stays cheap to render.
*/

// [progress, sky top, sky bottom]
const SKY = [
  [0, '#ffd2ad', '#fff3e3'], // sunrise
  [0.16, '#c9e9ff', '#fff8ee'], // morning
  [0.42, '#b7e1ff', '#f1faff'], // midday
  [0.62, '#ffe1a8', '#fff5e2'], // golden hour
  [0.8, '#ffad94', '#ffdca3'], // sunset
  [0.92, '#6c48a8', '#ff9a7a'], // dusk
  [1, '#0b1a6e', '#3b2a7c'], // night
]

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => {
  const A = hex(a)
  const B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}

function skyAt(p) {
  for (let i = 0; i < SKY.length - 1; i++) {
    const [p0, t0, b0] = SKY[i]
    const [p1, t1, b1] = SKY[i + 1]
    if (p <= p1) {
      const t = (p - p0) / (p1 - p0)
      return [mix(t0, t1, t), mix(b0, b1, t)]
    }
  }
  return [SKY.at(-1)[1], SKY.at(-1)[2]]
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/* ---------- doodles: thin ink drawings scattered down the page ---------- */
const ink = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }

const DOODLES = {
  plane: (
    <>
      <path d="M4 22 L44 6 L30 40 L22 28 Z M22 28 L44 6" {...ink} />
      <path d="M2 34 C -14 42, -24 30, -40 38" {...ink} strokeDasharray="3 6" />
    </>
  ),
  cloud: <path d="M8 34 a10 10 0 0 1 4 -19 a13 13 0 0 1 25 -3 a9 9 0 0 1 8 22 Z" {...ink} />,
  spark: <path d="M24 2 C 26 18, 30 22, 46 24 C 30 26, 26 30, 24 46 C 22 30, 18 26, 2 24 C 18 22, 22 18, 24 2 Z" {...ink} />,
  mountain: (
    <>
      <path d="M2 42 L18 16 L26 28 L34 12 L46 42 Z" {...ink} />
      <path d="M14 22 L18 16 L22 22 M30 18 L34 12 L38 18" {...ink} />
    </>
  ),
  code: <path d="M14 12 L4 24 L14 36 M34 12 L44 24 L34 36 M28 8 L20 40" {...ink} />,
  camera: (
    <>
      <path d="M6 16 h8 l4 -6 h12 l4 6 h8 a2 2 0 0 1 2 2 v20 a2 2 0 0 1 -2 2 h-36 a2 2 0 0 1 -2 -2 v-20 a2 2 0 0 1 2 -2 Z" {...ink} />
      <circle cx="24" cy="27" r="7" {...ink} />
    </>
  ),
  compass: (
    <>
      <circle cx="24" cy="24" r="20" {...ink} />
      <path d="M24 10 L29 24 L24 38 L19 24 Z M24 10 L24 4" {...ink} />
    </>
  ),
  pin: (
    <>
      <path d="M24 44 C 24 44, 8 28, 8 18 a16 16 0 0 1 32 0 C 40 28, 24 44, 24 44 Z" {...ink} />
      <circle cx="24" cy="18" r="5" {...ink} />
    </>
  ),
  route: <path d="M2 40 C 14 10, 30 46, 46 8" {...ink} strokeDasharray="2 7" />,
}

// [doodle, left %, top % of the page, size px, rotation, parallax depth, colour]
const PLACES = [
  ['plane', 6, 3, 64, -8, 0.35, 'var(--bd-ink)'],
  ['cloud', 82, 6, 90, 0, 0.15, 'var(--bd-ink)'],
  ['spark', 47, 9, 26, 0, 0.5, 'var(--saffron)'],
  ['code', 91, 14, 48, 8, 0.3, 'var(--bd-ink)'],
  ['mountain', 3, 18, 70, 0, 0.2, 'var(--bd-ink)'],
  ['spark', 70, 21, 20, 0, 0.6, 'var(--cyan)'],
  ['route', 55, 26, 80, 10, 0.25, 'var(--bd-ink)'],
  ['camera', 93, 31, 46, -12, 0.4, 'var(--bd-ink)'],
  ['cloud', 8, 35, 70, 0, 0.12, 'var(--bd-ink)'],
  ['spark', 30, 39, 22, 0, 0.55, 'var(--green-bright)'],
  ['compass', 88, 44, 54, 14, 0.3, 'var(--bd-ink)'],
  ['pin', 4, 49, 44, -6, 0.35, 'var(--bd-ink)'],
  ['plane', 76, 54, 56, 12, 0.45, 'var(--bd-ink)'],
  ['code', 10, 60, 44, -10, 0.25, 'var(--bd-ink)'],
  ['spark', 60, 63, 24, 0, 0.6, 'var(--coral)'],
  ['mountain', 90, 68, 64, 0, 0.18, 'var(--bd-ink)'],
  ['cloud', 22, 73, 84, 0, 0.14, 'var(--bd-ink)'],
  ['spark', 84, 78, 20, 0, 0.5, 'var(--saffron)'],
  ['route', 5, 82, 76, -12, 0.3, 'var(--bd-ink)'],
  ['compass', 70, 87, 46, -8, 0.35, 'var(--bd-ink)'],
  ['plane', 40, 92, 52, 6, 0.4, 'var(--bd-ink)'],
  ['spark', 12, 95, 22, 0, 0.55, 'var(--yellow)'],
]

/* ---------- topographic contour lines, generated once ---------- */
function contourRings(cx, cy, count, base, gap, seed) {
  return Array.from({ length: count }, (_, i) => {
    const r = base + i * gap
    const pts = Array.from({ length: 36 }, (_, k) => {
      const a = (k / 36) * Math.PI * 2
      const wob = 1 + Math.sin(a * 3 + seed + i * 0.4) * 0.12 + Math.cos(a * 5 - seed * 2 + i * 0.3) * 0.06
      return `${(cx + Math.cos(a) * r * wob * 1.35).toFixed(1)},${(cy + Math.sin(a) * r * wob).toFixed(1)}`
    })
    return `M${pts.join(' L')} Z`
  }).join(' ')
}

const CONTOURS = [
  contourRings(260, 220, 9, 26, 26, 1.3),
  contourRings(1180, 640, 11, 22, 24, 4.1),
  contourRings(420, 1040, 8, 30, 28, 2.6),
  contourRings(1320, 1300, 7, 24, 30, 5.7),
].join(' ')

const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453
    return x - Math.floor(x)
  }
  return { x: r(1) * 100, y: r(2) * 70, s: 1 + r(3) * 2.2, d: r(4) * 4 }
})

export default function Backdrop() {
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = document.documentElement
    let ticking = false
    const update = () => {
      ticking = false
      const max = Math.max(1, root.scrollHeight - innerHeight)
      const p = Math.min(1, Math.max(0, scrollY / max))
      const [top, bottom] = skyAt(p)
      const night = smooth(0.84, 0.98, p)
      root.style.setProperty('--bd-top', top)
      root.style.setProperty('--bd-bottom', bottom)
      root.style.setProperty('--bd-p', p.toFixed(4))
      root.style.setProperty('--bd-scroll', `${scrollY.toFixed(0)}px`)
      root.style.setProperty('--bd-night', night.toFixed(3))
      const a = (0.16 + night * 0.12).toFixed(3)
      const c = Math.round(20 + night * 235)
      root.style.setProperty('--bd-ink', `rgba(${c}, ${c}, ${c}, ${a})`)
      // the sun rises from the bottom edge, peaks at midday, sets before night
      root.style.setProperty('--bd-sun-x', `${(30 + p * 56).toFixed(2)}vw`)
      root.style.setProperty('--bd-sun-y', `${(100 - Math.sin(Math.min(1, p / 0.88) * Math.PI) * 84).toFixed(2)}vh`)
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // page height changes as images/3D load
    const ro = new ResizeObserver(onScroll)
    ro.observe(document.body)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      ro.disconnect()
    }
  }, [])

  return (
    <div className={`backdrop ${reduced ? 'is-still' : ''}`} aria-hidden="true">
      {/* fixed: sky, sun, moon, stars, glows */}
      <div className="backdrop__sky">
        <div className="backdrop__stars">
          {STARS.map((s, i) => (
            <i
              key={i}
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
            />
          ))}
        </div>
        <span className="backdrop__sun" />
        <span className="backdrop__moon" />
        <span className="glow glow--saffron" />
        <span className="glow glow--green" />
        <span className="glow glow--cyan" />
        <span className="glow glow--coral" />
        <svg className="backdrop__topo" viewBox="0 0 1600 1500" preserveAspectRatio="xMidYMid slice">
          <path d={CONTOURS} />
        </svg>
        <span className="backdrop__grain" />
      </div>

      {/* page-length: doodles with parallax */}
      <div className="backdrop__doodles">
        {PLACES.map(([name, left, top, size, rot, depth, color], i) => (
          <span
            key={i}
            className="doodle"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              color,
              '--rot': `${rot}deg`,
              '--depth': depth,
              animationDelay: `${(i % 7) * -1.3}s`,
            }}
          >
            <svg viewBox="-2 -2 52 52" overflow="visible">
              {DOODLES[name]}
            </svg>
          </span>
        ))}
      </div>
    </div>
  )
}
