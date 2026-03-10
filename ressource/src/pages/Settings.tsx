import { useState } from 'react';
import { Card, CardHeader } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Download,
  Monitor,
  Smartphone,
  Layers,
  Check,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type SettingsSection = 'general' | 'notifications' | 'appearance' | 'security' | 'export';

const sections: { key: SettingsSection; label: string; icon: typeof SettingsIcon; desc: string }[] = [
  { key: 'general', label: 'Général', icon: SettingsIcon, desc: 'Lieu, langue, fuseau horaire' },
  { key: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alertes, emails, push' },
  { key: 'appearance', label: 'Apparence', icon: Palette, desc: 'Thème, densité, disposition' },
  { key: 'security', label: 'Sécurité', icon: Shield, desc: 'Mot de passe, sessions' },
  { key: 'export', label: 'Export & Données', icon: Database, desc: 'PDF, Excel, sauvegarde' },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-[#f5f5f7] mb-2">Paramètres</h1>
        <p className="text-[#a1a1aa]">Configuration de la plateforme StageOps</p>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-400'
                    : 'text-[#a1a1aa] hover:text-[#f5f5f7] hover:bg-[#1c1c21]'
                }`}
              >
                <Icon size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{section.label}</p>
                  <p className="text-[10px] text-[#71717a] truncate">{section.desc}</p>
                </div>
                {isActive && <ChevronRight size={14} />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {activeSection === 'general' && <GeneralSettings />}
          {activeSection === 'notifications' && <NotificationSettings />}
          {activeSection === 'appearance' && <AppearanceSettings />}
          {activeSection === 'security' && <SecuritySettings />}
          {activeSection === 'export' && <ExportSettings />}
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#27272e] last:border-0">
      <div className="flex-1 pr-8">
        <p className="text-sm text-[#f5f5f7]">{label}</p>
        {description && <p className="text-xs text-[#71717a] mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-cyan-400' : 'bg-[#27272e]'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function GeneralSettings() {
  return (
    <Card>
      <CardHeader title="Paramètres généraux" subtitle="Configuration du lieu et de la plateforme" />
      <div>
        <SettingRow label="Nom du lieu" description="Nom principal affiché dans l'interface">
          <input
            type="text"
            defaultValue="Théâtre National"
            className="bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 w-56"
          />
        </SettingRow>
        <SettingRow label="Salles disponibles" description="Scènes et espaces gérés">
          <div className="flex flex-wrap gap-1.5 max-w-xs justify-end">
            {['Grande Salle', 'Salle Studio', 'Foyer'].map((s) => (
              <span key={s} className="px-2 py-0.5 bg-[#1c1c21] border border-[#27272e] rounded-lg text-xs text-[#a1a1aa]">
                {s}
              </span>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Langue" description="Langue de l'interface">
          <select className="bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>Français</option>
            <option>English</option>
          </select>
        </SettingRow>
        <SettingRow label="Fuseau horaire">
          <select className="bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>Europe/Paris (CET)</option>
            <option>Europe/London (GMT)</option>
            <option>America/New_York (EST)</option>
          </select>
        </SettingRow>
        <SettingRow label="Convention scénique" description="Vocabulaire utilisé pour les côtés du plateau">
          <select className="bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
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

function NotificationSettings() {
  return (
    <Card>
      <CardHeader title="Notifications" subtitle="Gérez vos alertes et canaux de notification" />
      <div>
        <SettingRow
          label="Incidents critiques"
          description="Notification immédiate pour les incidents de sévérité élevée ou critique"
        >
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow
          label="Équipement HS"
          description="Alerte quand un équipement passe en statut HS"
        >
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow
          label="Rappels de vérification"
          description="Rappel avant le show pour les équipements à vérifier"
        >
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow
          label="Changements d'événement"
          description="Notification lors de modifications du planning"
        >
          <Toggle />
        </SettingRow>
        <SettingRow
          label="Notifications par email"
          description="Recevoir un résumé quotidien par email"
        >
          <Toggle />
        </SettingRow>
        <SettingRow
          label="Notifications push"
          description="Activer les notifications push sur mobile"
        >
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow
          label="Son d'alerte critique"
          description="Son d'alarme pour les incidents critiques en régie"
        >
          <Toggle defaultChecked />
        </SettingRow>
      </div>
      <div className="mt-6">
        <Button variant="primary" onClick={() => toast.success('Notifications mises à jour')}>
          <Check size={16} />
          Sauvegarder
        </Button>
      </div>
    </Card>
  );
}

function AppearanceSettings() {
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
                      : 'bg-[#1c1c21] text-[#a1a1aa] border border-[#27272e] hover:border-[#35353e]'
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
          <select className="bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>Normal</option>
            <option>Compact</option>
            <option>Confortable</option>
          </select>
        </SettingRow>
        <SettingRow
          label="Vue par défaut"
          description="Écran affiché à l'ouverture de StageOps"
        >
          <select className="bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
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

function SecuritySettings() {
  return (
    <Card>
      <CardHeader title="Sécurité" subtitle="Gestion de l'authentification et des accès" />
      <div>
        <SettingRow
          label="Modifier le mot de passe"
          description="Dernière modification il y a 45 jours"
        >
          <Button variant="secondary" size="sm">
            Modifier
          </Button>
        </SettingRow>
        <SettingRow
          label="Authentification à deux facteurs"
          description="Sécurité renforcée via application TOTP"
        >
          <Toggle />
        </SettingRow>
        <SettingRow
          label="Sessions actives"
          description="2 sessions actives (Desktop, Mobile)"
        >
          <Button variant="ghost" size="sm">
            Voir les sessions
          </Button>
        </SettingRow>
        <SettingRow
          label="Délai d'inactivité"
          description="Déconnexion automatique après inactivité"
        >
          <select className="bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>30 minutes</option>
            <option>1 heure</option>
            <option>4 heures</option>
            <option>Jamais</option>
          </select>
        </SettingRow>
      </div>
      <div className="mt-6">
        <Button variant="primary" onClick={() => toast.success('Sécurité mise à jour')}>
          <Check size={16} />
          Sauvegarder
        </Button>
      </div>
    </Card>
  );
}

function ExportSettings() {
  return (
    <Card>
      <CardHeader title="Export & Données" subtitle="Exportez vos données et créez des sauvegardes" />
      <div className="space-y-4">
        {/* Export options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#1c1c21] border border-[#27272e] rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Download size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm text-[#f5f5f7]">Export PDF</p>
                <p className="text-[10px] text-[#71717a]">Rapport complet avec visuels</p>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <label className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <input type="checkbox" defaultChecked className="accent-cyan-400" />
                Inventaire équipements
              </label>
              <label className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <input type="checkbox" defaultChecked className="accent-cyan-400" />
                Historique incidents
              </label>
              <label className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <input type="checkbox" className="accent-cyan-400" />
                Planning événements
              </label>
            </div>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => toast.success('Export PDF lancé — fichier prêt dans quelques secondes')}
            >
              <Download size={14} />
              Générer PDF
            </Button>
          </div>

          <div className="p-4 bg-[#1c1c21] border border-[#27272e] rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Download size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[#f5f5f7]">Export Excel</p>
                <p className="text-[10px] text-[#71717a]">Données tabulaires (.xlsx)</p>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <label className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <input type="checkbox" defaultChecked className="accent-cyan-400" />
                Inventaire équipements
              </label>
              <label className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <input type="checkbox" defaultChecked className="accent-cyan-400" />
                Historique incidents
              </label>
              <label className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <input type="checkbox" className="accent-cyan-400" />
                Liste équipe
              </label>
            </div>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => toast.success('Export Excel lancé — fichier prêt dans quelques secondes')}
            >
              <Download size={14} />
              Générer Excel
            </Button>
          </div>
        </div>

        {/* Backup */}
        <div className="p-4 bg-[#1c1c21] border border-[#27272e] rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-400/10 rounded-lg">
                <Database size={18} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-[#f5f5f7]">Sauvegarde complète</p>
                <p className="text-[10px] text-[#71717a]">
                  Dernière sauvegarde : 10 fév. 2026 à 23:00
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast.success('Sauvegarde en cours...')}
            >
              <Database size={14} />
              Sauvegarder maintenant
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
