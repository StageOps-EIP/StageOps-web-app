import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../components/design-system/Button';
import { Input } from '../components/design-system/Input';
import { Layers, Mail, Lock, User, Phone, Briefcase, ChevronLeft, CheckCircle2 } from 'lucide-react';

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
];

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form & { general: string }>>({});

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateStep1() {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'Requis';
    if (!form.lastName.trim()) e.lastName = 'Requis';
    if (!form.email.trim()) e.email = 'Requis';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email invalide';
    if (!form.role) e.role = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Partial<typeof form> = {};
    if (!form.password) e.password = 'Requis';
    else if (form.password.length < 8) e.password = '8 caractères minimum';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep2()) navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0a0b] via-[#131316] to-[#1c1c21]">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #00ffff 1px, transparent 0)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl mb-4 shadow-2xl shadow-cyan-400/20">
            <Layers size={40} className="text-black" />
          </div>
          <h1 className="text-4xl font-bold text-[#f5f5f7] mb-2">StageOps</h1>
          <p className="text-[#a1a1aa]">Créer votre compte</p>
        </div>

        <div className="bg-[#131316] border border-[#27272e] rounded-3xl p-8 shadow-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step >= 1 ? 'bg-cyan-400 text-black' : 'bg-[#27272e] text-[#71717a]'
                }`}
              >
                {step > 1 ? <CheckCircle2 size={14} /> : '1'}
              </div>
              <span className={`text-sm ${step === 1 ? 'text-[#f5f5f7]' : 'text-[#71717a]'}`}>
                Informations
              </span>
            </div>
            <div className="flex-1 h-px bg-[#27272e]" />
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step >= 2 ? 'bg-cyan-400 text-black' : 'bg-[#27272e] text-[#71717a]'
                }`}
              >
                2
              </div>
              <span className={`text-sm ${step === 2 ? 'text-[#f5f5f7]' : 'text-[#71717a]'}`}>
                Sécurité
              </span>
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="text-xl font-semibold text-[#f5f5f7] mb-4">Vos informations</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-1.5">Prénom *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => set('firstName', e.target.value)}
                      placeholder="Prénom"
                      className={`w-full bg-[#1c1c21] border rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f5f5f7] placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors ${
                        errors.firstName ? 'border-red-500/60' : 'border-[#27272e] focus:border-cyan-400/50'
                      }`}
                    />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-1.5">Nom *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    placeholder="Nom"
                    className={`w-full bg-[#1c1c21] border rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors ${
                      errors.lastName ? 'border-red-500/60' : 'border-[#27272e] focus:border-cyan-400/50'
                    }`}
                  />
                  {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1.5">Email professionnel *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="votre.email@theatre.fr"
                    className={`w-full bg-[#1c1c21] border rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f5f5f7] placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors ${
                      errors.email ? 'border-red-500/60' : 'border-[#27272e] focus:border-cyan-400/50'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1.5">Téléphone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f5f5f7] placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1.5">Rôle *</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none" />
                  <select
                    value={form.role}
                    onChange={(e) => set('role', e.target.value)}
                    className={`w-full bg-[#1c1c21] border rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors [color-scheme:dark] ${
                      errors.role ? 'border-red-500/60' : 'border-[#27272e] focus:border-cyan-400/50'
                    }`}
                  >
                    <option value="">Sélectionner un rôle</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role}</p>}
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
                  className="p-1.5 rounded-lg hover:bg-[#27272e] text-[#71717a] hover:text-[#f5f5f7] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <h2 className="text-xl font-semibold text-[#f5f5f7]">Sécurité du compte</h2>
              </div>

              {/* Résumé step 1 */}
              <div className="flex items-center gap-3 p-3 bg-cyan-400/5 border border-cyan-400/20 rounded-xl mb-2">
                <div className="w-9 h-9 bg-cyan-400/10 rounded-xl flex items-center justify-center shrink-0">
                  <User size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-[#f5f5f7]">{form.firstName} {form.lastName}</p>
                  <p className="text-xs text-[#71717a]">{form.role} · {form.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="8 caractères minimum"
                    className={`w-full bg-[#1c1c21] border rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f5f5f7] placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors ${
                      errors.password ? 'border-red-500/60' : 'border-[#27272e] focus:border-cyan-400/50'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
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
                              ? form.password.length >= 12 ? '#22c55e' : form.password.length >= 8 ? '#f59e0b' : '#ef4444'
                              : '#27272e',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1.5">Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => set('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-[#1c1c21] border rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f5f5f7] placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors ${
                      errors.confirmPassword ? 'border-red-500/60' : 'border-[#27272e] focus:border-cyan-400/50'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2">
                <CheckCircle2 size={18} />
                Créer mon compte
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-[#27272e] text-center">
            <p className="text-sm text-[#71717a]">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#71717a] mt-8">
          © 2026 StageOps. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
