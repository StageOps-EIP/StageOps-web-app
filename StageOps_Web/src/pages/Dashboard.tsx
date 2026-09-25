import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Radio,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { usePageTitle } from '@/hooks/usePageTitle';
import { mockEquipment, mockEvents, mockIncidents, mockTeamMembers } from '@/lib/mockData';
import { formatRelativeTime, formatTime } from '@/lib/utils';

const currentDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date());

export function Dashboard() {
  usePageTitle('Tableau de bord');
  const navigate = useNavigate();
  const activeEvent = mockEvents[0];
  const hsEquipment = mockEquipment.filter((equipment) => equipment.status === 'hs');
  const toCheckEquipment = mockEquipment.filter((equipment) => equipment.status === 'to-check');
  const operationalEquipment = mockEquipment.filter((equipment) => equipment.status === 'ok');
  const openIncidents = mockIncidents.filter((incident) => incident.status === 'open' || incident.status === 'in-progress');
  const readinessScore = activeEvent.checklistProgress;

  const stats = [
    { code: 'SYS.01', label: 'Parc opérationnel', value: `${operationalEquipment.length}/${mockEquipment.length}`, icon: Check, tone: 'text-emerald-400' },
    { code: 'SYS.02', label: 'Contrôles requis', value: toCheckEquipment.length, icon: Clock3, tone: 'text-amber-400' },
    { code: 'SYS.03', label: 'Incidents actifs', value: openIncidents.length, icon: AlertTriangle, tone: 'text-red-400' },
    { code: 'SYS.04', label: 'Équipe en poste', value: mockTeamMembers.length, icon: Users, tone: 'text-violet-300' },
  ];

  return (
    <div className="page-shell">
      <header className="mb-0 flex flex-col gap-5 border-x border-t border-theme-border bg-theme-deeper px-5 py-5 sm:px-7 lg:flex-row lg:items-end lg:justify-between lg:py-7">
        <div>
          <p className="eyebrow mb-4"><Radio size={11} /> StageOps / Control room</p>
          <h1 className="page-heading text-content-primary">Régie générale</h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 lg:justify-end">
          <div>
            <p className="control-label text-content-faint">Date système</p>
            <p className="mt-1 text-xs capitalize text-content-muted">{currentDate}</p>
          </div>
          <div className="border-l border-theme-border pl-5">
            <p className="control-label text-content-faint">État réseau</p>
            <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#c7ff4a]"><span className="signal-dot" /> Opérationnel</p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border border-theme-border bg-theme-base">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-[linear-gradient(115deg,rgba(121,100,255,.16),transparent_70%)]" />
        <div className="pointer-events-none absolute -right-20 top-1/2 h-px w-[55%] -rotate-[18deg] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="relative min-w-0 p-5 sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.13em] text-content-subtle">
              <span className="flex items-center gap-2 text-[#c7ff4a]"><span className="signal-dot" /> Show en préparation</span>
              <span>{formatTime(activeEvent.startDate)} — {formatTime(activeEvent.endDate)}</span>
              <span>Grande salle</span>
            </div>

            <p className="control-label mb-3 text-cyan-300">Production active / 001</p>
            <h2 className="max-w-4xl text-[clamp(2.6rem,6vw,6.8rem)] font-medium leading-[0.86] tracking-[-0.07em] text-content-primary">
              Hamlet<span className="text-cyan-400">—</span><br className="hidden sm:block" />Représentation
            </h2>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-content-muted sm:text-sm">
              <span>{activeEvent.venue}</span>
              <span className="h-px w-8 bg-theme-border-strong" />
              <span>{activeEvent.stage}</span>
              <span className="h-px w-8 bg-theme-border-strong" />
              <span>{activeEvent.teamMembers.length} techniciens affectés</span>
            </div>

            <div className="mt-9 flex flex-wrap gap-2">
              <Button size="lg" onClick={() => navigate('/stage')}>
                Ouvrir le plateau <ArrowUpRight size={15} />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/events')}>
                <CalendarDays size={15} /> Conducteur
              </Button>
            </div>
          </div>

          <div className="relative flex flex-col justify-between border-t border-theme-border bg-theme-deeper p-6 lg:border-l lg:border-t-0 lg:p-8">
            <div className="flex items-center justify-between">
              <p className="control-label text-content-faint">Readiness index</p>
              <Activity size={16} className="text-cyan-300" />
            </div>
            <div className="my-8">
              <div className="flex items-start">
                <strong className="font-display text-[7rem] font-medium leading-[0.78] tracking-[-0.09em] text-content-primary sm:text-[9rem] lg:text-[7.5rem]">{readinessScore}</strong>
                <span className="ml-2 mt-2 font-mono text-xl text-cyan-300">%</span>
              </div>
              <p className="mt-5 text-sm font-semibold text-content-primary">Prêt pour la mise</p>
              <p className="mt-1 text-xs leading-5 text-content-subtle">La checklist suit le rythme prévu. Aucun blocage critique.</p>
            </div>
            <div>
              <div className="mb-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-content-faint">
                <span>Progression</span><span>{readinessScore}/100</span>
              </div>
              <div className="h-1 bg-theme-elevated">
                <div className="h-full bg-gradient-to-r from-brand-violet to-cyan-400" style={{ width: `${readinessScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Indicateurs clés" className="grid grid-cols-2 border-x border-b border-theme-border md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.code} className={`relative min-w-0 border-theme-border p-4 sm:p-5 ${index % 2 === 0 ? 'border-r' : ''} ${index < 2 ? 'border-b md:border-b-0' : ''} ${index < 3 ? 'md:border-r' : ''}`}>
              <div className="mb-8 flex items-center justify-between">
                <span className="control-label text-content-faint">{stat.code}</span>
                <Icon size={15} className={stat.tone} />
              </div>
              <div className="flex items-end justify-between gap-3">
                <p className="max-w-24 text-[11px] font-semibold leading-4 text-content-muted sm:max-w-none sm:text-xs">{stat.label}</p>
                <strong className="font-display text-3xl font-medium tracking-[-0.06em] text-content-primary sm:text-4xl">{stat.value}</strong>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid border-x border-b border-theme-border xl:grid-cols-[1.2fr_.8fr]">
        <div className="min-w-0 border-b border-theme-border p-5 sm:p-7 xl:border-b-0 xl:border-r">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="control-label mb-2 text-content-faint">Action queue / 04</p>
              <h3 className="text-2xl font-medium text-content-primary">Points d’attention</h3>
            </div>
            <button onClick={() => navigate('/equipment')} className="control-label flex items-center gap-2 text-content-subtle hover:text-cyan-300">
              Parc complet <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="border-t border-theme-border">
            {[...hsEquipment, ...toCheckEquipment].slice(0, 4).map((equipment, index) => (
              <button
                key={equipment.id}
                type="button"
                className="group grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-theme-border py-4 text-left transition-colors hover:bg-cyan-400/[0.04] sm:grid-cols-[3rem_minmax(0,1fr)_9rem_auto]"
                onClick={() => navigate('/equipment')}
              >
                <span className="font-mono text-[10px] text-content-faint">{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-content-primary">{equipment.name}</span>
                  <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-wider text-content-faint">{equipment.qrCode}</span>
                </span>
                <span className="hidden text-xs text-content-subtle sm:block">{equipment.location}</span>
                <Badge status={equipment.status} size="sm" />
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-7">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="control-label mb-2 text-content-faint">Incident feed / Live</p>
              <h3 className="text-2xl font-medium text-content-primary">Journal technique</h3>
            </div>
            <button onClick={() => navigate('/incidents')} className="control-label flex items-center gap-2 text-content-subtle hover:text-cyan-300">
              Ouvrir <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="space-y-0">
            {openIncidents.slice(0, 4).map((incident, index) => (
              <button key={incident.id} type="button" onClick={() => navigate('/incidents')} className="group grid w-full grid-cols-[auto_1fr] gap-4 border-t border-theme-border py-4 text-left">
                <span className={`mt-1.5 h-2 w-2 ${incident.severity === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <span className="min-w-0">
                  <span className="flex items-center justify-between gap-4">
                    <span className="truncate text-sm font-semibold text-content-primary group-hover:text-cyan-300">{incident.title}</span>
                    <span className="font-mono text-[9px] text-content-faint">0{index + 1}</span>
                  </span>
                  <span className="mt-1 block text-xs text-content-subtle">{formatRelativeTime(incident.timestamp)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
