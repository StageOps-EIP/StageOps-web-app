import type {
  Equipment,
  EquipmentCategory,
  EquipmentStatus,
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from './types.ts'

type CsvValue = string | number | boolean | Date | null | undefined

const UTF8_BOM = '\uFEFF'
const CSV_SEPARATOR = ';'

const equipmentCategoryLabels: Record<EquipmentCategory, string> = {
  sound: 'Son',
  light: 'Lumière',
  video: 'Vidéo',
  set: 'Plateau',
  safety: 'Sécurité',
  rigging: 'Accroche',
}

const equipmentStatusLabels: Record<EquipmentStatus, string> = {
  ok: 'Opérationnel',
  'to-check': 'À vérifier',
  hs: 'Hors service',
  repair: 'En réparation',
}

const incidentSeverityLabels: Record<IncidentSeverity, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  critical: 'Critique',
}

const incidentStatusLabels: Record<IncidentStatus, string> = {
  open: 'Ouvert',
  'in-progress': 'En cours',
  resolved: 'Résolu',
  closed: 'Clos',
}

function toCsvText(value: CsvValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()

  const text = String(value)

  // Prevent spreadsheet applications from interpreting user-entered text as a formula.
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
}

function escapeCsvCell(value: CsvValue): string {
  const text = toCsvText(value)
  const escaped = text.replaceAll('"', '""')

  return /[;"\r\n]/.test(text) ? `"${escaped}"` : escaped
}

export function serializeCsv(
  headers: readonly string[],
  rows: ReadonlyArray<ReadonlyArray<CsvValue>>,
): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(CSV_SEPARATOR))
  return `${UTF8_BOM}${lines.join('\r\n')}\r\n`
}

export function buildEquipmentCsv(equipment: readonly Equipment[]): string {
  return serializeCsv(
    ['Identifiant', 'Nom', 'Catégorie', 'État', 'Localisation', 'Dernier contrôle'],
    equipment.map((item) => [
      item.qrCode,
      item.name,
      equipmentCategoryLabels[item.category],
      equipmentStatusLabels[item.status],
      [item.location, item.zone].filter(Boolean).join(' — '),
      item.lastCheck,
    ]),
  )
}

export function buildIncidentsCsv(
  incidents: readonly Incident[],
  equipment: readonly Equipment[],
): string {
  const equipmentNames = new Map(equipment.map((item) => [item.id, item.name]))

  return serializeCsv(
    ['Identifiant', 'Titre', 'Priorité', 'Statut', 'Équipement', 'Auteur', 'Horodatage'],
    incidents.map((incident) => [
      incident.id,
      incident.title,
      incidentSeverityLabels[incident.severity],
      incidentStatusLabels[incident.status],
      incident.equipmentId
        ? (equipmentNames.get(incident.equipmentId) ?? 'Équipement inconnu')
        : '',
      incident.reportedBy,
      incident.timestamp,
    ]),
  )
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildCsvFilename(projectName: string, dataset: string, date = new Date()): string {
  return `${slugify(projectName)}_${slugify(dataset)}_${formatLocalDate(date)}.csv`
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
