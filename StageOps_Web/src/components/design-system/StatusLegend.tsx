import { Badge } from './Badge';

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-theme-base border border-theme-border rounded-xl">
      <span className="text-sm text-content-muted font-medium">Légende :</span>
      <Badge status="ok" size="sm" />
      <Badge status="to-check" size="sm" />
      <Badge status="hs" size="sm" />
      <Badge status="repair" size="sm" />
    </div>
  );
}
