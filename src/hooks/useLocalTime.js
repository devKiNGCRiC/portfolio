import { useEffect, useState } from 'react'

/** Live time string for a given IANA timezone, updated every 30s. */
export function useLocalTime(timeZone) {
  const format = () =>
    new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(new Date())

  const [time, setTime] = useState(format)

  useEffect(() => {
    const id = setInterval(() => setTime(format()), 30_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone])

  return time
}
