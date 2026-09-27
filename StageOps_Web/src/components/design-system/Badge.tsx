import { getStatusColor, getStatusLabel } from '@/lib/utils'
import type { EquipmentStatus } from '@/lib/types'
import type { ReactNode } from 'react'

export function CategoryIcon({ category }: { category: string; size?: number }) {
  const shortLabels: Record<string, string> = {
    sound: 'SO',
    light: 'LX',
    video: 'VI',
    set: 'PL',
    safety: 'SE',
    rigging: 'AC',
  }

  return (
    <span className="font-data text-[9px] font-bold text-content-subtle" aria-hidden="true">
      {shortLabels[category] ?? 'EQ'}
    </span>
  )
}

interface BadgeProps {
  status: EquipmentStatus
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function Badge({ status, size = 'md', showLabel = true }: BadgeProps) {
  const color = getStatusColor(status)
  const label = getStatusLabel(status)
  const sizeClasses = {
    sm: 'text-[11px] gap-1.5',
    md: 'text-xs gap-2',
  }

  return (
    <div
      className={`inline-flex items-center font-semibold ${sizeClasses[size]}`}
      style={{ color }}
    >
      <span
        className="h-1.5 w-1.5 rotate-45"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {showLabel && <span>{label}</span>}
    </div>
  )
}

interface CategoryChipProps {
  category: string
  label?: string
  icon?: ReactNode
  onRemove?: () => void
}

export function CategoryChip({ category, label, icon, onRemove }: CategoryChipProps) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-content-primary">
      {icon && <span className="text-base">{icon}</span>}
      <span>{label || category}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-content-subtle hover:text-content-primary transition-colors"
        >
          ×
        </button>
      )}
    </div>
  )
}
