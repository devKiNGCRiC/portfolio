import { useEffect, useMemo, useRef, useState } from 'react'
import SectionHead from '../components/SectionHead'
import PostcardArt from '../components/PostcardArt'
import PrayerFlags from '../components/PrayerFlags'
import { Guides, GuideReader } from '../components/Guidebook'
import Lightbox from '../components/Lightbox'
import Icon from '../components/Icon'
import { useReveal } from '../hooks/useReveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { valleyRoute, tripToProduct, places, albums, interests, guidePageFor } from '../data/travel'
import { links, site } from '../data/profile'
import './Trips.css'

const fmt = new Intl.NumberFormat('en-IN')
const MAX_ALT = Math.max(...valleyRoute.map((s) => s.alt))

/*
  Postcard trail. On wide screens the section pins and vertical scroll moves
  the cards sideways; on phones (or with reduced motion) it's a native swipe row.
*/
function PostcardTrail({ onOpenGuide }) {
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
            <p className="trail__worth">WORTH IT</p>
          </div>
        </div>

        <div className="trail__viewport">
          <ol ref={trackRef} className="trail__track" aria-label="Route, in order">
            {valleyRoute.map((s, i) => (
              <li key={s.name} className="postcard" style={{ '--r': `${i % 2 ? 1.5 : -1.5}deg` }}>
                <div className="postcard__art">
                  {s.photo ? (
                    <img src={s.photo} alt={`${s.name}, on the trek`} loading="lazy" decoding="async" draggable="false" />
                  ) : (
                    <PostcardArt name={s.name} scene={s.scene} />
                  )}
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
                  {guidePageFor(s.name) && (
                    <button className="postcard__guide" onClick={() => onOpenGuide(guidePageFor(s.name))}>
                      Guide p.{String(guidePageFor(s.name).page + 1).padStart(2, '0')}
                      <span className="sr-only">: {s.name}</span>
                    </button>
                  )}
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

/*
  The photo wall: one roll of film per trip, printed as polaroids you can drag
  around (mouse) and open full size (click or tap). The last roll holds the
  places that don't have photos yet, as illustrations.
*/
function PhotoWall() {
  const ref = useReveal({ threshold: 0.05 })
  const z = useRef(10)
  const rolls = [
    ...albums.filter((a) => a.photos.length),
    ...(places.length ? [{ id: 'developing', title: 'Still developing', when: 'photos soon', places }] : []),
  ]
  const [rollId, setRollId] = useState(rolls[0]?.id)
  const [viewing, setViewing] = useState(null)
  const roll = rolls.find((r) => r.id === rollId) ?? rolls[0]

  const items = useMemo(
    () =>
      (roll?.photos ?? []).map((p) => ({
        src: p.src,
        alt: p.alt,
        title: p.caption,
        sub: `${roll.title}, ${roll.region}`,
        label: roll.title,
        stamp: p.date,
        ratio: p.width && p.height ? p.width / p.height : undefined,
      })),
    [roll],
  )

  // drag to rearrange (mouse only, so touch users can still scroll the page);
  // a press that barely moves is a click and opens the photo instead
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = e.currentTarget
    const startX = e.clientX
    const startY = e.clientY
    const [ox, oy] = (el.dataset.pos || '0,0').split(',').map(Number)
    el.dataset.moved = ''
    el.style.zIndex = ++z.current
    el.classList.add('is-dragging')
    el.setPointerCapture(e.pointerId)
    const move = (ev) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (Math.hypot(dx, dy) > 5) el.dataset.moved = '1'
      el.style.translate = `${ox + dx}px ${oy + dy}px`
      el.dataset.pos = `${ox + dx},${oy + dy}`
    }
    const up = () => {
      el.classList.remove('is-dragging')
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
  }
  const onOpen = (i) => (e) => {
    if (e.currentTarget.dataset.moved) return
    setViewing(i)
  }

  return (
    <div ref={ref} className="wall reveal">
      <div className="wall__head">
        <h3 className="display">The photo wall</h3>
        <p className="hand">(drag them around, tap one to open it)</p>
      </div>

      {rolls.length > 1 && (
        <div className="rolls" role="group" aria-label="Choose a trip">
          {rolls.map((r, i) => (
            <button key={r.id} className="roll" aria-pressed={r.id === roll.id} onClick={() => setRollId(r.id)}>
              <span className="roll__no">Roll {String(i + 1).padStart(2, '0')}</span>
              <b>{r.title}</b>
              <small>{r.when}</small>
            </button>
          ))}
        </div>
      )}

      <ul className="wall__grid" key={roll?.id}>
        {roll?.photos?.map((p, i) => (
          <li
            key={p.src}
            className="polaroid polaroid--photo"
            style={{ '--r': `${[-4, 3, -2, 5, -5, 2, 4, -3][i % 8]}deg` }}
            onPointerDown={onPointerDown}
            onClick={onOpen(i)}
          >
            <span className="polaroid__tape" aria-hidden="true" />
            <button className="polaroid__img" aria-label={`Open photo: ${p.caption}`}>
              <img
                src={p.thumb}
                alt={p.alt}
                width={p.width}
                height={p.height}
                loading="lazy"
                decoding="async"
                draggable="false"
              />
              {p.date && (
                <span className="polaroid__stamp" aria-hidden="true">
                  {p.date}
                </span>
              )}
            </button>
            <p className="polaroid__cap hand">{p.caption}</p>
          </li>
        ))}
        {roll?.places?.map((p, i) => (
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

      <a className="insta" href={links.travelInstagram || links.instagram} target="_blank" rel="noreferrer">
        <Icon name="instagram" size={26} />
        <span>
          <b className="display">{links.travelInstagramHandle || links.instagramHandle}</b>
          <small>the real photos &amp; travel stories live here</small>
        </span>
      </a>

      <Lightbox items={items} index={viewing} onGo={setViewing} onClose={() => setViewing(null)} />
    </div>
  )
}

export default function Trips() {
  const chainRef = useReveal()
  // the guide page open in the full-size reader, as { book, page }
  const [reading, setReading] = useState(null)

  return (
    <section id="trips" className="section trips" aria-labelledby="trips-title">
      <PrayerFlags />
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

      <PostcardTrail onOpenGuide={setReading} />

      <div className="wrap">
        <Guides onZoom={setReading} />

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

        <PhotoWall />
      </div>

      <GuideReader at={reading} onGo={setReading} onClose={() => setReading(null)} />
    </section>
  )
}
