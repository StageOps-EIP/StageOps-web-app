import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, Radio, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { StageOpsLogo } from '@/components/brand/StageOpsLogo';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { useAuth } from '@/contexts/auth.context';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Connexion impossible. Vérifiez vos informations.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" className="relative min-h-dvh overflow-hidden bg-[#070b1a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(117,85,244,.2),transparent_28rem),radial-gradient(circle_at_90%_80%,rgba(69,102,242,.18),transparent_32rem)]" />
      <div className="relative grid min-h-dvh lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col xl:p-14">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(120,133,255,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(120,133,255,.13)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="relative">
            <StageOpsLogo inverse />
          </div>

          <div className="relative my-auto max-w-xl py-12">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
              <Radio size={13} /> Le poste de contrôle de vos productions
            </div>
            <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em] xl:text-6xl">
              La régie gagne en <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">précision.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-blue-100/65">
              Centralisez la scène, le matériel, les équipes et les incidents dans un espace pensé pour les opérations en direct.
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {['Suivi temps réel', 'Parc centralisé', 'Équipe coordonnée'].map((feature) => (
                <div key={feature} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-sm">
                  <CheckCircle2 size={17} className="mb-4 text-cyan-300" />
                  <p className="text-xs font-semibold leading-5 text-blue-50/85">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-blue-100/40">© 2026 StageOps · Opérations scéniques</p>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <StageOpsLogo inverse />
              <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-blue-100/60 hover:text-white">
                <ArrowLeft size={14} /> Retour
              </Link>
            </div>

            <div className="mb-8">
              <p className="eyebrow mb-3"><ShieldCheck size={13} /> Espace sécurisé</p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Bienvenue.</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100/55">Connectez-vous pour retrouver votre environnement de production.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                type="email"
                label="Adresse e-mail"
                placeholder="prenom@organisation.fr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                icon={<Mail size={17} />}
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
                    icon={<Lock size={17} />}
                    autoComplete="current-password"
                    className="pr-12"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute bottom-3 right-3 text-content-subtle transition-colors hover:text-content-primary"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-xs">
                  <label className="flex cursor-pointer items-center gap-2 text-blue-100/55">
                    <input type="checkbox" className="h-4 w-4 rounded border-theme-border bg-theme-elevated accent-cyan-400" />
                    Rester connecté
                  </label>
                  <button type="button" className="font-semibold text-cyan-300 hover:text-cyan-200">Mot de passe oublié ?</button>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" fullWidth disabled={isLoading}>
                {isLoading ? 'Connexion en cours…' : <>Se connecter <ArrowRight size={16} /></>}
              </Button>
            </form>

            <div className="my-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-100/30">
              <span className="h-px flex-1 bg-white/10" /> ou <span className="h-px flex-1 bg-white/10" />
            </div>

            <Link
              to="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-blue-50 transition-all hover:border-cyan-300/25 hover:bg-white/[0.07]"
            >
              Accéder sans compte <ArrowRight size={16} />
            </Link>

            <p className="mt-8 text-center text-xs text-blue-100/45">
              Nouveau sur StageOps ? <Link to="/register" className="font-semibold text-cyan-300 hover:text-cyan-200">Créer un compte</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
