/*
  Layered poster art for project cards. Each layer shifts by a different
  amount (--d) as the pointer moves, so the layers separate when the card tilts.
  To use a screenshot instead, set `image` on the project in data/projects.js.
  A tall (phone) screenshot is shown in a phone frame over the art instead.
*/
import { useState } from 'react'

const stroke = { stroke: '#17171a', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }

function SafarnamaArt() {
  return (
    <>
      <div className="art__layer" style={{ '--d': 0.02 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMax slice">
          <circle cx="470" cy="90" r="48" fill="#fff" {...stroke} />
          <path d="M-10 300 L120 120 L200 220 L310 70 L430 230 L520 150 L620 300 Z" fill="#8a97ad" {...stroke} />
          <path d="M280 112 L310 70 L340 112 L322 104 L310 118 L296 104 Z" fill="#fff" {...stroke} />
        </svg>
      </div>
      <div className="art__layer" style={{ '--d': 0.07 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMax slice">
          <path d="M-10 360 L-10 270 C 100 230, 180 280, 300 250 S 500 220, 620 260 L620 360 Z" fill="#5fd07f" {...stroke} />
          <path d="M40 330 C 140 300, 180 260, 250 262 S 300 200, 310 90" fill="none" stroke="#ff4032" strokeWidth="7" strokeLinecap="round" strokeDasharray="1 14" />
          <path d="M300 92 L300 58 L330 66 L300 74" fill="#ff4032" {...stroke} />
        </svg>
      </div>
      <div className="art__layer art__stamp" style={{ '--d': 0.16 }}>
        <span className="stamp stamp--red">
          <small>Special Jury Award</small>
          <b>Most Innovative</b>
          <small>8 Feb 2025</small>
        </span>
      </div>
    </>
  )
}

function WanderLinkArt() {
  return (
    <>
      <div className="art__layer" style={{ '--d': 0.02 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
          {[
            [90, 90],
            [250, 60],
            [470, 100],
            [380, 250],
            [150, 270],
          ].map(([x, y], i, a) => (
            <g key={i}>
              <line x1={x} y1={y} x2={a[(i + 1) % a.length][0]} y2={a[(i + 1) % a.length][1]} stroke="#17171a" strokeWidth="2.5" strokeDasharray="6 8" />
              <circle cx={x} cy={y} r="11" fill={i === 3 ? '#ff4032' : '#fff'} {...stroke} />
            </g>
          ))}
        </svg>
      </div>
      <div className="art__layer art__bubbles" style={{ '--d': 0.12 }}>
        <span className="bubble bubble--left">anyone near Mana village?</span>
        <span className="bubble bubble--right">yes! meet at the café?</span>
      </div>
    </>
  )
}

function PortfolioArt() {
  return (
    <>
      <div className="art__layer" style={{ '--d': 0.02 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="300" cy="250" rx="190" ry="50" fill="#5fd07f" {...stroke} />
          <path d="M140 262 L300 330 L460 262 C 420 300, 180 300, 140 262Z" fill="#b8744f" {...stroke} />
          <path d="M220 250 L300 90 L380 250 Z" fill="#8a97ad" {...stroke} />
          <path d="M275 140 L300 90 L325 140 Z" fill="#fff" {...stroke} />
        </svg>
      </div>
      <div className="art__layer art__pin" style={{ '--d': 0.14 }}>
        <span className="sticker">you are here</span>
      </div>
    </>
  )
}

// Wanderlens: a map with photo-spot pins and a polaroid
function WanderlensArt() {
  return (
    <>
      <div className="art__layer" style={{ '--d': 0.02 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
          <rect width="600" height="360" fill="#d3f5da" />
          <path d="M-10 250 C 120 200, 200 290, 330 230 S 520 180, 620 220" fill="none" stroke="#3fa9f5" strokeWidth="18" strokeLinecap="round" />
          <path d="M60 60 C 140 120, 200 40, 300 110 S 460 60, 560 120" fill="none" stroke="#17171a" strokeWidth="2.5" strokeDasharray="6 9" />
          {[
            [120, 150, '#ff9933'],
            [300, 110, '#e53935'],
            [470, 175, '#00b8d4'],
          ].map(([x, y, c]) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              <path d="M0 0 C -22 -26, -22 -52, 0 -56 C 22 -52, 22 -26, 0 0 Z" fill={c} {...stroke} />
              <circle cx="0" cy="-36" r="8" fill="#fff" {...stroke} />
            </g>
          ))}
        </svg>
      </div>
      <div className="art__layer art__polaroid" style={{ '--d': 0.13 }}>
        <span className="mini-polaroid">
          <i />
          <b>golden hour</b>
        </span>
      </div>
    </>
  )
}

// TripWise: day-by-day itinerary cards
function TripWiseArt() {
  return (
    <>
      <div className="art__layer" style={{ '--d': 0.02 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
          <rect width="600" height="360" fill="#ffe0db" />
          <path d="M0 290 L110 170 L190 240 L300 120 L410 230 L500 160 L600 250 V360 H0Z" fill="#8a97ad" {...stroke} />
          <path d="M270 154 L300 120 L330 154 Z" fill="#fff" {...stroke} />
          <circle cx="500" cy="80" r="34" fill="#ffc400" {...stroke} />
        </svg>
      </div>
      <div className="art__layer art__days" style={{ '--d': 0.12 }}>
        {['Day 1', 'Day 2', 'Day 3'].map((d, i) => (
          <span key={d} className="day-card" style={{ '--r': `${(i - 1) * 5}deg` }}>
            <b>{d}</b>
            <i />
            <i />
          </span>
        ))}
      </div>
    </>
  )
}

// PinchPop: two hands framing a shot
function PinchPopArt() {
  return (
    <>
      <div className="art__layer" style={{ '--d': 0.02 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
          <rect width="600" height="360" fill="#d3f5da" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${r}${c}`}
                x={220 + c * 56}
                y={100 + r * 56}
                width="52"
                height="52"
                rx="6"
                fill={['#ff9933', '#bfe6ff', '#ffc400', '#2dbe4f', '#ff6f61', '#bfe6ff', '#fff', '#ffc400', '#ff9933'][r * 3 + c]}
                {...stroke}
              />
            )),
          )}
        </svg>
      </div>
      <div className="art__layer" style={{ '--d': 0.14 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
          {/* finger "frame" corners */}
          <path d="M170 150 V70 H250" fill="none" stroke="#e53935" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M430 210 V290 H350" fill="none" stroke="#e53935" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="250" cy="70" r="14" fill="#c68642" {...stroke} />
          <circle cx="350" cy="290" r="14" fill="#c68642" {...stroke} />
        </svg>
      </div>
    </>
  )
}

// DevBlog: an article page with a like and a comment bubble
function DevBlogArt() {
  return (
    <>
      <div className="art__layer" style={{ '--d': 0.02 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
          <rect width="600" height="360" fill="#e3f1ff" />
          <rect x="170" y="40" width="260" height="300" rx="14" fill="#fff" {...stroke} />
          <rect x="190" y="60" width="220" height="70" rx="8" fill="#ffc400" {...stroke} />
          <rect x="190" y="148" width="180" height="14" rx="7" fill="#17171a" />
          {[178, 198, 218, 238, 258].map((y, i) => (
            <rect key={y} x="190" y={y} width={i % 2 ? 190 : 220} height="8" rx="4" fill="#c9ced8" />
          ))}
        </svg>
      </div>
      <div className="art__layer" style={{ '--d': 0.1 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
          <path d="M480 150 C 480 128, 452 122, 444 142 C 436 122, 408 128, 408 150 C 408 172, 444 192, 444 192 C 444 192, 480 172, 480 150 Z" fill="#ff2e88" {...stroke} />
          <path d="M80 210 H190 A14 14 0 0 1 204 224 V262 A14 14 0 0 1 190 276 H112 L92 296 V276 H80 A14 14 0 0 1 66 262 V224 A14 14 0 0 1 80 210 Z" fill="#00e5ff" {...stroke} />
          <circle cx="110" cy="243" r="6" fill="#17171a" />
          <circle cx="135" cy="243" r="6" fill="#17171a" />
          <circle cx="160" cy="243" r="6" fill="#17171a" />
        </svg>
      </div>
    </>
  )
}

// AlgoVisualizer Pro: sorting bars mid-swap
function AlgoArt() {
  const bars = [140, 60, 200, 100, 240, 80, 170, 120]
  return (
    <>
      <div className="art__layer" style={{ '--d': 0.02 }}>
        <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
          <rect width="600" height="360" fill="#fff1b8" />
          {bars.map((h, i) => (
            <rect
              key={i}
              x={90 + i * 54}
              y={310 - h}
              width="40"
              height={h}
              rx="6"
              fill={i === 2 || i === 3 ? '#e53935' : i < 2 ? '#2dbe4f' : '#0b1a6e'}
              {...stroke}
            />
          ))}
          <path d="M215 80 C 235 50, 285 50, 305 80" fill="none" stroke="#17171a" strokeWidth="3" />
          <path d="M296 70 L305 80 L292 84" fill="none" stroke="#17171a" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="art__layer art__pin" style={{ '--d': 0.12 }}>
        <span className="sticker">swap!</span>
      </div>
    </>
  )
}

const art = {
  safarnama: SafarnamaArt,
  wanderlink: WanderLinkArt,
  portfolio: PortfolioArt,
  wanderlens: WanderlensArt,
  tripwise: TripWiseArt,
  pinchpop: PinchPopArt,
  algovisualizer: AlgoArt,
  devblog: DevBlogArt,
}

export default function ProjectArt({ project }) {
  // 'wide' until the screenshot loads; a tall one means a phone app
  const [shape, setShape] = useState('wide')
  const Art = art[project.id] ?? PortfolioArt

  if (!project.image) return <Art />

  if (shape === 'tall') {
    // phone screenshots stand in clay phones on the project's own scenery
    const screens = [project.image, ...(project.moreImages ?? [])].filter(Boolean).slice(0, 3)
    return (
      <>
        <div className={`art__layer art__phones art__phones--${screens.length}`} style={{ '--d': 0.08 }}>
          {screens.map((src, i) => (
            <span key={`${i}-${src}`} className="phone">
              <img src={src} alt={`${project.name} screen ${i + 1}`} loading="lazy" />
            </span>
          ))}
        </div>
        <Art />
      </>
    )
  }

  return (
    <div className="art__layer" style={{ '--d': 0.02 }}>
      <img
        src={project.image}
        alt={`Screenshot of ${project.name}`}
        loading="lazy"
        onLoad={(e) => {
          const img = e.currentTarget
          if (img.naturalHeight > img.naturalWidth) setShape('tall')
        }}
      />
    </div>
  )
}
