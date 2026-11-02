import { useEffect, useState } from 'react'

/**
 * Returns the id of the section crossing the middle of the viewport. At the very
 * bottom of the page (where the footer fills the middle) it's the last section.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join(',')

  useEffect(() => {
    const els = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    const last = els.at(-1)?.id
    const onScroll = () => {
      const root = document.documentElement
      if (last && innerHeight + scrollY >= root.scrollHeight - 4) setActive(last)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [key])

  return active
}
