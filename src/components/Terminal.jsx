import { useEffect, useRef, useState } from 'react'
import { profile, links } from '../data/profile'
import { projects, workbench } from '../data/projects'
import { skillGroups, levels } from '../data/skills'
import { valleyRoute } from '../data/travel'
import './Terminal.css'

const PROMPT = 'king@srm:~$'
const SECTIONS = ['top', 'about', 'projects', 'skills', 'journey', 'github', 'trips', 'contact']
const COMMANDS = ['help', 'whoami', 'now', 'ls', 'cat', 'skills', 'resume', 'contact', 'email', 'open', 'goto', 'route', 'date', 'clear', 'exit']

// open <name>: profiles first, then any project with a live demo or repo
const SITES = {
  github: links.github,
  linkedin: links.linkedin,
  instagram: links.instagram,
  travel: links.travelInstagram,
  x: links.x,
}

const banner = [
  { t: 'out', v: 'king-shell v1.1. A tiny terminal for the curious.' },
  { t: 'out', v: 'Try "ls", "cat wanderlens" or "resume". "help" lists everything; Tab completes.' },
]

const findProject = (name) => projects.find((x) => x.id === name || x.name.toLowerCase() === name)

// what Tab can finish: a command, or the word after cat / open / goto
function complete(input) {
  const [cmd, ...rest] = input.split(' ')
  const options = !rest.length
    ? COMMANDS
    : cmd === 'cat'
      ? projects.map((p) => p.id)
      : cmd === 'open'
        ? [...Object.keys(SITES), ...projects.map((p) => p.id)]
        : cmd === 'goto'
          ? SECTIONS
          : []
  const word = (rest.length ? rest.join(' ') : cmd).toLowerCase()
  const hits = options.filter((o) => o.startsWith(word))
  if (!hits.length) return { hits }
  // like a real shell: fill in as much as all the matches share
  let shared = hits[0]
  for (const h of hits) while (!h.startsWith(shared)) shared = shared.slice(0, -1)
  const done = hits.length === 1 && !rest.length ? `${shared} ` : shared
  return { hits, value: rest.length ? `${cmd} ${done}` : done }
}

function run(raw, close) {
  const [cmd, ...args] = raw.trim().split(/\s+/)
  const arg = args.join(' ').toLowerCase()
  switch ((cmd || '').toLowerCase()) {
    case '':
      return []
    case 'help':
      return [
        'whoami             who is this',
        'now                what I am working on right now',
        'ls                 list main projects (ls -a adds the workbench)',
        'cat <project>      read about a project (e.g. cat safarnama)',
        'skills             what I work with, by comfort level',
        'resume             download my resume (PDF)',
        'contact            email, LinkedIn and socials',
        'email              copy my email address',
        'open <name>        github | linkedin | instagram | travel | x | <project>',
        'goto <section>     jump to a section (about, projects, trips...)',
        'route              the Valley of Flowers route',
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
    case 'now':
      return [profile.currently]
    case 'ls': {
      const main = projects.map((p) => `${p.id.padEnd(14)} ${p.status.padEnd(12)} ${p.tagline}`)
      if (arg !== '-a') return [...main, '', 'ls -a also lists the smaller workbench builds.']
      return [...main, '', '# workbench', ...workbench.map((w) => `${w.name.padEnd(28)} ${w.tech}`)]
    }
    case 'cat': {
      const p = findProject(arg)
      if (!p) return [`cat: ${arg || '(nothing)'}: no such project. Try "ls".`]
      return [
        `# ${p.name} (${p.status}, ${p.year})`,
        p.summary,
        '',
        `problem  → ${p.story.problem}`,
        `learned  → ${p.story.learned}`,
        `stack    → ${p.tech.join(', ')}`,
        ...(p.live ? [`live     → ${p.live}`] : []),
        ...(p.repo ? [`code     → ${p.repo}`] : []),
      ]
    }
    case 'skills':
      return skillGroups.flatMap((g) => [
        `# ${g.pouch}`,
        ...Object.entries(levels)
          .map(([id, l]) => [l.label, g.items.filter((i) => i.level === id).map((i) => i.name)])
          .filter(([, names]) => names.length)
          .map(([label, names]) => `  ${label.padEnd(12)} ${names.join(', ')}`),
      ])
    case 'resume': {
      if (!links.resume) return ['resume: not uploaded yet. Try "contact".']
      const a = document.createElement('a')
      a.href = links.resume
      a.download = ''
      a.click()
      return [`downloading ${links.resume.split('/').pop()}`]
    }
    case 'contact':
      return [
        `email     ${links.email}`,
        `linkedin  ${links.linkedin}`,
        `github    ${links.github}`,
        `instagram ${links.instagramHandle} (dev), ${links.travelInstagramHandle} (travel)`,
        '',
        'LinkedIn is the fastest way to reach me. "email" copies the address.',
      ]
    case 'email':
      navigator.clipboard?.writeText(links.email).catch(() => {})
      return [`${links.email} (copied to your clipboard)`]
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
      const p = findProject(arg)
      const url = SITES[arg] || p?.live || p?.repo
      if (!url) return [`open: try ${Object.keys(SITES).join(', ')} or a project name`]
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
    if (e.key === 'Tab') {
      e.preventDefault()
      const { value: done, hits } = complete(value)
      if (done) setValue(done)
      if (hits.length > 1) setLines((l) => [...l, { t: 'in', v: value }, { t: 'out', v: hits.join('  ') }])
    } else if (e.key === 'ArrowUp' && history.length) {
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
