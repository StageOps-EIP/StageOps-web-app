import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { StageOpsLogo } from '@/components/brand/StageOpsLogo'
import { useAuth } from '@/contexts/auth.context'
import {
  emptyRegistrationForm, validateRegistration, type RegistrationForm,
} from '@/lib/registration-validation'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState(emptyRegistrationForm)
  const [errors, setErrors] = useState<Partial<RegistrationForm & { general: string }>>({})
  const [isLoading, setIsLoading] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const generalErrorRef = useRef<HTMLParagraphElement>(null)

  function set(key: keyof RegistrationForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined, general: undefined }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const next = validateRegistration(form)
    setErrors(next)
    if (next.email) emailRef.current?.focus()
    else if (next.password) passwordRef.current?.focus()
    else if (next.confirmPassword) confirmPasswordRef.current?.focus()
    if (Object.keys(next).length > 0) return

    setIsLoading(true)
    try {
      await register(form.email, form.password)
      navigate('/')
    } catch (error) {
      setErrors((current) => ({
        ...current,
        general: error instanceof Error ? error.message : 'Création du compte impossible.',
      }))
      requestAnimationFrame(() => generalErrorRef.current?.focus())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main id="main-content" className="auth-surface min-h-dvh bg-theme-void px-4 py-6 text-content-primary sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-6 text-center sm:mb-8">
          <StageOpsLogo className="mb-5" />
          <h1 className="mb-2 text-3xl font-semibold text-content-primary">Créer un compte</h1>
          <p className="text-sm text-content-muted">
            Créez vos accès avec une adresse e-mail et un mot de passe.
          </p>
        </header>

        <div className="panel p-5 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <p className="text-sm text-content-muted">Tous les champs sont obligatoires.</p>
            <Input ref={emailRef} label="Adresse e-mail" type="email" required autoComplete="email"
              value={form.email} onChange={(event) => set('email', event.target.value)} error={errors.email} />
            <div>
              <Input ref={passwordRef} label="Mot de passe" type="password" required autoComplete="new-password"
                aria-describedby="register-password-rules" value={form.password}
                onChange={(event) => set('password', event.target.value)} error={errors.password} />
              <p id="register-password-rules" className="mt-1.5 text-sm text-content-muted">
                8 caractères minimum, dont une majuscule, un chiffre et un caractère spécial.
              </p>
            </div>
            <Input ref={confirmPasswordRef} label="Confirmer le mot de passe" type="password" required autoComplete="new-password"
              value={form.confirmPassword} onChange={(event) => set('confirmPassword', event.target.value)}
              error={errors.confirmPassword} />
            {errors.general && (
              <p ref={generalErrorRef} tabIndex={-1} role="alert"
                className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errors.general}
              </p>
            )}
            <Button type="submit" size="lg" fullWidth disabled={isLoading}>
              {isLoading ? 'Création…' : 'Créer mon compte'}
            </Button>
          </form>

          <p className="mt-6 border-t border-theme-border pt-6 text-center text-sm text-content-muted">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold text-[var(--brand-violet-hover)]">Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
