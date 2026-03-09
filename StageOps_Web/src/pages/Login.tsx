import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Layers, Mail, Lock } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in production would authenticate
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0a0b] via-[#131316] to-[#1c1c21]">
      {/* Background theatrical pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #00ffff 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>
      
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl mb-4 shadow-2xl shadow-cyan-400/20">
            <Layers size={40} className="text-black" />
          </div>
          <h1 className="text-4xl font-bold text-[#f5f5f7] mb-2">StageOps</h1>
          <p className="text-[#a1a1aa]">Plateforme de régie technique</p>
        </div>
        
        {/* Login form */}
        <div className="bg-[#131316] border border-[#27272e] rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-[#f5f5f7] mb-6">Connexion</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="votre.email@theatre.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />
            
            <Input
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#a1a1aa] cursor-pointer">
                <input type="checkbox" className="rounded border-[#27272e] bg-[#1c1c21] text-cyan-400 focus:ring-cyan-400" />
                <span>Se souvenir de moi</span>
              </label>
              <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Mot de passe oublié ?
              </button>
            </div>
            
            <Button type="submit" variant="primary" size="lg" fullWidth className="mt-6">
              Se connecter
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-[#27272e] text-center">
            <p className="text-sm text-[#71717a]">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Créer un compte
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
