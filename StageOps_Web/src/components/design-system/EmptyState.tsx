import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-theme-border px-6 py-10 text-center">
      <Icon size={24} className="mb-3 text-content-faint" aria-hidden="true" />
      <p className="text-sm font-semibold text-content-primary">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-content-subtle">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
