import { Card, CardHeader } from '@/components/design-system/Card'
import { SettingRow, Toggle } from './shared'

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader
        title="Notifications"
        subtitle="Configurez les alertes opérationnelles de votre espace"
      />
      <div>
        <SettingRow
          label="Incidents critiques"
          description="Notification immédiate pour les incidents de sévérité élevée ou critique"
        >
          <Toggle label="Notifications pour les incidents critiques" defaultChecked />
        </SettingRow>
        <SettingRow
          label="Équipement HS"
          description="Alerte quand un équipement passe en statut HS"
        >
          <Toggle label="Notifications pour les équipements hors service" defaultChecked />
        </SettingRow>
        <SettingRow
          label="Rappels de vérification"
          description="Rappel avant le show pour les équipements à vérifier"
        >
          <Toggle label="Rappels de vérification" defaultChecked />
        </SettingRow>
        <SettingRow
          label="Changements d'événement"
          description="Notification lors de modifications du planning"
        >
          <Toggle label="Notifications pour les changements d'événement" />
        </SettingRow>
        <SettingRow
          label="Notifications par email"
          description="Recevoir un résumé quotidien par email"
        >
          <Toggle label="Notifications par email" />
        </SettingRow>
        <SettingRow
          label="Notifications push"
          description="Activer les notifications push sur mobile"
        >
          <Toggle label="Notifications push" defaultChecked />
        </SettingRow>
        <SettingRow
          label="Son d'alerte critique"
          description="Son d'alarme pour les incidents critiques en régie"
        >
          <Toggle label="Son d'alerte critique" defaultChecked />
        </SettingRow>
      </div>
    </Card>
  )
}
