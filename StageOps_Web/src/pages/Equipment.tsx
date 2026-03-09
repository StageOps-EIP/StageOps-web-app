import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/design-system/Button';
import { SearchInput } from '@/components/design-system/Input';
import { Badge, CategoryChip, CategoryIcon } from '@/components/design-system/Badge';
import { mockEquipment as initialEquipment } from '@/lib/mockData';
import { getCategoryLabel, formatRelativeTime } from '@/lib/utils';
import { Plus, Filter, Download, QrCode, ChevronDown } from 'lucide-react';
import type { EquipmentCategory, EquipmentStatus, Equipment as EquipmentType } from '@/lib/types';
import { EquipmentDetailModal } from '@/components/equipment/EquipmentDetailModal';
import { AddEquipmentModal } from '@/components/equipment/AddEquipmentModal';

export function Equipment() {
  usePageTitle('Inventaire');
  const [equipmentList, setEquipmentList] = useState<EquipmentType[]>(initialEquipment);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<EquipmentCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const filteredEquipment = equipmentList.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         eq.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         eq.qrCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || eq.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-content-primary mb-2">Inventaire</h1>
          <p className="text-content-muted">{equipmentList.length} équipements au total</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">
            <QrCode size={18} />
            Scanner QR
          </Button>
          <Button variant="secondary">
            <Download size={18} />
            Exporter
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Ajouter équipement
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            aria-label="Rechercher par nom, QR code ou emplacement"
            placeholder="Rechercher par nom, QR code, emplacement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-content-subtle" />
          <div className="relative">
            <select
              aria-label="Filtrer par catégorie"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as EquipmentCategory | 'all')}
              className="px-4 py-2.5 bg-theme-elevated border border-theme-border rounded-xl text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer hover:border-[#52525b] transition-colors appearance-none pr-9"
            >
              <option value="all">Toutes catégories</option>
              <option value="sound">Son</option>
              <option value="light">Lumière</option>
              <option value="video">Vidéo</option>
              <option value="set">Plateau</option>
              <option value="safety">Sécurité</option>
              <option value="rigging">Accroche</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              aria-label="Filtrer par statut"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EquipmentStatus | 'all')}
              className="px-4 py-2.5 bg-theme-elevated border border-theme-border rounded-xl text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer hover:border-[#52525b] transition-colors appearance-none pr-9"
            >
              <option value="all">Tous statuts</option>
              <option value="ok">OK</option>
              <option value="to-check">À vérifier</option>
              <option value="hs">HS</option>
              <option value="repair">En réparation</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="mb-4">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-content-muted">
          {filteredEquipment.length} équipement{filteredEquipment.length !== 1 ? 's' : ''} trouvé{filteredEquipment.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Table */}
      <div className="bg-theme-base border border-theme-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-theme-elevated border-b border-theme-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">
                  Équipement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">
                  Emplacement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-content-muted uppercase tracking-wider">
                  Dernière vérif.
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-content-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {filteredEquipment.map((eq) => (
                <tr
                  key={eq.id}
                  className="hover:bg-theme-elevated transition-colors"
                >
                  <td className="px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-content-primary">{eq.name}</p>
                      {eq.notes && (
                        <p className="text-xs text-content-subtle mt-0.5 line-clamp-1">{eq.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <CategoryChip
                      category={eq.category}
                      label={getCategoryLabel(eq.category)}
                      icon={<CategoryIcon category={eq.category} />}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <code className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded font-mono whitespace-nowrap block">
                      {eq.qrCode}
                    </code>
                  </td>
                  <td className="px-6 py-3">
                    <div>
                      <p className="text-sm text-content-primary">{eq.location}</p>
                      {eq.zone && (
                        <p className="text-xs text-content-subtle mt-0.5">{eq.zone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <Badge status={eq.status} />
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-sm text-content-primary">{eq.responsiblePerson || '-'}</p>
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-sm text-content-muted">
                      {eq.lastCheck ? formatRelativeTime(eq.lastCheck) : '-'}
                    </p>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedEquipment(eq)}>
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {filteredEquipment.length === 0 && (
        <div className="text-center py-16">
          <p className="text-content-subtle mb-4">Aucun équipement trouvé</p>
          <Button variant="secondary" onClick={() => {
            setSearchQuery('');
            setFilterCategory('all');
            setFilterStatus('all');
          }}>
            Réinitialiser les filtres
          </Button>
        </div>
      )}

      {/* Modal détail équipement */}
      {selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onSave={(updated) => {
            setEquipmentList((prev) =>
              prev.map((eq) => (eq.id === updated.id ? updated : eq))
            );
            setSelectedEquipment(null);
          }}
        />
      )}

      {/* Modal ajout équipement */}
      {showAddModal && (
        <AddEquipmentModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newEquipment) => {
            setEquipmentList((prev) => [newEquipment, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
