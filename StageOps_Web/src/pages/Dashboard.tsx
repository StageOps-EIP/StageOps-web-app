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
import { Card, CardHeader } from '@/components/design-system/Card'
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
    <div className="page-shell space-y-5">
      <PageHeader
        context="Théâtre National · Grande Salle"
        title="Vue générale"
        description="Les informations à traiter pour la production sélectionnée."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/events')}>
              <CalendarDays size={16} /> Voir le conducteur
            </Button>
            <Button onClick={() => navigate('/stage')}>
              Ouvrir le plateau <ArrowRight size={16} />
            </Button>
          </>
        }
      />

      <DemoNotice />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,.6fr)]">
        <Card className="p-0 sm:p-0">
          <div className="border-b border-theme-border px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[var(--brand-violet-hover)]">
                  Production sélectionnée
                </p>
                <h2 className="mt-1 text-xl font-semibold text-content-primary">
                  {activeEvent.title}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
                <Wrench size={13} /> Installation
              </span>
            </div>
          </div>
          <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoLine icon={CalendarDays} label="Date" value="Mercredi 11 février 2026" />
              <InfoLine
                icon={Clock3}
                label="Horaire"
                value={`${formatTime(activeEvent.startDate)} – ${formatTime(activeEvent.endDate)}`}
              />
              <InfoLine
                icon={MapPin}
                label="Lieu"
                value={`${activeEvent.venue} · ${activeEvent.stage}`}
              />
              <InfoLine
                icon={Users}
                label="Équipe affectée"
                value={`${activeEvent.teamMembers.length} personnes`}
              />
            </div>
            <div className="border-t border-theme-border pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-content-primary">Checklist de production</span>
                <span className="font-semibold text-content-primary">
                  {activeEvent.checklistProgress}%
                </span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-theme-elevated"
                aria-label={`Checklist complétée à ${activeEvent.checklistProgress}%`}
              >
                <div
                  className="h-full bg-[var(--brand-violet)]"
                  style={{ width: `${activeEvent.checklistProgress}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-content-subtle">
                Progression issue directement de la checklist associée à cet événement.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Prochaine échéance" subtitle="Aujourd’hui dans le scénario" />
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[var(--brand-soft)] text-[var(--brand-violet-hover)]">
              <Clock3 size={18} />
            </div>
            <div>
              <p className="font-semibold text-content-primary">Début de la représentation</p>
              <p className="mt-1 text-sm text-content-muted">20:00 · Grande Salle</p>
              <p className="mt-3 text-sm text-content-subtle">
                La checklist est complétée à {activeEvent.checklistProgress}%.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section
        aria-label="Synthèse opérationnelle"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryItem
          icon={CheckCircle2}
          label="Matériel opérationnel"
          value={`${availableEquipment} sur ${mockEquipment.length}`}
          hint="Statut OK"
        />
        <SummaryItem
          icon={Clock3}
          label="Contrôles requis"
          value={controls.length.toString()}
          hint="À vérifier ou hors service"
          attention
        />
        <SummaryItem
          icon={AlertTriangle}
          label="Incidents à traiter"
          value={openIncidents.length.toString()}
          hint="Ouverts ou en cours"
          danger
        />
        <SummaryItem
          icon={Users}
          label="Équipe référencée"
          value={mockTeamMembers.length.toString()}
          hint="Membres du scénario"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Incidents à traiter"
            subtitle="Classés par niveau d’urgence"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
                Tout voir <ArrowRight size={14} />
              </Button>
            }
          />
          <div className="divide-y divide-theme-border">
            {openIncidents.map((incident) => {
              const color = getSeverityColor(incident.severity)
              return (
                <button
                  key={incident.id}
                  onClick={() => navigate(`/incidents?incident=${incident.id}`)}
                  className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-theme-elevated"
                >
                  <AlertTriangle size={16} style={{ color }} className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-content-primary">
                      {incident.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-content-subtle">
                      Signalé par {incident.reportedBy}
                    </span>
                  </span>
                  <span
                    className="rounded-md border px-2 py-0.5 text-xs font-semibold"
                    style={{ color, borderColor: `${color}40`, backgroundColor: `${color}12` }}
                  >
                    {getSeverityLabel(incident.severity)}
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-content-faint" />
                </button>
              )
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Contrôles matériel"
            subtitle="Éléments qui demandent une action"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/equipment')}>
                Ouvrir le parc <ArrowRight size={14} />
              </Button>
            }
          />
          <div className="divide-y divide-theme-border">
            {controls.map((equipment) => (
              <button
                key={equipment.id}
                onClick={() => navigate(`/equipment?equipment=${equipment.id}`)}
                className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-theme-elevated"
              >
                <Box size={16} className="shrink-0 text-content-subtle" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-content-primary">
                    {equipment.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-content-subtle">
                    {equipment.location}
                    {equipment.responsiblePerson ? ` · ${equipment.responsiblePerson}` : ''}
                  </span>
                </span>
                <Badge status={equipment.status} size="sm" />
                <ArrowRight size={14} className="shrink-0 text-content-faint" />
              </button>
            ))}
          </div>
        </Card>
      </section>
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
    <div className="flex gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-content-subtle" />
      <div>
        <p className="text-xs text-content-subtle">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-content-primary">{value}</p>
      </div>
    </div>
  )
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  hint,
  attention,
  danger,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
  hint: string
  attention?: boolean
  danger?: boolean
}) {
  const tone = danger
    ? 'text-red-400'
    : attention
      ? 'text-amber-400'
      : 'text-[var(--brand-violet-hover)]'
  return (
    <div className="panel flex items-center gap-4 p-4">
      <Icon size={19} className={`shrink-0 ${tone}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-content-primary">{label}</p>
        <p className="mt-0.5 truncate text-xs text-content-subtle">{hint}</p>
      </div>
      <strong className="text-xl font-semibold text-content-primary">{value}</strong>
    </div>
  )
}
