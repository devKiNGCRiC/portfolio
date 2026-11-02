import { useEffect, useRef } from 'react'
import './Lightbox.css'

const num = (i) => String(i + 1).padStart(2, '0')

/**
 * Full-size viewer for a list of images: next/back buttons, arrow keys, swipe
 * and pinch-zoom. `items` are { src, alt, title, sub, label, stamp }; `index`
 * is the open one, or null when closed. `ratio` (width / height) sizes the
 * sheet; `square` frames square guide pages.
 */
export default function Lightbox({ items, index, onGo, onClose, square = false }) {
  const dialogRef = useRef(null)
  const swipe = useRef(null)
  const item = index !== null && index >= 0 ? items[index] : null

  useEffect(() => {
    const d = dialogRef.current
    if (item && !d.open) d.showModal()
    else if (!item && d.open) d.close()
  }, [item])

  // load the neighbours early so flipping feels instant
  useEffect(() => {
    if (index === null) return
    for (const j of [index - 1, index + 1]) if (items[j]) new Image().src = items[j].src
  }, [index, items])

  const go = (step) => {
    const j = index + step
    if (j >= 0 && j < items.length) onGo(j)
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
      style={{ '--ar': item?.ratio ?? 1 }}
      aria-label={item ? `${item.title}, ${index + 1} of ${items.length}` : 'Viewer'}
      // the close event arrives a moment late; ignore it if something new has opened since
      onClose={() => !dialogRef.current.open && onClose()}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === dialogRef.current && onClose()}
    >
      {item && (
        <div className="reader__sheet">
          <div className="reader__bar">
            <p className="reader__where">
              {item.label && <span>{item.label}</span>}
              <b>
                {num(index)} / {items.length}
              </b>
            </p>
            <button className="reader__close" onClick={onClose} aria-label="Close">
              esc
            </button>
          </div>
          <div className="reader__frame">
            <img
              key={item.src}
              className={`reader__img ${square ? 'reader__img--square' : ''}`}
              src={item.src}
              alt={item.alt}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              draggable="false"
            />
            {item.stamp && (
              <span className="reader__stamp" aria-hidden="true">
                {item.stamp}
              </span>
            )}
          </div>
          <div className="reader__foot">
            <button className="btn btn--sm" onClick={() => go(-1)} disabled={index === 0}>
              <span aria-hidden="true">←</span> Back
            </button>
            <p className="reader__title">
              <b>{item.title}</b>
              {item.sub && <span>{item.sub}</span>}
            </p>
            <button className="btn btn--sm btn--saffron" onClick={() => go(1)} disabled={index === items.length - 1}>
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
