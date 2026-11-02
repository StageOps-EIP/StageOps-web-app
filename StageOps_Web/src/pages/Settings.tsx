import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  GeneralSettings,
  NotificationSettings,
  SecuritySettings,
  ExportSettings,
} from './settings/index'
import { PageHeader } from '@/components/design-system/PageHeader'

type SettingsSection = 'general' | 'notifications' | 'security' | 'export'

const sections: { key: SettingsSection; label: string; desc: string }[] = [
  { key: 'general', label: 'Général', desc: 'Lieu, langue, fuseau horaire' },
  { key: 'notifications', label: 'Notifications', desc: 'Alertes, emails, push' },
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
      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
        {/* Sidebar */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-theme-border bg-theme-base p-2 lg:block lg:overflow-visible">
          {sections.map((section) => {
            const isActive = activeSection === section.key
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                aria-pressed={isActive}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors lg:w-full ${
                  isActive
                    ? 'bg-[var(--brand-soft)] font-semibold text-content-primary'
                    : 'text-content-muted hover:bg-theme-elevated hover:text-content-primary'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{section.label}</p>
                  <p className="hidden truncate text-[10px] text-content-subtle lg:block">
                    {section.desc}
                  </p>
                </div>
                {isActive && (
                  <span
                    className="h-2 w-2 rounded-full bg-[var(--brand-violet)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div>
          {activeSection === 'general' && <GeneralSettings />}
          {activeSection === 'notifications' && <NotificationSettings />}
          {activeSection === 'security' && <SecuritySettings />}
          {activeSection === 'export' && <ExportSettings />}
        </div>
      </div>
    </div>
  )
}
