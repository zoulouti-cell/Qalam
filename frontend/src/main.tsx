import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { persister, queryClient } from './lib/queryClient'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js') })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        buster: 'qalam-v1',
        // never keep streaming/AI or one-off queries; everything else is readable offline
        dehydrateOptions: { shouldDehydrateQuery: (q) => q.state.status === 'success' },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </StrictMode>,
)
