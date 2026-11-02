import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Icon from './Icon'
import Lightbox from './Lightbox'
import { useReveal } from '../hooks/useReveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { guides } from '../data/travel'
import './Guidebook.css'

const num = (i) => String(i + 1).padStart(2, '0')
const NO_PAGES = []

// two-page spreads from this width, one page at a time below it
const WIDE = '(min-width: 760px)'
const subscribeWide = (cb) => {
  const mq = window.matchMedia(WIDE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => true)

/** One page of the book: the full image, picked by the browser at the right size. */
function Page({ page, side }) {
  if (!page) return <div className={`gpage gpage--${side} gpage--blank`} />
  return (
    <div className={`gpage gpage--${side}`}>
      <img
        src={page.thumb}
        srcSet={page.thumb === page.image ? undefined : `${page.thumb} 360w, ${page.image} 1080w`}
        sizes="(min-width: 760px) 520px, 92vw"
        alt={`${page.title}: ${page.about}`}
        decoding="async"
        draggable="false"
      />
    </div>
  )
}

/**
 * The guide as an open book: a two-page spread on wide screens, one page on
 * phones. Pages turn in 3D, index tabs jump between chapters, arrow keys and
 * swipes work, and "Full size" opens the reader for the small print.
 */
function FlipBook({ book, onZoom }) {
  const wide = useWide()
  const reduced = useReducedMotion()
  const per = wide ? 2 : 1
  const { pages } = book
  const [at, setAt] = useState(0)
  const [turning, setTurning] = useState(null) // { dir: 1 | -1, to }
  const swipe = useRef(null)

  const start = Math.floor(at / per) * per
  const last = Math.floor((pages.length - 1) / per) * per

  // load the next and previous spreads early so turning never shows a blank page
  useEffect(() => {
    for (const i of [start - per, start + per, start + per + 1]) {
      const p = pages[i]
      if (p) new Image().src = wide ? p.image : p.thumb
    }
  }, [start, per, pages, wide])

  const goTo = (to) => {
    to = Math.max(0, Math.min(last, Math.floor(to / per) * per))
    if (to === start || turning) return
    if (reduced || Math.abs(to - start) > per) return setAt(to)
    setTurning({ dir: to > start ? 1 : -1, to })
  }
  const finish = () => {
    setAt(turning.to)
    setTurning(null)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') goTo(start + per)
    if (e.key === 'ArrowLeft') goTo(start - per)
  }
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') swipe.current = e.clientX
  }
  const onPointerUp = (e) => {
    if (swipe.current === null) return
    const dx = e.clientX - swipe.current
    swipe.current = null
    if (Math.abs(dx) > 40) goTo(start + (dx < 0 ? per : -per))
  }

  // what sits underneath while a page is turning, and the turning leaf's two faces
  const t = turning
  let left = pages[start]
  let right = pages[start + 1]
  let leaf = null
  if (t && wide) {
    if (t.dir > 0) {
      right = pages[t.to + 1]
      leaf = { front: pages[start + 1], back: pages[t.to] }
    } else {
      left = pages[t.to]
      leaf = { front: pages[start], back: pages[t.to + 1] }
    }
  } else if (t) {
    left = pages[t.dir > 0 ? t.to : start]
    leaf = { front: pages[t.dir > 0 ? start : t.to] }
  }

  // chapters become index tabs
  const chapters = pages.reduce((list, p, i) => {
    if (p.chapter && p.chapter !== list.at(-1)?.name) list.push({ name: p.chapter, page: i })
    return list
  }, [])
  const titles = (wide ? [pages[start], pages[start + 1]] : [pages[start]]).filter(Boolean).map((p) => p.title)
  const current = chapters.findLast((c) => c.page <= start + (wide ? 1 : 0))?.name

  const range = wide && pages[start + 1] ? `${num(start)}–${num(start + 1)}` : num(start)

  return (
    <div className="flipbook" style={{ '--cover': book.color || '#1f5c45' }}>
      <div className="flipbook__tabs" role="group" aria-label="Chapters">
        {chapters.map((c) => (
          <button key={c.name} aria-pressed={c.name === current} onClick={() => goTo(c.page)}>
            {c.name}
          </button>
        ))}
      </div>

      <div
        className={`flipbook__book ${wide ? 'is-spread' : 'is-single'}`}
        tabIndex={0}
        role="group"
        aria-roledescription="book"
        aria-label={`${book.title}, pages ${range} of ${pages.length}. Use the arrow keys to turn pages.`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="flipbook__pages">
          <Page page={left} side={wide ? 'left' : 'single'} />
          {wide && <Page page={right} side="right" />}
          {leaf && (
            <div
              className={`leaf ${wide ? '' : 'leaf--single'} ${t.dir > 0 ? 'leaf--next' : 'leaf--prev'}`}
              onAnimationEnd={finish}
            >
              <div className="leaf__face leaf__front">
                <Page page={leaf.front} side={wide ? (t.dir > 0 ? 'right' : 'left') : 'single'} />
              </div>
              {wide && (
                <div className="leaf__face leaf__back">
                  <Page page={leaf.back} side={t.dir > 0 ? 'left' : 'right'} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flipbook__nav">
        <button className="btn btn--sm" onClick={() => goTo(start - per)} disabled={start === 0}>
          <span aria-hidden="true">←</span> Back
        </button>
        <p className="flipbook__where" aria-live="polite">
          <span>
            p.{range} <small>of {pages.length}</small>
          </span>
          <b>{titles.join(' / ')}</b>
        </p>
        <button className="btn btn--sm btn--saffron" onClick={() => goTo(start + per)} disabled={start >= last}>
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
      <button className="flipbook__zoom" onClick={() => onZoom(start + (wide && pages[start + 1] ? 1 : 0))}>
        Full size, to read the small print
      </button>
    </div>
  )
}

/** Trail guides: a shelf of books (once there's more than one) and the open book. */
export function Guides({ onZoom }) {
  const ref = useReveal({ threshold: 0.05 })
  const [open, setOpen] = useState(0)
  const books = guides.books.filter((b) => b.pages.length)
  if (!books.length) return null
  const book = books[open] ?? books[0]

  return (
    <div ref={ref} className="guides reveal">
      <div className="guides__head">
        <h3 className="display">{guides.title}</h3>
        {guides.note && <p className="hand">{guides.note}</p>}
      </div>

      {books.length > 1 && (
        <div className="guides__shelf" role="group" aria-label="Choose a guide">
          {books.map((b, i) => (
            <button
              key={b.id}
              className="spine"
              style={{ '--cover': b.color || '#1f5c45' }}
              aria-pressed={i === open}
              onClick={() => setOpen(i)}
            >
              <b>{b.title}</b>
              <span>{b.region}</span>
            </button>
          ))}
        </div>
      )}

      <div className="guides__meta">
        <p className="guides__facts">
          <span>{book.region}</span>
          <span>{book.days}</span>
          <span>{book.pages.length} pages</span>
        </p>
        <h4 className="display">{book.title}</h4>
        <p className="guides__intro">{book.intro}</p>
        {book.post && (
          <a className="btn btn--sm" href={book.post} target="_blank" rel="noreferrer">
            <Icon name="instagram" size={16} />
            See the post
          </a>
        )}
      </div>

      <FlipBook key={book.id} book={book} onZoom={(page) => onZoom({ book: books.indexOf(book), page })} />
    </div>
  )
}

/** A guide page at full size, for reading the small print. */
export function GuideReader({ at, onGo, onClose }) {
  const pages = (at && guides.books[at.book]?.pages) || NO_PAGES
  const items = useMemo(
    () => pages.map((p) => ({ src: p.image, alt: `${p.title}: ${p.about}`, title: p.title, sub: p.about, label: p.chapter })),
    [pages],
  )
  return <Lightbox items={items} index={at ? at.page : null} onGo={(page) => onGo({ ...at, page })} onClose={onClose} square />
}
