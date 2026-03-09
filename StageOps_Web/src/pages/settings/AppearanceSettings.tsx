import { useState } from 'react';
import { Card, CardHeader } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Check, Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { SettingRow } from './shared';

export function AppearanceSettings() {
  const [theme, setTheme] = useState<'dark' | 'auto'>('dark');

  return (
    <Card>
      <CardHeader title="Apparence" subtitle="Personnalisez l'interface de StageOps" />
      <div>
        <SettingRow label="Thème" description="Mode d'affichage de l'interface">
          <div className="flex gap-2">
            {[
              { key: 'dark' as const, label: 'Sombre', icon: Monitor },
              { key: 'auto' as const, label: 'Auto', icon: Smartphone },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all ${
                    theme === t.key
                      ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                      : 'bg-theme-elevated text-content-muted border border-theme-border hover:border-theme-border-hover'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </SettingRow>
        <SettingRow
          label="Couleur d'accentuation"
          description="Couleur principale de l'interface"
        >
          <div className="flex gap-2">
            {[
              { color: '#00ffff', label: 'Cyan' },
              { color: '#a3ff12', label: 'Lime' },
              { color: '#a855f7', label: 'Violet' },
              { color: '#3b82f6', label: 'Bleu' },
            ].map((c) => (
              <button
                key={c.color}
                className="w-8 h-8 rounded-xl border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: `${c.color}20`,
                  borderColor: c.color === '#00ffff' ? c.color : 'transparent',
                }}
                title={c.label}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto"
                  style={{ backgroundColor: c.color }}
                />
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow
          label="Densité d'affichage"
          description="Espacement des éléments dans l'interface"
        >
          <select className="bg-theme-elevated border border-theme-border rounded-xl px-4 py-2 text-sm text-content-primary focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>Normal</option>
            <option>Compact</option>
            <option>Confortable</option>
          </select>
        </SettingRow>
        <SettingRow
          label="Vue par défaut"
          description="Écran affiché à l'ouverture de StageOps"
        >
          <select className="bg-theme-elevated border border-theme-border rounded-xl px-4 py-2 text-sm text-content-primary focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>Tableau de bord</option>
            <option>Vue Scène</option>
            <option>Inventaire</option>
          </select>
        </SettingRow>
      </div>
      <div className="mt-6">
        <Button variant="primary" onClick={() => toast.success('Apparence mise à jour')}>
          <Check size={16} />
          Sauvegarder
        </Button>
      </div>
    </Card>
  );
}
