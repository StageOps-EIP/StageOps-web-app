import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Database,
  ChevronRight,
} from 'lucide-react'
import {
  GeneralSettings,
  NotificationSettings,
  AppearanceSettings,
  SecuritySettings,
  ExportSettings,
} from './settings/index'
import { DemoNotice, PageHeader } from '@/components/design-system/PageHeader'

type SettingsSection = 'general' | 'notifications' | 'appearance' | 'security' | 'export'

const sections: { key: SettingsSection; label: string; icon: typeof SettingsIcon; desc: string }[] =
  [
    { key: 'general', label: 'Général', icon: SettingsIcon, desc: 'Lieu, langue, fuseau horaire' },
    { key: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alertes, emails, push' },
    { key: 'appearance', label: 'Apparence', icon: Palette, desc: 'Thème clair ou sombre' },
    { key: 'security', label: 'Sécurité', icon: Shield, desc: 'Mot de passe, sessions' },
    { key: 'export', label: 'Export & Données', icon: Database, desc: 'PDF, Excel, sauvegarde' },
  ]

export function Settings() {
  usePageTitle('Paramètres')
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')

  return (
    <div className="page-shell space-y-5">
      <PageHeader
        context="StageOps"
        title="Paramètres"
        description="Configuration du lieu et préférences de l’interface."
      />
      <DemoNotice>
        Les réglages sont conservés uniquement dans cet environnement de démonstration.
      </DemoNotice>

      <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
        {/* Sidebar */}
        <div className="flex overflow-x-auto border border-theme-border bg-theme-base lg:block lg:overflow-visible">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.key
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex shrink-0 items-center gap-3 border-b-2 px-4 py-3 text-left transition-colors lg:w-full lg:border-b lg:border-l-2 ${
                  isActive
                    ? 'border-b-[var(--brand-violet)] bg-[var(--brand-soft)] text-content-primary lg:border-b-theme-border lg:border-l-[var(--brand-violet)]'
                    : 'border-b-transparent text-content-muted hover:bg-theme-elevated hover:text-content-primary lg:border-b-theme-border lg:border-l-transparent'
                }`}
              >
                <Icon size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{section.label}</p>
                  <p className="hidden truncate text-[10px] text-content-subtle lg:block">
                    {section.desc}
                  </p>
                </div>
                {isActive && <ChevronRight size={14} />}
              </button>
            )
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
  )
}
