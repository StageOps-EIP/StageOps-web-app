import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
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
      className="auth-surface grid min-h-dvh bg-theme-void text-content-primary lg:grid-cols-[minmax(22rem,.8fr)_minmax(32rem,1.2fr)]"
    >
      <section className="flex flex-col border-b border-theme-border bg-theme-deeper p-6 lg:border-b-0 lg:border-r lg:p-10 xl:p-14">
        <StageOpsLogo inverse />
        <div className="my-auto max-w-lg py-12 lg:py-16">
          <p className="page-kicker mb-3">Gestion technique du spectacle</p>
          <h1 className="text-3xl font-semibold leading-tight text-content-primary sm:text-4xl">
            Les opérations de régie réunies dans un même espace de travail.
          </h1>
          <p className="mt-5 text-base leading-7 text-content-muted">
            Suivez les productions, le parc matériel, les incidents, l’équipe et le plateau 3D sans
            perdre le contexte du spectacle.
          </p>
        </div>
        <p className="text-xs text-content-subtle">StageOps · Projet EIP</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-content-primary">Connexion</h2>
            <p className="mt-2 text-sm text-content-muted">Accédez à votre espace StageOps.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="email"
              label="Adresse e-mail"
              placeholder="prenom@organisation.fr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              icon={<Mail size={16} />}
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
                  icon={<Lock size={16} />}
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
                className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </p>
            )}
            <Button type="submit" size="lg" fullWidth disabled={isLoading}>
              {isLoading ? (
                'Connexion en cours…'
              ) : (
                <>
                  Se connecter <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-content-faint">
            <span className="h-px flex-1 bg-theme-border" /> ou{' '}
            <span className="h-px flex-1 bg-theme-border" />
          </div>

          <Link
            to="/"
            className="flex w-full items-center justify-between rounded-md border border-theme-border bg-theme-base px-4 py-3 text-sm font-semibold text-content-primary transition-colors hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]"
          >
            Ouvrir la démonstration sans compte <ArrowRight size={16} />
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
