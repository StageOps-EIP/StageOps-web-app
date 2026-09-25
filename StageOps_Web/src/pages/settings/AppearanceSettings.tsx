import { Card, CardHeader } from '@/components/design-system/Card'
import { Monitor, Sun } from 'lucide-react'
import { useTheme } from '@/lib/use-theme'
import { SettingRow } from './shared'

export function AppearanceSettings() {
  const { theme, toggle } = useTheme()

  return (
    <Card>
      <CardHeader title="Apparence" subtitle="Le thème est appliqué immédiatement à l'interface" />
      <div>
        <SettingRow label="Thème" description="Mode d'affichage de l'interface">
          <div className="flex gap-2">
            {[
              { key: 'dark' as const, label: 'Sombre', icon: Monitor },
              { key: 'light' as const, label: 'Clair', icon: Sun },
            ].map((t) => {
              const Icon = t.icon
              const isActive = theme === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    if (!isActive) toggle()
                  }}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs transition-colors ${
                    isActive
                      ? 'border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-violet-hover)]'
                      : 'border-theme-border bg-theme-elevated text-content-muted hover:border-theme-border-hover'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </SettingRow>
      </div>
    </Card>
  )
}
