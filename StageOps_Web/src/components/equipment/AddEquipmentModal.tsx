import { useState, useEffect } from 'react';
import { Button } from '@/components/design-system/Button';
import { CategoryIcon } from '@/components/design-system/Badge';
import type { Equipment, EquipmentStatus, EquipmentCategory } from '@/lib/types';
import { getStatusColor } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  X,
  MapPin,
  User,
  FileText,
  QrCode,
  Plus,
  AlertCircle,
  Wrench,
} from 'lucide-react';

const statusOptions: { value: EquipmentStatus; label: string; color: string }[] = [
  { value: 'ok', label: 'OK', color: '#22c55e' },
  { value: 'to-check', label: 'À vérifier', color: '#f59e0b' },
  { value: 'hs', label: 'HS', color: '#ef4444' },
  { value: 'repair', label: 'En réparation', color: '#8b5cf6' },
];

const categoryOptions: { value: EquipmentCategory; label: string }[] = [
  { value: 'sound', label: 'Son' },
  { value: 'light', label: 'Lumière' },
  { value: 'video', label: 'Vidéo' },
  { value: 'set', label: 'Plateau' },
  { value: 'safety', label: 'Sécurité' },
  { value: 'rigging', label: 'Accroche' },
];

interface FormState {
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  location: string;
  zone: string;
  responsiblePerson: string;
  notes: string;
  qrCode: string;
}

const emptyForm: FormState = {
  name: '',
  category: 'sound',
  status: 'ok',
  location: '',
  zone: '',
  responsiblePerson: '',
  notes: '',
  qrCode: '',
};

function generateQrCode(name: string, category: EquipmentCategory): string {
  const prefix = category.slice(0, 3).toUpperCase();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `QR-${prefix}-${rand}`;
}

function generateId(): string {
  return `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function AddEquipmentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (equipment: Equipment) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const trapRef = useFocusTrap(true);

  const statusColor = getStatusColor(form.status);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Le nom est requis';
    if (!form.location.trim()) newErrors.location = "L'emplacement est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const qrCode = form.qrCode.trim() || generateQrCode(form.name, form.category);
    const newEquipment: Equipment = {
      id: generateId(),
      name: form.name.trim(),
      category: form.category,
      status: form.status,
      location: form.location.trim(),
      zone: form.zone.trim() || undefined,
      responsiblePerson: form.responsiblePerson.trim() || undefined,
      notes: form.notes.trim() || undefined,
      qrCode,
      lastCheck: new Date(),
    };
    onAdd(newEquipment);
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
        aria-labelledby="add-equipment-title"
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
              <h2 id="add-equipment-title" className="text-lg font-semibold text-content-primary">Ajouter un équipement</h2>
              <p className="text-xs text-content-subtle">Nouvel équipement dans l'inventaire</p>
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

          {/* Nom */}
          <div>
            <label htmlFor="equipment-name" className="text-xs text-content-subtle uppercase tracking-wider mb-3 block">Nom de l'équipement *</label>
            <input
              id="equipment-name"
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex : Console Son DiGiCo SD12"
              className={`w-full bg-theme-elevated border rounded-xl px-4 py-3 text-sm text-content-primary placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors ${
                errors.name ? 'border-red-500/60' : 'border-theme-border focus:border-cyan-400/50'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.name}
              </p>
            )}
          </div>

          {/* Catégorie */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Catégorie</p>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set('category', opt.value)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200"
                  style={
                    form.category === opt.value
                      ? {
                          backgroundColor: 'rgba(0,255,255,0.08)',
                          borderColor: 'rgba(0,255,255,0.4)',
                          color: '#00ffff',
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: '#27272e',
                          color: '#71717a',
                        }
                  }
                >
                  <CategoryIcon category={opt.value} size={13} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Statut */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Statut initial</p>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set('status', opt.value)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200"
                  style={
                    form.status === opt.value
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
                    style={{ backgroundColor: form.status === opt.value ? opt.color : '#71717a' }}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Emplacement & Zone */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Localisation</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-theme-elevated rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={12} className="text-content-subtle" />
                  <p className="text-[10px] text-content-subtle uppercase tracking-wider">Emplacement *</p>
                </div>
                <input
                  id="equipment-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Ex : Régie Son"
                  aria-label="Emplacement"
                  className={`w-full bg-transparent text-sm text-content-primary placeholder-[#35353e] border-b focus:outline-none pb-0.5 transition-colors ${
                    errors.location ? 'border-red-500/60' : 'border-theme-border focus:border-cyan-400'
                  }`}
                />
                {errors.location && (
                  <p className="text-[10px] text-red-400 mt-1">{errors.location}</p>
                )}
              </div>

              <div className="p-4 bg-theme-elevated rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={12} className="text-content-subtle" />
                  <p className="text-[10px] text-content-subtle uppercase tracking-wider">Zone</p>
                </div>
                <input
                  type="text"
                  value={form.zone}
                  onChange={(e) => set('zone', e.target.value)}
                  placeholder="Ex : FOH, Jardin…"
                  aria-label="Zone"
                  className="w-full bg-transparent text-sm text-content-primary placeholder-[#35353e] border-b border-theme-border focus:border-cyan-400 focus:outline-none pb-0.5 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Responsable */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Responsable</p>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
              <input
                type="text"
                value={form.responsiblePerson}
                onChange={(e) => set('responsiblePerson', e.target.value)}
                placeholder="Nom du responsable"
                aria-label="Nom du responsable"
                className="w-full bg-theme-elevated border border-theme-border rounded-xl pl-9 pr-4 py-3 text-sm text-content-primary placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors"
              />
            </div>
          </div>

          {/* QR Code */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">QR Code</p>
            <div className="relative">
              <QrCode size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                value={form.qrCode}
                onChange={(e) => set('qrCode', e.target.value)}
                placeholder="Généré automatiquement si vide"
                aria-label="Code QR"
                className="w-full bg-theme-elevated border border-theme-border rounded-xl pl-9 pr-4 py-3 text-sm text-content-primary placeholder-[#35353e] font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors"
              />
            </div>
            <p className="text-[11px] text-content-subtle mt-1.5">
              Laissez vide pour générer un code automatiquement basé sur la catégorie.
            </p>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Notes</p>
            <div className="relative">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Observations, état général, points d'attention..."
                rows={3}
                className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-3 text-sm text-content-primary placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 resize-none transition-colors"
              />
              <FileText size={14} className="absolute top-3.5 right-3.5 text-[#35353e] pointer-events-none" />
            </div>
          </div>

          {/* Avertissements contextuels */}
          {form.status === 'hs' && (
            <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-red-400 font-medium">Équipement hors service</p>
                <p className="text-xs text-content-muted mt-1">
                  Cet équipement sera ajouté comme HS. Pensez à créer un incident associé.
                </p>
              </div>
            </div>
          )}
          {form.status === 'repair' && (
            <div className="flex items-start gap-3 p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
              <Wrench size={16} className="text-violet-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-violet-400 font-medium">En cours de réparation</p>
                <p className="text-xs text-content-muted mt-1">
                  Cet équipement ne sera pas disponible jusqu'à sa remise en service.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-theme-border">
            <Button variant="primary" className="flex-1" onClick={handleSubmit}>
              <Plus size={16} />
              Ajouter l'équipement
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
