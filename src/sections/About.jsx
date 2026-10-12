import SectionHead from '../components/SectionHead'
import Icon from '../components/Icon'
import { useReveal } from '../hooks/useReveal'
import { useTilt } from '../hooks/useTilt'
import RichText from '../components/RichText'
import { profile, site } from '../data/profile'
import './About.css'

const about = site.about
// portrait: upload one from /admin (About me → Portrait)
const PORTRAIT = about.portrait || null
const fields = [['Passenger', profile.name], ...(about.pass ?? []).map((f) => [f.label, f.value])]

export default function About() {
  const tilt = useTilt(5)
  const storyRef = useReveal()
  const passRef = useReveal()

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead
          id="about-title"
          title={site.sections.about.title}
          note={site.sections.about.note}
          intro={site.sections.about.intro}
        />

        <div className="about__grid">
          <div ref={passRef} className="reveal">
            <article
              onPointerMove={tilt.onPointerMove}
              onPointerLeave={tilt.onPointerLeave}
              className="pass"
              aria-label="Boarding pass: from Arunachal Pradesh to Chennai"
            >
              <div className="pass__main">
                <div className="pass__head">
                  <span className="pass__airline display">{profile.nickname} AIR</span>
                  <span className="pass__type">Boarding pass</span>
                </div>

                <div className="pass__route">
                  <div>
                    <p className="pass__code display">HGI</p>
                    <p className="pass__city">Arunachal Pradesh</p>
                    <p className="pass__sub">where I grew up</p>
                  </div>
                  <div className="pass__plane" aria-hidden="true">
                    <span />
                    <Icon name="plane" size={26} />
                    <span />
                  </div>
                  <div className="pass__to">
                    <p className="pass__code display">MAA</p>
                    <p className="pass__city">Chennai</p>
                    <p className="pass__sub">doing my MCA</p>
                  </div>
                </div>

                <dl className="pass__fields">
                  {fields.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="pass__stub">
                <div className="pass__photo">
                  {PORTRAIT ? (
                    <img src={PORTRAIT} alt={`Portrait of ${profile.name}`} width="240" height="300" loading="lazy" />
                  ) : (
                    <span className="hand">your
                      <br />
                      photo here</span>
                  )}
                </div>
                <p className="pass__gate">
                  <span>Gate</span>
                  <b className="display">SRM</b>
                </p>
                <span className="pass__barcode" aria-hidden="true" />
              </div>
            </article>
          </div>

          <div ref={storyRef} className="story reveal">
            <p className="story__lead">
              <RichText text={about.lead} />
            </p>
            {about.paragraphs.map((para, i) => (
              <p key={i}>
                <RichText text={para} />
              </p>
            ))}
            {about.signoff && <p className="story__sign hand">{about.signoff}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
