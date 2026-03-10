import { useState } from "react";
import {
  Card,
  CardHeader,
} from "../components/design-system/Card";
import { Button } from "../components/design-system/Button";
import { mockIncidents, mockEquipment } from "../lib/mockData";
import {
  getSeverityColor,
  getSeverityLabel,
  formatRelativeTime,
} from "../lib/utils";
import { IncidentDetailModal } from "../components/IncidentDetailModal";
import type { Incident, IncidentStatus } from "../lib/types";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Archive,
  Plus,
  LayoutGrid,
  List,
  ChevronRight,
  Wrench,
  X,
} from "lucide-react";

const columns: {
  key: IncidentStatus;
  label: string;
  icon: typeof AlertCircle;
  color: string;
}[] = [
  {
    key: "open",
    label: "Ouvert",
    icon: AlertCircle,
    color: "#ef4444",
  },
  {
    key: "in-progress",
    label: "En cours",
    icon: Clock,
    color: "#f59e0b",
  },
  {
    key: "resolved",
    label: "Résolu",
    icon: CheckCircle2,
    color: "#22c55e",
  },
  {
    key: "closed",
    label: "Clos",
    icon: Archive,
    color: "#71717a",
  },
];

const allIncidents: Incident[] = [
  ...mockIncidents,
  {
    id: "inc-006",
    title: "Fuite hydraulique praticable mobile",
    description:
      "Fuite détectée au niveau du vérin gauche du praticable mobile. Zone sécurisée.",
    severity: "critical",
    status: "open",
    equipmentId: "eq-005",
    reportedBy: "Jean Moreau",
    timestamp: new Date("2026-02-11T11:00:00"),
  },
  {
    id: "inc-007",
    title: "Câble DMX défaillant perche 3",
    description:
      "Signal DMX intermittent sur la perche 3 côté Cour. Câble à remplacer.",
    severity: "medium",
    status: "in-progress",
    equipmentId: "eq-008",
    reportedBy: "Thomas Dubois",
    timestamp: new Date("2026-02-11T07:30:00"),
  },
  {
    id: "inc-008",
    title: "Batterie radio HF faible",
    description:
      "Batteries des micros HF tombent sous 30% après 2h. Remplacement préventif.",
    severity: "low",
    status: "resolved",
    reportedBy: "Marie Lambert",
    timestamp: new Date("2026-02-09T20:00:00"),
    resolvedAt: new Date("2026-02-10T08:00:00"),
    resolutionNotes:
      "Batteries remplacées. Lot de 12 neuves en stock.",
  },
];

