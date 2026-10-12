import { Component, lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Icon from '../components/Icon'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useGithub } from '../hooks/useGithub'
import RichText from '../components/RichText'
import { links, profile, site } from '../data/profile'
import { mapPins } from '../data/map'
import './Hero.css'

// three.js is big, so the scene gets its own chunk and loads after the page is usable
const HeroScene = lazy(() => import('../three/HeroScene'))

class WebGLBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail?.()
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Shown while three.js loads, or if WebGL isn't available: the same pins as plain buttons. */
function MapFallback({ onNavigate }) {
  return (
    <div className="map-fallback">
      <p className="hand">tap a stop</p>
      <ul>
        {mapPins.map((p) => (
          <li key={p.id}>
            <button className="mappin" style={{ '--pin': p.color }} onClick={() => onNavigate(p.id)}>
              <b>{p.label}</b>
              <span>{p.place}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const coarseQuery = '(pointer: coarse)'
const subscribeCoarse = (cb) => {
  const mq = window.matchMedia(coarseQuery)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

const GREETINGS = ['Namaste!', 'Hey there!', 'Scroll down, I’ll drive.', 'Tap a pin to jump there!']

export default function Hero() {
  const reducedMotion = useReducedMotion()
  const coarse = useSyncExternalStore(subscribeCoarse, () => window.matchMedia(coarseQuery).matches, () => false)
  const gh = useGithub(links.githubUser)
  const stageRef = useRef(null)
  const labelEls = useRef({}) // DOM pin labels, positioned by the 3D scene
  const [sceneFailed, setSceneFailed] = useState(false)
  const [active, setActive] = useState(true)
  const [greet, setGreet] = useState(0)

  // stop rendering the 3D scene while it's off screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '100px' })
    io.observe(stageRef.current)
    return () => io.disconnect()
  }, [])

  const navigate = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="hero__status">
            <span className="hero__live" aria-hidden="true" />
            {site.hero.status}
          </p>

          <h1 id="hero-title" className="hero__title display">
            Building{' '}
            <span className="hero__pill hero__pill--code">
              <span aria-hidden="true" className="hero__lt">
                &lt;
              </span>
              apps
              <span aria-hidden="true" className="hero__lt">
                /&gt;
              </span>
            </span>
            <br />
            between{' '}
            <span className="hero__pill hero__pill--trip">
              trips
              <Icon name="plane" size={28} className="hero__plane" />
            </span>
          </h1>

          <p className="hero__intro">
            <RichText text={site.hero.intro} />
          </p>

          <div className="hero__actions">
            <a className="btn btn--saffron" href="#projects">
              See my work
            </a>
            <a className="btn" href="#trips">
              <Icon name="plane" size={18} />
              Where I&rsquo;ve been
            </a>
          </div>

          <ul className="hero__facts" aria-label="Quick facts">
            {site.hero.facts.map((f) => (
              <li key={f.big}>
                <b>{f.big}</b>
                <span>{f.small}</span>
              </li>
            ))}
            <li className="hero__fact--repo">
              <b>{gh.status === 'ready' ? gh.profile.publicRepos : '20+'}</b>
              <span>public repos on GitHub</span>
            </li>
          </ul>
        </div>

        <div ref={stageRef} className="stage">
          <span className="stage__sun" aria-hidden="true" />
          <div className="stage__canvas">
            <WebGLBoundary fallback={<MapFallback onNavigate={navigate} />} onFail={() => setSceneFailed(true)}>
              <Suspense fallback={<MapFallback onNavigate={navigate} />}>
                <HeroScene
                  active={active}
                  reducedMotion={reducedMotion}
                  coarse={coarse}
                  onNavigate={navigate}
                  onAvatar={() => setGreet((g) => g + 1)}
                  getLabel={(id) => labelEls.current[id]}
                />
              </Suspense>
            </WebGLBoundary>
          </div>

          {!sceneFailed && (
            <nav className="stage__pins" aria-label="Map stops">
              {mapPins.map((p) => (
                <button
                  key={p.id}
                  ref={(el) => (labelEls.current[p.id] = el)}
                  className="mappin"
                  style={{ '--pin': p.color }}
                  onClick={() => navigate(p.id)}
                >
                  <b>{p.label}</b>
                  <span>{p.place}</span>
                </button>
              ))}
            </nav>
          )}

          <p className="stage__title sticker" aria-hidden="true">
            <Icon name="pin" size={15} />
            {profile.nickname}&rsquo;s map of India
          </p>
          {greet > 0 && (
            <p className="stage__greet" key={greet} aria-hidden="true">
              {GREETINGS[(greet - 1) % GREETINGS.length]}
            </p>
          )}
          <p className="stage__note hand" aria-hidden="true">
            {coarse ? 'tap a pin, or tap me!' : 'drag the map, click a pin, or click me!'}
          </p>
          <p className="stage__legend" aria-hidden="true">
            <span>
              <i className="dash dash--saffron" /> Arunachal to Chennai
            </span>
            <span>
              <i className="dash dash--red" /> the Valley of Flowers trek
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
