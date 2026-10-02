import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card } from '../components/design-system/Card'
import { Button } from '../components/design-system/Button'
import { DemoNotice, PageHeader } from '@/components/design-system/PageHeader'
import { useDemoData } from '@/hooks/useDemoData'
import { getSeverityColor, getSeverityLabel, formatRelativeTime } from '../lib/utils'
import { IncidentDetailModal } from '../components/incidents/IncidentDetailModal'
import type { Incident, IncidentStatus } from '../lib/types'
import { INCIDENT_COLUMNS, SEVERITY_ORDER } from '../lib/constants'
import { IncidentCard } from '../components/incidents/IncidentCard'
import { NewIncidentModal } from '../components/incidents/NewIncidentModal'
import { toast } from 'sonner'

const columns = INCIDENT_COLUMNS

export function Incidents() {
  usePageTitle('Incidents')
  const [searchParams, setSearchParams] = useSearchParams()
  const { equipment, incidents, addIncident, updateIncident } = useDemoData()
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const requestedIncident =
    incidents.find((incident) => incident.id === searchParams.get('incident')) ?? null
  const activeIncident = selectedIncident ?? requestedIncident

  const filtered = filterSeverity
    ? incidents.filter((i) => i.severity === filterSeverity)
    : incidents

  const getByStatus = (status: IncidentStatus) => filtered.filter((i) => i.status === status)

  const openCount = incidents.filter((i) => i.status === 'open').length
  const inProgressCount = incidents.filter((i) => i.status === 'in-progress').length
  const criticalCount = incidents.filter(
    (i) => i.severity === 'critical' || i.severity === 'high',
  ).length

  return (
    <div className="page-shell space-y-5">
      <PageHeader
        context="Théâtre National"
        title="Incidents et maintenance"
        description={
          <>
            {openCount} ouvert{openCount > 1 ? 's' : ''} · {inProgressCount} en cours ·{' '}
            {criticalCount} critique{criticalCount > 1 ? 's' : ''}
          </>
        }
        actions={
          <>
            <div className="segmented-control">
              <button onClick={() => setViewMode('kanban')} aria-pressed={viewMode === 'kanban'}>
                Kanban
              </button>
              <button onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}>
                Liste
              </button>
            </div>

            <Button variant="primary" onClick={() => setShowNewForm(true)}>
              Signaler un incident
            </Button>
          </>
        }
      />
      <DemoNotice />

      <div className="toolbar">
        <span className="text-sm font-medium text-content-muted">Priorité</span>
        <div className="segmented-control overflow-x-auto">
          <button onClick={() => setFilterSeverity(null)} aria-pressed={!filterSeverity}>
            Toutes
          </button>
          {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(filterSeverity === severity ? null : severity)}
              aria-pressed={filterSeverity === severity}
            >
              {getSeverityLabel(severity)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-content-subtle">
          {filtered.length} incident{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {viewMode === 'kanban' ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {columns.map((col) => {
            const items = getByStatus(col.key)
            return (
              <section key={col.key} className="work-register min-w-0">
                <div className="flex min-h-10 items-center gap-2 border-b border-theme-border px-3 py-2">
                  <span
                    className="h-3 w-0.5"
                    style={{ backgroundColor: col.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-content-primary">{col.label}</span>
                  <span className="ml-auto border-l border-theme-border pl-2 text-xs text-content-subtle">
                    {items.length}
                  </span>
                </div>
                <div>
                  {items.map((inc) => (
                    <IncidentCard
                      key={inc.id}
                      incident={inc}
                      equipment={equipment.find((item) => item.id === inc.equipmentId)}
                      onClick={() => setSelectedIncident(inc)}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-content-subtle">
                      <p className="text-xs">Aucun incident</p>
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="space-y-1">
            {filtered
              .slice()
              .sort((a, b) => {
                return (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4)
              })
              .map((inc) => {
                const sevColor = getSeverityColor(inc.severity)
                const statusCol = columns.find((c) => c.key === inc.status)
                const eq = inc.equipmentId
                  ? equipment.find((item) => item.id === inc.equipmentId)
                  : null
                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="work-row flex w-full items-center gap-4 p-3 text-left transition-colors hover:bg-theme-elevated"
                  >
                    <div className="h-10 w-0.5 shrink-0" style={{ backgroundColor: sevColor }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-content-primary truncate block">
                        {inc.title}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-content-subtle mt-0.5">
                        <span>{formatRelativeTime(inc.timestamp)}</span>
                        {eq && <span>Matériel · {eq.name}</span>}
                        <span>Par {inc.reportedBy}</span>
                      </div>
                    </div>
                    <span
                      className="shrink-0 border-l border-theme-border px-2 py-0.5 text-[10px]"
                      style={{
                        backgroundColor: `${sevColor}15`,
                        color: sevColor,
                      }}
                    >
                      {getSeverityLabel(inc.severity)}
                    </span>
                    <span
                      className="shrink-0 border-l border-theme-border px-2 py-0.5 text-[10px]"
                      style={{
                        backgroundColor: `${statusCol?.color}15`,
                        color: statusCol?.color,
                      }}
                    >
                      {statusCol?.label}
                    </span>
                    <span className="shrink-0 text-content-faint" aria-hidden="true">
                      →
                    </span>
                  </button>
                )
              })}
          </div>
        </Card>
      )}

      {activeIncident && (
        <IncidentDetailModal
          incident={activeIncident}
          equipment={equipment.find((item) => item.id === activeIncident.equipmentId)}
          onClose={() => {
            setSelectedIncident(null)
            if (searchParams.has('incident')) {
              const next = new URLSearchParams(searchParams)
              next.delete('incident')
              setSearchParams(next, { replace: true })
            }
          }}
          onStatusChange={(status) => {
            const resolvedAt = status === 'resolved' ? new Date() : activeIncident.resolvedAt
            updateIncident(activeIncident.id, { status, resolvedAt })
            toast.success('Statut de l’incident mis à jour', {
              description: 'Le registre et le tableau de bord utilisent maintenant la même donnée.',
            })
            setSelectedIncident((current) =>
              current
                ? {
                    ...current,
                    status,
                    resolvedAt,
                  }
                : current,
            )
          }}
        />
      )}
      {showNewForm && (
        <NewIncidentModal
          equipment={equipment}
          onClose={() => setShowNewForm(false)}
          onCreate={(incident) => {
            addIncident(incident)
            setShowNewForm(false)
            toast.success('Incident ajouté au scénario', {
              description: 'Il est enregistré et visible immédiatement dans le tableau de bord.',
            })
          }}
        />
      )}
    </div>
  )
}
