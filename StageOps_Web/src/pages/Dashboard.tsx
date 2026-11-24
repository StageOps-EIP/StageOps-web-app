import { ArrowRight, CalendarDays, PackageCheck, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/design-system/Badge'
import { useOperationalData } from '@/hooks/useOperationalData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { mockEvents } from '@/lib/mockData'
import { isActiveIncident, sortIncidentsForAttention } from '@/lib/incident-order'
import { formatTime, getSeverityLabel } from '@/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})

export function Dashboard() {
  usePageTitle('Vue générale')
  const { equipment, incidents } = useOperationalData()
  const events = [...mockEvents].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  const production = events[0]
  const active = sortIncidentsForAttention(incidents.filter(isActiveIncident))
  const urgent = active[0]
  const linkedEquipment = equipment.find((item) => item.id === urgent?.equipmentId)
  const attention = equipment
    .filter((item) => item.status !== 'ok')
    .sort((a, b) => {
      const rank = { hs: 0, repair: 1, 'to-check': 2, ok: 3 }
      return rank[a.status] - rank[b.status]
    })
  const available = equipment.filter((item) => item.status === 'ok').length
  const check = equipment.filter((item) => item.status === 'to-check').length
  const unavailable = equipment.filter((item) => item.status === 'hs' || item.status === 'repair').length

  return (
    <div className="page-shell dashboard-rideau space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="page-heading">Vue générale</h1>
          <p className="mt-2 text-base text-content-muted">Les points à suivre pour préparer la régie.</p>
        </div>
        <Link to="/incidents?new=1" className="dashboard-primary-action lg:hidden">
          Signaler un incident <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.8fr)]">
        <section aria-labelledby="priority-title" className="dashboard-section min-w-0">
          <div className="dashboard-section-header">
            <div className="flex items-center gap-3">
              <TriangleAlert size={22} className="text-[var(--status-danger)]" aria-hidden="true" />
              <h2 id="priority-title">À traiter maintenant</h2>
            </div>
          </div>
          {urgent ? (
            <>
              <div className="dashboard-priority">
                <span className="dashboard-priority-label">
                  {getSeverityLabel(urgent.severity)} · {urgent.status === 'open' ? 'Ouvert' : 'En cours'}
                </span>
                <h3>{urgent.title}</h3>
                <p className="mt-2 max-w-[65ch] text-sm text-content-muted">{urgent.description}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-content-primary">
                    {linkedEquipment ? 'Matériel concerné : ' + linkedEquipment.name : 'Signalé par ' + urgent.reportedBy}
                  </p>
                  <Link to={'/incidents?incident=' + urgent.id} className="dashboard-primary-action">
                    Ouvrir le suivi <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </div>
              {active.length > 1 && (
                <div className="dashboard-secondary-list">
                  {active.slice(1, 3).map((incident) => (
                    <Link key={incident.id} to={'/incidents?incident=' + incident.id}>
                      <span className="min-w-0">
                        <strong>{incident.title}</strong>
                        <span>{getSeverityLabel(incident.severity)} · {incident.status === 'open' ? 'Ouvert' : 'En cours'}</span>
                      </span>
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="dashboard-priority">
              <h3>Aucun incident actif</h3>
              <p className="mt-2 text-sm text-content-muted">Le registre ne contient rien à traiter pour le moment.</p>
            </div>
          )}
          <Link to="/incidents" className="dashboard-section-footer">
            Tous les incidents <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>

        <section aria-labelledby="equipment-title" className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="flex items-center gap-3">
              <PackageCheck size={22} className="text-[var(--brand-violet-hover)]" aria-hidden="true" />
              <h2 id="equipment-title">État du matériel</h2>
            </div>
          </div>
          <p className="px-5 pt-5 text-sm text-content-muted">
            {equipment.length} équipements dans le parc
          </p>
          <dl className="dashboard-equipment-stats">
            <div><dt>Opérationnels</dt><dd>{available}</dd></div>
            <div><dt>À vérifier</dt><dd>{check}</dd></div>
            <div><dt>Indisponibles</dt><dd>{unavailable}</dd></div>
          </dl>
          {attention.length > 0 && (
            <div className="dashboard-equipment-attention">
              <p className="font-semibold text-content-primary">À contrôler en priorité</p>
              <Link to={'/equipment?equipment=' + attention[0].id}>
                <span>{attention[0].name}</span>
                <Badge status={attention[0].status} size="sm" />
              </Link>
            </div>
          )}
          <Link to="/equipment" className="dashboard-section-footer">
            Ouvrir le parc matériel <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <p className="dashboard-demo-note">
        <strong>Scénario d’exemple</strong>
        <span>Programme fictif. Matériel et incidents conservés dans ce navigateur.</span>
      </p>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
        <section aria-labelledby="program-title" className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="flex items-center gap-3">
              <CalendarDays size={22} className="text-[var(--brand-violet-hover)]" aria-hidden="true" />
              <h2 id="program-title">Programme du scénario</h2>
            </div>
            <Link to="/events" className="dashboard-text-link">
              Conducteur <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ol className="dashboard-program">
            {events.map((event) => (
              <li key={event.id}>
                <time dateTime={event.startDate.toISOString()}>
                  <strong>{formatTime(event.startDate)}</strong>
                  <span>{dateFormatter.format(event.startDate)}</span>
                </time>
                <div><strong>{event.title}</strong><span>{event.stage}</span></div>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="production-title" className="dashboard-section">
          <div className="dashboard-section-header"><h2 id="production-title">Fiche de production</h2></div>
          <div className="px-5 py-5">
            <h3 className="text-xl font-bold text-content-primary">{production.title.replace(/ - .+$/, '')}</h3>
            <p className="mt-1 text-sm text-content-muted">
              {dateFormatter.format(production.startDate)} · {production.stage}
            </p>
            <dl className="mt-5 space-y-3 border-t border-theme-border pt-4 text-sm">
              <div className="flex justify-between gap-4"><dt>Horaire</dt><dd>{formatTime(production.startDate)}–{formatTime(production.endDate)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Préparation enregistrée</dt><dd>{production.checklistProgress} %</dd></div>
            </dl>
          </div>
          <Link to="/stage" className="dashboard-section-footer">
            Voir le plateau 3D <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  )
}
