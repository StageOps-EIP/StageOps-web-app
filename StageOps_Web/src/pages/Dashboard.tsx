import {
  AlertTriangle,
  ArrowRight,
  Box,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Radio,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Card, CardHeader } from '@/components/design-system/Card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { mockEquipment, mockEvents, mockIncidents, mockTeamMembers } from '@/lib/mockData';
import { formatRelativeTime, formatTime } from '@/lib/utils';

const currentDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
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
    {
      label: 'Parc opérationnel',
      value: `${Math.round((operationalEquipment.length / mockEquipment.length) * 100)}%`,
      detail: `${operationalEquipment.length} équipements prêts`,
      icon: CheckCircle2,
      tone: 'emerald',
    },
    {
      label: 'À contrôler',
      value: toCheckEquipment.length,
      detail: 'Avant ouverture plateau',
      icon: Clock3,
      tone: 'amber',
    },
    {
      label: 'Incidents actifs',
      value: openIncidents.length,
      detail: `${hsEquipment.length} équipement critique`,
      icon: AlertTriangle,
      tone: 'red',
    },
    {
      label: 'Équipe mobilisée',
      value: mockTeamMembers.length,
      detail: 'Tous corps de métier',
      icon: Users,
      tone: 'violet',
    },
  ] as const;

  const toneClasses = {
    emerald: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20',
    amber: 'bg-amber-400/10 text-amber-400 ring-amber-400/20',
    red: 'bg-red-400/10 text-red-400 ring-red-400/20',
    violet: 'bg-brand-violet/10 text-violet-300 ring-violet-400/20',
  };

  return (
    <div className="page-shell space-y-5 md:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2"><Radio size={12} /> Régie en direct</p>
          <h1 className="page-heading text-content-primary">Vue d’ensemble</h1>
          <p className="mt-2 capitalize text-sm text-content-muted">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2 text-xs font-semibold text-emerald-300 sm:self-auto">
          <span className="h-2 w-2 animate-soft-pulse rounded-full bg-emerald-400" />
          Tous les systèmes répondent
        </div>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#152356] via-[#111a3b] to-[#171239] p-5 shadow-brand sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-brand-violet/20 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                <Sparkles size={13} className="text-cyan-300" /> Session active
              </span>
              <span className="text-xs font-medium text-blue-100/65">
                {formatTime(activeEvent.startDate)} — {formatTime(activeEvent.endDate)}
              </span>
            </div>
            <h2 className="max-w-2xl text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">{activeEvent.title}</h2>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-blue-100/70">
              <span>{activeEvent.venue}</span><span aria-hidden="true">•</span><span>{activeEvent.stage}</span>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={() => navigate('/stage')}>
                Ouvrir la vue scène <ArrowRight size={16} />
              </Button>
              <Button variant="secondary" className="border-white/15 bg-white/[0.07] text-white hover:bg-white/10" onClick={() => navigate('/events')}>
                <CalendarDays size={16} /> Voir le conducteur
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-black/10 p-4 backdrop-blur-sm lg:min-w-64 lg:flex-col lg:py-5">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,.1)" strokeWidth="7" fill="none" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#8994ff"
                  strokeWidth="7"
                  fill="none"
                  strokeDasharray={`${readinessScore * 2.51} 251`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="text-2xl font-bold text-white">{readinessScore}%</span>
            </div>
            <div className="lg:text-center">
              <p className="text-sm font-semibold text-white">Prêt pour le show</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-100/60">La checklist avance normalement</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Indicateurs clés" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="animate-fade-up" style={{ animationDelay: `${index * 70}ms` } as React.CSSProperties}>
              <div className="flex items-start justify-between gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${toneClasses[stat.tone]}`}>
                  <Icon size={19} />
                </span>
                <strong className="font-display text-2xl font-semibold text-content-primary sm:text-3xl">{stat.value}</strong>
              </div>
              <p className="mt-4 text-xs font-semibold text-content-primary sm:text-sm">{stat.label}</p>
              <p className="mt-1 truncate text-[10px] text-content-subtle sm:text-xs">{stat.detail}</p>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card>
          <CardHeader
            title="Points d’attention"
            subtitle="À traiter avant l’ouverture plateau"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/equipment')}>Inventaire <ArrowRight size={14} /></Button>}
          />
          <div className="space-y-2">
            {[...hsEquipment, ...toCheckEquipment].slice(0, 4).map((equipment) => (
              <button
                key={equipment.id}
                type="button"
                className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-theme-elevated p-3 text-left transition-all hover:border-theme-border-hover"
                onClick={() => navigate('/equipment')}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-theme-base text-content-muted"><Box size={17} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-content-primary">{equipment.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-content-subtle">{equipment.location}{equipment.zone ? ` · ${equipment.zone}` : ''}</span>
                </span>
                <Badge status={equipment.status} size="sm" />
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Flux d’incidents"
            subtitle="Derniers signalements"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>Tout voir <ArrowRight size={14} /></Button>}
          />
          <div className="relative space-y-4 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-theme-border">
            {openIncidents.slice(0, 4).map((incident) => (
              <button key={incident.id} type="button" onClick={() => navigate('/incidents')} className="relative flex w-full gap-4 text-left">
                <span className={`relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-theme-base ${incident.severity === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <span className="min-w-0 flex-1 border-b border-theme-border pb-4 last:border-0">
                  <span className="block truncate text-sm font-semibold text-content-primary">{incident.title}</span>
                  <span className="mt-1 block text-xs text-content-subtle">{formatRelativeTime(incident.timestamp)}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
