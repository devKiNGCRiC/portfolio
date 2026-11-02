import { useEffect } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useTheme } from '../theme'
import './Backdrop.css'

/*
  The page background: one day of the trip, told by the sky.
  Scroll moves the sky from sunrise → day → golden hour → sunset → dusk → night,
  arcs a sun across the screen, and brings out the moon and stars at the end.
  On top: drifting colour glows, topographic contour lines, parallax doodles, film grain.
  Everything is gradients + transforms, so it stays cheap to render.
*/

// [progress, sky top, sky bottom] for each theme
const SKIES = {
  // a whole day: sunrise → day → golden hour → sunset → dusk → night
  // saffron, marigold and red, the India colours, as one sky down the whole page;
  // the lower half of the screen stays pale so text reads on it
  sunrise: [
    [0, '#ffa94d', '#ffeccc'],
    [0.2, '#ffbf5f', '#fff2d8'],
    [0.45, '#ffcb6b', '#fff4de'],
    [0.66, '#ffaf57', '#ffe9cc'],
    [0.82, '#ff8a5c', '#ffd8b4'],
    [0.92, '#6c48a8', '#ff9a7a'],
    [1, '#0b1a6e', '#3b2a7c'],
  ],
  // the evening only: golden hour deepening into pink, dusk and night
  sunset: [
    [0, '#ffa877', '#ffe2c0'],
    [0.3, '#ff9f86', '#ffd9b8'],
    [0.55, '#ff9f8f', '#ffd6ae'],
    [0.76, '#d98bb0', '#ffc2a0'],
    [0.9, '#6c48a8', '#ff9a7a'],
    [1, '#0b1a6e', '#3b2a7c'],
  ],
  // a starlit night all the way down
  night: [
    [0, '#0a1240', '#1d2470'],
    [0.5, '#0d1a5c', '#2b2470'],
    [1, '#0b1a6e', '#3b2a7c'],
  ],
}

// how dark it has got, 0 (day) to 1 (night), at a scroll progress
const NIGHT = {
  sunrise: (p) => smooth(0.84, 0.98, p),
  sunset: (p) => smooth(0.8, 0.96, p),
  night: () => 1,
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => {
  const A = hex(a)
  const B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}

function skyAt(SKY, p) {
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

/* ---------- the Himalaya: three ranges that rise as you climb the page ---------- */
const RANGES = [
  // far: high snowy peaks
  { d: 'M0 250 L90 170 L150 205 L260 90 L330 150 L420 120 L520 40 L610 130 L700 95 L820 20 L930 140 L1010 100 L1120 55 L1220 150 L1310 110 L1420 30 L1520 120 L1600 90 V400 H0 Z', k: 0.55 },
  // middle: ridges
  { d: 'M0 290 L120 220 L210 260 L330 180 L460 250 L560 200 L690 270 L800 190 L930 255 L1060 210 L1180 270 L1300 200 L1440 260 L1600 215 V400 H0 Z', k: 0.8 },
  // near: forested foothills
  { d: 'M0 340 Q120 290 240 330 T480 320 T740 335 T1000 315 T1260 335 T1600 320 V400 H0 Z', k: 1 },
]
const SNOW = 'M233 115 L260 90 L285 118 L270 112 L258 122 Z M495 63 L520 40 L548 72 L530 66 L518 76 L506 68 Z M795 44 L820 20 L850 52 L834 46 L822 56 L808 48 Z M1095 76 L1120 55 L1146 82 L1130 78 L1118 86 Z M1395 54 L1420 30 L1450 62 L1432 56 L1420 66 L1406 58 Z'

const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453
    return x - Math.floor(x)
  }
  return { x: r(1) * 100, y: r(2) * 70, s: 1 + r(3) * 2.2, d: r(4) * 4 }
})

export default function Backdrop() {
  const reduced = useReducedMotion()
  const theme = useTheme()

  useEffect(() => {
    const root = document.documentElement
    let ticking = false
    const update = () => {
      ticking = false
      const max = Math.max(1, root.scrollHeight - innerHeight)
      const p = Math.min(1, Math.max(0, scrollY / max))
      const [top, bottom] = skyAt(SKIES[theme] ?? SKIES.sunrise, p)
      const night = (NIGHT[theme] ?? NIGHT.sunrise)(p)
      root.style.setProperty('--bd-top', top)
      root.style.setProperty('--bd-bottom', bottom)
      root.style.setProperty('--bd-p', p.toFixed(4))
      root.style.setProperty('--bd-scroll', `${scrollY.toFixed(0)}px`)
      root.style.setProperty('--bd-night', night.toFixed(3))
      const a = (0.11 + night * 0.12).toFixed(3)
      const c = Math.round(20 + night * 235)
      root.style.setProperty('--bd-ink', `rgba(${c}, ${c}, ${c}, ${a})`)
      // sunrise: the sun rises from the bottom edge, peaks at midday, sets before night.
      // sunset: it starts low and sinks to the horizon.
      const sunY =
        theme === 'sunset'
          ? 42 + Math.min(1, p / 0.85) * 62
          : 100 - Math.sin(Math.min(1, p / 0.88) * Math.PI) * 84
      root.style.setProperty('--bd-sun-x', `${(30 + p * 56).toFixed(2)}vw`)
      root.style.setProperty('--bd-sun-y', `${sunY.toFixed(2)}vh`)
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
  }, [theme])

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
        <svg className="backdrop__range" viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax slice">
          {RANGES.map((r, i) => (
            <path key={i} className={`range range--${i + 1}`} d={r.d} style={{ '--k': r.k }} />
          ))}
          <path className="range__snow" d={SNOW} style={{ '--k': RANGES[0].k }} />
        </svg>
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
