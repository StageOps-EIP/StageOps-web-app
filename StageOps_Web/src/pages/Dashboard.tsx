import { useNavigate } from 'react-router'
import { Badge } from '@/components/design-system/Badge'
import { Button } from '@/components/design-system/Button'
import { DemoNotice, PageHeader } from '@/components/design-system/PageHeader'
import { useDemoData } from '@/hooks/useDemoData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { mockEvents, mockTeamMembers } from '@/lib/mockData'
import { formatTime, getSeverityColor, getSeverityLabel } from '@/lib/utils'
import { SEVERITY_ORDER } from '@/lib/constants'

export function Dashboard() {
  usePageTitle('Vue générale')
  const navigate = useNavigate()
  const { equipment, incidents } = useDemoData()
  const activeEvent = mockEvents[0]
  const controls = equipment.filter(
    (equipment) => equipment.status === 'to-check' || equipment.status === 'hs',
  )
  const openIncidents = incidents
    .filter((incident) => incident.status === 'open' || incident.status === 'in-progress')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  const availableEquipment = equipment.filter((item) => item.status === 'ok').length

  return (
    <div className="page-shell space-y-5">
      <PageHeader
        context="Vue générale"
        title={activeEvent.title}
        description={`Mercredi 11 février 2026 · ${activeEvent.venue}, ${activeEvent.stage}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate('/events')}>
              Voir le conducteur
            </Button>
            <Button onClick={() => navigate('/stage')}>Ouvrir le plateau 3D</Button>
          </>
        }
      />

      <DemoNotice />

      <section className="grid gap-8 pb-5 pt-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:gap-12">
        <div>
          <p className="page-kicker">Prochaine échéance</p>
          <div className="mt-7 flex flex-wrap items-end gap-x-7 gap-y-3">
            <strong className="call-time font-data">20:00</strong>
            <div className="max-w-sm pb-1">
              <p className="font-editorial text-2xl leading-6 text-content-primary">
                Début de la représentation
              </p>
              <p className="mt-2 text-xs text-content-muted">
                Grande Salle · appel équipe confirmé
              </p>
            </div>
          </div>
        </div>

        <div className="self-end border-l-2 border-[var(--brand-violet)] pl-5">
          <p className="text-xs leading-5 text-content-muted">
            La production est en phase d’installation. Les contrôles matériel et les incidents
            ouverts restent prioritaires avant l’entrée du public.
          </p>
          <p className="mt-3 text-xs font-semibold text-[var(--brand-violet-hover)]">
            Installation en cours
          </p>
        </div>
      </section>

      <section aria-label="Point de situation" className="border-y border-theme-border">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          <SituationItem
            label="Matériel opérationnel"
            value={`${availableEquipment} / ${equipment.length}`}
          />
          <SituationItem
            label="Contrôles requis"
            value={controls.length.toString()}
            tone="warning"
          />
          <SituationItem
            label="Incidents actifs"
            value={openIncidents.length.toString()}
            tone="danger"
          />
          <SituationItem
            label="Équipe affectée"
            value={`${activeEvent.teamMembers.length} / ${mockTeamMembers.length}`}
          />
        </div>
      </section>

      <div className="grid items-start gap-10 pt-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-14">
        <div className="space-y-10">
          <section className="editorial-section">
            <div className="editorial-section-heading">
              <div>
                <h2 className="text-sm font-bold text-content-primary">Incidents à traiter</h2>
                <p className="mt-1 text-[11px] text-content-subtle">Classés par niveau d’urgence</p>
              </div>
              <button
                onClick={() => navigate('/incidents')}
                className="text-xs font-semibold text-content-muted hover:text-content-primary"
              >
                Registre complet <span aria-hidden="true">→</span>
              </button>
            </div>

            {openIncidents.map((incident, index) => {
              const color = getSeverityColor(incident.severity)
              return (
                <button
                  key={incident.id}
                  onClick={() => navigate(`/incidents?incident=${incident.id}`)}
                  className="editorial-row grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-3 text-left transition-colors hover:bg-theme-elevated sm:grid-cols-[2rem_7rem_minmax(0,1fr)_auto]"
                >
                  <span className="font-data text-[10px] text-content-faint">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="hidden text-[11px] font-semibold sm:block" style={{ color }}>
                    {getSeverityLabel(incident.severity)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-content-primary">
                      {incident.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-content-subtle">
                      Signalé par {incident.reportedBy}
                    </span>
                  </span>
                  <span className="pr-1 text-content-faint" aria-hidden="true">
                    →
                  </span>
                </button>
              )
            })}
          </section>

          <section className="editorial-section">
            <div className="editorial-section-heading">
              <div>
                <h2 className="text-sm font-bold text-content-primary">Contrôles matériel</h2>
                <p className="mt-1 text-[11px] text-content-subtle">
                  Éléments qui demandent une intervention
                </p>
              </div>
              <button
                onClick={() => navigate('/equipment')}
                className="text-xs font-semibold text-content-muted hover:text-content-primary"
              >
                Ouvrir le parc <span aria-hidden="true">→</span>
              </button>
            </div>

            {controls.map((equipment, index) => (
              <button
                key={equipment.id}
                onClick={() => navigate(`/equipment?equipment=${equipment.id}`)}
                className="editorial-row grid w-full grid-cols-[2rem_minmax(0,1fr)_auto_auto] items-center gap-3 py-3 text-left transition-colors hover:bg-theme-elevated"
              >
                <span className="font-data text-[10px] text-content-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-content-primary">
                    {equipment.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-content-subtle">
                    {equipment.location}
                    {equipment.responsiblePerson ? ` · ${equipment.responsiblePerson}` : ''}
                  </span>
                </span>
                <Badge status={equipment.status} size="sm" />
                <span className="pr-1 text-content-faint" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </section>
        </div>

        <aside className="editorial-section xl:sticky xl:top-5" aria-label="Feuille du jour">
          <div className="editorial-section-heading">
            <h2 className="text-sm font-bold text-content-primary">Feuille du jour</h2>
            <span className="font-data text-[11px] text-content-subtle">11.02.2026</span>
          </div>

          <div className="space-y-0">
            <DayLine
              label="Horaire"
              value={`${formatTime(activeEvent.startDate)} – ${formatTime(activeEvent.endDate)}`}
            />
            <DayLine label="Implantation" value={`${activeEvent.venue} · ${activeEvent.stage}`} />
            <DayLine
              label="Équipe"
              value={`${activeEvent.teamMembers.length} personnes affectées`}
            />
          </div>

          <div className="mt-7 border-l border-theme-border pl-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold text-content-primary">Checklist</span>
              <strong className="font-data text-sm text-content-primary">
                {activeEvent.checklistProgress}%
              </strong>
            </div>
            <div className="mt-3 h-px bg-theme-elevated" aria-hidden="true">
              <div
                className="h-px bg-[var(--brand-violet)]"
                style={{ width: `${activeEvent.checklistProgress}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] leading-4 text-content-subtle">
              Progression calculée depuis la checklist associée à cet événement.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function DayLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-state-line">
      <span className="text-[11px] text-content-subtle">{label}</span>
      <span className="max-w-[12rem] text-right text-xs font-semibold text-content-primary">
        {value}
      </span>
    </div>
  )
}

function SituationItem({
  label,
  value,
  tone = 'brand',
}: {
  label: string
  value: string
  tone?: 'brand' | 'warning' | 'danger'
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-red-400'
      : tone === 'warning'
        ? 'text-amber-400'
        : 'text-[var(--brand-violet-hover)]'

  return (
    <div className="flex min-h-14 items-baseline justify-between gap-4 py-3 sm:pr-6 sm:odd:border-r sm:odd:border-theme-border sm:even:pl-6 xl:border-r xl:border-theme-border xl:px-6 xl:first:pl-0 xl:last:border-r-0 xl:last:pr-0">
      <span className="text-[11px] leading-4 text-content-muted">{label}</span>
      <strong className={`font-data text-base font-semibold ${toneClass}`}>{value}</strong>
    </div>
  )
}
