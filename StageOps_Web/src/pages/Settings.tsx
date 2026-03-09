import { useState } from 'react';
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
} from './settings';

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
        <h1 className="text-3xl text-content-primary mb-2">Paramètres</h1>
        <p className="text-content-muted">Configuration de la plateforme StageOps</p>
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
                    : 'text-content-muted hover:text-content-primary hover:bg-theme-elevated'
                }`}
              >
                <Icon size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{section.label}</p>
                  <p className="text-[10px] text-content-subtle truncate">{section.desc}</p>
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


