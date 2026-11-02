import { links, profile } from '../data/profile'
import { valleyRoute } from '../data/travel'

const fmt = new Intl.NumberFormat('en-IN')
const summit = valleyRoute.at(-1)

/** The end of the page is the end of the trek: a peak with KiNG's flag on top. */
function Summit() {
  return (
    <div className="summit">
      <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path className="summit__far" d="M0 260 L0 190 L140 120 L230 165 L330 95 L420 150 L470 130 L520 160 V260 Z M700 260 V170 L780 120 L870 160 L980 90 L1080 150 L1200 110 V260 Z" />
        <path className="summit__peak" d="M250 260 L470 110 L540 70 L600 26 L660 66 L730 104 L960 260 Z" />
        <path className="summit__snow" d="M540 70 L600 26 L660 66 L636 60 L618 76 L598 62 L578 78 L560 64 Z" />
        <path className="summit__pole" d="M600 26 V-34" />
        <path className="summit__flag" d="M600 -34 H662 L648 -20 L662 -6 H600 Z" />
      </svg>
      {summit && (
        <p className="summit__note hand">
          {summit.name}, {fmt.format(summit.alt)} m. You made it to the top!
        </p>
      )}
    </div>
  )
}

export default function Footer() {
  const items = [
    ['GitHub', links.github],
    ['Instagram', links.instagram],
    ['LinkedIn', links.linkedin],
    ['X', links.x],
    ['Email', links.email && `mailto:${links.email}`],
  ].filter(([, href]) => href)

  return (
    <>
      <Summit />
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
    </>
  )
}
