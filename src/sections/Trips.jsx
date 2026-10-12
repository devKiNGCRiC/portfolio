import { useEffect, useRef } from 'react'
import SectionHead from '../components/SectionHead'
import PostcardArt from '../components/PostcardArt'
import Icon from '../components/Icon'
import { useReveal } from '../hooks/useReveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { valleyRoute, tripToProduct, places, interests } from '../data/travel'
import { links, site } from '../data/profile'
import './Trips.css'

const fmt = new Intl.NumberFormat('en-IN')
const MAX_ALT = Math.max(...valleyRoute.map((s) => s.alt))

/*
  Postcard trail. On wide screens the section pins and vertical scroll moves
  the cards sideways; on phones (or with reduced motion) it's a native swipe row.
*/
function PostcardTrail() {
  const outerRef = useRef(null)
  const trackRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const outer = outerRef.current
    const track = trackRef.current
    const mq = window.matchMedia('(min-width: 900px)')
    let distance = 0
    let ticking = false

    const measure = () => {
      if (!mq.matches || reduced) {
        outer.style.height = ''
        track.style.transform = ''
        outer.style.setProperty('--trail', 0)
        distance = 0
        return
      }
      distance = Math.max(0, track.scrollWidth - track.parentElement.clientWidth)
      outer.style.height = `${window.innerHeight + distance}px`
      update()
    }
    const update = () => {
      ticking = false
      if (!distance) return
      const r = outer.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / distance))
      track.style.transform = `translate3d(${-p * distance}px, 0, 0)`
      outer.style.setProperty('--trail', p.toFixed(4))
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    window.addEventListener('scroll', onScroll, { passive: true })
    mq.addEventListener('change', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      mq.removeEventListener('change', measure)
    }
  }, [reduced])

  // elevation profile across the top of the trail
  const profile = valleyRoute
    .map((s, i) => `${(i / (valleyRoute.length - 1)) * 1000},${100 - (s.alt / MAX_ALT) * 85}`)
    .join(' ')

  return (
    <div ref={outerRef} className="trail">
      <div className="trail__sticky">
        <div className="trail__head wrap">
          <div>
            <p className="trail__kicker hand">the solo trip that started it all</p>
            <h3 className="trail__title display">Valley of Flowers</h3>
          </div>
          <div className="trail__alt" aria-hidden="true">
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none">
              <polyline points={`0,100 ${profile} 1000,100`} className="trail__alt-fill" />
              <polyline points={profile} className="trail__alt-line" />
            </svg>
            <span className="trail__alt-label">altitude, Delhi to Hemkund</span>
          </div>
        </div>

        <div className="trail__viewport">
          <ol ref={trackRef} className="trail__track" aria-label="Route, in order">
            {valleyRoute.map((s, i) => (
              <li key={s.name} className="postcard" style={{ '--r': `${i % 2 ? 1.5 : -1.5}deg` }}>
                <div className="postcard__art">
                  <PostcardArt name={s.name} scene={s.scene} />
                  <span className="postcard__stamp">
                    {fmt.format(s.alt)}
                    <small>m</small>
                  </span>
                </div>
                <div className="postcard__body">
                  <p className="postcard__stop">Stop {String(i + 1).padStart(2, '0')}</p>
                  <h4 className="display">{s.name}</h4>
                  <p>{s.about}</p>
                  <p className="postcard__coords mono">
                    {s.lat.toFixed(2)}°N {s.lon.toFixed(2)}°E
                  </p>
                </div>
              </li>
            ))}
            <li className="postcard postcard--end">
              <p className="hand">…then back down via Rishikesh to Delhi.</p>
              <p className="display">4,632 m. Solo. Worth every step.</p>
              <a className="btn btn--saffron btn--sm" href="#projects">
                See what it turned into
              </a>
            </li>
          </ol>
        </div>

        <p className="trail__hint hand" aria-hidden="true">
          keep scrolling, the trail moves sideways
        </p>
      </div>
    </div>
  )
}

function Polaroids() {
  const ref = useReveal({ threshold: 0.05 })
  const z = useRef(10)

  // drag to rearrange (mouse only, so touch users can still scroll the page)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = e.currentTarget
    const startX = e.clientX
    const startY = e.clientY
    const [ox, oy] = (el.dataset.pos || '0,0').split(',').map(Number)
    el.style.zIndex = ++z.current
    el.classList.add('is-dragging')
    el.setPointerCapture(e.pointerId)
    const move = (ev) => {
      const x = ox + ev.clientX - startX
      const y = oy + ev.clientY - startY
      el.style.translate = `${x}px ${y}px`
      el.dataset.pos = `${x},${y}`
    }
    const up = () => {
      el.classList.remove('is-dragging')
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
  }

  return (
    <div ref={ref} className="wall reveal">
      <div className="wall__head">
        <h3 className="display">The photo wall</h3>
        <p className="hand">(go on, drag them around)</p>
      </div>
      <ul className="wall__grid">
        {places.map((p, i) => (
          <li
            key={p.name}
            className="polaroid"
            style={{ '--r': `${[-4, 3, -2, 5, -5, 2, 4, -3][i % 8]}deg` }}
            onPointerDown={onPointerDown}
          >
            <span className="polaroid__tape" aria-hidden="true" />
            <div className="polaroid__img">
              {p.src ? (
                <img src={p.src} alt={`${p.name}, ${p.region}`} loading="lazy" decoding="async" draggable="false" />
              ) : (
                <PostcardArt name={p.name} scene={p.scene} square />
              )}
            </div>
            <p className="polaroid__cap hand">{p.name}</p>
            <p className="polaroid__meta">
              {p.region}, {p.lat} {p.lon}
            </p>
          </li>
        ))}
      </ul>
      <a className="insta" href={links.instagram} target="_blank" rel="noreferrer">
        <Icon name="instagram" size={26} />
        <span>
          <b className="display">{links.instagramHandle}</b>
          <small>the real photos &amp; travel stories live here</small>
        </span>
      </a>
    </div>
  )
}

export default function Trips() {
  const chainRef = useReveal()

  return (
    <section id="trips" className="section trips" aria-labelledby="trips-title">
      <div className="wrap">
        <SectionHead
          id="trips-title"
          title={site.sections.trips.title}
          note={site.sections.trips.note}
          intro={site.sections.trips.intro}
        />
        <ul className="trips__tags" aria-label="Interests">
          {interests.map((t, i) => (
            <li key={t} className="sticker" style={{ rotate: `${[-3, 2, -1, 3, -2, 1][i % 6]}deg` }}>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <PostcardTrail />

      <div className="wrap">
        <div ref={chainRef} className="stubs reveal">
          <h3 className="stubs__title display">How a trip became a product</h3>
          <ol className="stubs__list">
            {tripToProduct.map((c, i) => (
              <li key={c.step} className="stub" style={{ '--i': i }}>
                <span className="stub__no display">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{c.step}</h4>
                  <p>{c.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Polaroids />
      </div>
    </section>
  )
}
