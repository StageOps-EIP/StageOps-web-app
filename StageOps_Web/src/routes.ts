import { createBrowserRouter } from 'react-router';
import { DesktopLayout } from './components/layout/DesktopLayout';
import { Dashboard } from './pages/Dashboard';
import { Equipment } from './pages/Equipment';
import { Events } from './pages/Events';
import { Incidents } from './pages/Incidents';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Register } from './pages/Register';
import { SceneEditor } from './pages/SceneEditor';
import { Settings } from './pages/Settings';
import { StageView } from './pages/StageView';
import { Team } from './pages/Team';

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  { path: '/register', Component: Register },
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
  { path: '/editor', Component: SceneEditor },
]);
