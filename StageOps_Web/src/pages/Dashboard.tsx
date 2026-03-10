import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardHeader } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { useNavigate } from 'react-router';
import { getEquipment } from '@/services/equipment.service';
import { getIncidents } from '@/services/incidents.service';
import { getEvents } from '@/services/events.service';
import type { Equipment, Incident, Event } from '@/lib/types';
import { getSeverityColor, getSeverityLabel } from '@/lib/utils';

export function Dashboard() {
  usePageTitle('Tableau de bord');
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    void getEquipment().then(setEquipment).catch(() => {});
    void getIncidents().then(setIncidents).catch(() => {});
    void getEvents().then(setEvents).catch(() => {});
  }, []);

  const hsEquipment = equipment.filter((e) => e.status === 'hs');
  const toCheckEquipment = equipment.filter((e) => e.status === 'to-check');
  const operationalEquipmentCount = equipment.filter((e) => e.status === 'ok').length;
  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'in-progress');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEvents = events.filter((e) => {
    const d = new Date(e.startDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  const nextEvent = todayEvents[0] ?? events.find((e) => new Date(e.startDate) > new Date());

  const total = equipment.length;
  const readinessScore = total === 0 ? 0 : Math.round((operationalEquipmentCount / total) * 100);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-content-primary mb-2">Tableau de bord</h1>
        <p className="text-content-muted">
          {equipment.length} équipements · {openIncidents.length} incident{openIncidents.length !== 1 ? 's' : ''} ouvert{openIncidents.length !== 1 ? 's' : ''}
        </p>
      </div>

      <Card className="bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 border-cyan-400/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-cyan-400/20 text-cyan-400 rounded-lg text-sm font-medium border border-cyan-400/30">Aujourd'hui</span>
              {nextEvent && <span className="text-content-muted">{todayEvents.length > 1 ? `${todayEvents.length} événements` : ''}</span>}
            </div>
            <h2 className="text-2xl font-semibold text-content-primary mb-1">
              {nextEvent ? nextEvent.title : 'Aucun événement'}
            </h2>
            <p className="text-content-muted">
              {nextEvent ? nextEvent.venue ?? nextEvent.description : '—'}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#27272e" strokeWidth="8" fill="none" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#00ffff"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${readinessScore * 2.51} 251`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-cyan-400">{readinessScore}%</span>
              </div>
            </div>
            <span className="text-xs text-content-muted mt-2">Préparation</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="primary" onClick={() => navigate('/stage')}>
            Ouvrir Vue Scène
          </Button>
          <Button variant="secondary" onClick={() => navigate('/events')}>
            Voir Checklist
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <span className="text-3xl font-bold text-red-500">{hsEquipment.length}</span>
          </div>
          <p className="text-sm font-medium text-content-primary">Équipements HS</p>
          <p className="text-xs text-content-subtle mt-1">Nécessite attention</p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Clock size={24} className="text-amber-500" />
            </div>
            <span className="text-3xl font-bold text-amber-500">{toCheckEquipment.length}</span>
          </div>
          <p className="text-sm font-medium text-content-primary">À vérifier</p>
          <p className="text-xs text-content-subtle mt-1">Avant le show</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
            <span className="text-3xl font-bold text-green-500">{operationalEquipmentCount}</span>
          </div>
          <p className="text-sm font-medium text-content-primary">Opérationnels</p>
          <p className="text-xs text-content-subtle mt-1">Prêts à l'emploi</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <TrendingUp size={24} className="text-purple-500" />
            </div>
            <span className="text-3xl font-bold text-purple-500">{openIncidents.length}</span>
          </div>
          <p className="text-sm font-medium text-content-primary">Incidents ouverts</p>
          <p className="text-xs text-content-subtle mt-1">En cours</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Équipements HS"
            subtitle="Nécessite intervention immédiate"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/equipment')}>
                Voir tout
              </Button>
            }
          />
          <div className="space-y-3">
            {hsEquipment.length === 0 ? (
              <p className="text-sm text-content-subtle text-center py-8">Aucun équipement HS actuellement</p>
            ) : (
              hsEquipment.slice(0, 5).map((eq) => (
                <div key={eq.id} className="flex items-center justify-between p-3 bg-theme-elevated rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-content-primary">{eq.name}</p>
                    <p className="text-xs text-content-subtle">{eq.location}</p>
                  </div>
                  <Badge status="hs" />
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Incidents récents"
            subtitle="Ouverts & en cours"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
                Voir tout
              </Button>
            }
          />
          <div className="space-y-3">
            {openIncidents.length === 0 ? (
              <p className="text-sm text-content-subtle text-center py-8">Aucun incident ouvert</p>
            ) : (
              openIncidents.slice(0, 5).map((inc) => (
                <div key={inc.id} className="flex items-center justify-between p-3 bg-theme-elevated rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-content-primary">{inc.title}</p>
                    <p className="text-xs text-content-subtle">{getSeverityLabel(inc.severity)}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${getSeverityColor(inc.severity)}20`, color: getSeverityColor(inc.severity) }}>
                    {inc.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="À vérifier avant le show" subtitle={`${toCheckEquipment.length} équipement${toCheckEquipment.length !== 1 ? 's' : ''} nécessite${toCheckEquipment.length === 1 ? '' : 'nt'} une vérification`} />
        <div className="grid grid-cols-3 gap-4">
          {toCheckEquipment.length === 0 ? (
            <p className="text-sm text-content-subtle col-span-3 text-center py-8">Aucun équipement à vérifier</p>
          ) : (
            toCheckEquipment.slice(0, 6).map((eq) => (
              <div key={eq.id} className="flex items-center gap-3 p-3 bg-theme-elevated rounded-xl border border-amber-500/20">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock size={16} className="text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-content-primary truncate">{eq.name}</p>
                  <p className="text-xs text-content-subtle truncate">{eq.location}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
