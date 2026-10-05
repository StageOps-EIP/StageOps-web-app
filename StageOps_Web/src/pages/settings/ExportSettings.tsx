import { Card, CardHeader } from '@/components/design-system/Card'
import { Button } from '@/components/design-system/Button'
import { Download, Database } from 'lucide-react'
import { useOperationalData } from '@/hooks/useOperationalData'
import {
  buildCsvFilename,
  buildEquipmentCsv,
  buildIncidentsCsv,
  downloadCsv,
} from '@/lib/csv-export'
import { toast } from 'sonner'

const PROJECT_NAME = 'Théâtre National'

export function ExportSettings() {
  const { equipment, incidents } = useOperationalData()

  function exportEquipment() {
    const filename = buildCsvFilename(PROJECT_NAME, 'inventaire')
    downloadCsv(buildEquipmentCsv(equipment), filename)
    toast.success('Inventaire exporté', { description: filename })
  }

  function exportIncidents() {
    const filename = buildCsvFilename(PROJECT_NAME, 'incidents')
    downloadCsv(buildIncidentsCsv(incidents, equipment), filename)
    toast.success('Incidents exportés', { description: filename })
  }

  return (
    <Card>
      <CardHeader
        title="Export & Données"
        subtitle="Exportez vos données et créez des sauvegardes"
      />
      <div className="space-y-4">
        {/* Export options */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-theme-elevated border border-theme-border rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Download size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm text-content-primary">Export PDF</p>
                <p className="text-[10px] text-content-subtle">Rapport complet avec visuels</p>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <label className="flex items-center gap-2 text-xs text-content-muted">
                <input type="checkbox" defaultChecked className="accent-cyan-400" />
                Inventaire équipements
              </label>
              <label className="flex items-center gap-2 text-xs text-content-muted">
                <input type="checkbox" defaultChecked className="accent-cyan-400" />
                Historique incidents
              </label>
              <label className="flex items-center gap-2 text-xs text-content-muted">
                <input type="checkbox" className="accent-cyan-400" />
                Planning événements
              </label>
            </div>
            <Button variant="secondary" size="sm" fullWidth disabled>
              <Download size={14} />
              Fonction en préparation
            </Button>
          </div>

          <div className="p-4 bg-theme-elevated border border-theme-border rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Download size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-content-primary">Export CSV</p>
                <p className="text-[10px] text-content-subtle">Compatible Excel et LibreOffice</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={exportEquipment}
                disabled={!equipment.length}
              >
                <Download size={14} />
                Inventaire ({equipment.length})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={exportIncidents}
                disabled={!incidents.length}
              >
                <Download size={14} />
                Incidents ({incidents.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Backup */}
        <div className="p-4 bg-theme-elevated border border-theme-border rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-400/10 rounded-lg">
                <Database size={18} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-content-primary">Sauvegarde complète</p>
                <p className="text-[10px] text-content-subtle">
                  Dernière sauvegarde : 10 fév. 2026 à 23:00
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" disabled>
              <Database size={14} />
              Fonction en préparation
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
