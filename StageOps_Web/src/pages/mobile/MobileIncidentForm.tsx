import { useState } from 'react';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Camera, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router';

export function MobileIncidentForm() {
  const navigate = useNavigate();
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/mobile/incidents');
    }, 2000);
  };
  
  if (submitted) {
    return (
      <div className="min-h-screen pb-24 bg-[#0a0a0b] flex items-center justify-center p-4">
        <Card className="text-center bg-green-500/10 border-green-500/20">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#f5f5f7] mb-2">Incident signalé</h2>
          <p className="text-sm text-[#a1a1aa]">Votre rapport a été enregistré avec succès</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-24 bg-[#0a0a0b]">
      <MobileHeader title="Signaler un incident" showBack />
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-cyan-400" />
            <h3 className="text-base font-semibold text-[#f5f5f7]">Informations</h3>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Titre de l'incident"
              placeholder="Ex: Panne projecteur FOH"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-[#f5f5f7] mb-2">
                Description
              </label>
              <textarea
                className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all min-h-32 resize-none"
                placeholder="Décrivez l'incident en détail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-base font-semibold text-[#f5f5f7] mb-4">Gravité</h3>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { value: 'low', label: 'Faible', color: '#22c55e' },
                { value: 'medium', label: 'Moyenne', color: '#f59e0b' },
                { value: 'high', label: 'Élevée', color: '#ef4444' },
                { value: 'critical', label: 'Critique', color: '#dc2626' },
              ] as { value: typeof severity; label: string; color: string }[]
            ).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSeverity(item.value)}
                className={`py-4 rounded-xl font-medium transition-all active:scale-95 ${
                  severity === item.value
                    ? 'border-2'
                    : 'border bg-[#1c1c21]'
                }`}
                style={{
                  borderColor: severity === item.value ? item.color : '#27272e',
                  backgroundColor: severity === item.value ? `${item.color}15` : '',
                  color: severity === item.value ? item.color : '#f5f5f7',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Card>
        
        <Card>
          <h3 className="text-base font-semibold text-[#f5f5f7] mb-4">Photos (optionnel)</h3>
          <button
            type="button"
            className="w-full py-8 border-2 border-dashed border-[#27272e] rounded-xl hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all"
          >
            <Camera size={32} className="text-[#71717a] mx-auto mb-2" />
            <p className="text-sm text-[#a1a1aa]">Ajouter des photos</p>
          </button>
        </Card>
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!title || !description}
        >
          Envoyer le rapport
        </Button>
      </form>
    </div>
  );
}
