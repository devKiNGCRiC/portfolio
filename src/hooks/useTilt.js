import { useReducedMotion } from './useReducedMotion'

/**
 * 3D tilt toward the cursor. Spread the returned handlers onto the element.
 * Also writes --gx / --gy (pointer position, 0–100%) for parallax layers and glare.
 */
export function useTilt(max = 8) {
  const reduced = useReducedMotion()

  const onPointerMove = (e) => {
    if (reduced || e.pointerType !== 'mouse') return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
  }

  const onPointerLeave = (e) => {
    e.currentTarget.style.transform = ''
    e.currentTarget.style.removeProperty('--gx')
    e.currentTarget.style.removeProperty('--gy')
  }

  return { onPointerMove, onPointerLeave }
}
