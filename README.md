# Raj Roy (KiNG) · Portfolio

Building apps between trips: a road trip through India with a 3D clay guide. React + Vite + three.js (React Three Fiber), no UI kit.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run lint
```

## Editing content: the admin panel

Everything on the site (text, projects, skills, timeline, trips, photos, KiNG's speech bubbles, map pins, links, resume) is editable from **`/admin`**, a form-based editor powered by [Sveltia CMS](https://github.com/sveltia/sveltia-cms). No code needed. Every save is a Git commit, so nothing is ever lost and any change can be undone.

### On your computer (works today, no setup)

1. `npm run dev`
2. Open **http://localhost:5173/admin/** in Chrome or Edge.
3. Click **Work with Local Repository** and pick this project folder.
4. Edit, then **Save**. The files in `src/content/` update and the dev site reloads.
5. Commit and push as usual when you're happy.

### On the live site (after deploying)

1. Push this project to GitHub as **`devKiNGCRiC/portfolio`**. If you use another repo name, change `repo:` at the top of `public/admin/config.yml`.
2. Deploy it on **Vercel** or **Netlify** (import the repo; build command `npm run build`, output folder `dist`). Every push will redeploy automatically.
3. Visit **https://your-site/admin/** → **Sign In Using Access Token**. The dialog links to GitHub to create a token (it needs *Contents: read and write* on this repo). The token stays in your browser only.
4. Edit and **Save**. The CMS commits to GitHub, and the site redeploys in about a minute. Works from your phone too.

> "Sign In with GitHub" (the OAuth button) needs an extra auth service to be set up. The access-token option above does the same job without it.

### Where the content lives

| Admin section | File |
| --- | --- |
| Site & About me (profile, links, resume, hero, ticker, about, headings, contact, open-source checklist) | `src/content/site.json` |
| Projects (main projects + workbench) | `src/content/projects.json` |
| Skills (suitcases) | `src/content/skills.json` |
| Journey (passport stamps + education) | `src/content/journey.json` |
| Trips & photos (postcard trail, trip → product, photo wall) | `src/content/travel.json` |
| Guide & map (KiNG's stops, poses, speech; India map pins) | `src/content/guide.json`, `src/content/map.json` |

Uploaded photos go to `public/photos/`, uploaded files (resume) to `public/files/`. In text fields, `**bold**` makes bold text and `==text==` adds the yellow highlight.

You can still edit the JSON files by hand if you prefer; `src/data/*.js` just reads them.

## Still to add

- **Email & LinkedIn:** Admin → Site & About me → Links. Rows show "coming soon" until filled.
- **Resume:** Admin → Links → Resume (upload a PDF), or drop it at `public/resume.pdf`.
- **Portrait:** Admin → About me → Portrait.
- **Travel photos:** Admin → Trips & photos → Photo wall (the polaroids show illustrations until then). Export at ~1200px wide, WebP or JPG, under ~200 KB each.
- **Project screenshots (optional):** Admin → Projects → Screenshot, to replace the generated art.
- **Domain:** replace `https://your-domain.example/` in `index.html` (canonical, Open Graph, JSON-LD) and add `public/og-image.png` (1200×630).
- **Double-check WanderLink's** status and tech stack in Admin → Projects.

## How the pieces work

- **3D cast** (`src/three/`, built from three.js primitives, no model files):
  - `HeroScene.jsx`: clay map of India (simplified outline, not to scale) with pins that jump to sections, the Arunachal → Chennai flight arc, the Valley of Flowers trek, and clay-KiNG waving beside the auto-rickshaw.
  - `Avatar.jsx`: clay-KiNG. Poses: idle, wave, type, camera, suitcase, passport, cheer, drive.
  - `Rickshaw.jsx`: the auto-rickshaw. `CompanionScene.jsx`: the corner guide's little road.
  - three.js is a lazy chunk shared by both scenes, so the page is usable before it arrives. Scenes pause when off-screen; if WebGL isn't available the map pins show as plain buttons.
- **The guide** (`src/components/Companion.jsx`): appears after the hero, changes pose and speech per section, and "Next stop" drives you to the next one. Click KiNG or the rickshaw for a honk. Edit the lines and poses in `src/data/stops.js`.
- **Road dock** (`src/components/Nav.jsx`): the bottom nav is a road; a rickshaw drives to the current stop.
- **Map pins**: `src/data/map.js`. Labels are real DOM buttons positioned by the 3D scene, so they stay keyboard-accessible.
- Each section is a travel object: boarding pass (About), bento cards with a passport-stamp award (Projects), suitcases (Skills), passport stamps + visas (Journey), an airport departures board (GitHub, live), a scroll-pinned postcard trail + draggable polaroid wall (Trips), and a postcard (Contact).
- `src/hooks/useGithub.js`: public GitHub API (profile + recent non-fork repos), cached in `sessionStorage` for 30 minutes.
- `src/components/Terminal.jsx`: press <kbd>/</kbd> anywhere, or use the terminal button in the top bar.
- **Colours** (`src/styles/tokens.css`): India (saffron, white, green), travel (sky, coral, yellow), tech (navy + neon cyan); chunky outlines + hard shadows.
