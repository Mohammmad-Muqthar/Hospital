import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/sora/wght.css'
import '@fontsource-variable/dm-sans/wght.css'
import './styles/variables.css'
import './styles/typography.css'
import './styles/globals.css'

import App from './App.jsx'
import { prepareScrollRestore } from './hooks/useScrollTriggerSetup'

// Hide the page until a reload restores the reader's position (no hero flash).
prepareScrollRestore()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
