export default function StatusTag({ status }) {
  const slug = status.toLowerCase().replace(/\s+/g, '-')
  return (
    <span className={`status status--${slug}`}>
      <span className="sr-only">Status: </span>
      {status}
    </span>
  )
}
