import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { StageOpsLogo } from '@/components/brand/StageOpsLogo'
import { useAuth } from '@/contexts/auth.context'
import {
  emptyRegistrationForm, validateCredentials, validateIdentity,
  type RegistrationForm,
} from '@/lib/registration-validation'

const roleOptions = [
  'Régisseur Général',
  'Régisseur Son',
  'Régisseur Lumière',
  'Régisseur Vidéo',
  'Régisseur Plateau',
  'Responsable Sécurité',
  'Machiniste',
  'Cintrier',
  'Technicien',
]

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState(emptyRegistrationForm)
  const [errors, setErrors] = useState<Partial<RegistrationForm & { general: string }>>({})
  const [isLoading, setIsLoading] = useState(false)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const stepTwoTitleRef = useRef<HTMLHeadingElement>(null)
  const generalErrorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (step === 2) stepTwoTitleRef.current?.focus()
  }, [step])

  function set(key: keyof RegistrationForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined, general: undefined }))
  }

  function validateStep1(): boolean {
    const next = validateIdentity(form)
    setErrors(next)
    if (next.firstName) firstNameRef.current?.focus()
    else if (next.lastName) lastNameRef.current?.focus()
    else if (next.email) emailRef.current?.focus()
    else if (next.role) roleRef.current?.focus()
    return Object.keys(next).length === 0
  }

  function validateStep2(): boolean {
    const next = validateCredentials(form)
    setErrors(next)
    if (next.password) passwordRef.current?.focus()
    else if (next.confirmPassword) confirmPasswordRef.current?.focus()
    return Object.keys(next).length === 0
  }

  function handleNext(event: React.FormEvent) {
    event.preventDefault()
    if (validateStep1()) setStep(2)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validateStep2()) return
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
          <h1 className="mb-2 text-3xl font-semibold text-content-primary">Créer votre espace</h1>
          <p className="text-sm text-content-muted">Configurez votre profil de régie en quelques instants.</p>
        </header>

        <div className="panel p-5 sm:p-8">
          <ol aria-label="Étapes de création du compte" className="mb-6 flex items-center gap-3 text-sm">
            <li aria-current={step === 1 ? 'step' : undefined} className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand-violet)] font-semibold text-[var(--brand-button-text)]">
                {step === 1 ? '1' : <CheckCircle2 size={17} aria-hidden="true" />}
              </span>
              <span className={step === 1 ? 'font-semibold text-content-primary' : 'text-content-muted'}>Informations</span>
            </li>
            <li aria-hidden="true" className="h-px flex-1 bg-theme-border" />
            <li aria-current={step === 2 ? 'step' : undefined} className="flex items-center gap-2">
              <span className={'grid h-8 w-8 place-items-center rounded-full font-semibold ' + (step === 2 ? 'bg-[var(--brand-violet)] text-[var(--brand-button-text)]' : 'bg-theme-elevated text-content-muted')}>2</span>
              <span className={step === 2 ? 'font-semibold text-content-primary' : 'text-content-muted'}>Sécurité</span>
            </li>
          </ol>

          {step === 1 && (
            <form onSubmit={handleNext} noValidate className="space-y-4">
              <h2 className="mb-4 text-xl font-semibold text-content-primary">Vos informations</h2>
              <p className="text-sm text-content-muted">Les champs marqués * sont obligatoires.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input ref={firstNameRef} label="Prénom *" required autoComplete="given-name"
                  value={form.firstName} onChange={(event) => set('firstName', event.target.value)} error={errors.firstName} />
                <Input ref={lastNameRef} label="Nom *" required autoComplete="family-name"
                  value={form.lastName} onChange={(event) => set('lastName', event.target.value)} error={errors.lastName} />
              </div>
              <Input ref={emailRef} label="Adresse e-mail *" type="email" required autoComplete="email"
                value={form.email} onChange={(event) => set('email', event.target.value)} error={errors.email} />
              <Input label="Téléphone (facultatif)" type="tel" autoComplete="tel"
                value={form.phone} onChange={(event) => set('phone', event.target.value)} />
              <div>
                <label htmlFor="register-role" className="mb-1.5 block text-sm font-medium text-content-muted">Rôle *</label>
                <select id="register-role" ref={roleRef} required className="form-control px-3"
                  value={form.role} onChange={(event) => set('role', event.target.value)}
                  aria-invalid={Boolean(errors.role)} aria-describedby={errors.role ? 'register-role-error' : undefined}>
                  <option value="">Sélectionner un rôle</option>
                  {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                {errors.role && <p id="register-role-error" role="alert" className="mt-1.5 text-sm text-red-800">{errors.role}</p>}
              </div>
              <Button type="submit" size="lg" fullWidth>Continuer</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setStep(1)} aria-label="Retour aux informations"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-content-muted hover:bg-theme-elevated">
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <h2 ref={stepTwoTitleRef} tabIndex={-1} className="text-xl font-semibold text-content-primary">Sécurité du compte</h2>
              </div>
              <p className="rounded-lg bg-[var(--brand-soft)] p-3 text-sm text-content-primary">
                {form.firstName} {form.lastName} · {form.role} · {form.email}
              </p>
              <div>
                <Input ref={passwordRef} label="Mot de passe *" type="password" required autoComplete="new-password"
                  aria-describedby="register-password-rules" value={form.password}
                  onChange={(event) => set('password', event.target.value)} error={errors.password} />
                <p id="register-password-rules" className="mt-1.5 text-sm text-content-muted">
                  8 caractères minimum, dont une majuscule, un chiffre et un caractère spécial.
                </p>
              </div>
              <Input ref={confirmPasswordRef} label="Confirmer le mot de passe *" type="password" required autoComplete="new-password"
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
          )}

          <p className="mt-6 border-t border-theme-border pt-6 text-center text-sm text-content-muted">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold text-[var(--brand-violet-hover)]">Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
