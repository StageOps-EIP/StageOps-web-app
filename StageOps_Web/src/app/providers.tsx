import type { ReactNode } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { AuthProvider } from '../contexts/AuthContext'
import { OperationalDataProvider } from '../contexts/OperationalDataProvider'
import { ThemeProvider } from '../lib/theme'
import { createLocalWorkspaceRepository } from '../infrastructure/workspace/local-workspace.repository'
import { createWorkspaceSeed } from '../infrastructure/workspace/workspace-seed'

// Stable composition root: browser adapters are selected here, never in the domain.
const workspaceRepository = createLocalWorkspaceRepository(
  () => window.localStorage,
  createWorkspaceSeed,
)

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <OperationalDataProvider repository={workspaceRepository}>
            {children}
          </OperationalDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
