import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  GeneralSettings,
  NotificationSettings,
  AppearanceSettings,
  SecuritySettings,
  ExportSettings,
} from './settings/index'
import { PageHeader } from '@/components/design-system/PageHeader'

type SettingsSection = 'general' | 'notifications' | 'appearance' | 'security' | 'export'

const sections: { key: SettingsSection; label: string; desc: string }[] = [
  { key: 'general', label: 'Général', desc: 'Lieu, langue, fuseau horaire' },
  { key: 'notifications', label: 'Notifications', desc: 'Alertes, emails, push' },
  { key: 'appearance', label: 'Apparence', desc: 'Thème clair ou sombre' },
  { key: 'security', label: 'Sécurité', desc: 'Mot de passe, sessions' },
  { key: 'export', label: 'Export et données', desc: 'PDF, Excel, sauvegarde' },
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
      <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
        {/* Sidebar */}
        <div className="flex overflow-x-auto border-y border-theme-border lg:block lg:overflow-visible lg:border-b-0">
          {sections.map((section, index) => {
            const isActive = activeSection === section.key
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex shrink-0 items-center gap-3 border-b-2 px-3 py-3 text-left transition-colors lg:w-full lg:border-b lg:border-l-0 ${
                  isActive
                    ? 'border-b-[var(--brand-violet)] text-content-primary lg:border-b-theme-border'
                    : 'border-b-transparent text-content-muted hover:text-content-primary lg:border-b-theme-border'
                }`}
              >
                <span className="font-data text-[10px] text-content-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{section.label}</p>
                  <p className="hidden truncate text-[10px] text-content-subtle lg:block">
                    {section.desc}
                  </p>
                </div>
                {isActive && (
                  <span className="text-[var(--brand-violet-hover)]" aria-hidden="true">
                    →
                  </span>
                )}
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
