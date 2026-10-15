import { createBrowserRouter } from 'react-router'
import { DesktopLayout } from '../components/layout/DesktopLayout'
import { RouteError, RouteLoading } from './RouteFeedback'

export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: async () => ({ Component: (await import('../pages/Login')).Login }),
    ErrorBoundary: RouteError,
    HydrateFallback: RouteLoading,
  },
  {
    path: '/register',
    lazy: async () => ({ Component: (await import('../pages/Register')).Register }),
    ErrorBoundary: RouteError,
    HydrateFallback: RouteLoading,
  },
  {
    path: '/',
    Component: DesktopLayout,
    ErrorBoundary: RouteError,
    HydrateFallback: RouteLoading,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('../pages/Dashboard')).Dashboard }),
      },
      {
        path: 'stage',
        lazy: async () => ({ Component: (await import('../pages/StageView')).StageView }),
      },
      {
        path: 'equipment',
        lazy: async () => ({ Component: (await import('../pages/Equipment')).Equipment }),
      },
      {
        path: 'events',
        lazy: async () => ({ Component: (await import('../pages/Events')).Events }),
      },
      {
        path: 'incidents',
        lazy: async () => ({ Component: (await import('../pages/Incidents')).Incidents }),
      },
      { path: 'team', lazy: async () => ({ Component: (await import('../pages/Team')).Team }) },
      {
        path: 'settings',
        lazy: async () => ({ Component: (await import('../pages/Settings')).Settings }),
      },
      {
        path: 'profile',
        lazy: async () => ({ Component: (await import('../pages/Profile')).Profile }),
      },
    ],
  },
  {
    path: '/editor',
    lazy: async () => ({ Component: (await import('../pages/SceneEditor')).SceneEditor }),
    ErrorBoundary: RouteError,
    HydrateFallback: RouteLoading,
  },
])
