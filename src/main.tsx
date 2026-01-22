// Layer: App Composition. Responsibility: App bootstrap. Business logic: NO.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProviders } from './app/providers'
import { worker } from './mocks/browser'

// Enable mocking
async function enableMocking() {
    if (import.meta.env.DEV) {
        return worker.start()
    }
}

enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <AppProviders/>
        </StrictMode>,
    )
})
