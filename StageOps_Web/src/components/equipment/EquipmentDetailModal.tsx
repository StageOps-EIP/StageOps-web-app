import { useState, useEffect } from 'react';
import { Button } from '@/components/design-system/Button';
import { CategoryIcon } from '@/components/design-system/Badge';
import { getStatusColor, getCategoryLabel, formatRelativeTime, formatDateTime } from '@/lib/utils';
import type { Equipment, EquipmentStatus } from '@/lib/types';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  X,
  MapPin,
  QrCode,
  User,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Tag,
} from 'lucide-react';

const statusOptions: { value: EquipmentStatus; label: string; color: string }[] = [
  { value: 'ok', label: 'OK', color: '#22c55e' },
  { value: 'to-check', label: 'À vérifier', color: '#f59e0b' },
  { value: 'hs', label: 'HS', color: '#ef4444' },
  { value: 'repair', label: 'En réparation', color: '#8b5cf6' },
];

export function EquipmentDetailModal({
  equipment,
  onClose,
  onSave,
}: {
  equipment: Equipment;
  onClose: () => void;
  onSave?: (updated: Equipment) => void;
}) {
  const [editedStatus, setEditedStatus] = useState<EquipmentStatus>(equipment.status);
  const [editedLocation, setEditedLocation] = useState(equipment.location);
  const [editedZone, setEditedZone] = useState(equipment.zone ?? '');
  const [editedResponsible, setEditedResponsible] = useState(equipment.responsiblePerson ?? '');
  const [editedNotes, setEditedNotes] = useState(equipment.notes ?? '');
  const [isSaved, setIsSaved] = useState(false);
  const trapRef = useFocusTrap(true);

  const statusColor = getStatusColor(editedStatus);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const hasChanges =
    editedStatus !== equipment.status ||
    editedLocation !== equipment.location ||
    editedZone !== (equipment.zone ?? '') ||
    editedResponsible !== (equipment.responsiblePerson ?? '') ||
    editedNotes !== (equipment.notes ?? '');

  function handleSave() {
    const updated: Equipment = {
      ...equipment,
      status: editedStatus,
      location: editedLocation,
      zone: editedZone || undefined,
      responsiblePerson: editedResponsible || undefined,
      notes: editedNotes || undefined,
      lastCheck: new Date(),
    };
    onSave?.(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }

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
        aria-labelledby="equipment-detail-title"
        className="w-full max-w-2xl bg-theme-base border border-theme-border rounded-2xl shadow-2xl shadow-black/50 max-h-[85vh] overflow-y-auto"
      >

        {/* Header */}
        <div className="sticky top-0 z-10 bg-theme-base flex items-center justify-between px-8 py-5 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-8 rounded-full transition-colors duration-300"
              style={{ backgroundColor: statusColor }}
            />
            <div>
              <h2 id="equipment-detail-title" className="text-lg font-semibold text-content-primary">Détail équipement</h2>
              <p className="text-xs text-content-subtle">{equipment.qrCode}</p>
            </div>
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

          {/* Nom & catégorie */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-theme-elevated rounded-xl flex items-center justify-center text-cyan-400">
              <CategoryIcon category={equipment.category} size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-content-primary">{equipment.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Tag size={12} className="text-content-subtle" />
                <span className="text-sm text-content-muted">{getCategoryLabel(equipment.category)}</span>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Statut</p>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEditedStatus(opt.value)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200"
                  style={
                    editedStatus === opt.value
                      ? {
                          backgroundColor: `${opt.color}20`,
                          borderColor: `${opt.color}60`,
                          color: opt.color,
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: '#27272e',
                          color: '#71717a',
                        }
                  }
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: editedStatus === opt.value ? opt.color : '#71717a' }}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Informations */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Informations</p>
            <div className="grid grid-cols-2 gap-3">

              {/* Emplacement */}
              <div className="p-4 bg-theme-elevated rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={12} className="text-content-subtle" />
                  <p className="text-[10px] text-content-subtle uppercase tracking-wider">Emplacement</p>
                </div>
                <input
                  type="text"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                  aria-label="Emplacement"
                  className="w-full bg-transparent text-sm text-content-primary border-b border-theme-border focus:border-cyan-400 focus:outline-none pb-0.5 transition-colors"
                />
              </div>

              {/* Zone */}
              <div className="p-4 bg-theme-elevated rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={12} className="text-content-subtle" />
                  <p className="text-[10px] text-content-subtle uppercase tracking-wider">Zone</p>
                </div>
                <input
                  type="text"
                  value={editedZone}
                  onChange={(e) => setEditedZone(e.target.value)}
                  placeholder="—"
                  aria-label="Zone"
                  className="w-full bg-transparent text-sm text-content-primary placeholder-[#35353e] border-b border-theme-border focus:border-cyan-400 focus:outline-none pb-0.5 transition-colors"
                />
              </div>

              {/* Responsable */}
              <div className="p-4 bg-theme-elevated rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <User size={12} className="text-content-subtle" />
                  <p className="text-[10px] text-content-subtle uppercase tracking-wider">Responsable</p>
                </div>
                <input
                  type="text"
                  value={editedResponsible}
                  onChange={(e) => setEditedResponsible(e.target.value)}
                  placeholder="—"
                  aria-label="Responsable"
                  className="w-full bg-transparent text-sm text-content-primary placeholder-[#35353e] border-b border-theme-border focus:border-cyan-400 focus:outline-none pb-0.5 transition-colors"
                />
              </div>

              {/* Dernière vérification */}
              <div className="p-4 bg-theme-elevated rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock size={12} className="text-content-subtle" />
                  <p className="text-[10px] text-content-subtle uppercase tracking-wider">Dernière vérif.</p>
                </div>
                <p className="text-sm text-content-primary">
                  {equipment.lastCheck ? formatRelativeTime(equipment.lastCheck) : '—'}
                </p>
                {equipment.lastCheck && (
                  <p className="text-[10px] text-content-subtle mt-0.5">
                    {formatDateTime(equipment.lastCheck)}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* QR Code */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">QR Code</p>
            <div className="flex items-center gap-3 p-4 bg-theme-elevated border border-theme-border rounded-xl">
              <div className="p-2.5 bg-[#27272e] rounded-lg">
                <QrCode size={18} className="text-cyan-400" />
              </div>
              <code className="text-sm text-cyan-400 font-mono">{equipment.qrCode}</code>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Notes</p>
            <div className="relative">
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Ajouter une note sur cet équipement..."
                rows={3}
                aria-label="Notes"
                className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-3 text-sm text-content-primary placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 resize-none transition-colors"
              />
              <FileText size={14} className="absolute top-3.5 right-3.5 text-[#35353e] pointer-events-none" />
            </div>
          </div>

          {/* Avertissement HS */}
          {editedStatus === 'hs' && (
            <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-red-400 font-medium">Équipement hors service</p>
                <p className="text-xs text-content-muted mt-1">
                  Cet équipement est marqué HS. Pensez à créer un incident et à notifier le responsable.
                </p>
              </div>
            </div>
          )}

          {/* Avertissement En réparation */}
          {editedStatus === 'repair' && (
            <div className="flex items-start gap-3 p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
              <Wrench size={16} className="text-violet-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-violet-400 font-medium">En cours de réparation</p>
                <p className="text-xs text-content-muted mt-1">
                  Cet équipement est en maintenance. Il ne sera pas disponible jusqu'à sa remise en service.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-theme-border">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 size={16} />
                  Sauvegardé !
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Enregistrer les modifications
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
