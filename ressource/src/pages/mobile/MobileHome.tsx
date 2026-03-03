import { MobileHeader } from '../../components/layout/MobileHeader';
import { Card } from '../../components/design-system/Card';
import { mockEquipment, mockEvents, mockIncidents } from '../../lib/mockData';
import { AlertCircle, Clock, CheckCircle2, QrCode, Calendar, Users } from 'lucide-react';
import { formatTime } from '../../lib/utils';
import { useNavigate } from 'react-router';

export function MobileHome() {
  const navigate = useNavigate();
  const todayEvent = mockEvents[0];
  const hsCount = mockEquipment.filter(eq => eq.status === 'hs').length;
  const toCheckCount = mockEquipment.filter(eq => eq.status === 'to-check').length;
  const incidentCount = mockIncidents.filter(inc => inc.status === 'open' || inc.status === 'in-progress').length;
  
  return (
    <div className="min-h-screen pb-24 bg-[#0a0a0b]">
      <MobileHeader title="StageOps" />
      
      <div className="p-4 space-y-4">
        {/* Today's Event */}
        <Card className="bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 border-cyan-400/20">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-cyan-400/20 rounded-lg">
              <Calendar size={20} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-400 rounded text-xs font-medium">
                  Aujourd'hui
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  {formatTime(todayEvent.startDate)}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[#f5f5f7] mb-0.5">
                {todayEvent.title}
              </h2>
              <p className="text-sm text-[#a1a1aa]">{todayEvent.venue}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-3 border-t border-cyan-400/20">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-cyan-400">{todayEvent.checklistProgress}%</p>
              <p className="text-xs text-[#71717a] mt-0.5">Préparation</p>
            </div>
            <div className="flex-1 text-center border-l border-cyan-400/20">
              <p className="text-2xl font-bold text-[#f5f5f7]">{todayEvent.teamMembers.length}</p>
              <p className="text-xs text-[#71717a] mt-0.5">Équipe</p>
            </div>
          </div>
        </Card>
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* HS Equipment */}
          <button
            onClick={() => navigate('/mobile/equipment')}
            className="text-left"
          >
            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20 h-full">
              <div className="flex flex-col h-full">
                <div className="p-3 bg-red-500/20 rounded-xl w-fit mb-3">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-red-500 mb-1">{hsCount}</p>
                  <p className="text-sm font-medium text-[#f5f5f7]">HS</p>
                  <p className="text-xs text-[#71717a] mt-0.5">Intervention requise</p>
                </div>
              </div>
            </Card>
          </button>
          
          {/* To Check */}
          <button
            onClick={() => navigate('/mobile/equipment')}
            className="text-left"
          >
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20 h-full">
              <div className="flex flex-col h-full">
                <div className="p-3 bg-amber-500/20 rounded-xl w-fit mb-3">
                  <Clock size={24} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-amber-500 mb-1">{toCheckCount}</p>
                  <p className="text-sm font-medium text-[#f5f5f7]">À vérifier</p>
                  <p className="text-xs text-[#71717a] mt-0.5">Avant le show</p>
                </div>
              </div>
            </Card>
          </button>
          
          {/* Scan QR */}
          <button
            onClick={() => navigate('/mobile/scan')}
            className="text-left"
          >
            <Card className="bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 border-cyan-400/20 h-full">
              <div className="flex flex-col h-full justify-between">
                <div className="p-3 bg-cyan-400/20 rounded-xl w-fit">
                  <QrCode size={24} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#f5f5f7]">Scanner</p>
                  <p className="text-xs text-[#71717a] mt-0.5">QR code</p>
                </div>
              </div>
            </Card>
          </button>
          
          {/* Incidents */}
          <button
            onClick={() => navigate('/mobile/incidents')}
            className="text-left"
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 h-full">
              <div className="flex flex-col h-full">
                <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-3">
                  <AlertCircle size={24} className="text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-purple-500 mb-1">{incidentCount}</p>
                  <p className="text-sm font-medium text-[#f5f5f7]">Incidents</p>
                  <p className="text-xs text-[#71717a] mt-0.5">En cours</p>
                </div>
              </div>
            </Card>
          </button>
        </div>
        
        {/* Checklist Progress */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#f5f5f7]">Checklist du jour</h3>
            <span className="text-sm text-cyan-400 font-medium">
              {todayEvent.checklistProgress}%
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={14} className="text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#f5f5f7]">Vérification console son</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={14} className="text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#f5f5f7]">Test projecteurs FOH</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#27272e] rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-[#71717a] rounded-full" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#f5f5f7]">Calibration écran LED</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#27272e] rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-[#71717a] rounded-full" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#f5f5f7]">Vérification sécurité perches</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/mobile/stage')}
            className="w-full mt-4 py-3 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-cyan-400 text-sm font-medium hover:bg-cyan-400/20 transition-colors"
          >
            Voir toute la checklist
          </button>
        </Card>
        
        {/* Team */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-[#a1a1aa]" />
            <h3 className="text-base font-semibold text-[#f5f5f7]">Équipe sur place</h3>
          </div>
          
          <div className="flex -space-x-3">
            {['ML', 'TD', 'SM', 'JM'].map((initials, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-[#131316] flex items-center justify-center text-black text-xs font-bold"
              >
                {initials}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-[#27272e] border-2 border-[#131316] flex items-center justify-center text-[#71717a] text-xs font-bold">
              +1
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
