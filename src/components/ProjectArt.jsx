/*
  Layered poster art for project cards. Each layer shifts by a different
  amount (--d) as the pointer moves, so the layers separate when the card tilts.
  To use a screenshot instead, set `image` on the project in data/projects.js.
*/

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

const art = { safarnama: SafarnamaArt, wanderlink: WanderLinkArt, portfolio: PortfolioArt }

export default function ProjectArt({ project }) {
  if (project.image) {
    return (
      <div className="art__layer" style={{ '--d': 0.02 }}>
        <img src={project.image} alt={`Screenshot of ${project.name}`} loading="lazy" />
      </div>
    )
  }
  const Art = art[project.id] ?? PortfolioArt
  return <Art />
}
