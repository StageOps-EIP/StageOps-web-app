import { useEffect } from 'react';
import { AlertCircle, ChevronDown, X } from "lucide-react";
import { Card } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { mockEquipment } from "../../lib/mockData";
import { useFocusTrap } from "../../hooks/useFocusTrap";

export function NewIncidentModal({ onClose }: { onClose: () => void }) {
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={trapRef}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="new-incident-title" className="w-full max-w-lg">
      <Card className="relative">
        <button
          aria-label="Fermer"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-theme-border text-content-subtle hover:text-content-primary transition-colors"
        >
          <X size={16} />
        </button>
        <h2 id="new-incident-title" className="text-xl text-content-primary mb-6">
          Signaler un incident
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="incident-title" className="block text-sm text-content-muted mb-1.5">
              Titre
            </label>
            <input
              id="incident-title"
              type="text"
              placeholder="Ex: Panne projecteur perche 2"
              className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-cyan-400/50"
            />
          </div>
          <div>
            <label htmlFor="incident-description" className="block text-sm text-content-muted mb-1.5">
              Description
            </label>
            <textarea
              id="incident-description"
              rows={3}
              placeholder="Décrivez le problème en détail..."
              className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-cyan-400/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="incident-severity" className="block text-sm text-content-muted mb-1.5">
                Sévérité
              </label>
              <div className="relative">
                <select
                  id="incident-severity"
                  className="w-full px-4 py-2.5 bg-theme-elevated border border-theme-border rounded-xl text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer hover:border-[#52525b] transition-colors appearance-none pr-9 [color-scheme:dark]">
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="critical">Critique</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="incident-equipment" className="block text-sm text-content-muted mb-1.5">
                Équipement
              </label>
              <div className="relative">
                <select
                  id="incident-equipment"
                  className="w-full px-4 py-2.5 bg-theme-elevated border border-theme-border rounded-xl text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer hover:border-[#52525b] transition-colors appearance-none pr-9 [color-scheme:dark]">
                  <option value="">Aucun</option>
                  {mockEquipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="danger" onClick={onClose}>
              <AlertCircle size={16} /> Signaler l'incident
            </Button>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
