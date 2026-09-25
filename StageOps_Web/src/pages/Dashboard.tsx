import {
  AlertTriangle,
  ArrowRight,
  Box,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
  Wrench,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { Badge } from '@/components/design-system/Badge'
import { Button } from '@/components/design-system/Button'
import { DemoNotice, PageHeader } from '@/components/design-system/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { mockEquipment, mockEvents, mockIncidents, mockTeamMembers } from '@/lib/mockData'
import { formatTime, getSeverityColor, getSeverityLabel } from '@/lib/utils'
import { SEVERITY_ORDER } from '@/lib/constants'

export function Dashboard() {
  usePageTitle('Vue générale')
  const navigate = useNavigate()
  const activeEvent = mockEvents[0]
  const controls = mockEquipment.filter(
    (equipment) => equipment.status === 'to-check' || equipment.status === 'hs',
  )
  const openIncidents = mockIncidents
    .filter((incident) => incident.status === 'open' || incident.status === 'in-progress')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  const availableEquipment = mockEquipment.filter((equipment) => equipment.status === 'ok').length

  return (
    <div className="page-shell space-y-4">
      <PageHeader
        context="Vue générale"
        title={activeEvent.title}
        description={`Mercredi 11 février 2026 · ${activeEvent.venue}, ${activeEvent.stage}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/events')}>
              <CalendarDays size={15} /> Conducteur
            </Button>
            <Button onClick={() => navigate('/stage')}>
              Plateau 3D <ArrowRight size={15} />
            </Button>
          </>
        }
      />

      <DemoNotice />

      <section className="work-register" aria-label="État de la production">
        <div className="work-register-header">
          <div>
            <p className="work-register-title">État de préparation</p>
            <p className="mt-0.5 text-[11px] text-content-subtle">
              Données issues du parc, des incidents et de la checklist de production
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
            <Wrench size={13} /> Installation
          </span>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          <StatusCell
            icon={CheckCircle2}
            label="Matériel opérationnel"
            value={`${availableEquipment} / ${mockEquipment.length}`}
            detail="Équipements au statut opérationnel"
          />
          <StatusCell
            icon={Clock3}
            label="Contrôles requis"
            value={controls.length.toString()}
            detail="À vérifier ou hors service"
            tone="warning"
          />
          <StatusCell
            icon={AlertTriangle}
            label="Incidents actifs"
            value={openIncidents.length.toString()}
            detail="Ouverts ou en cours"
            tone="danger"
          />
          <StatusCell
            icon={Users}
            label="Équipe affectée"
            value={activeEvent.teamMembers.length.toString()}
            detail={`${mockTeamMembers.length} membres référencés`}
          />
        </div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-4">
          <section className="work-register">
            <div className="work-register-header">
              <div>
                <p className="work-register-title">Incidents à traiter</p>
                <p className="mt-0.5 text-[11px] text-content-subtle">
                  Classés par niveau d’urgence
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
                Registre complet <ArrowRight size={13} />
              </Button>
            </div>
            <div>
              {openIncidents.map((incident) => {
                const color = getSeverityColor(incident.severity)
                return (
                  <button
                    key={incident.id}
                    onClick={() => navigate(`/incidents?incident=${incident.id}`)}
                    className="work-row grid w-full grid-cols-[1.5rem_minmax(0,1fr)_auto_1rem] items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-theme-elevated"
                  >
                    <AlertTriangle size={15} style={{ color }} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-content-primary">
                        {incident.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-content-subtle">
                        Signalé par {incident.reportedBy}
                      </span>
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color }}>
                      {getSeverityLabel(incident.severity)}
                    </span>
                    <ArrowRight size={13} className="text-content-faint" />
                  </button>
                )
              })}
            </div>
          </section>

          <section className="work-register">
            <div className="work-register-header">
              <div>
                <p className="work-register-title">Contrôles matériel</p>
                <p className="mt-0.5 text-[11px] text-content-subtle">
                  Éléments qui demandent une intervention
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/equipment')}>
                Ouvrir le parc <ArrowRight size={13} />
              </Button>
            </div>
            <div>
              {controls.map((equipment) => (
                <button
                  key={equipment.id}
                  onClick={() => navigate(`/equipment?equipment=${equipment.id}`)}
                  className="work-row grid w-full grid-cols-[1.5rem_minmax(0,1fr)_auto_1rem] items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-theme-elevated"
                >
                  <Box size={15} className="text-content-subtle" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-content-primary">
                      {equipment.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-content-subtle">
                      {equipment.location}
                      {equipment.responsiblePerson ? ` · ${equipment.responsiblePerson}` : ''}
                    </span>
                  </span>
                  <Badge status={equipment.status} size="sm" />
                  <ArrowRight size={13} className="text-content-faint" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="work-register xl:sticky xl:top-4" aria-label="Feuille du jour">
          <div className="work-register-header">
            <p className="work-register-title">Feuille du jour</p>
            <span className="text-[11px] text-content-subtle">11 fév. 2026</span>
          </div>
          <div className="border-b border-theme-border p-4">
            <p className="text-[11px] font-semibold text-[var(--brand-violet-hover)]">
              Prochaine échéance
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <strong className="text-2xl font-semibold text-content-primary">20:00</strong>
              <span className="text-sm text-content-primary">Début de la représentation</span>
            </div>
            <p className="mt-1 text-xs text-content-subtle">Grande Salle</p>
          </div>

          <div className="divide-y divide-theme-border">
            <InfoLine
              icon={Clock3}
              label="Horaire"
              value={`${formatTime(activeEvent.startDate)} – ${formatTime(activeEvent.endDate)}`}
            />
            <InfoLine
              icon={MapPin}
              label="Implantation"
              value={`${activeEvent.venue} · ${activeEvent.stage}`}
            />
            <InfoLine
              icon={Users}
              label="Équipe"
              value={`${activeEvent.teamMembers.length} personnes affectées`}
            />
          </div>

          <div className="border-t border-theme-border p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-content-primary">Checklist</span>
              <strong className="text-content-primary">{activeEvent.checklistProgress}%</strong>
            </div>
            <div className="mt-2 h-1 bg-theme-elevated" aria-hidden="true">
              <div
                className="h-full bg-[var(--brand-violet)]"
                style={{ width: `${activeEvent.checklistProgress}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-4 text-content-subtle">
              Progression calculée depuis la checklist associée à cet événement.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[1.25rem_5rem_minmax(0,1fr)] items-start gap-2 px-4 py-3">
      <Icon size={13} className="mt-0.5 text-content-subtle" aria-hidden="true" />
      <span className="text-[11px] text-content-subtle">{label}</span>
      <span className="text-right text-xs font-medium text-content-primary">{value}</span>
    </div>
  )
}

function StatusCell({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'brand',
}: {
  icon: typeof CalendarDays
  label: string
  value: string
  detail: string
  tone?: 'brand' | 'warning' | 'danger'
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-red-400'
      : tone === 'warning'
        ? 'text-amber-400'
        : 'text-[var(--brand-violet-hover)]'

  return (
    <div className="grid min-h-[5.5rem] grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-theme-border p-3 last:border-b-0 sm:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0">
      <Icon size={16} className={toneClass} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-content-primary">{label}</p>
        <p className="mt-0.5 truncate text-[10px] text-content-subtle">{detail}</p>
      </div>
      <strong className="text-lg font-semibold text-content-primary">{value}</strong>
    </div>
  )
}
