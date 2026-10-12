import { useEffect, useRef } from 'react'

/**
 * Writes a 0→1 CSS variable (default --progress) onto the element as it moves through the viewport.
 * start/end are viewport fractions: progress is 0 when the element top hits `start`,
 * and 1 when the element bottom hits `end`.
 */
export function useScrollProgress({ start = 0.75, end = 0.6, name = '--progress' } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let ticking = false
    const update = () => {
      ticking = false
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = r.height + vh * (start - end)
      const p = Math.min(1, Math.max(0, (vh * start - r.top) / total))
      el.style.setProperty(name, p.toFixed(4))
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
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [start, end, name])

  return ref
}
