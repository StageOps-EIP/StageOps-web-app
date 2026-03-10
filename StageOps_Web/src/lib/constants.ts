import type { Event, IncidentStatus } from './types';
import { AlertCircle, Clock, CheckCircle2, Archive } from 'lucide-react';

// ─── Localisation française ────────────────────────────────────────────────

export const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// ─── Événements ────────────────────────────────────────────────────────────

export const EVENT_STATUS_CONFIG: Record<Event['status'], { label: string; color: string; bg: string }> = {
  planning:  { label: 'Planification', color: '#f59e0b', bg: '#f59e0b15' },
  setup:     { label: 'Installation',  color: '#3b82f6', bg: '#3b82f615' },
  running:   { label: 'En cours',      color: '#22c55e', bg: '#22c55e15' },
  strike:    { label: 'Démontage',     color: '#a855f7', bg: '#a855f715' },
  completed: { label: 'Terminé',       color: '#71717a', bg: '#71717a15' },
};

// ─── Incidents ─────────────────────────────────────────────────────────────

export const INCIDENT_COLUMNS: {
  key: IncidentStatus;
  label: string;
  icon: typeof AlertCircle;
  color: string;
}[] = [
  { key: 'open',        label: 'Ouvert',   icon: AlertCircle,  color: '#ef4444' },
  { key: 'in-progress', label: 'En cours', icon: Clock,        color: '#f59e0b' },
  { key: 'resolved',    label: 'Résolu',   icon: CheckCircle2, color: '#22c55e' },
  { key: 'closed',      label: 'Clos',     icon: Archive,      color: '#71717a' },
];

export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ─── Équipe ────────────────────────────────────────────────────────────────

export const ROLE_COLORS: Record<string, string> = {
  'Régisseur Son':       '#3b82f6',
  'Régisseur Lumière':   '#f59e0b',
  'Régisseur Vidéo':     '#a855f7',
  'Régisseur Plateau':   '#22c55e',
  'Responsable Sécurité':'#ef4444',
};

export const PERMISSION_LABELS: Record<string, string> = {
  sound:     'Son',
  light:     'Lumière',
  video:     'Vidéo',
  set:       'Plateau',
  safety:    'Sécurité',
  rigging:   'Accroche',
  incidents: 'Incidents',
  equipment: 'Équipements',
  admin:     'Administration',
};

export const ROLE_OPTIONS = [
  'Régisseur Son',
  'Régisseur Lumière',
  'Régisseur Vidéo',
  'Régisseur Plateau',
  'Responsable Sécurité',
];

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS);
