import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Button } from '@/components/design-system/Button'
import { SearchInput } from '@/components/design-system/Input'
import { Badge, CategoryChip, CategoryIcon } from '@/components/design-system/Badge'
import { EmptyState } from '@/components/design-system/EmptyState'
import { DemoNotice, PageHeader } from '@/components/design-system/PageHeader'
import { mockEquipment as initialEquipment } from '@/lib/mockData'
import { getCategoryLabel, formatRelativeTime } from '@/lib/utils'
import { Plus, Filter, ChevronDown, PackageSearch } from 'lucide-react'
import type { EquipmentCategory, EquipmentStatus, Equipment as EquipmentType } from '@/lib/types'
import { EquipmentDetailModal } from '@/components/equipment/EquipmentDetailModal'
import { AddEquipmentModal } from '@/components/equipment/AddEquipmentModal'

export function Equipment() {
  usePageTitle('Parc matériel')
  const [searchParams, setSearchParams] = useSearchParams()
  const [equipmentList, setEquipmentList] = useState<EquipmentType[]>(initialEquipment)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<EquipmentCategory | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'all'>('all')
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const requestedEquipment =
    equipmentList.find((item) => item.id === searchParams.get('equipment')) ?? null
  const activeEquipment = selectedEquipment ?? requestedEquipment

  const filteredEquipment = equipmentList.filter((eq) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      eq.name.toLowerCase().includes(query) ||
      eq.location.toLowerCase().includes(query) ||
      eq.qrCode.toLowerCase().includes(query)
    return (
      matchesSearch &&
      (filterCategory === 'all' || eq.category === filterCategory) &&
      (filterStatus === 'all' || eq.status === filterStatus)
    )
  })

  function closeDetail() {
    setSelectedEquipment(null)
    if (searchParams.has('equipment')) {
      const next = new URLSearchParams(searchParams)
      next.delete('equipment')
      setSearchParams(next, { replace: true })
    }
  }

  return (
    <div className="page-shell space-y-5">
      <PageHeader
        context="Théâtre National"
        title="Parc matériel"
        description={`${equipmentList.length} équipements référencés`}
        actions={
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Ajouter un équipement
          </Button>
        }
      />
      <DemoNotice />

      <div className="toolbar">
        <div className="min-w-[16rem] flex-1">
          <SearchInput
            aria-label="Rechercher par nom, QR code ou emplacement"
            placeholder="Nom, QR code ou emplacement"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <Filter size={16} className="hidden text-content-subtle sm:block" aria-hidden="true" />
        <Select
          value={filterCategory}
          onChange={(value) => setFilterCategory(value as EquipmentCategory | 'all')}
          label="Filtrer par catégorie"
        >
          <option value="all">Toutes les catégories</option>
          <option value="sound">Son</option>
          <option value="light">Lumière</option>
          <option value="video">Vidéo</option>
          <option value="set">Plateau</option>
          <option value="safety">Sécurité</option>
          <option value="rigging">Accroche</option>
        </Select>
        <Select
          value={filterStatus}
          onChange={(value) => setFilterStatus(value as EquipmentStatus | 'all')}
          label="Filtrer par statut"
        >
          <option value="all">Tous les statuts</option>
          <option value="ok">Opérationnel</option>
          <option value="to-check">À vérifier</option>
          <option value="hs">Hors service</option>
          <option value="repair">En réparation</option>
        </Select>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-content-muted">
        {filteredEquipment.length} résultat{filteredEquipment.length !== 1 ? 's' : ''}
      </p>

      {filteredEquipment.length > 0 ? (
        <>
          <div className="panel hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="border-b border-theme-border bg-theme-deeper">
                  <tr>
                    {[
                      'Équipement',
                      'Catégorie',
                      'Identifiant',
                      'Emplacement',
                      'Statut',
                      'Responsable',
                      'Dernier contrôle',
                      '',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-semibold text-content-subtle last:text-right"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {filteredEquipment.map((equipment) => (
                    <tr key={equipment.id} className="hover:bg-theme-elevated">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-content-primary">{equipment.name}</p>
                        {equipment.notes && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-content-subtle">
                            {equipment.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <CategoryChip
                          category={equipment.category}
                          label={getCategoryLabel(equipment.category)}
                          icon={<CategoryIcon category={equipment.category} />}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <code className="whitespace-nowrap text-xs text-[var(--brand-violet-hover)]">
                          {equipment.qrCode}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-content-primary">{equipment.location}</p>
                        {equipment.zone && (
                          <p className="text-xs text-content-subtle">{equipment.zone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={equipment.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-content-muted">
                        {equipment.responsiblePerson || 'Non affecté'}
                      </td>
                      <td className="px-4 py-3 text-sm text-content-muted">
                        {equipment.lastCheck
                          ? formatRelativeTime(equipment.lastCheck)
                          : 'Non renseigné'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEquipment(equipment)}
                        >
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 lg:hidden sm:grid-cols-2">
            {filteredEquipment.map((equipment) => (
              <button
                key={equipment.id}
                onClick={() => setSelectedEquipment(equipment)}
                className="panel p-4 text-left transition-colors hover:border-theme-border-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-content-primary">
                      {equipment.name}
                    </p>
                    <p className="mt-1 text-xs text-content-subtle">
                      {equipment.location}
                      {equipment.zone ? ` · ${equipment.zone}` : ''}
                    </p>
                  </div>
                  <Badge status={equipment.status} size="sm" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-theme-border pt-3">
                  <CategoryChip
                    category={equipment.category}
                    label={getCategoryLabel(equipment.category)}
                    icon={<CategoryIcon category={equipment.category} />}
                  />
                  <code className="text-xs text-[var(--brand-violet-hover)]">
                    {equipment.qrCode}
                  </code>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="Aucun équipement trouvé"
          description="Modifiez les critères de recherche ou réinitialisez les filtres."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('')
                setFilterCategory('all')
                setFilterStatus('all')
              }}
            >
              Réinitialiser les filtres
            </Button>
          }
        />
      )}

      {activeEquipment && (
        <EquipmentDetailModal
          equipment={activeEquipment}
          onClose={closeDetail}
          onSave={(updated) => {
            setEquipmentList((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item)),
            )
            closeDetail()
          }}
        />
      )}
      {showAddModal && (
        <AddEquipmentModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newEquipment) => {
            setEquipmentList((prev) => [newEquipment, ...prev])
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="relative min-w-44 flex-1 sm:flex-none">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-control appearance-none px-3 pr-9"
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle"
      />
    </div>
  )
}
