import type { Event, IncidentStatus } from './types'
import { AlertCircle, Clock, CheckCircle2, Archive } from 'lucide-react'
import { BRAND_COLORS, STATUS_COLORS, TEXT_COLORS } from './design-tokens'

// ─── Localisation française ────────────────────────────────────────────────

export const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export const MONTHS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

// ─── Événements ────────────────────────────────────────────────────────────

export const EVENT_STATUS_CONFIG: Record<
  Event['status'],
  { label: string; color: string; bg: string }
> = {
  planning: {
    label: 'Planification',
    color: STATUS_COLORS.warning,
    bg: `${STATUS_COLORS.warning}15`,
  },
  setup: { label: 'Installation', color: BRAND_COLORS.blue, bg: `${BRAND_COLORS.blue}15` },
  running: { label: 'En cours', color: STATUS_COLORS.success, bg: `${STATUS_COLORS.success}15` },
  strike: { label: 'Démontage', color: STATUS_COLORS.neutral, bg: `${STATUS_COLORS.neutral}15` },
  completed: { label: 'Terminé', color: STATUS_COLORS.neutral, bg: `${STATUS_COLORS.neutral}15` },
}

// ─── Incidents ─────────────────────────────────────────────────────────────

export const INCIDENT_COLUMNS: {
  key: IncidentStatus
  label: string
  icon: typeof AlertCircle
  color: string
}[] = [
  { key: 'open', label: 'Ouvert', icon: AlertCircle, color: STATUS_COLORS.danger },
  { key: 'in-progress', label: 'En cours', icon: Clock, color: STATUS_COLORS.warning },
  { key: 'resolved', label: 'Résolu', icon: CheckCircle2, color: STATUS_COLORS.success },
  { key: 'closed', label: 'Clos', icon: Archive, color: STATUS_COLORS.neutral },
]

export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

// ─── Équipe ────────────────────────────────────────────────────────────────

export const ROLE_COLORS: Record<string, string> = {
  'Régisseur Son': BRAND_COLORS.blue,
  'Régisseur Lumière': BRAND_COLORS.violet,
  'Régisseur Vidéo': BRAND_COLORS.violetHover,
  'Régisseur Plateau': TEXT_COLORS.muted,
  'Responsable Sécurité': TEXT_COLORS.subtle,
}

export const PERMISSION_LABELS: Record<string, string> = {
  sound: 'Son',
  light: 'Lumière',
  video: 'Vidéo',
  set: 'Plateau',
  safety: 'Sécurité',
  rigging: 'Accroche',
  incidents: 'Incidents',
  equipment: 'Équipements',
  admin: 'Administration',
}

export const ROLE_OPTIONS = [
  'Régisseur Son',
  'Régisseur Lumière',
  'Régisseur Vidéo',
  'Régisseur Plateau',
  'Responsable Sécurité',
]

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS)
