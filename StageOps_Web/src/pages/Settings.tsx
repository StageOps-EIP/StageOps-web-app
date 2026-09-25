import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Database,
  ChevronRight,
} from 'lucide-react';
import {
  GeneralSettings,
  NotificationSettings,
  AppearanceSettings,
  SecuritySettings,
  ExportSettings,
} from './settings/index';

type SettingsSection = 'general' | 'notifications' | 'appearance' | 'security' | 'export';

const sections: { key: SettingsSection; label: string; icon: typeof SettingsIcon; desc: string }[] = [
  { key: 'general', label: 'Général', icon: SettingsIcon, desc: 'Lieu, langue, fuseau horaire' },
  { key: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alertes, emails, push' },
  { key: 'appearance', label: 'Apparence', icon: Palette, desc: 'Thème, densité, disposition' },
  { key: 'security', label: 'Sécurité', icon: Shield, desc: 'Mot de passe, sessions' },
  { key: 'export', label: 'Export & Données', icon: Database, desc: 'PDF, Excel, sauvegarde' },
];

export function Settings() {
  usePageTitle('Paramètres');
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  return (
    <div className="page-shell space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow mb-2">Préférences</p>
        <h1 className="page-heading text-content-primary">Paramètres</h1>
        <p className="text-content-muted">Configuration de la plateforme StageOps</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        {/* Sidebar */}
        <div className="flex gap-1 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all lg:w-full ${
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-400'
                    : 'text-content-muted hover:text-content-primary hover:bg-theme-elevated'
                }`}
              >
                <Icon size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{section.label}</p>
                  <p className="hidden truncate text-[10px] text-content-subtle lg:block">{section.desc}</p>
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