export function Incidents() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">(
    "kanban",
  );
  const [filterSeverity, setFilterSeverity] = useState<
    string | null
  >(null);
  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const filtered = filterSeverity
    ? allIncidents.filter((i) => i.severity === filterSeverity)
    : allIncidents;

  const getByStatus = (status: IncidentStatus) =>
    filtered.filter((i) => i.status === status);

  const openCount = allIncidents.filter(
    (i) => i.status === "open",
  ).length;
  const inProgressCount = allIncidents.filter(
    (i) => i.status === "in-progress",
  ).length;
  const criticalCount = allIncidents.filter(
    (i) => i.severity === "critical" || i.severity === "high",
  ).length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#f5f5f7] mb-2">
            Incidents & Maintenance
          </h1>
          <p className="text-[#a1a1aa]">
            {openCount} ouvert{openCount > 1 ? "s" : ""} ·{" "}
            {inProgressCount} en cours · {criticalCount}{" "}
            critique{criticalCount > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#1c1c21] rounded-xl p-1 border border-[#27272e]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === "kanban"
                  ? "bg-cyan-400/15 text-cyan-400"
                  : "text-[#a1a1aa] hover:text-[#f5f5f7]"
              }`}
            >
              <LayoutGrid size={16} /> Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === "list"
                  ? "bg-cyan-400/15 text-cyan-400"
                  : "text-[#a1a1aa] hover:text-[#f5f5f7]"
              }`}
            >
              <List size={16} /> Liste
            </button>
          </div>

          <div className="flex bg-[#1c1c21] rounded-xl p-1 border border-[#27272e]">
            <button
              onClick={() => setFilterSeverity(null)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                !filterSeverity
                  ? "bg-cyan-400/15 text-cyan-400"
                  : "text-[#a1a1aa] hover:text-[#f5f5f7]"
              }`}
            >
              Tous
            </button>
            {(
              ["critical", "high", "medium", "low"] as const
            ).map((s) => (
              <button
                key={s}
                onClick={() =>
                  setFilterSeverity(
                    filterSeverity === s ? null : s,
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  filterSeverity === s
                    ? "bg-cyan-400/15 text-cyan-400"
                    : "text-[#a1a1aa] hover:text-[#f5f5f7]"
                }`}
              >
                {getSeverityLabel(s)}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={() => setShowNewForm(true)}
          >
            <Plus size={16} /> Signaler
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => {
          const count = allIncidents.filter(
            (i) => i.status === col.key,
          ).length;
          const Icon = col.icon;
          return (
            <div
              key={col.key}
              className="flex items-center gap-3 p-4 bg-[#131316] border border-[#27272e] rounded-2xl"
            >
              <div
                className="p-2.5 rounded-xl"
                style={{ backgroundColor: `${col.color}15` }}
              >
                <Icon size={18} style={{ color: col.color }} />
              </div>
              <div>
                <span className="text-2xl text-[#f5f5f7]">
                  {count}
                </span>
                <p className="text-xs text-[#71717a]">
                  {col.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {viewMode === "kanban" ? (
        <div className="grid grid-cols-4 gap-4">
          {columns.map((col) => {
            const items = getByStatus(col.key);
            const Icon = col.icon;
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2 px-2 py-2">
                  <Icon
                    size={16}
                    style={{ color: col.color }}
                  />
                  <span className="text-sm text-[#f5f5f7]">
                    {col.label}
                  </span>
                  <span className="ml-auto text-xs text-[#71717a] bg-[#1c1c21] px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((inc) => (
                    <IncidentCard
                      key={inc.id}
                      incident={inc}
                      onClick={() => setSelectedIncident(inc)}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-[#71717a]">
                      <CheckCircle2
                        size={24}
                        className="mb-2 opacity-40"
                      />
                      <p className="text-xs">Aucun incident</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="space-y-1">
            {filtered
              .sort((a, b) => {
                const order: Record<string, number> = {
                  critical: 0,
                  high: 1,
                  medium: 2,
                  low: 3,
                };
                return (
                  (order[a.severity] ?? 4) -
                  (order[b.severity] ?? 4)
                );
              })
              .map((inc) => {
                const sevColor = getSeverityColor(inc.severity);
                const statusCol = columns.find(
                  (c) => c.key === inc.status,
                );
                const eq = inc.equipmentId
                  ? mockEquipment.find(
                      (e) => e.id === inc.equipmentId,
                    )
                  : null;
                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-xl hover:bg-[#1c1c21] transition-colors"
                  >
                    <div
                      className="w-1.5 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: sevColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#f5f5f7] truncate block">
                        {inc.title}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-[#71717a] mt-0.5">
                        <span>
                          {formatRelativeTime(inc.timestamp)}
                        </span>
                        {eq && (
                          <span className="flex items-center gap-1">
                            <Wrench size={10} /> {eq.name}
                          </span>
                        )}
                        <span>Par {inc.reportedBy}</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${sevColor}15`,
                        color: sevColor,
                      }}
                    >
                      {getSeverityLabel(inc.severity)}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${statusCol?.color}15`,
                        color: statusCol?.color,
                      }}
                    >
                      {statusCol?.label}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-[#71717a] shrink-0"
                    />
                  </button>
                );
              })}
          </div>
        </Card>
      )}

      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
      {showNewForm && (
        <NewIncidentModal
          onClose={() => setShowNewForm(false)}
        />
      )}
    </div>
  );
}

function IncidentCard({
  incident,
  onClick,
}: {
  incident: Incident;
  onClick: () => void;
}) {
  const sevColor = getSeverityColor(incident.severity);
  const eq = incident.equipmentId
    ? mockEquipment.find((e) => e.id === incident.equipmentId)
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-[#131316] border border-[#27272e] rounded-xl hover:bg-[#1c1c21] hover:border-[#35353e] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm text-[#f5f5f7] line-clamp-2">
          {incident.title}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 mt-0.5"
          style={{
            backgroundColor: `${sevColor}15`,
            color: sevColor,
          }}
        >
          {getSeverityLabel(incident.severity)}
        </span>
      </div>
      <p className="text-xs text-[#71717a] line-clamp-2 mb-3">
        {incident.description}
      </p>
      <div className="flex items-center justify-between">
        {eq && (
          <span className="text-[10px] text-[#a1a1aa] flex items-center gap-1">
            <Wrench size={10} /> {eq.name}
          </span>
        )}
        <span className="text-[10px] text-[#71717a] ml-auto">
          {formatRelativeTime(incident.timestamp)}
        </span>
      </div>
    </button>
  );
}

function NewIncidentModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#27272e] text-[#71717a] hover:text-[#f5f5f7] transition-colors"
        >
          <X size={16} />
        </button>
        <h2 className="text-xl text-[#f5f5f7] mb-6">
          Signaler un incident
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">
              Titre
            </label>
            <input
              type="text"
              placeholder="Ex: Panne projecteur perche 2"
              className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50"
            />
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Décrivez le problème en détail..."
              className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">
                Sévérité
              </label>
              <select className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="critical">Critique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">
                Équipement
              </label>
              <select className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
                <option value="">Aucun</option>
                {mockEquipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name}
                  </option>
                ))}
              </select>
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
  );
}