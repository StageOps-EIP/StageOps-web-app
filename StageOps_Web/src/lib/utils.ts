import type { EquipmentStatus, IncidentSeverity } from './types'
import { STATUS_COLORS } from './design-tokens'

export function getStatusColor(status: EquipmentStatus): string {
  switch (status) {
    case 'ok':
      return STATUS_COLORS.success
    case 'to-check':
      return STATUS_COLORS.warning
    case 'hs':
      return STATUS_COLORS.danger
    case 'repair':
      return STATUS_COLORS.warning
    default:
      return STATUS_COLORS.neutral
  }
}

export function getStatusLabel(status: EquipmentStatus): string {
  switch (status) {
    case 'ok':
      return 'Opérationnel'
    case 'to-check':
      return 'À vérifier'
    case 'hs':
      return 'Hors service'
    case 'repair':
      return 'En réparation'
    default:
      return status
  }
}

export function getSeverityColor(severity: IncidentSeverity): string {
  switch (severity) {
    case 'low':
      return STATUS_COLORS.success
    case 'medium':
      return STATUS_COLORS.warning
    case 'high':
      return STATUS_COLORS.danger
    case 'critical':
      return STATUS_COLORS.critical
    default:
      return STATUS_COLORS.neutral
  }
}

export function getSeverityLabel(severity: IncidentSeverity): string {
  switch (severity) {
    case 'low':
      return 'Faible'
    case 'medium':
      return 'Moyenne'
    case 'high':
      return 'Élevée'
    case 'critical':
      return 'Critique'
    default:
      return severity
  }
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    sound: 'Son',
    light: 'Lumière',
    video: 'Vidéo',
    set: 'Plateau',
    safety: 'Sécurité',
    rigging: 'Accroche',
  }
  return labels[category] || category
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    sound: 'SPK',
    light: 'LUM',
    video: 'VID',
    set: 'SCN',
    safety: 'SEC',
    rigging: 'GRE',
  }
  return icons[category] || 'EQP'
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getProgressColor(progress: number): string {
  if (progress > 75) return STATUS_COLORS.success
  if (progress > 40) return STATUS_COLORS.warning
  return STATUS_COLORS.danger
}
