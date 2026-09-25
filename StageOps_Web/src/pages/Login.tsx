import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Radio, ShieldCheck } from 'lucide-react';
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
    <main id="main-content" className="auth-surface relative min-h-dvh overflow-hidden bg-[#05060a] text-[#f3f1eb]">
      <div className="absolute inset-x-0 top-0 z-20 grid h-1 grid-cols-[34%_22%_1fr]">
        <span className="bg-[#7964ff]" /><span className="bg-[#3977ff]" /><span className="bg-[#11141d]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_right,black,transparent_72%)]" />

      <div className="relative grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_34rem]">
        <section className="relative hidden overflow-hidden border-r border-[#252b3a] p-10 lg:flex lg:flex-col xl:p-14">
          <div className="relative z-10 flex items-center justify-between">
            <StageOpsLogo inverse />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#747b8e]">Operations system / 01</span>
          </div>

          <div className="relative z-10 my-auto max-w-4xl py-16">
            <div className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9586ff]">
              <span className="h-px w-10 bg-[#7964ff]" /><Radio size={12} /> Live production control
            </div>
            <h1 className="max-w-[11ch] text-[clamp(4.5rem,8vw,9rem)] font-medium leading-[0.78] tracking-[-0.085em]">
              Pilotez<br />l’invisible<span className="text-[#7964ff]">.</span>
            </h1>
            <p className="mt-10 max-w-lg border-l border-[#7964ff] pl-5 text-sm leading-7 text-[#a4a9b7] xl:text-base">
              La scène, le parc et les équipes réunis dans un seul poste de commandement conçu pour le direct.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 border-y border-[#252b3a] font-mono text-[9px] uppercase tracking-[0.12em] text-[#747b8e]">
            <span className="border-r border-[#252b3a] py-3">Scene / 3D</span>
            <span className="border-r border-[#252b3a] px-4 py-3">Assets / Live</span>
            <span className="px-4 py-3">Team / Sync</span>
          </div>

          <img
            src="/brand/stageops-mark-transparent.png"
            alt=""
            className="pointer-events-none absolute -bottom-28 -right-32 w-[38rem] opacity-[0.1] saturate-150"
          />
        </section>

        <section className="relative flex items-center justify-center bg-[#080a10]/90 px-5 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-12 flex items-center justify-between lg:hidden">
              <StageOpsLogo inverse />
              <Link to="/" className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-[#747b8e] hover:text-white">
                <ArrowLeft size={13} /> Retour
              </Link>
            </div>

            <div className="mb-10 border-b border-[#252b3a] pb-7">
              <div className="mb-5 flex items-center justify-between">
                <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#9586ff]"><ShieldCheck size={12} /> Accès sécurisé</p>
                <span className="font-mono text-[9px] text-[#505767]">01 / 02</span>
              </div>
              <h2 className="text-5xl font-medium tracking-[-0.065em]">Identification</h2>
              <p className="mt-3 text-sm leading-6 text-[#747b8e]">Ouvrez votre environnement de production.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
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
                    className="absolute bottom-3 right-3 text-[#747b8e] transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-wider">
                  <label className="flex cursor-pointer items-center gap-2 text-[#747b8e]">
                    <input type="checkbox" className="h-3.5 w-3.5 border-[#3b4357] bg-[#0d1018] accent-[#7964ff]" />
                    Rester connecté
                  </label>
                  <button type="button" className="text-[#9586ff] hover:text-white">Accès perdu ?</button>
                </div>
              </div>

              {error && <p role="alert" className="border-l-2 border-red-400 bg-red-400/10 px-4 py-3 text-xs text-red-200">{error}</p>}

              <Button type="submit" size="lg" fullWidth disabled={isLoading}>
                {isLoading ? 'Connexion en cours…' : <>Entrer dans StageOps <ArrowRight size={15} /></>}
              </Button>
            </form>

            <div className="my-7 flex items-center gap-3 font-mono text-[8px] uppercase tracking-[0.2em] text-[#505767]">
              <span className="h-px flex-1 bg-[#252b3a]" /> Accès temporaire <span className="h-px flex-1 bg-[#252b3a]" />
            </div>

            <Link to="/" className="flex w-full items-center justify-between border border-[#3b4357] px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors hover:border-[#7964ff] hover:bg-[#7964ff]/10">
              Continuer en démonstration <ArrowRight size={15} />
            </Link>

            <p className="mt-8 text-center font-mono text-[9px] uppercase tracking-wider text-[#505767]">
              Nouveau profil ? <Link to="/register" className="text-[#9586ff] hover:text-white">Créer un accès</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
