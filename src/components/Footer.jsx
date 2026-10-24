import { links, profile } from '../data/profile'

export default function Footer() {
  const items = [
    ['GitHub', links.github],
    ['Instagram', links.instagram],
    ['LinkedIn', links.linkedin],
    ['X', links.x],
    ['Email', links.email && `mailto:${links.email}`],
  ].filter(([, href]) => href)

  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <p className="footer__brand display" aria-hidden="true">
          {profile.nickname}
        </p>
        <p className="footer__line">Building with code. Exploring with curiosity.</p>
        <nav className="footer__links" aria-label="Social">
          {items.map(([label, href]) => (
            <a
              key={label}
              className="btn btn--sm"
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
            >
              {label}
            </a>
          ))}
        </nav>
        <p className="footer__small">
          © 2026 {profile.name}. Press <kbd>/</kbd> for a secret terminal.
        </p>
      </div>
    </footer>
  )
}
