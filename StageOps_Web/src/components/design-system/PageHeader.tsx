import type { ReactNode } from 'react'
import { Database } from 'lucide-react'

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
    <header className="workspace-page-header flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {context && <p className="page-kicker mt-1.5 hidden shrink-0 xl:block">{context}</p>}
        <div className="min-w-0">
          <h1 className="page-heading">{title}</h1>
          {description && <div className="mt-0.5 text-xs text-content-muted">{description}</div>}
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
  return (
    <div className="demo-notice" role="note">
      <Database size={14} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
