import { AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardHeader } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { mockEquipment, mockEvents, mockIncidents } from '@/lib/mockData';
import { formatTime, formatRelativeTime } from '@/lib/utils';
import { useNavigate } from 'react-router';

export function Dashboard() {
  usePageTitle('Tableau de bord');
  const navigate = useNavigate();
  const todayEvent = mockEvents[0];
  const hsEquipment = mockEquipment.filter(eq => eq.status === 'hs');
  const toCheckEquipment = mockEquipment.filter(eq => eq.status === 'to-check');
  const openIncidents = mockIncidents.filter(inc => inc.status === 'open' || inc.status === 'in-progress');
  
  const readinessScore = todayEvent.checklistProgress;
  
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-content-primary mb-2">Tableau de bord</h1>
        <p className="text-content-muted">Mercredi 11 février 2026</p>
      </div>
      
      {/* Today's Event Banner */}
      <Card className="bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 border-cyan-400/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-cyan-400/20 text-cyan-400 rounded-lg text-sm font-medium border border-cyan-400/30">
                Aujourd'hui
              </span>
              <span className="text-content-muted">
                {formatTime(todayEvent.startDate)} - {formatTime(todayEvent.endDate)}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-content-primary mb-1">{todayEvent.title}</h2>
            <p className="text-content-muted">{todayEvent.venue} • {todayEvent.stage}</p>
          </div>
          
          {/* Readiness Score */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#27272e"
                  strokeWidth="8"
                  fill="none"
                />
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
      
      {/* Stats Grid */}
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
            <span className="text-3xl font-bold text-green-500">
              {mockEquipment.filter(eq => eq.status === 'ok').length}
            </span>
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
      
      {/* Alerts and Incidents */}
      <div className="grid grid-cols-2 gap-6">
        {/* HS Equipment */}
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
            {hsEquipment.map((eq) => (
              <div
                key={eq.id}
                className="flex items-center justify-between p-3 bg-theme-elevated rounded-xl hover:bg-theme-border transition-colors cursor-pointer"
                onClick={() => navigate('/equipment')}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-content-primary">{eq.name}</p>
                  <p className="text-xs text-content-subtle mt-0.5">{eq.location}</p>
                </div>
                <Badge status={eq.status} size="sm" />
              </div>
            ))}
            {hsEquipment.length === 0 && (
              <p className="text-sm text-content-subtle text-center py-8">
                Aucun équipement HS actuellement
              </p>
            )}
          </div>
        </Card>
        
        {/* Recent Incidents */}
        <Card>
          <CardHeader
            title="Incidents récents"
            subtitle="Dernières 24 heures"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
                Voir tout
              </Button>
            }
          />
          <div className="space-y-3">
            {openIncidents.slice(0, 3).map((incident) => (
              <div
                key={incident.id}
                className="flex items-start gap-3 p-3 bg-theme-elevated rounded-xl hover:bg-theme-border transition-colors cursor-pointer"
                onClick={() => navigate('/incidents')}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content-primary truncate">{incident.title}</p>
                  <p className="text-xs text-content-subtle mt-0.5">{formatRelativeTime(incident.timestamp)}</p>
                </div>
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: incident.severity === 'high' ? '#ef444415' : '#f59e0b15',
                    color: incident.severity === 'high' ? '#ef4444' : '#f59e0b',
                  }}
                >
                  {incident.severity === 'high' ? 'Élevée' : 'Moyenne'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* To Check Equipment */}
      <Card>
        <CardHeader
          title="À vérifier avant le show"
          subtitle={`${toCheckEquipment.length} équipements nécessitent une vérification`}
        />
        <div className="grid grid-cols-3 gap-4">
          {toCheckEquipment.map((eq) => (
            <div
              key={eq.id}
              className="p-4 bg-theme-elevated rounded-xl hover:bg-theme-border transition-colors cursor-pointer"
              onClick={() => navigate('/equipment')}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge status={eq.status} size="sm" />
              </div>
              <p className="text-sm font-medium text-content-primary mb-1">{eq.name}</p>
              <p className="text-xs text-content-subtle">{eq.location}</p>
              {eq.notes && (
                <p className="text-xs text-amber-500 mt-2 line-clamp-2">{eq.notes}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
