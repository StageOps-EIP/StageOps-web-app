import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Button } from '@/components/design-system/Button'
import { StageOpsLogo } from '@/components/brand/StageOpsLogo'
import { useAuth } from '@/contexts/auth.context'
import { Mail, Lock, User, Phone, Briefcase, ChevronLeft, CheckCircle2 } from 'lucide-react'

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
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form & { general: string }>>({})
  const [isLoading, setIsLoading] = useState(false)

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validateStep1() {
    const e: Partial<typeof form> = {}
    if (!form.firstName.trim()) e.firstName = 'Requis'
    if (!form.lastName.trim()) e.lastName = 'Requis'
    if (!form.email.trim()) e.email = 'Requis'
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      e.email = 'Email invalide'
    if (!form.role) e.role = 'Requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Partial<typeof form> = {}
    if (!form.password) e.password = 'Requis'
    else if (form.password.length < 8) e.password = '8 caractères minimum'
    else if (!/[A-Z]/.test(form.password)) e.password = 'Au moins une majuscule requise'
    else if (!/[0-9]/.test(form.password)) e.password = 'Au moins un chiffre requis'
    else if (!/[^a-zA-Z0-9]/.test(form.password))
      e.password = 'Au moins un caractère spécial requis'
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Les mots de passe ne correspondent pas'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (validateStep1()) setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep2()) return
    setIsLoading(true)
    try {
      await register(form.email, form.password)
      navigate('/')
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err instanceof Error ? err.message : 'Erreur lors de la création du compte',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      id="main-content"
      className="auth-surface min-h-dvh bg-theme-void px-4 py-8 text-content-primary sm:px-6"
    >
      <div className="mx-auto w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <StageOpsLogo className="mb-6" />
          <h1 className="mb-2 text-3xl font-semibold text-content-primary">Créer votre espace</h1>
          <p className="text-sm text-content-muted">
            Configurez votre profil de régie en quelques instants.
          </p>
        </div>

        <div className="panel p-5 sm:p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step >= 1
                    ? 'bg-[var(--brand-violet)] text-[var(--brand-button-text)]'
                    : 'bg-theme-border text-content-subtle'
                }`}
              >
                {step > 1 ? <CheckCircle2 size={14} /> : '1'}
              </div>
              <span
                className={`text-sm ${step === 1 ? 'text-content-primary' : 'text-content-subtle'}`}
              >
                Informations
              </span>
            </div>
            <div className="flex-1 h-px bg-theme-border" />
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step >= 2
                    ? 'bg-[var(--brand-violet)] text-[var(--brand-button-text)]'
                    : 'bg-theme-border text-content-subtle'
                }`}
              >
                2
              </div>
              <span
                className={`text-sm ${step === 2 ? 'text-content-primary' : 'text-content-subtle'}`}
              >
                Sécurité
              </span>
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="text-xl font-semibold text-content-primary mb-4">Vos informations</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-content-muted mb-1.5">Prénom *</label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle"
                    />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => set('firstName', e.target.value)}
                      placeholder="Prénom"
                      className={`w-full bg-theme-elevated border rounded-xl pl-9 pr-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] transition-colors ${
                        errors.firstName
                          ? 'border-red-500/60'
                          : 'border-theme-border focus:border-[var(--brand-violet)]'
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-red-700 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-content-muted mb-1.5">Nom *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    placeholder="Nom"
                    className={`w-full bg-theme-elevated border rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] transition-colors ${
                      errors.lastName
                        ? 'border-red-500/60'
                        : 'border-theme-border focus:border-[var(--brand-violet)]'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-700 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-content-muted mb-1.5">
                  Email professionnel *
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="votre.email@theatre.fr"
                    className={`w-full bg-theme-elevated border rounded-xl pl-9 pr-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] transition-colors ${
                      errors.email
                        ? 'border-red-500/60'
                        : 'border-theme-border focus:border-[var(--brand-violet)]'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-700 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm text-content-muted mb-1.5">Téléphone</label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle"
                  />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full bg-theme-elevated border border-theme-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] focus:border-[var(--brand-violet)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-content-muted mb-1.5">Rôle *</label>
                <div className="relative">
                  <Briefcase
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none"
                  />
                  <select
                    value={form.role}
                    onChange={(e) => set('role', e.target.value)}
                    className={`w-full bg-theme-elevated border rounded-xl pl-9 pr-4 py-2.5 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] transition-colors  ${
                      errors.role
                        ? 'border-red-500/60'
                        : 'border-theme-border focus:border-[var(--brand-violet)]'
                    }`}
                  >
                    <option value="">Sélectionner un rôle</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role && <p className="text-xs text-red-700 mt-1">{errors.role}</p>}
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2">
                Continuer
              </Button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1.5 rounded-lg hover:bg-theme-border text-content-subtle hover:text-content-primary transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <h2 className="text-xl font-semibold text-content-primary">Sécurité du compte</h2>
              </div>

              {/* Résumé step 1 */}
              <div className="flex items-center gap-3 p-3 bg-[var(--brand-soft)] border border-[var(--brand-border)] rounded-xl mb-2">
                <div className="w-9 h-9 bg-[var(--brand-soft)] rounded-xl flex items-center justify-center shrink-0">
                  <User size={16} className="text-[var(--brand-violet-hover)]" />
                </div>
                <div>
                  <p className="text-sm text-content-primary">
                    {form.firstName} {form.lastName}
                  </p>
                  <p className="text-xs text-content-subtle">
                    {form.role} · {form.email}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-content-muted mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle"
                  />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="8 car. min, 1 maj, 1 chiffre, 1 spécial"
                    className={`w-full bg-theme-elevated border rounded-xl pl-9 pr-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] transition-colors ${
                      errors.password
                        ? 'border-red-500/60'
                        : 'border-theme-border focus:border-[var(--brand-violet)]'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-700 mt-1">{errors.password}</p>}
                {/* Password strength */}
                {form.password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          backgroundColor:
                            form.password.length > i * 3
                              ? form.password.length >= 12
                                ? '#22c55e'
                                : form.password.length >= 8
                                  ? '#f59e0b'
                                  : '#ef4444'
                              : 'var(--border)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-content-muted mb-1.5">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle"
                  />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => set('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-theme-elevated border rounded-xl pl-9 pr-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] transition-colors ${
                      errors.confirmPassword
                        ? 'border-red-500/60'
                        : 'border-theme-border focus:border-[var(--brand-violet)]'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-700 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {errors.general && (
                <p className="text-sm text-red-700 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {errors.general}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="mt-2"
                disabled={isLoading}
              >
                <CheckCircle2 size={18} />
                {isLoading ? 'Création…' : 'Créer mon compte'}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-theme-border text-center">
            <p className="text-sm text-content-subtle">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-[var(--brand-violet-hover)] hover:text-[var(--brand-violet-hover)] transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-content-subtle mt-8">
          © 2026 StageOps. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
