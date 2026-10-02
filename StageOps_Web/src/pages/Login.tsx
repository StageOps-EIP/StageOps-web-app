import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { StageOpsLogo } from '@/components/brand/StageOpsLogo'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { useAuth } from '@/contexts/auth.context'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Connexion impossible. Vérifiez vos informations.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      id="main-content"
      className="auth-surface grid min-h-dvh bg-theme-void text-content-primary lg:grid-cols-[22rem_minmax(32rem,1fr)]"
    >
      <section className="flex flex-col border-b border-theme-border bg-theme-deeper p-6 lg:border-b-0 lg:border-r lg:p-8">
        <StageOpsLogo inverse />
        <div className="my-auto py-10">
          <p className="text-[11px] font-semibold text-[var(--brand-violet-hover)]">
            Poste de travail
          </p>
          <h1 className="font-editorial mt-2 text-4xl font-medium leading-none text-content-primary">
            Régie générale
          </h1>
          <div className="mt-8 border-y border-theme-border">
            <div className="border-b border-theme-border py-3">
              <p className="text-[10px] text-content-subtle">Production active</p>
              <p className="font-editorial mt-1 text-xl font-medium text-content-primary">
                Hamlet — Représentation
              </p>
            </div>
            <div className="grid grid-cols-[5rem_1fr] gap-2 border-b border-theme-border py-3 text-xs">
              <span className="text-content-subtle">Lieu</span>
              <span className="text-right text-content-primary">Théâtre National</span>
            </div>
            <div className="grid grid-cols-[5rem_1fr] gap-2 border-b border-theme-border py-3 text-xs">
              <span className="text-content-subtle">Plateau</span>
              <span className="text-right text-content-primary">Grande Salle</span>
            </div>
            <div className="grid grid-cols-[5rem_1fr] gap-2 py-3 text-xs">
              <span className="text-content-subtle">Scénario</span>
              <span className="text-right text-content-primary">11 février 2026</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-content-subtle">StageOps · Projet EIP</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 lg:justify-start lg:px-20">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <p className="text-[11px] text-content-subtle">Identification</p>
            <h2 className="font-editorial mt-1 text-3xl font-medium text-content-primary">
              Ouvrir une session
            </h2>
            <p className="mt-2 text-xs text-content-muted">
              Connectez-vous ou utilisez l’espace local hors-ligne sur cet appareil.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="email"
              label="Adresse e-mail"
              placeholder="prenom@organisation.fr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Mot de passe"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute bottom-2.5 right-3 rounded p-1 text-content-subtle hover:text-content-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <p
                role="alert"
                className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </p>
            )}
            <Button type="submit" size="lg" fullWidth disabled={isLoading}>
              {isLoading ? 'Connexion en cours…' : <>Se connecter</>}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-content-faint">
            <span className="h-px flex-1 bg-theme-border" /> ou{' '}
            <span className="h-px flex-1 bg-theme-border" />
          </div>

          <Link
            to="/"
            className="flex w-full items-center justify-between border border-theme-border bg-theme-base px-4 py-3 text-sm font-semibold text-content-primary transition-colors hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]"
          >
            Continuer dans l’espace local <span aria-hidden="true">→</span>
          </Link>
          <p className="mt-6 text-center text-sm text-content-subtle">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-[var(--brand-violet-hover)]">
              Créer un compte
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
