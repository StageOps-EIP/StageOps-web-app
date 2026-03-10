import { Card, CardHeader } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { SettingRow, Toggle } from './shared';

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader title="Notifications" subtitle="Gérez vos alertes et canaux de notification" />
      <div>
        <SettingRow
          label="Incidents critiques"
          description="Notification immédiate pour les incidents de sévérité élevée ou critique"
        >
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow
          label="Équipement HS"
          description="Alerte quand un équipement passe en statut HS"
        >
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow
          label="Rappels de vérification"
          description="Rappel avant le show pour les équipements à vérifier"
        >
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow
          label="Changements d'événement"
          description="Notification lors de modifications du planning"
        >
          <Toggle />
        </SettingRow>
        <SettingRow
          label="Notifications par email"
          description="Recevoir un résumé quotidien par email"
        >
          <Toggle />
        </SettingRow>
        <SettingRow
          label="Notifications push"
          description="Activer les notifications push sur mobile"
        >
          <Toggle defaultChecked />
        </SettingRow>
        <SettingRow
          label="Son d'alerte critique"
          description="Son d'alarme pour les incidents critiques en régie"
        >
          <Toggle defaultChecked />
        </SettingRow>
      </div>
      <div className="mt-6">
        <Button variant="primary" onClick={() => toast.success('Notifications mises à jour')}>
          <Check size={16} />
          Sauvegarder
        </Button>
      </div>
    </Card>
  );
}
