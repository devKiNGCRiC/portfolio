import { useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

/** Gently pulls its child toward the cursor. Mouse only, off with reduced motion. */
export default function Magnetic({ children, strength = 0.28 }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  const onMove = (e) => {
    if (reduced || e.pointerType !== 'mouse') return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) * strength
    const y = (e.clientY - (r.top + r.height / 2)) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <span ref={ref} className="magnetic" onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </span>
  )
}
