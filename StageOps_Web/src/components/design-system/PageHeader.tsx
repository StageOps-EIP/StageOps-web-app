import type { ReactNode } from 'react'

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
