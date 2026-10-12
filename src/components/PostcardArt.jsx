/*
  Tiny illustrated scenes for postcards and polaroids.
  Pick one per place with `scene` in /admin (city, river, temple, village, trail,
  flowers, lake, hills, sea); otherwise it is chosen by the place name.
*/

const s = { stroke: '#17171a', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }

const scenes = {
  hills: (
    <>
      <rect x="0" y="0" width="300" height="180" fill="#cdf4d9" />
      <path d="M0 100 C 60 60, 110 60, 150 95 S 240 55, 300 85 V180 H0Z" fill="#37c26a" {...s} />
      <path d="M0 135 C 70 110, 150 130, 200 115 S 270 110, 300 120 V180 H0Z" fill="#5fd07f" {...s} />
      <path d="M40 180 C 90 160, 150 170, 220 150" fill="none" stroke="#5bb6ff" strokeWidth="10" strokeLinecap="round" />
      <circle cx="230" cy="40" r="18" fill="#ffcb2b" {...s} />
    </>
  ),
  sea: (
    <>
      <rect x="0" y="0" width="300" height="180" fill="#ffd9c7" />
      <circle cx="150" cy="100" r="34" fill="#ffcb2b" {...s} />
      <rect x="0" y="100" width="300" height="80" fill="#5bb6ff" {...s} />
      <path d="M30 130 q15 -8 30 0 t30 0 M170 150 q15 -8 30 0 t30 0 M100 162 q15 -8 30 0" fill="none" {...s} />
    </>
  ),
  city: (
    <>
      <rect x="0" y="0" width="300" height="180" fill="#ffd9c7" />
      <circle cx="230" cy="55" r="26" fill="#ffcb2b" {...s} />
      <path d="M20 180 V110 h40 v70 M70 180 V80 h50 v100 M130 180 V120 h35 v60 M175 180 V95 h45 v85 M230 180 V125 h50 v55" fill="#fff" {...s} />
    </>
  ),
  river: (
    <>
      <rect x="0" y="0" width="300" height="180" fill="#bfe3ff" />
      <path d="M0 110 L70 50 L130 100 L200 40 L300 105 V180 H0Z" fill="#5fd07f" {...s} />
      <path d="M120 180 C 140 150, 170 140, 160 115 S 190 95, 205 90" fill="none" stroke="#5bb6ff" strokeWidth="18" strokeLinecap="round" />
      <path d="M40 150 H260" stroke="#17171a" strokeWidth="3" strokeDasharray="4 8" />
    </>
  ),
  temple: (
    <>
      <rect x="0" y="0" width="300" height="180" fill="#bfe3ff" />
      <path d="M0 130 L80 40 L150 110 L230 30 L300 120 V180 H0Z" fill="#8a97ad" {...s} />
      <path d="M60 60 L80 40 L100 62 Z M210 52 L230 30 L252 55Z" fill="#fff" {...s} />
      <path d="M120 180 V120 h60 v60 M130 120 L150 85 L170 120" fill="#ff4032" {...s} />
    </>
  ),
  village: (
    <>
      <rect x="0" y="0" width="300" height="180" fill="#fff0b8" />
      <path d="M0 120 L90 30 L170 100 L240 50 L300 100 V180 H0Z" fill="#8a97ad" {...s} />
      <path d="M40 180 V135 L65 115 L90 135 V180 M150 180 V140 L175 120 L200 140 V180" fill="#b8744f" {...s} />
      <path d="M220 180 V145 L245 125 L270 145 V180" fill="#fff" {...s} />
    </>
  ),
  trail: (
    <>
      <rect x="0" y="0" width="300" height="180" fill="#cdf4d9" />
      <path d="M0 90 L60 40 L120 85 L190 25 L300 95 V180 H0Z" fill="#5fd07f" {...s} />
      <path d="M40 180 C 90 150, 180 160, 150 120 S 170 70, 190 40" fill="none" stroke="#ff4032" strokeWidth="5" strokeDasharray="2 12" strokeLinecap="round" />
      <path d="M230 180 v-30 l-15 12 m15-12 l15 12 M60 180 v-24 l-12 10 m12-10 l12 10" fill="none" {...s} />
    </>
  ),
  flowers: (
    <>
      <rect x="0" y="0" width="300" height="180" fill="#ffe1ee" />
      <path d="M0 80 L80 20 L160 70 L230 15 L300 70 V180 H0Z" fill="#8a97ad" {...s} />
      <path d="M0 115 C 80 95, 200 125, 300 105 V180 H0Z" fill="#5fd07f" {...s} />
      {[
        [40, 140, '#ff4032'],
        [90, 155, '#ffcb2b'],
        [140, 135, '#b26bff'],
        [190, 158, '#ff4032'],
        [240, 140, '#ffcb2b'],
        [270, 162, '#b26bff'],
      ].map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill={c} {...s} strokeWidth="2.5" />
      ))}
    </>
  ),
  lake: (
    <>
      <rect x="0" y="0" width="300" height="180" fill="#bfe3ff" />
      <path d="M0 110 L70 30 L140 90 L220 20 L300 100 V180 H0Z" fill="#8a97ad" {...s} />
      <path d="M55 48 L70 30 L86 50Z M204 38 L220 20 L238 40Z" fill="#fff" {...s} />
      <ellipse cx="150" cy="150" rx="110" ry="22" fill="#5bb6ff" {...s} />
    </>
  ),
}

const kinds = {
  Delhi: 'city',
  Rishikesh: 'river',
  Badrinath: 'temple',
  'Mana Village': 'village',
  Govindghat: 'trail',
  Ghanghariya: 'trail',
  'Valley of Flowers': 'flowers',
  'Hemkund Sahib': 'lake',
  'Arunachal Pradesh': 'hills',
  'Northeast India': 'river',
  Kodaikanal: 'lake',
  Kanyakumari: 'sea',
}

export default function PostcardArt({ name, scene, square = false }) {
  return (
    <svg viewBox={square ? '60 0 180 180' : '0 0 300 180'} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {scenes[scene] ?? scenes[kinds[name]] ?? scenes.trail}
    </svg>
  )
}
