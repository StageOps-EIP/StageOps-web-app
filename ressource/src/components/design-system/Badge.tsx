import { getStatusColor, getStatusLabel } from '../../lib/utils';
import { EquipmentStatus } from '../../lib/types';

interface BadgeProps {
  status: EquipmentStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function Badge({ status, size = 'md', showLabel = true }: BadgeProps) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
  };
  
  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {showLabel && <span>{label}</span>}
    </div>
  );
}

interface CategoryChipProps {
  category: string;
  label?: string;
  icon?: string;
  onRemove?: () => void;
}

export function CategoryChip({ category, label, icon, onRemove }: CategoryChipProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1c1c21] border border-[#27272e] rounded-lg text-sm text-[#f5f5f7]">
      {icon && <span className="text-base">{icon}</span>}
      <span>{label || category}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-[#71717a] hover:text-[#f5f5f7] transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}
