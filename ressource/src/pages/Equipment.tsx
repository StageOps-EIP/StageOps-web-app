import { useState } from 'react';
import { Button } from '../components/design-system/Button';
import { SearchInput } from '../components/design-system/Input';
import { Badge, CategoryChip } from '../components/design-system/Badge';
import { mockEquipment } from '../lib/mockData';
import { getCategoryLabel, getCategoryIcon, formatRelativeTime } from '../lib/utils';
import { Plus, Filter, Download, QrCode } from 'lucide-react';
import { EquipmentCategory, EquipmentStatus } from '../lib/types';

export function Equipment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<EquipmentCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'all'>('all');
  
  const filteredEquipment = mockEquipment.filter(eq => {
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
          <h1 className="text-3xl font-bold text-[#f5f5f7] mb-2">Inventaire</h1>
          <p className="text-[#a1a1aa]">{mockEquipment.length} équipements au total</p>
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
          <Button variant="primary">
            <Plus size={18} />
            Ajouter équipement
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Rechercher par nom, QR code, emplacement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#71717a]" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as EquipmentCategory | 'all')}
            className="px-4 py-2.5 bg-[#1c1c21] border border-[#27272e] rounded-xl text-[#f5f5f7] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="all">Toutes catégories</option>
            <option value="sound">Son</option>
            <option value="light">Lumière</option>
            <option value="video">Vidéo</option>
            <option value="set">Plateau</option>
            <option value="safety">Sécurité</option>
            <option value="rigging">Accroche</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as EquipmentStatus | 'all')}
            className="px-4 py-2.5 bg-[#1c1c21] border border-[#27272e] rounded-xl text-[#f5f5f7] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="all">Tous statuts</option>
            <option value="ok">OK</option>
            <option value="to-check">À vérifier</option>
            <option value="hs">HS</option>
            <option value="repair">En réparation</option>
          </select>
        </div>
      </div>
      
      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-[#a1a1aa]">
          {filteredEquipment.length} équipement{filteredEquipment.length !== 1 ? 's' : ''} trouvé{filteredEquipment.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Table */}
      <div className="bg-[#131316] border border-[#27272e] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1c1c21] border-b border-[#27272e]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Équipement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Emplacement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Dernière vérif.
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272e]">
              {filteredEquipment.map((eq) => (
                <tr
                  key={eq.id}
                  className="hover:bg-[#1c1c21] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#f5f5f7]">{eq.name}</p>
                      {eq.notes && (
                        <p className="text-xs text-[#71717a] mt-0.5 line-clamp-1">{eq.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <CategoryChip
                      category={eq.category}
                      label={getCategoryLabel(eq.category)}
                      icon={getCategoryIcon(eq.category)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
                      {eq.qrCode}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-[#f5f5f7]">{eq.location}</p>
                      {eq.zone && (
                        <p className="text-xs text-[#71717a] mt-0.5">{eq.zone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={eq.status} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#f5f5f7]">{eq.responsiblePerson || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#a1a1aa]">
                      {eq.lastCheck ? formatRelativeTime(eq.lastCheck) : '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">
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
          <p className="text-[#71717a] mb-4">Aucun équipement trouvé</p>
          <Button variant="secondary" onClick={() => {
            setSearchQuery('');
            setFilterCategory('all');
            setFilterStatus('all');
          }}>
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
