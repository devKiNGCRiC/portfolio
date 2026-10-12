import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
  The dev server's SPA fallback would answer /admin/ with the portfolio's own
  index.html. Point /admin and /admin/ at the CMS page instead.
*/
function adminRoute() {
  const rewrite = (req, _res, next) => {
    const [path, query = ''] = req.url.split('?')
    if (path === '/admin' || path === '/admin/') req.url = `/admin/index.html${query ? `?${query}` : ''}`
    next()
  }
  return {
    name: 'admin-route',
    // block bodies on purpose: returning a function here would make Vite run it as a post-hook
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

export default defineConfig({
  plugins: [adminRoute(), react()],
})
