import { Link } from 'react-router'
import { Badge } from '@/components/design-system/Badge'
import { useOperationalData } from '@/hooks/useOperationalData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { mockEvents, mockTeamMembers } from '@/lib/mockData'
import { SEVERITY_ORDER } from '@/lib/constants'
import { formatTime, getSeverityColor, getSeverityLabel } from '@/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function Dashboard() {
  usePageTitle('Vue générale')
  const { equipment, incidents } = useOperationalData()
  const activeEvent = mockEvents[0]
  const upcomingEvents = [...mockEvents].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  )
  const controls = equipment.filter((item) => item.status !== 'ok')
  const openIncidents = incidents
    .filter((incident) => incident.status === 'open' || incident.status === 'in-progress')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  const availableEquipment = equipment.filter((item) => item.status === 'ok').length
  const needsCheck = equipment.filter((item) => item.status === 'to-check').length
  const outOfService = equipment.filter((item) => item.status === 'hs').length

  return (
    <div className="page-shell dashboard-rideau space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-heading">La production en régie</h1>
          <p className="mt-2 text-sm text-content-muted">
            {dateFormatter.format(activeEvent.startDate)} · {activeEvent.venue}, {activeEvent.stage}
          </p>
        </div>
        <Link
          to="/stage"
          className="text-sm font-semibold text-[var(--brand-violet-hover)] hover:underline"
        >
          Ouvrir le plateau 3D
        </Link>
      </header>

      <section
        aria-labelledby="featured-production"
        className="overflow-hidden rounded-xl border border-theme-border bg-theme-base"
      >
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="border-l-[5px] border-[var(--brand-violet)] p-5 sm:p-8">
            <p className="text-xs font-semibold text-[var(--brand-violet-hover)]">
              Production sélectionnée
            </p>
            <h2
              id="featured-production"
              className="mt-2 text-4xl font-bold tracking-tight text-content-primary"
            >
              {activeEvent.title.replace(/ - .+$/, '')}
            </h2>
            <p className="mt-2 text-sm text-content-muted">
              Représentation · {formatTime(activeEvent.startDate)}–{formatTime(activeEvent.endDate)}
            </p>
            <Link
              to="/events"
              className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-theme-border bg-theme-base px-4 text-sm font-semibold text-content-primary hover:bg-theme-elevated"
            >
              Voir le conducteur
            </Link>
          </div>
          <div className="grid grid-cols-2 border-t border-theme-border lg:border-l lg:border-t-0">
            <div className="p-4 sm:p-7">
              <p className="text-sm font-semibold text-content-muted">Préparation</p>
              <p className="mt-3 text-4xl font-bold text-content-primary">
                {activeEvent.checklistProgress}
                <span className="ml-1 text-xl text-content-muted">%</span>
              </p>
              <div
                role="progressbar"
                aria-label="Progression de la checklist"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={activeEvent.checklistProgress}
                className="mt-3 h-2 overflow-hidden rounded-full bg-theme-elevated"
              >
                <div
                  className="h-full rounded-full bg-[#e7a93a]"
                  style={{ width: `${activeEvent.checklistProgress}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-content-muted">Checklist de production</p>
            </div>
            <div className="border-l border-theme-border p-4 sm:p-7">
              <p className="text-sm font-semibold text-content-muted">Repères de la fiche</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-content-muted">Début</dt>
                  <dd className="font-bold text-content-primary">
                    {formatTime(activeEvent.startDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-content-muted">Fin</dt>
                  <dd className="font-bold text-content-primary">
                    {formatTime(activeEvent.endDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-content-muted">Équipe</dt>
                  <dd className="font-bold text-content-primary">
                    {activeEvent.teamMembers.length} / {mockTeamMembers.length}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,1fr)]">
        <section aria-labelledby="action-title" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <h2 id="action-title" className="text-2xl font-bold text-content-primary">
              À traiter maintenant
            </h2>
            <Link
              to="/incidents"
              className="text-sm font-semibold text-[var(--brand-violet-hover)] hover:underline"
            >
              Voir tous les incidents
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-theme-border bg-theme-base">
            {openIncidents.length ? (
              openIncidents.slice(0, 3).map((incident) => (
                <Link
                  key={incident.id}
                  to={`/incidents?incident=${incident.id}`}
                  className="grid gap-2 border-b border-theme-border px-5 py-4 transition-colors last:border-b-0 hover:bg-theme-elevated sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: getSeverityColor(incident.severity) }}
                  >
                    {getSeverityLabel(incident.severity)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-content-primary">
                      {incident.title}
                    </span>
                    <span className="mt-1 block text-xs text-content-muted">
                      Signalé par {incident.reportedBy}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-[var(--brand-violet-hover)]">
                    Ouvrir
                  </span>
                </Link>
              ))
            ) : (
              <p className="px-5 py-7 text-sm text-content-muted">
                Aucun incident actif pour cette production.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="schedule-title" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <h2 id="schedule-title" className="text-2xl font-bold text-content-primary">
              Programme enregistré
            </h2>
            <Link
              to="/events"
              className="text-sm font-semibold text-[var(--brand-violet-hover)] hover:underline"
            >
              Voir le planning
            </Link>
          </div>
          <div className="rounded-xl border border-theme-border bg-theme-base px-5">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border-b border-theme-border py-4 last:border-b-0"
              >
                <time
                  dateTime={event.startDate.toISOString()}
                  className="text-sm font-bold text-content-primary"
                >
                  {formatTime(event.startDate)}
                </time>
                <div>
                  <p className="text-sm font-semibold text-content-primary">{event.title}</p>
                  <p className="mt-1 text-xs text-content-muted">
                    {dateFormatter.format(event.startDate)} · {event.stage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,1fr)]">
        <section
          aria-labelledby="equipment-title"
          className="rounded-xl border border-theme-border bg-theme-base p-5"
        >
          <div className="flex items-end justify-between gap-3 border-b border-theme-border pb-3">
            <h2 id="equipment-title" className="text-xl font-bold text-content-primary">
              Matériel
            </h2>
            <Link
              to="/equipment"
              className="text-sm font-semibold text-[var(--brand-violet-hover)] hover:underline"
            >
              Ouvrir le parc
            </Link>
          </div>
          <dl className="grid grid-cols-3 gap-3 pt-4">
            <Stat value={availableEquipment} label="opérationnels" color="text-emerald-800" />
            <Stat value={needsCheck} label="à vérifier" color="text-amber-800" />
            <Stat value={outOfService} label="hors service" color="text-red-800" />
          </dl>
          {controls.length > 0 && (
            <div className="mt-4 border-t border-theme-border pt-3">
              <Link
                to={`/equipment?equipment=${controls[0].id}`}
                className="flex items-center justify-between gap-3 text-sm hover:underline"
              >
                <span className="truncate font-medium text-content-primary">
                  {controls[0].name}
                </span>
                <Badge status={controls[0].status} size="sm" />
              </Link>
            </div>
          )}
        </section>
        <section
          aria-labelledby="stage-title"
          className="rounded-xl border border-theme-border bg-theme-base p-5"
        >
          <div className="flex items-end justify-between gap-3 border-b border-theme-border pb-3">
            <h2 id="stage-title" className="text-xl font-bold text-content-primary">
              Plateau 3D
            </h2>
            <Link
              to="/stage"
              className="text-sm font-semibold text-[var(--brand-violet-hover)] hover:underline"
            >
              Ouvrir
            </Link>
          </div>
          <p className="pt-4 text-sm text-content-muted">
            Visualisez la scène enregistrée et ouvrez l’éditeur pour la modifier.
          </p>
        </section>
      </div>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <dt className="mt-1 text-xs text-content-muted">{label}</dt>
      <dd className={`text-3xl font-bold ${color}`}>{value}</dd>
    </div>
  )
}
