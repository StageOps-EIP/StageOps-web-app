import { Card, CardHeader } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { SettingRow } from './shared';

export function GeneralSettings() {
  return (
    <Card>
      <CardHeader title="Paramètres généraux" subtitle="Configuration du lieu et de la plateforme" />
      <div>
        <SettingRow label="Nom du lieu" description="Nom principal affiché dans l'interface">
          <input
            type="text"
            defaultValue="Théâtre National"
            className="bg-theme-elevated border border-theme-border rounded-xl px-4 py-2 text-sm text-content-primary focus:outline-none focus:border-cyan-400/50 w-56"
          />
        </SettingRow>
        <SettingRow label="Salles disponibles" description="Scènes et espaces gérés">
          <div className="flex flex-wrap gap-1.5 max-w-xs justify-end">
            {['Grande Salle', 'Salle Studio', 'Foyer'].map((s) => (
              <span key={s} className="px-2 py-0.5 bg-theme-elevated border border-theme-border rounded-lg text-xs text-content-muted">
                {s}
              </span>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Langue" description="Langue de l'interface">
          <select className="bg-theme-elevated border border-theme-border rounded-xl px-4 py-2 text-sm text-content-primary focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>Français</option>
            <option>English</option>
          </select>
        </SettingRow>
        <SettingRow label="Fuseau horaire">
          <select className="bg-theme-elevated border border-theme-border rounded-xl px-4 py-2 text-sm text-content-primary focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>Europe/Paris (CET)</option>
            <option>Europe/London (GMT)</option>
            <option>America/New_York (EST)</option>
          </select>
        </SettingRow>
        <SettingRow label="Convention scénique" description="Vocabulaire utilisé pour les côtés du plateau">
          <select className="bg-theme-elevated border border-theme-border rounded-xl px-4 py-2 text-sm text-content-primary focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>Cour / Jardin (FR)</option>
            <option>Stage Left / Stage Right (EN)</option>
            <option>Prompt / OP (UK)</option>
          </select>
        </SettingRow>
      </div>
      <div className="mt-6">
        <Button variant="primary" onClick={() => toast.success('Paramètres sauvegardés')}>
          <Check size={16} />
          Sauvegarder
        </Button>
      </div>
    </Card>
  );
}
