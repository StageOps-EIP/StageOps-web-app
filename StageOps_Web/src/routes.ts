import { createBrowserRouter } from 'react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SceneEditor } from './pages/SceneEditor';
import { Dashboard } from './pages/Dashboard';
import { StageView } from './pages/StageView';
import { Equipment } from './pages/Equipment';
import { Events } from './pages/Events';
import { Incidents } from './pages/Incidents';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { DesktopLayout } from './components/layout/DesktopLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: '/',
        Component: DesktopLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'stage', Component: StageView },
          { path: 'equipment', Component: Equipment },
          { path: 'events', Component: Events },
          { path: 'incidents', Component: Incidents },
          { path: 'team', Component: Team },
          { path: 'settings', Component: Settings },
          { path: 'profile', Component: Profile },
        ],
      },
      {
        path: '/editor',
        Component: SceneEditor,
      },
    ],
  },
]);
