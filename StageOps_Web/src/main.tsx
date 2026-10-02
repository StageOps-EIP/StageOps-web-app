import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'
import { ThemeProvider } from './lib/theme.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { DemoDataProvider } from './contexts/DemoDataProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <DemoDataProvider>
          <App />
        </DemoDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>,
)
