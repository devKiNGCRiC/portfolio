import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import '@fontsource/kalam/400.css'
import '@fontsource/kalam/700.css'
import '@fontsource-variable/geist-mono'
import '@fontsource/special-elite'
import '@fontsource/mrs-saint-delafield'
import '@fontsource-variable/pixelify-sans'
import '@fontsource/anton'
import '@fontsource-variable/fraunces/wght.css'
import '@fontsource-variable/fraunces/wght-italic.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
