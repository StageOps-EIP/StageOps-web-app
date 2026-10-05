import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Equipment, Incident } from '../src/lib/types.ts'
import {
  buildCsvFilename,
  buildEquipmentCsv,
  buildIncidentsCsv,
  serializeCsv,
} from '../src/lib/csv-export.ts'

const equipment: Equipment[] = [
  {
    id: 'eq-1',
    name: 'Console "Régie"; principale',
    category: 'sound',
    qrCode: 'QR-001',
    status: 'ok',
    location: 'Régie Son',
    zone: 'FOH',
    lastCheck: new Date('2026-10-05T08:30:00.000Z'),
  },
]

const incidents: Incident[] = [
  {
    id: 'inc-1',
    title: '=CMD|incident',
    description: 'Test',
    severity: 'high',
    status: 'in-progress',
    equipmentId: 'eq-1',
    reportedBy: 'Élodie Martin',
    timestamp: new Date('2026-10-05T09:00:00.000Z'),
  },
]

describe('CSV export', () => {
  it('serializes French-compatible CSV with a UTF-8 BOM and escaped cells', () => {
    const csv = serializeCsv(['Nom', 'Note'], [['Écran', 'Une valeur; avec séparateur']])

    assert.equal(csv.charCodeAt(0), 0xfeff)
    assert.match(csv, /Nom;Note\r\nÉcran;"Une valeur; avec séparateur"\r\n/)
  })

  it('exports the requested inventory columns', () => {
    const csv = buildEquipmentCsv(equipment)

    assert.match(csv, /Identifiant;Nom;Catégorie;État;Localisation;Dernier contrôle/)
    assert.match(csv, /QR-001;"Console ""Régie""; principale";Son;Opérationnel/)
    assert.match(csv, /Régie Son — FOH;2026-10-05T08:30:00.000Z/)
  })

  it('links incidents to equipment and neutralizes spreadsheet formulas', () => {
    const csv = buildIncidentsCsv(incidents, equipment)

    assert.match(csv, /inc-1;'=CMD\|incident;Élevée;En cours/)
    assert.match(csv, /Console ""Régie""; principale/)
    assert.match(csv, /Élodie Martin;2026-10-05T09:00:00.000Z/)
  })

  it('builds a dated, filesystem-safe filename', () => {
    const filename = buildCsvFilename('Théâtre National', 'Parc matériel', new Date(2026, 9, 5))

    assert.equal(filename, 'theatre-national_parc-materiel_2026-10-05.csv')
  })
})
