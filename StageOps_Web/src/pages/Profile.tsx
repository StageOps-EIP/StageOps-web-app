import { usePageTitle } from '@/hooks/usePageTitle'
import { useNavigate } from 'react-router'
import { Button } from '@/components/design-system/Button'
import { Card, CardHeader } from '@/components/design-system/Card'
import { DemoNotice, PageHeader } from '@/components/design-system/PageHeader'
import { useAuth } from '@/contexts/auth.context'
import { Mail, Shield, LogOut, LogIn, Settings } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  rg: 'Régisseur général',
  lumiere: 'Régisseur lumière',
  son: 'Régisseur son',
  plateau: 'Régisseur plateau',
}

export function Profile() {
  usePageTitle('Profil')
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : 'Accès invité'
  const displayName = user?.email ?? 'Session de démonstration'
  const initials = user?.email.slice(0, 2).toUpperCase() ?? 'SO'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="page-shell space-y-5">
      <PageHeader
        context="Compte"
        title="Profil"
        description="Identité, rôle et accès à l’application."
      />
      {!user && (
        <DemoNotice>
          Vous utilisez StageOps sans compte dans l’environnement de démonstration.
        </DemoNotice>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[2px] bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand-violet-hover)]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-content-primary">{displayName}</h2>
              <p className="mt-1 text-sm text-content-muted">{roleLabel}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="border-l-2 border-theme-border py-1 pl-3">
                  <p className="flex items-center gap-2 text-xs text-content-subtle">
                    <Mail size={13} /> Adresse e-mail
                  </p>
                  <p className="mt-1.5 truncate text-sm text-content-primary">
                    {user?.email ?? 'Aucun compte connecté'}
                  </p>
                </div>
                <div className="border-l-2 border-theme-border py-1 pl-3">
                  <p className="flex items-center gap-2 text-xs text-content-subtle">
                    <Shield size={13} /> Niveau d’accès
                  </p>
                  <p className="mt-1.5 text-sm text-content-primary">{roleLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Accès" subtitle={user ? 'Compte connecté' : 'Démonstration locale'} />
          <div className="space-y-2">
            <Button variant="secondary" fullWidth onClick={() => navigate('/settings')}>
              <Settings size={16} /> Ouvrir les paramètres
            </Button>
            <Button variant={user ? 'danger' : 'primary'} fullWidth onClick={handleLogout}>
              {user ? <LogOut size={16} /> : <LogIn size={16} />}
              {user ? 'Se déconnecter' : 'Se connecter'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
