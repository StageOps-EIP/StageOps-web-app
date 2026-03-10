import { AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardHeader } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { useNavigate } from 'react-router';

export function Dashboard() {
  usePageTitle('Tableau de bord');
  const navigate = useNavigate();

  const hsEquipment: Array<{ id: string; name: string; location: string; status: string }> = [];
  const toCheckEquipment: Array<{ id: string; name: string; location: string; status: string; notes?: string }> = [];
  const openIncidents: Array<{ id: string; title: string; severity: string }> = [];
  const readinessScore = 0;
  const operationalEquipmentCount = 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-content-primary mb-2">Tableau de bord</h1>
        <p className="text-content-muted">Aucune donnée disponible</p>
      </div>

      <Card className="bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 border-cyan-400/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-cyan-400/20 text-cyan-400 rounded-lg text-sm font-medium border border-cyan-400/30">Aujourd'hui</span>
              <span className="text-content-muted">—</span>
            </div>
            <h2 className="text-2xl font-semibold text-content-primary mb-1">Aucun événement</h2>
            <p className="text-content-muted">—</p>
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
                <span className="text-2xl font-bold text-cyan-400">0%</span>
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
            <span className="text-3xl font-bold text-red-500">0</span>
          </div>
          <p className="text-sm font-medium text-content-primary">Équipements HS</p>
          <p className="text-xs text-content-subtle mt-1">Nécessite attention</p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Clock size={24} className="text-amber-500" />
            </div>
            <span className="text-3xl font-bold text-amber-500">0</span>
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
            <span className="text-3xl font-bold text-purple-500">0</span>
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
            {hsEquipment.length === 0 && <p className="text-sm text-content-subtle text-center py-8">Aucun équipement HS actuellement</p>}
          </div>
        </Card>

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
            {openIncidents.length === 0 && <p className="text-sm text-content-subtle text-center py-8">Aucun incident ouvert</p>}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="À vérifier avant le show" subtitle={`${toCheckEquipment.length} équipements nécessitent une vérification`} />
        <div className="grid grid-cols-3 gap-4">
          {toCheckEquipment.length === 0 && <p className="text-sm text-content-subtle col-span-3 text-center py-8">Aucun équipement à vérifier</p>}
        </div>
      </Card>
    </div>
  );
}
