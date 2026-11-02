import { useEffect, useRef } from 'react'
import { useReveal } from '../hooks/useReveal'
import { trekGuide } from '../data/travel'
import './TrekGuide.css'

const pages = trekGuide.pages
const num = (i) => String(i + 1).padStart(2, '0')

/**
 * The Valley of Flowers guide as a spiral-bound field notebook: the cover on
 * one side, every page pinned on the other. Any page opens in the reader.
 */
export function TrekGuide({ onOpen }) {
  const ref = useReveal({ threshold: 0.05 })
  if (!pages.length) return null
  const [cover, ...rest] = pages

  return (
    <div ref={ref} className="tbook reveal">
      <div className="tbook__head">
        <h3 className="display">{trekGuide.title}</h3>
        {trekGuide.note && <p className="hand">{trekGuide.note}</p>}
      </div>

      <div className="tbook__book">
        <span className="tbook__rings" aria-hidden="true" />

        <div className="tbook__front">
          <button className="tbook__cover" onClick={() => onOpen(0)} aria-label={`Open the guide at page 1: ${cover.title}`}>
            <img src={cover.thumb} srcSet={`${cover.thumb} 360w, ${cover.image} 1080w`} sizes="(min-width: 900px) 34vw, 86vw" alt="" loading="lazy" decoding="async" />
          </button>
          <p className="tbook__intro">{trekGuide.intro}</p>
          <div className="tbook__actions">
            <button className="btn btn--saffron btn--sm" onClick={() => onOpen(0)}>
              Read from page 1
            </button>
            {trekGuide.post && (
              <a className="btn btn--sm" href={trekGuide.post} target="_blank" rel="noreferrer">
                See the post
              </a>
            )}
          </div>
        </div>

        <ol className="tbook__pages" aria-label="Pages">
          {rest.map((p, i) => {
            const index = i + 1
            const newChapter = i === 0 || p.chapter !== pages[index - 1].chapter
            return (
              <li key={p.image} className={newChapter ? 'is-chapter' : undefined} data-chapter={p.chapter}>
                <button className="tbook__page" onClick={() => onOpen(index)}>
                  <img src={p.thumb} alt="" loading="lazy" decoding="async" />
                  <span className="tbook__no">p.{num(index)}</span>
                  <span className="tbook__title">{p.title}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

/** Full-size reader: next/back buttons, arrow keys and swipe. */
export function GuideReader({ index, onGo, onClose }) {
  const dialogRef = useRef(null)
  const swipe = useRef(null)
  const open = index !== null && index >= 0
  const page = open ? pages[index] : null

  useEffect(() => {
    const d = dialogRef.current
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  }, [open])

  // load the neighbours early so flipping feels instant
  useEffect(() => {
    if (!open) return
    for (const j of [index - 1, index + 1]) if (pages[j]) new Image().src = pages[j].image
  }, [open, index])

  const go = (step) => {
    const j = index + step
    if (j >= 0 && j < pages.length) onGo(j)
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
      aria-label={page ? `Guide page ${index + 1} of ${pages.length}: ${page.title}` : 'Guide'}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === dialogRef.current && onClose()}
    >
      {page && (
        <div className="reader__sheet">
          <div className="reader__bar">
            <p className="reader__where">
              <span>{page.chapter}</span>
              <b>
                {num(index)} / {pages.length}
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
            <button className="btn btn--sm" onClick={() => go(-1)} disabled={index === 0}>
              ← Back
            </button>
            <p className="reader__title">
              <b>{page.title}</b>
              <span>{page.about}</span>
            </p>
            <button className="btn btn--sm btn--saffron" onClick={() => go(1)} disabled={index === pages.length - 1}>
              Next →
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
