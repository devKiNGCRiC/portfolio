/* Shared colours + pointer helpers for every 3D piece on the site. */

export const C = {
  saffron: '#ff9933',
  green: '#1f9e4a',
  greenBright: '#2dbe4f',
  greenDark: '#157a36',
  white: '#ffffff',
  navy: '#1b2b8f',
  navyDeep: '#0b1a6e',
  cyan: '#00e5ff',
  yellow: '#ffc400',
  red: '#e53935',
  coral: '#ff6f61',
  sky: '#bfe6ff',
  water: '#4fb3f6',
  sand: '#e9a866',
  clay: '#c77b4a',
  ink: '#1b1b1f',
  skin: '#c68642',
  hair: '#1b1b1f',
  denim: '#2a3f99',
  slate: '#8a97ad',
}

export const hoverCursor = {
  onPointerOver: (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  },
  onPointerOut: () => {
    document.body.style.cursor = ''
  },
}
