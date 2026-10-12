import Magnetic from '../components/Magnetic'
import Icon from '../components/Icon'
import { useReveal } from '../hooks/useReveal'
import { useTilt } from '../hooks/useTilt'
import RichText from '../components/RichText'
import { links, profile, site } from '../data/profile'
import './Contact.css'

const rows = [
  { key: 'email', label: 'Email', icon: 'mail', href: links.email && `mailto:${links.email}`, value: links.email },
  { key: 'github', label: 'GitHub', icon: 'github', href: links.github, value: `@${links.githubUser}` },
  { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin', href: links.linkedin, value: links.linkedin && 'Connect' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram', href: links.instagram, value: links.instagramHandle },
]

export default function Contact() {
  const reveal = useReveal()
  const tilt = useTilt(4)
  const primary = links.email ? `mailto:${links.email}` : links.github

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap">
        <div ref={reveal} className="reveal">
          <article
            onPointerMove={tilt.onPointerMove}
            onPointerLeave={tilt.onPointerLeave}
            className="card-post"
          >
            <div className="card-post__message">
              <p className="card-post__now sticker">
                <span className="card-post__dot" aria-hidden="true" />
                Currently: {profile.currently}
              </p>
              <h2 id="contact-title" className="display">
                {site.contact.title}
              </h2>
              <p className="card-post__text">
                <RichText text={site.contact.text} />
              </p>
              <p className="card-post__sign hand">{profile.nickname}</p>
              <div className="card-post__cta">
                <Magnetic>
                  <a
                    className="btn btn--red"
                    href={primary}
                    target={links.email ? undefined : '_blank'}
                    rel="noreferrer"
                  >
                    {links.email ? 'Say hello' : 'Say hello on GitHub'}
                  </a>
                </Magnetic>
                <a className="btn btn--saffron" href={links.resume} download>
                  <Icon name="download" size={18} />
                  Download resume
                </a>
              </div>
            </div>

            <div className="card-post__address">
              <div className="card-post__stamps" aria-hidden="true">
                <span className="card-post__postmark">
                  CHENNAI
                  <br />
                  2026
                </span>
                <span className="card-post__stamp">
                  <svg viewBox="0 0 60 60">
                    <path d="M6 50 L22 24 L32 36 L42 16 L56 50 Z" fill="#fff" stroke="#17171a" strokeWidth="3" strokeLinejoin="round" />
                    <circle cx="46" cy="12" r="5" fill="#ffcb2b" stroke="#17171a" strokeWidth="2.5" />
                  </svg>
                </span>
              </div>

              <p className="card-post__to hand">To: {profile.name}, wherever the trail is</p>
              <ul className="card-post__lines">
                {rows.map((r) => (
                  <li key={r.key}>
                    {r.href ? (
                      <a href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                        <Icon name={r.icon} size={20} />
                        <span className="card-post__label">{r.label}</span>
                        <span className="card-post__value">{r.value}</span>
                      </a>
                    ) : (
                      <span className="is-soon">
                        <Icon name={r.icon} size={20} />
                        <span className="card-post__label">{r.label}</span>
                        <span className="card-post__value">coming soon</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
