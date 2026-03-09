import { useEffect } from 'react';
import { Button } from '@/components/design-system/Button';
import { mockEquipment } from '@/lib/mockData';
import { getSeverityColor, getSeverityLabel, formatRelativeTime } from '@/lib/utils';
import type { Incident } from '@/lib/types';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  CheckCircle2,
  Wrench,
  X,
  ArrowUpRight,
} from 'lucide-react';

const statusLabels: Record<string, { label: string; color: string }> = {
  open: { label: 'Ouvert', color: '#ef4444' },
  'in-progress': { label: 'En cours', color: '#f59e0b' },
  resolved: { label: 'Résolu', color: '#22c55e' },
  closed: { label: 'Clos', color: '#71717a' },
};

export function IncidentDetailModal({
  incident,
  onClose,
}: {
  incident: Incident;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(true);
  const sevColor = getSeverityColor(incident.severity);
  const statusCol = statusLabels[incident.status];
  const eq = incident.equipmentId
    ? mockEquipment.find((e) => e.id === incident.equipmentId)
    : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-modal-title"
        className="w-full max-w-2xl bg-theme-base border border-theme-border rounded-2xl shadow-2xl shadow-black/50 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-theme-base flex items-center justify-between px-8 py-5 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-8 rounded-full"
              style={{ backgroundColor: sevColor }}
            />
            <h2 id="incident-modal-title" className="text-lg text-content-primary">Détail de l'incident</h2>
          </div>
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-theme-border text-content-subtle hover:text-content-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${sevColor}15`,
                color: sevColor,
                border: `1px solid ${sevColor}30`,
              }}
            >
              {getSeverityLabel(incident.severity)}
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${statusCol.color}15`,
                color: statusCol.color,
                border: `1px solid ${statusCol.color}30`,
              }}
            >
              {statusCol.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl text-content-primary">{incident.title}</h3>

          {/* Description */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-content-muted leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Info grid */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">
              Informations
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-theme-elevated rounded-xl">
                <p className="text-[10px] text-content-subtle mb-1">Signalé par</p>
                <p className="text-sm text-content-primary">{incident.reportedBy}</p>
              </div>
              <div className="p-4 bg-theme-elevated rounded-xl">
                <p className="text-[10px] text-content-subtle mb-1">
                  Date du signalement
                </p>
                <p className="text-sm text-content-primary">
                  {formatRelativeTime(incident.timestamp)}
                </p>
              </div>
              {incident.resolvedAt && (
                <>
                  <div className="p-4 bg-theme-elevated rounded-xl">
                    <p className="text-[10px] text-content-subtle mb-1">Résolu le</p>
                    <p className="text-sm text-content-primary">
                      {formatRelativeTime(incident.resolvedAt)}
                    </p>
                  </div>
                  <div className="p-4 bg-theme-elevated rounded-xl">
                    <p className="text-[10px] text-content-subtle mb-1">
                      Durée de résolution
                    </p>
                    <p className="text-sm text-content-primary">
                      {Math.round(
                        (incident.resolvedAt.getTime() -
                          incident.timestamp.getTime()) /
                          3600000
                      )}
                      h
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Linked equipment */}
          {eq && (
            <div>
              <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">
                Équipement concerné
              </p>
              <div className="flex items-center gap-4 p-4 bg-theme-elevated border border-theme-border rounded-xl">
                <div className="p-2.5 bg-[#27272e] rounded-lg">
                  <Wrench size={18} className="text-content-muted" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-content-primary">{eq.name}</p>
                  <p className="text-xs text-content-subtle mt-0.5">
                    {eq.location}
                    {eq.zone ? ` · ${eq.zone}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resolution notes */}
          {incident.resolutionNotes && (
            <div>
              <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">
                Résolution
              </p>
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <p className="text-xs text-green-400">Résolu</p>
                </div>
                <p className="text-sm text-content-muted leading-relaxed">
                  {incident.resolutionNotes}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">
              Historique
            </p>
            <div className="space-y-0">
              <TimelineItem
                color={sevColor}
                label={`Incident signalé par ${incident.reportedBy}`}
                time={formatRelativeTime(incident.timestamp)}
              />
              {incident.status === 'in-progress' && (
                <TimelineItem
                  color="#f59e0b"
                  label="Prise en charge"
                  time="En cours"
                />
              )}
              {incident.resolvedAt && (
                <TimelineItem
                  color="#22c55e"
                  label="Incident résolu"
                  time={formatRelativeTime(incident.resolvedAt)}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-theme-border">
            {incident.status === 'open' && (
              <Button variant="primary" className="flex-1" onClick={onClose}>
                <ArrowUpRight size={16} />
                Prendre en charge
              </Button>
            )}
            {incident.status === 'in-progress' && (
              <Button variant="primary" className="flex-1" onClick={onClose}>
                <CheckCircle2 size={16} />
                Marquer résolu
              </Button>
            )}
            {(incident.status === 'open' ||
              incident.status === 'in-progress') && (
              <Button variant="secondary" onClick={onClose}>
                Escalader
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  color,
  label,
  time,
}: {
  color: string;
  label: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex flex-col items-center mt-1">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="w-px h-6 bg-[#27272e]" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-content-primary">{label}</p>
        <p className="text-xs text-content-subtle">{time}</p>
      </div>
    </div>
  );
}
