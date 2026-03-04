import { useState } from 'react';
import { Card } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';
import { SearchInput } from '../components/design-system/Input';
import { Badge, CategoryChip } from '../components/design-system/Badge';
import { mockEquipment, mockEvents } from '../lib/mockData';
import { getCategoryLabel, getCategoryIcon, formatDateTime, formatTime } from '../lib/utils';
import { 
  Eye, 
  Layers as LayersIcon, 
  Download, 
  ZoomIn, 
  ZoomOut,
  Grid3x3,
  AlertCircle,
  User,
  MapPin,
  Clock,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { Equipment, EquipmentCategory } from '../lib/types';

const categories: EquipmentCategory[] = ['sound', 'light', 'video', 'set', 'safety', 'rigging'];

const eventStatusColors: Record<string, string> = {
  planning: '#71717a',
  setup: '#f59e0b',
  running: '#22c55e',
  strike: '#3b82f6',
  completed: '#a1a1aa',
};
const eventStatusLabels: Record<string, string> = {
  planning: 'Planification',
  setup: 'Installation',
  running: 'En cours',
  strike: 'Démontage',
  completed: 'Terminé',
};

export function StageView() {
  const [selectedEventId, setSelectedEventId] = useState(mockEvents[0].id);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<EquipmentCategory[]>(categories);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'front' | 'top' | '3d'>('3d');

  const selectedEvent = mockEvents.find((e) => e.id === selectedEventId) ?? mockEvents[0];

  const toggleLayer = (category: EquipmentCategory) => {
    setSelectedLayers(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Only equipment assigned to the selected event
  const eventEquipment = mockEquipment.filter((eq) =>
    selectedEvent.equipmentIds.includes(eq.id)
  );

  const filteredEquipment = eventEquipment.filter(eq => 
    selectedLayers.includes(eq.category) &&
    (eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     eq.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar - Layers & Filters */}
      <div className="w-80 bg-[#131316] border-r border-[#27272e] flex flex-col overflow-hidden">

        {/* Event selector */}
        <div className="p-4 border-b border-[#27272e] relative">
          <p className="text-[10px] text-[#71717a] uppercase tracking-wider mb-2">Événement</p>
          <button
            onClick={() => setShowEventPicker((v) => !v)}
            className="w-full flex items-center gap-3 p-3 bg-[#1c1c21] border border-[#27272e] rounded-xl hover:border-cyan-400/30 transition-colors text-left"
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: eventStatusColors[selectedEvent.status] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f5f5f7] truncate">{selectedEvent.title}</p>
              <p className="text-xs text-[#71717a]">
                {formatTime(selectedEvent.startDate)} · {selectedEvent.stage}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-[#71717a] shrink-0 transition-transform ${showEventPicker ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {showEventPicker && (
            <div className="absolute left-4 right-4 top-full mt-1 z-20 bg-[#1c1c21] border border-[#27272e] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
              {mockEvents.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => {
                    setSelectedEventId(evt.id);
                    setSelectedEquipment(null);
                    setShowEventPicker(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#27272e] transition-colors ${
                    evt.id === selectedEventId ? 'bg-cyan-400/10' : ''
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: eventStatusColors[evt.status] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f5f5f7] truncate">{evt.title}</p>
                    <p className="text-xs text-[#71717a]">
                      {eventStatusLabels[evt.status]} · {evt.venue}
                    </p>
                  </div>
                  {evt.id === selectedEventId && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-b border-[#27272e]">
          <h2 className="text-xl font-semibold text-[#f5f5f7] mb-4">Vue Scène</h2>
          <SearchInput
            placeholder="Rechercher équipement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Layers */}
        <div className="p-6 border-b border-[#27272e]">
          <div className="flex items-center gap-2 mb-4">
            <LayersIcon size={18} className="text-[#a1a1aa]" />
            <h3 className="text-sm font-semibold text-[#f5f5f7]">Calques</h3>
          </div>
          <div className="space-y-2">
            {categories.map((category) => {
              const count = eventEquipment.filter(eq => eq.category === category).length;
              const isActive = selectedLayers.includes(category);
              
              return (
                <button
                  key={category}
                  onClick={() => toggleLayer(category)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-cyan-400/10 border border-cyan-400/20'
                      : 'bg-[#1c1c21] border border-[#27272e] hover:bg-[#27272e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${isActive ? 'text-cyan-400' : 'text-[#f5f5f7]'}`}>
                        {getCategoryLabel(category)}
                      </p>
                      <p className="text-xs text-[#71717a]">{count} équipements</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 transition-all ${
                    isActive
                      ? 'bg-cyan-400 border-cyan-400'
                      : 'border-[#35353e]'
                  }`}>
                    {isActive && (
                      <svg className="w-full h-full text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Equipment List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-semibold text-[#f5f5f7] mb-4">
            Équipements ({filteredEquipment.length})
          </h3>
          <div className="space-y-2">
            {filteredEquipment.map((eq) => (
              <button
                key={eq.id}
                onClick={() => setSelectedEquipment(eq)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedEquipment?.id === eq.id
                    ? 'bg-cyan-400/10 border border-cyan-400/20'
                    : 'bg-[#1c1c21] hover:bg-[#27272e]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-[#f5f5f7] flex-1 pr-2">{eq.name}</p>
                  <Badge status={eq.status} size="sm" showLabel={false} />
                </div>
                <p className="text-xs text-[#71717a]">{eq.location}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Center - Stage Canvas */}
      <div className="flex-1 flex flex-col bg-[#0a0a0b]">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-[#131316] border-b border-[#27272e]">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === '3d' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('3d')}
            >
              <Eye size={16} />
              3D
            </Button>
            <Button
              variant={viewMode === 'front' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('front')}
            >
              <Grid3x3 size={16} />
              Face
            </Button>
            <Button
              variant={viewMode === 'top' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('top')}
            >
              <Grid3x3 size={16} />
              Plan
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <ZoomOut size={16} />
            </Button>
            <span className="text-sm text-[#a1a1aa] px-2">100%</span>
            <Button variant="secondary" size="sm">
              <ZoomIn size={16} />
            </Button>
            <div className="w-px h-6 bg-[#27272e] mx-2" />
            <Button variant="secondary" size="sm">
              <Download size={16} />
              Exporter
            </Button>
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #27272e 1px, transparent 1px),
                  linear-gradient(to bottom, #27272e 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          
          {/* Stage representation */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="relative w-full h-full max-w-4xl max-h-3xl">
              {/* Stage outline */}
              <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#131316] border border-cyan-400/30 rounded-full text-xs text-cyan-400">
                  Fond de scène
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-4 py-1 bg-[#131316] border border-cyan-400/30 rounded-full text-xs text-cyan-400">
                  Avant-scène / FOH
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 -rotate-90 px-4 py-1 bg-[#131316] border border-cyan-400/30 rounded-full text-xs text-cyan-400">
                  Jardin
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-90 px-4 py-1 bg-[#131316] border border-cyan-400/30 rounded-full text-xs text-cyan-400">
                  Cour
                </div>
              </div>
              
              {/* Equipment positions */}
              {filteredEquipment.filter(eq => eq.position).map((eq) => {
                const isSelected = selectedEquipment?.id === eq.id;
                const statusColor = eq.status === 'ok' ? '#22c55e' :
                                  eq.status === 'to-check' ? '#f59e0b' :
                                  eq.status === 'hs' ? '#ef4444' : '#8b5cf6';
                
                return (
                  <button
                    key={eq.id}
                    onClick={() => setSelectedEquipment(eq)}
                    className="absolute group"
                    style={{
                      left: `${eq.position!.x / 2.5}%`,
                      top: `${eq.position!.y / 2}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl transition-all duration-300"
                      style={{
                        backgroundColor: statusColor,
                        opacity: isSelected ? 0.4 : 0.2,
                        transform: isSelected ? 'scale(2)' : 'scale(1.5)',
                      }}
                    />
                    
                    {/* Equipment marker */}
                    <div
                      className={`relative w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all duration-200 ${
                        isSelected ? 'scale-125' : 'scale-100 group-hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: `${statusColor}20`,
                        border: `2px solid ${statusColor}`,
                        boxShadow: isSelected ? `0 0 20px ${statusColor}60` : 'none',
                      }}
                    >
                      {getCategoryIcon(eq.category)}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#131316] border border-[#27272e] rounded-lg text-xs text-[#f5f5f7] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {eq.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Center guidance */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-4 h-4 border-2 border-cyan-400/50 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Right Sidebar - Inspector */}
      {selectedEquipment && (
        <div className="w-96 bg-[#131316] border-l border-[#27272e] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[#27272e]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#f5f5f7] mb-1">
                  {selectedEquipment.name}
                </h3>
                <CategoryChip
                  category={selectedEquipment.category}
                  label={getCategoryLabel(selectedEquipment.category)}
                  icon={getCategoryIcon(selectedEquipment.category)}
                />
              </div>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="text-[#71717a] hover:text-[#f5f5f7] transition-colors"
              >
                ×
              </button>
            </div>
            <Badge status={selectedEquipment.status} />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Actions */}
            <Card>
              <h4 className="text-sm font-semibold text-[#f5f5f7] mb-3">Actions rapides</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" fullWidth>
                  Marquer OK
                </Button>
                <Button variant="secondary" size="sm" fullWidth>
                  À vérifier
                </Button>
                <Button variant="danger" size="sm" fullWidth>
                  Passer en HS
                </Button>
                <Button variant="secondary" size="sm" fullWidth>
                  En réparation
                </Button>
              </div>
            </Card>
            
            {/* Details */}
            <Card>
              <h4 className="text-sm font-semibold text-[#f5f5f7] mb-3">Détails</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#71717a] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#71717a]">Emplacement</p>
                    <p className="text-sm text-[#f5f5f7]">{selectedEquipment.location}</p>
                    {selectedEquipment.zone && (
                      <p className="text-xs text-[#a1a1aa] mt-0.5">Zone: {selectedEquipment.zone}</p>
                    )}
                  </div>
                </div>
                
                {selectedEquipment.responsiblePerson && (
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-[#71717a] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#71717a]">Responsable</p>
                      <p className="text-sm text-[#f5f5f7]">{selectedEquipment.responsiblePerson}</p>
                    </div>
                  </div>
                )}
                
                {selectedEquipment.lastCheck && (
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-[#71717a] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#71717a]">Dernière vérification</p>
                      <p className="text-sm text-[#f5f5f7]">
                        {formatDateTime(selectedEquipment.lastCheck)}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <Grid3x3 size={16} className="text-[#71717a] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#71717a]">QR Code</p>
                    <p className="text-sm text-[#f5f5f7] font-mono">{selectedEquipment.qrCode}</p>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Notes */}
            {selectedEquipment.notes && (
              <Card className="bg-amber-500/5 border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-500 mb-1">Notes</h4>
                    <p className="text-sm text-[#f5f5f7]">{selectedEquipment.notes}</p>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Actions */}
            <div className="space-y-2">
              <Button variant="primary" fullWidth>
                <AlertCircle size={16} />
                Signaler un incident
              </Button>
              <Button variant="secondary" fullWidth>
                Voir l'historique
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
