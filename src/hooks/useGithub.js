import { useEffect, useState } from 'react'

const CACHE_KEY = 'kc-gh-cache-v1'
const TTL = 1000 * 60 * 30 // 30 min, keeps us well under the unauthenticated rate limit

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Date.now() - parsed.at < TTL ? parsed.data : null
  } catch {
    return null
  }
}

/** Public GitHub data only: profile + most recently pushed, non-fork repos. */
export function useGithub(user) {
  const [state, setState] = useState(() => {
    const cached = readCache()
    return cached ? { status: 'ready', ...cached } : { status: 'loading' }
  })

  useEffect(() => {
    if (state.status === 'ready') return
    const ctrl = new AbortController()
    const opts = { signal: ctrl.signal, headers: { Accept: 'application/vnd.github+json' } }

    Promise.all([
      fetch(`https://api.github.com/users/${user}`, opts).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=30`, opts).then((r) =>
        r.ok ? r.json() : Promise.reject(r.status),
      ),
    ])
      .then(([profile, repos]) => {
        const data = {
          profile: {
            avatar: profile.avatar_url,
            name: profile.name,
            bio: profile.bio,
            publicRepos: profile.public_repos,
            url: profile.html_url,
          },
          repos: repos
            .filter((r) => !r.fork && !r.private)
            .slice(0, 6)
            .map((r) => ({
              id: r.id,
              name: r.name,
              description: r.description,
              language: r.language,
              stars: r.stargazers_count,
              url: r.html_url,
              pushed: r.pushed_at,
            })),
        }
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
        } catch {
          /* storage unavailable, fine */
        }
        setState({ status: 'ready', ...data })
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') setState({ status: 'error' })
      })

    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return state
}
