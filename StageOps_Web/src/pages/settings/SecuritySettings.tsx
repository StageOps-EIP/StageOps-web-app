import { Card, CardHeader } from '@/components/design-system/Card'
import { Button } from '@/components/design-system/Button'
import { SettingRow, Toggle } from './shared'

export function SecuritySettings() {
  return (
    <Card>
      <CardHeader title="Sécurité" subtitle="Options disponibles dans cet environnement" />
      <div>
        <SettingRow
          label="Modifier le mot de passe"
          description="Dernière modification il y a 45 jours"
        >
          <Button variant="secondary" size="sm" disabled title="Indisponible en mode démonstration">
            Indisponible
          </Button>
        </SettingRow>
        <SettingRow
          label="Authentification à deux facteurs"
          description="Configuration indisponible en mode démonstration"
        >
          <Toggle label="Authentification à deux facteurs indisponible" disabled />
        </SettingRow>
        <SettingRow label="Sessions actives" description="2 sessions actives (Desktop, Mobile)">
          <Button variant="ghost" size="sm" disabled title="Indisponible en mode démonstration">
            Indisponible
          </Button>
        </SettingRow>
        <SettingRow
          label="Délai d'inactivité"
          description="Déconnexion automatique après inactivité"
        >
          <select
            disabled
            title="Indisponible en mode démonstration"
            className="form-control w-auto px-3 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <option>30 minutes</option>
            <option>1 heure</option>
            <option>4 heures</option>
            <option>Jamais</option>
          </select>
        </SettingRow>
      </div>
    </Card>
  )
}
