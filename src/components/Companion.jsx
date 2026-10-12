import { Component, lazy, Suspense, useEffect, useState } from 'react'
import Icon from './Icon'
import { stops } from '../data/stops'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './Companion.css'

const CompanionScene = lazy(() => import('../three/CompanionScene'))

class Quiet extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const HONKS = ['Pom pom!', 'Beep beep!', 'Mind the potholes!', 'Next stop, adventure.']

/*
  Clay-KiNG, the corner guide. Appears once you leave the hero, changes pose and
  line per section, and "Next stop" drives you to the following section.
*/
export default function Companion({ active }) {
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(true)
  const [honk, setHonk] = useState(null)
  const [bubble, setBubble] = useState(true)
  const [visible, setVisible] = useState(false)
  const [seen, setSeen] = useState(false) // mount the 3D scene once, then keep it

  const index = Math.max(0, stops.findIndex((s) => s.id === active))
  const stop = stops[index]
  const next = stops[(index + 1) % stops.length]
  const [lastActive, setLastActive] = useState(active)

  // only show after the hero (the hero has its own big avatar)
  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(!e.isIntersecting)
        if (!e.isIntersecting) setSeen(true)
      },
      { threshold: 0.35 },
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  // new stop → show the bubble again (adjust state during render, not in an effect)
  if (lastActive !== active) {
    setLastActive(active)
    setBubble(true)
    setHonk(null)
  }

  // bubbles tuck away after a while so they don't cover content
  useEffect(() => {
    if (!bubble) return
    const id = setTimeout(() => setBubble(false), 6000)
    return () => clearTimeout(id)
  }, [bubble, active])

  const goNext = () => {
    document.getElementById(next.id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  const onHonk = () => {
    setHonk(HONKS[Math.floor(Math.random() * HONKS.length)])
    setBubble(true)
  }

  if (!open) {
    return (
      <button
        className={`guide-fab ${visible ? 'is-visible' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Show the tour guide"
      >
        <Icon name="plane" size={22} />
      </button>
    )
  }

  return (
    <aside className={`guide ${visible ? 'is-visible' : ''}`} aria-label="Tour guide">
      <div className={`guide__bubble ${bubble ? 'is-open' : ''}`}>
        <p>{honk ?? stop.say}</p>
      </div>

      <div className="guide__stage">
        <button className="guide__close" onClick={() => setOpen(false)} aria-label="Hide the tour guide">
          <Icon name="close" size={14} strokeWidth={3} />
        </button>
        <div className="guide__canvas" aria-hidden="true">
          <Quiet>
            <Suspense fallback={null}>
              {seen && (
                <CompanionScene
                  active={visible}
                  pose={stop.pose}
                  driveKey={active}
                  reducedMotion={reduced}
                  onHonk={onHonk}
                />
              )}
            </Suspense>
          </Quiet>
        </div>
        <button className="guide__next" onClick={goNext}>
          <span>Next stop</span>
          <b>{next.id === 'top' ? 'Back to start' : next.label}</b>
        </button>
      </div>
    </aside>
  )
}
