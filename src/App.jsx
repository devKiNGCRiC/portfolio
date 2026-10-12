import { lazy, Suspense, useEffect, useState } from 'react'
import Nav from './components/Nav'
import Companion from './components/Companion'
import { stops } from './data/stops'
import { site } from './data/profile'
import { useActiveSection } from './hooks/useActiveSection'
import Footer from './components/Footer'
import Marquee from './components/Marquee'
import Hero from './sections/Hero'
import About from './sections/About'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import Journey from './sections/Journey'
import Github from './sections/Github'
import Trips from './sections/Trips'
import Contact from './sections/Contact'

// The terminal is an easter egg, so it only downloads the first time someone opens it
const Terminal = lazy(() => import('./components/Terminal'))

const STOP_IDS = stops.map((s) => s.id)

const ticker = site.ticker ?? []

export default function App() {
  const active = useActiveSection(STOP_IDS)
  const [termOpen, setTermOpen] = useState(false)
  const [termLoaded, setTermLoaded] = useState(false)

  const openTerminal = () => {
    setTermLoaded(true)
    setTermOpen(true)
  }

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setTermLoaded(true)
        setTermOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    console.log(
      '%c hey, you opened devtools! %c press "/" anywhere for a terminal.',
      'background:#ffcb2b;color:#17171a;font-weight:800;padding:4px 6px;border:2px solid #17171a;border-radius:6px',
      'color:#d92a1d;font-weight:700',
    )
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav active={active} onOpenTerminal={openTerminal} />
      <main id="main">
        <Hero />
        <Marquee items={ticker} />
        <About />
        <Projects />
        <Skills />
        <Journey />
        <Github />
        <Trips />
        <Contact />
      </main>
      <Footer />
      <Companion active={active} />
      {termLoaded && (
        <Suspense fallback={null}>
          <Terminal open={termOpen} onClose={() => setTermOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
