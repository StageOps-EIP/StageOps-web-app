import { EquipmentStatus, IncidentSeverity } from './types';

export function getStatusColor(status: EquipmentStatus): string {
  switch (status) {
    case 'ok':
      return '#22c55e';
    case 'to-check':
      return '#f59e0b';
    case 'hs':
      return '#ef4444';
    case 'repair':
      return '#8b5cf6';
    default:
      return '#71717a';
  }
}

export function getStatusLabel(status: EquipmentStatus): string {
  switch (status) {
    case 'ok':
      return 'OK';
    case 'to-check':
      return 'À vérifier';
    case 'hs':
      return 'HS';
    case 'repair':
      return 'En réparation';
    default:
      return status;
  }
}

export function getSeverityColor(severity: IncidentSeverity): string {
  switch (severity) {
    case 'low':
      return '#22c55e';
    case 'medium':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    case 'critical':
      return '#dc2626';
    default:
      return '#71717a';
  }
}

export function getSeverityLabel(severity: IncidentSeverity): string {
  switch (severity) {
    case 'low':
      return 'Faible';
    case 'medium':
      return 'Moyenne';
    case 'high':
      return 'Élevée';
    case 'critical':
      return 'Critique';
    default:
      return severity;
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
  };
  return labels[category] || category;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    sound: '🔊',
    light: '💡',
    video: '📺',
    set: '🎭',
    safety: '🦺',
    rigging: '⚙️',
  };
  return icons[category] || '📦';
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
