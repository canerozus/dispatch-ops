import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProviders } from './app/providers'
import { worker } from './mocks/browser'

// Enable mocking
async function enableMocking() {
    if (process.env.NODE_ENV === 'development') {
        return worker.start()
    }
}

enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <AppProviders />
        </StrictMode>,
    )
})
