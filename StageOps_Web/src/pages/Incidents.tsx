import { useEffect, useRef, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';
import { getSeverityColor, getSeverityLabel, formatRelativeTime } from '../lib/utils';
import { IncidentDetailModal } from '../components/incidents/IncidentDetailModal';
import type { Equipment, Incident, IncidentStatus } from '../lib/types';
import { CheckCircle2, Plus, LayoutGrid, List, ChevronRight, Wrench } from 'lucide-react';
import { INCIDENT_COLUMNS, SEVERITY_ORDER } from '../lib/constants';
import { IncidentCard } from '../components/incidents/IncidentCard';
import { NewIncidentModal } from '../components/incidents/NewIncidentModal';
import { getIncidents, updateIncident } from '../services/incidents.service';
import { getEquipment } from '../services/equipment.service';

const columns = INCIDENT_COLUMNS;

export function Incidents() {
  usePageTitle('Incidents');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [dragOverCol, setDragOverCol] = useState<IncidentStatus | null>(null);
  const draggedId = useRef<string | null>(null);

  useEffect(() => {
    void loadIncidents();
    void getEquipment().then(setEquipmentList).catch(() => {});
  }, []);

  async function loadIncidents() {
    const items = await getIncidents();
    setAllIncidents(items);
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    draggedId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, status: IncidentStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  }

  async function handleDrop(e: React.DragEvent, status: IncidentStatus) {
    e.preventDefault();
    setDragOverCol(null);
    const id = draggedId.current;
    if (!id) return;
    draggedId.current = null;
    const incident = allIncidents.find((i) => i.id === id);
    if (!incident || incident.status === status) return;
    // Optimistic update
    setAllIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      // Backend requires full object (title + severity are mandatory)
      await updateIncident(id, { ...incident, status });
    } catch {
      // Revert on error
      setAllIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status: incident.status } : i)));
    }
  }

  const filtered = filterSeverity ? allIncidents.filter((i) => i.severity === filterSeverity) : allIncidents;
  const getByStatus = (status: IncidentStatus) => filtered.filter((i) => i.status === status);

  const openCount = allIncidents.filter((i) => i.status === 'open').length;
  const inProgressCount = allIncidents.filter((i) => i.status === 'in-progress').length;
  const criticalCount = allIncidents.filter((i) => i.severity === 'critical' || i.severity === 'high').length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-content-primary mb-2">Incidents & Maintenance</h1>
          <p className="text-content-muted">
            {openCount} ouvert{openCount > 1 ? 's' : ''} · {inProgressCount} en cours · {criticalCount} critique
            {criticalCount > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-theme-elevated rounded-xl p-1 border border-theme-border">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'kanban' ? 'bg-cyan-400/15 text-cyan-400' : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <LayoutGrid size={16} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'list' ? 'bg-cyan-400/15 text-cyan-400' : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <List size={16} /> Liste
            </button>
          </div>

          <div className="flex bg-theme-elevated rounded-xl p-1 border border-theme-border">
            <button
              onClick={() => setFilterSeverity(null)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                !filterSeverity ? 'bg-cyan-400/15 text-cyan-400' : 'text-content-muted hover:text-content-primary'
              }`}
            >
              Tous
            </button>
            {(['critical', 'high', 'medium', 'low'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(filterSeverity === s ? null : s)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  filterSeverity === s ? 'bg-cyan-400/15 text-cyan-400' : 'text-content-muted hover:text-content-primary'
                }`}
              >
                {getSeverityLabel(s)}
              </button>
            ))}
          </div>

          <Button variant="primary" onClick={() => setShowNewForm(true)}>
            <Plus size={16} /> Signaler
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => {
          const count = allIncidents.filter((i) => i.status === col.key).length;
          const Icon = col.icon;
          return (
            <div key={col.key} className="flex items-center gap-3 p-4 bg-theme-base border border-theme-border rounded-2xl">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${col.color}15` }}>
                <Icon size={18} style={{ color: col.color }} />
              </div>
              <div>
                <span className="text-2xl text-content-primary">{count}</span>
                <p className="text-xs text-content-subtle">{col.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-4 gap-4">
          {columns.map((col) => {
            const items = getByStatus(col.key);
            const Icon = col.icon;
            const isOver = dragOverCol === col.key;
            return (
              <div
                key={col.key}
                className="space-y-3"
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => void handleDrop(e, col.key)}
              >
                <div className="flex items-center gap-2 px-2 py-2">
                  <Icon size={16} style={{ color: col.color }} />
                  <span className="text-sm text-content-primary">{col.label}</span>
                  <span className="ml-auto text-xs text-content-subtle bg-theme-elevated px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div
                  className={`space-y-2 min-h-[80px] rounded-xl p-1 transition-colors ${isOver ? 'bg-cyan-400/5 ring-1 ring-cyan-400/30' : ''}`}
                >
                  {items.map((inc) => (
                    <IncidentCard
                      key={inc.id}
                      incident={inc}
                      onClick={() => setSelectedIncident(inc)}
                      onDragStart={(e) => handleDragStart(e, inc.id)}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className={`flex flex-col items-center justify-center py-8 transition-colors ${isOver ? 'text-cyan-400/60' : 'text-content-subtle'}`}>
                      <CheckCircle2 size={24} className="mb-2 opacity-40" />
                      <p className="text-xs">{isOver ? 'Déposer ici' : 'Aucun incident'}</p>
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
              .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4))
              .map((inc) => {
                const sevColor = getSeverityColor(inc.severity);
                const statusCol = columns.find((c) => c.key === inc.status);
                const equipmentName = '—';

                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-xl hover:bg-theme-elevated transition-colors"
                  >
                    <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: sevColor }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-content-primary truncate block">{inc.title}</span>
                      <div className="flex items-center gap-3 text-xs text-content-subtle mt-0.5">
                        <span>{formatRelativeTime(inc.timestamp)}</span>
                        <span className="flex items-center gap-1">
                          <Wrench size={10} /> {equipmentName}
                        </span>
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
                    <ChevronRight size={14} className="text-content-subtle shrink-0" />
                  </button>
                );
              })}
          </div>
        </Card>
      )}

      {selectedIncident && <IncidentDetailModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />}
      {showNewForm && (
        <NewIncidentModal
          onClose={() => setShowNewForm(false)}
          onAdd={(i) => setAllIncidents((prev) => [i, ...prev])}
          equipmentList={equipmentList}
        />
      )}
    </div>
  );
}
