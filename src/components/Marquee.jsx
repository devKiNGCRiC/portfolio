/** Infinite ticker. Items are rendered twice so the loop is seamless. */
export default function Marquee({ items }) {
  const row = items.map((t, i) => (
    <span key={i}>
      {t}
      <i aria-hidden="true">✦</i>
    </span>
  ))
  return (
    <div className="marquee" role="marquee" aria-label={items.join(', ')}>
      <div className="marquee__track" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  )
}
