import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app/App'
import { reportEnvStatus } from '@/lib/env'
import '@/styles/globals.css'

reportEnvStatus()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
