import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { useDemoData } from '@/hooks/useDemoData'
import { toast } from 'sonner'

export function PageHeader({
  title,
  description,
  context,
  actions,
}: {
  title: string
  description?: ReactNode
  context?: string
  actions?: ReactNode
}) {
  return (
    <header className="workspace-page-header flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {context && <p className="page-kicker mb-2">{context}</p>}
        <div className="min-w-0">
          <h1 className="page-heading">{title}</h1>
          {description && <div className="mt-2 text-xs text-content-muted">{description}</div>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function DemoNotice({
  children = 'Données de démonstration · scénario du 11 février 2026',
}: {
  children?: ReactNode
}) {
  const { isDemoDirty, resetDemoData } = useDemoData()

  return (
    <div className="demo-notice flex-wrap" role="note" data-dirty={isDemoDirty}>
      <span
        className="h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--brand-violet)]"
        aria-hidden="true"
      />
      <span>{children}</span>
      {isDemoDirty && (
        <>
          <span className="text-content-faint" aria-hidden="true">
            ·
          </span>
          <span className="text-[var(--brand-violet-hover)]">Modifications enregistrées</span>
          <button
            type="button"
            onClick={() => {
              resetDemoData()
              toast.success('Scénario de démonstration réinitialisé')
            }}
            className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-content-muted transition-colors hover:text-content-primary"
          >
            <RotateCcw size={12} aria-hidden="true" />
            Réinitialiser la démo
          </button>
        </>
      )}
    </div>
  )
}
