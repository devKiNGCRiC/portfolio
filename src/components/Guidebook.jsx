import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Icon from './Icon'
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

/** Full-size reader for one page: next/back, arrow keys, swipe and pinch-zoom. */
export function GuideReader({ at, onGo, onClose }) {
  const dialogRef = useRef(null)
  const swipe = useRef(null)
  const pages = (at && guides.books[at.book]?.pages) || NO_PAGES
  const page = at ? pages[at.page] : null

  useEffect(() => {
    const d = dialogRef.current
    if (page && !d.open) d.showModal()
    else if (!page && d.open) d.close()
  }, [page])

  useEffect(() => {
    if (!at) return
    for (const j of [at.page - 1, at.page + 1]) if (pages[j]) new Image().src = pages[j].image
  }, [at, pages])

  const go = (step) => {
    const j = at.page + step
    if (j >= 0 && j < pages.length) onGo({ ...at, page: j })
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  }
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') swipe.current = e.clientX
  }
  const onPointerUp = (e) => {
    if (swipe.current === null) return
    const dx = e.clientX - swipe.current
    swipe.current = null
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  }

  return (
    <dialog
      ref={dialogRef}
      className="reader"
      aria-label={page ? `Guide page ${at.page + 1} of ${pages.length}: ${page.title}` : 'Guide'}
      // the close event arrives a moment late; ignore it if a new page has opened since
      onClose={() => !dialogRef.current.open && onClose()}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === dialogRef.current && onClose()}
    >
      {page && (
        <div className="reader__sheet">
          <div className="reader__bar">
            <p className="reader__where">
              <span>{page.chapter}</span>
              <b>
                {num(at.page)} / {pages.length}
              </b>
            </p>
            <button className="reader__close" onClick={onClose} aria-label="Close the guide">
              esc
            </button>
          </div>
          <img
            key={page.image}
            className="reader__img"
            src={page.image}
            alt={`${page.title}: ${page.about}`}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            draggable="false"
          />
          <div className="reader__foot">
            <button className="btn btn--sm" onClick={() => go(-1)} disabled={at.page === 0}>
              <span aria-hidden="true">←</span> Back
            </button>
            <p className="reader__title">
              <b>{page.title}</b>
              <span>{page.about}</span>
            </p>
            <button className="btn btn--sm btn--saffron" onClick={() => go(1)} disabled={at.page === pages.length - 1}>
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
