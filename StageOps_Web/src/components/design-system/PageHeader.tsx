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
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        {context && <p className="page-kicker mb-1.5">{context}</p>}
        <h1 className="page-heading">{title}</h1>
        {description && <div className="mt-1.5 text-sm text-content-muted">{description}</div>}
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
