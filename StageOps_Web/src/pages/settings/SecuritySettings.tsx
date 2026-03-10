import { Card, CardHeader } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { SettingRow, Toggle } from './shared';

export function SecuritySettings() {
  return (
    <Card>
      <CardHeader title="Sécurité" subtitle="Gestion de l'authentification et des accès" />
      <div>
        <SettingRow
          label="Modifier le mot de passe"
          description="Dernière modification il y a 45 jours"
        >
          <Button variant="secondary" size="sm">
            Modifier
          </Button>
        </SettingRow>
        <SettingRow
          label="Authentification à deux facteurs"
          description="Sécurité renforcée via application TOTP"
        >
          <Toggle />
        </SettingRow>
        <SettingRow
          label="Sessions actives"
          description="2 sessions actives (Desktop, Mobile)"
        >
          <Button variant="ghost" size="sm">
            Voir les sessions
          </Button>
        </SettingRow>
        <SettingRow
          label="Délai d'inactivité"
          description="Déconnexion automatique après inactivité"
        >
          <select className="bg-theme-elevated border border-theme-border rounded-xl px-4 py-2 text-sm text-content-primary focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
            <option>30 minutes</option>
            <option>1 heure</option>
            <option>4 heures</option>
            <option>Jamais</option>
          </select>
        </SettingRow>
      </div>
      <div className="mt-6">
        <Button variant="primary" onClick={() => toast.success('Sécurité mise à jour')}>
          <Check size={16} />
          Sauvegarder
        </Button>
      </div>
    </Card>
  );
}
