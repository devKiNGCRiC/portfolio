import { useEffect, useRef, useState } from 'react'
import { profile, links } from '../data/profile'
import { projects } from '../data/projects'
import { valleyRoute } from '../data/travel'
import './Terminal.css'

const PROMPT = 'king@srm:~$'
const SECTIONS = ['top', 'about', 'projects', 'skills', 'journey', 'github', 'trips', 'contact']

const banner = [
  { t: 'out', v: 'king-shell v1.0. A tiny terminal for the curious.' },
  { t: 'out', v: 'Type "help" to see what it can do.' },
]

function run(raw, close) {
  const [cmd, ...args] = raw.trim().split(/\s+/)
  const arg = args.join(' ').toLowerCase()
  switch ((cmd || '').toLowerCase()) {
    case '':
      return []
    case 'help':
      return [
        'whoami             who is this',
        'ls                 list projects',
        'cat <project>      read about a project (e.g. cat safarnama)',
        'route              the Valley of Flowers route',
        'goto <section>     jump to a section (about, projects, trips...)',
        'open <site>        github | instagram',
        'date               local time in Chennai',
        'clear              clear the screen',
        'exit               close the terminal',
      ]
    case 'whoami':
      return [
        `${profile.name}, a.k.a. ${profile.nickname}. ${profile.role}.`,
        `From ${profile.from}, grew up in ${profile.grewUp}, now in ${profile.basedIn}.`,
        'Builds things. Walks long routes. Still learning.',
      ]
    case 'ls':
      return projects.map((p) => `${p.id.padEnd(14)} ${p.status.padEnd(12)} ${p.tagline}`)
    case 'cat': {
      const p = projects.find((x) => x.id === arg || x.name.toLowerCase() === arg)
      if (!p) return [`cat: ${arg || '(nothing)'}: no such project. Try "ls".`]
      return [`# ${p.name} (${p.status})`, p.summary, '', `problem  → ${p.story.problem}`, `learned  → ${p.story.learned}`]
    }
    case 'route':
      return [
        valleyRoute.map((s) => s.name).join(' → ') + ' → Rishikesh → Delhi',
        `max altitude: ${valleyRoute.at(-1).alt} m. Legs: tired. Worth it: yes.`,
      ]
    case 'goto': {
      if (!SECTIONS.includes(arg)) return [`goto: unknown section "${arg}". Try: ${SECTIONS.join(', ')}`]
      close()
      setTimeout(() => document.getElementById(arg)?.scrollIntoView({ behavior: 'smooth' }), 50)
      return []
    }
    case 'open': {
      const url = arg === 'github' ? links.github : arg === 'instagram' ? links.instagram : null
      if (!url) return ['open: try "open github" or "open instagram"']
      window.open(url, '_blank', 'noopener')
      return [`opening ${url}`]
    }
    case 'date':
      return [new Date().toLocaleString('en-IN', { timeZone: profile.timezone }) + ' IST']
    case 'sudo':
      return ["Nice try. No root access here, but my inbox is open. Try 'goto contact'."]
    case 'exit':
      close()
      return []
    default:
      return [`${cmd}: command not found. Type "help".`]
  }
}

export default function Terminal({ open, onClose }) {
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const [lines, setLines] = useState(banner)
  const [value, setValue] = useState('')
  const [history, setHistory] = useState([])
  const [hIndex, setHIndex] = useState(-1)

  useEffect(() => {
    const d = dialogRef.current
    if (open && !d.open) {
      d.showModal()
      inputRef.current?.focus()
    } else if (!open && d.open) {
      d.close()
    }
  }, [open])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines])

  const submit = (e) => {
    e.preventDefault()
    const input = value
    setValue('')
    setHIndex(-1)
    if (input.trim()) setHistory((h) => [input, ...h].slice(0, 30))
    if (input.trim().toLowerCase() === 'clear') {
      setLines([])
      return
    }
    const out = run(input, onClose)
    setLines((l) => [...l, { t: 'in', v: input }, ...out.map((v) => ({ t: 'out', v }))])
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault()
      const i = Math.min(hIndex + 1, history.length - 1)
      setHIndex(i)
      setValue(history[i])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const i = hIndex - 1
      setHIndex(Math.max(i, -1))
      setValue(i >= 0 ? history[i] : '')
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="term"
      aria-label="Terminal"
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
    >
      <div className="term__window">
        <div className="term__bar">
          <span className="term__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="term__name mono">king-shell</span>
          <button className="term__close" onClick={onClose} aria-label="Close terminal">
            esc
          </button>
        </div>
        <div ref={bodyRef} className="term__body mono" onClick={() => inputRef.current?.focus()}>
          <div role="log" aria-live="polite">
            {lines.map((l, i) =>
              l.t === 'in' ? (
                <p key={i} className="term__in">
                  <span>{PROMPT}</span> {l.v}
                </p>
              ) : (
                <p key={i} className="term__out">
                  {l.v || ' '}
                </p>
              ),
            )}
          </div>
          <form onSubmit={submit} className="term__form">
            <label htmlFor="term-input">{PROMPT}</label>
            <input
              id="term-input"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </form>
        </div>
      </div>
    </dialog>
  )
}
