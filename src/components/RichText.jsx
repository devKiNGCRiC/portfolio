/**
 * Tiny formatter for text edited in /admin:
 *   **bold**  →  <b>bold</b>
 *   ==mark==  →  <mark>mark</mark>
 */
export default function RichText({ text = '' }) {
  return text.split(/(\*\*[^*]+\*\*|==[^=]+==)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>
    if (part.startsWith('==') && part.endsWith('==')) return <mark key={i}>{part.slice(2, -2)}</mark>
    return part
  })
}
